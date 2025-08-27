import { useCallback, useEffect, useState } from 'react';
import { Budget, Goal, Debt, Obligation, BNPLPlan } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function useRemoteData(token: string | null) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [bnpl, setBnpl] = useState<BNPLPlan[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/data`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setBudgets(data.budgets || []);
        setGoals(data.goals || []);
        setDebts(data.debts || []);
        setObligations(data.obligations || []);
        setBnpl(data.bnpl || []);
      })
      .catch(() => {
        setBudgets([]);
        setGoals([]);
        setDebts([]);
        setObligations([]);
        setBnpl([]);
      });
  }, [token]);

  function crud<T extends { id: string }>(
    path: string,
    setList: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    const create = useCallback(
      async (item: T) => {
        if (!token) return;
        const res = await fetch(`${API}/${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        const data = await res.json();
        setList((prev) => [...prev, data]);
      },
      [path, token]
    );

    const update = useCallback(
      async (item: T) => {
        if (!token) return;
        await fetch(`${API}/${path}/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        setList((prev) => prev.map((x) => (x.id === item.id ? item : x)));
      },
      [path, token]
    );

    const remove = useCallback(
      async (id: string) => {
        if (!token) return;
        await fetch(`${API}/${path}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setList((prev) => prev.filter((x) => x.id !== id));
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
  } as const;
}
