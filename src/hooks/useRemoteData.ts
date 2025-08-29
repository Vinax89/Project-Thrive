import { useCallback, useEffect, useState } from 'react';
import { Budget, Goal, Debt, Obligation, BNPLPlan } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function useRemoteData(token: string | null) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [bnpl, setBnpl] = useState<BNPLPlan[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(`${API}/data`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setBudgets(data.budgets || []);
        setGoals(data.goals || []);
        setDebts(data.debts || []);
        setObligations(data.obligations || []);
        setBnpl(data.bnpl || []);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err as Error);
      }
    };

    load();

    return () => controller.abort();
  }, [token]);

  function crud<T extends { id: string }>(
    path: string,
    setList: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    const create = useCallback(
      async (item: T) => {
        if (!token) return;
        try {
          const res = await fetch(`${API}/${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          });
          if (!res.ok) {
            throw new Error(`Failed to create ${path}`);
          }
          const data = await res.json();
          setList((prev) => [...prev, data]);
          setError(null);
          return data;
        } catch (err) {
          console.error(err);
          setError(err as Error);
          throw err;
        }
      },
      [path, token]
    );

    const update = useCallback(
      async (item: T) => {
        if (!token) return;
        try {
          const res = await fetch(`${API}/${path}/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          });
          if (!res.ok) {
            throw new Error(`Failed to update ${path}`);
          }
          setList((prev) => prev.map((x) => (x.id === item.id ? item : x)));
          setError(null);
        } catch (err) {
          console.error(err);
          setError(err as Error);
          throw err;
        }
      },
      [path, token]
    );

    const remove = useCallback(
      async (id: string) => {
        if (!token) return;
        try {
          const res = await fetch(`${API}/${path}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            throw new Error(`Failed to delete ${path}`);
          }
          setList((prev) => prev.filter((x) => x.id !== id));
          setError(null);
        } catch (err) {
          console.error(err);
          setError(err as Error);
          throw err;
        }
      },
      [path, token]
    );

    return { create, update, remove } as const;
  }

  const budgetOps = crud<Budget>('budgets', setBudgets);
  const goalOps = crud<Goal>('goals', setGoals);
  const debtOps = crud<Debt>('debts', setDebts);
  const obligationOps = crud<Obligation>('obligations', setObligations);
  const bnplOps = crud<BNPLPlan>('bnpl', setBnpl);

  return {
    budgets,
    setBudgets,
    addBudget: budgetOps.create,
    updateBudgetApi: budgetOps.update,
    deleteBudgetApi: budgetOps.remove,
    goals,
    setGoals,
    addGoalApi: goalOps.create,
    updateGoalApi: goalOps.update,
    deleteGoalApi: goalOps.remove,
    debts,
    setDebts,
    addDebtApi: debtOps.create,
    updateDebtApi: debtOps.update,
    deleteDebtApi: debtOps.remove,
    obligations,
    setObligations,
    addObligationApi: obligationOps.create,
    updateObligationApi: obligationOps.update,
    deleteObligationApi: obligationOps.remove,
    bnpl,
    setBnpl,
    addBnplApi: bnplOps.create,
    updateBnplApi: bnplOps.update,
    deleteBnplApi: bnplOps.remove,
    error,
  } as const;
}
