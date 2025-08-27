import React, { Suspense, useCallback, useMemo, useState } from 'react';
import Button from './components/Button';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import useHotkeys from './hooks/useHotkeys';
import useRemoteList from './hooks/useRemoteList';
import BudgetTracker from './components/BudgetTracker';
import CashFlowProjection from './components/CashFlowProjection';
import BNPLTrackerModal from './components/BNPLTrackerModal';
import ShiftImpactModal from './components/ShiftImpactModal';
import DebtScheduleViewer from './components/DebtScheduleViewer';
import ManageDebtsModal from './components/modals/ManageDebtsModal';
import ManageGoalsModal from './components/modals/ManageGoalsModal';
import ManageObligationsModal from './components/modals/ManageObligationsModal';
import ImportDataModal, { ImportPayload } from './components/modals/ImportDataModal';
import CalculatorModal from './components/modals/CalculatorModal';
import { payoff } from './logic/debt';
import { evaluateBadges } from './logic/badges';
import { SEEDED } from './utils/constants';
import { exportJSON, exportCSV, exportPDF, exportCSVBudgets } from './utils/export';
import toast from 'react-hot-toast';
import { Budget, Goal, RecurringTransaction, Obligation, Debt, BNPLPlan, Transaction } from './types';

const DebtVelocityChart = React.lazy(() => import('./components/reports/DebtVelocityChart'));
const SpendingHeatmap = React.lazy(() => import('./components/reports/SpendingHeatmap'));
const GoalWaterfall = React.lazy(() => import('./components/reports/GoalWaterfall'));
const SankeyFlow = React.lazy(() => import('./components/reports/SankeyFlow'));

type Tab = 'dashboard' | 'budgets' | 'projection' | 'reports';

export default function App(){
  const [tab, setTab] = useState<Tab>('dashboard');
  const [strategy, setStrategy] = useState<'avalanche'|'snowball'>('avalanche');

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { list: budgets, create: addBudget, update: updateBudgetApi, remove: deleteBudgetApi } = useRemoteList<Budget>('budgets', token);
  const { list: goals, create: addGoalApi, update: updateGoalApi, remove: deleteGoalApi } = useRemoteList<Goal>('goals', token);
  const { list: debts, create: addDebtApi, update: updateDebtApi, remove: deleteDebtApi } = useRemoteList<Debt>('debts', token);
  const { list: obligations, create: addObligationApi, update: updateObligationApi, remove: deleteObligationApi } = useRemoteList<Obligation>('obligations', token);
  const { list: bnpl, create: addBnplApi, update: updateBnplApi, remove: deleteBnplApi } = useRemoteList<BNPLPlan>('bnpl', token);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => SEEDED.recurring);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showBNPL, setShowBNPL] = useState(false);
  const [showShiftImpact, setShowShiftImpact] = useState(false);
  const [showManageDebts, setShowManageDebts] = useState(false);
  const [showManageGoals, setShowManageGoals] = useState(false);
  const [showManageObligations, setShowManageObligations] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const monthlyDebtBudget = useMemo(()=> budgets.find(b=>b.category==='Debt')?.allocated ?? 1500, [budgets]);

  const plan = useMemo(()=> {
    const unlocked = new Set<string>();
    return payoff(debts, monthlyDebtBudget, strategy, 600, (step)=> {
      const newly = evaluateBadges(step, unlocked);
      if (newly.length) toast.success('Milestone: ' + newly.join(', '));
      return newly;
    });
  }, [debts, monthlyDebtBudget, strategy]);

  const heatmap = useMemo(()=>{
    const cats = budgets.slice(0,5);
    return Array.from({length: cats.length}, (_, i) =>
      Array.from({length:12}, (_, m) => Math.max(0, Math.round((cats[i].spent + (m*13)) )))
    );
  }, [budgets]);

  const flows = useMemo(()=>{
    const income = recurring.filter(r=>r.type==='income').reduce((s,r)=>s+r.amount,0);
    const essentials = budgets.filter(b=>['Housing','Car','Groceries','Power','Internet','Insurance'].includes(b.category)).reduce((s,b)=>s+b.spent,0);
    const dining = budgets.find(b=>b.category==='Dining')?.spent ?? 0;
    const debt = budgets.find(b=>b.category==='Debt')?.spent ?? 0;
    const save = Math.max(0, income - (essentials+dining+debt));
    return [
      { source: 'Income', target: 'Essentials', amount: essentials },
      { source: 'Income', target: 'Dining', amount: dining },
      { source: 'Income', target: 'Debt', amount: debt },
      { source: 'Income', target: 'Save/Goals', amount: save },
    ];
  }, [budgets, recurring]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const goBudgets = useCallback(() => setTab('budgets'), []);
  const openManageDebts = useCallback(() => setShowManageDebts(true), []);
  const goDashboard = useCallback(() => setTab('dashboard'), []);

  const hotkeys = useMemo(
    () => [
      ['meta+k', openPalette],
      ['ctrl+k', openPalette],
      ['shift+b', goBudgets],
      ['shift+d', openManageDebts],
      ['shift+g', goDashboard],
    ],
    [openPalette, goBudgets, openManageDebts, goDashboard]
  );

  useHotkeys(hotkeys);
  async function handleLogin() {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
    } else {
      toast.error('Login failed');
    }
  }

  async function handleRegister() {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
    } else {
      toast.error('Registration failed');
    }
  }

  const handleAddBudget = useCallback((b: Budget) => {
    addBudget(b);
  }, [addBudget]);

  const handleUpdateBudget = useCallback((b: Budget) => {
    updateBudgetApi(b);
  }, [updateBudgetApi]);

  const handleDeleteBudget = useCallback((id: string) => {
    deleteBudgetApi(id);
  }, [deleteBudgetApi]);

  const handleDebtsChange = useCallback((next: Debt[]) => {
    if (next.length > debts.length) {
      const added = next.find((n) => !debts.some((d) => d.id === n.id));
      if (added) addDebtApi(added);
    } else if (next.length < debts.length) {
      const removed = debts.find((d) => !next.some((n) => n.id === d.id));
      if (removed) deleteDebtApi(removed.id);
    } else {
      const updated = next.find((n) => {
        const prev = debts.find((d) => d.id === n.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(n);
      });
      if (updated) updateDebtApi(updated);
    }
  }, [debts, addDebtApi, updateDebtApi, deleteDebtApi]);

  const handleGoalsChange = useCallback((next: Goal[]) => {
    if (next.length > goals.length) {
      const added = next.find((n) => !goals.some((d) => d.id === n.id));
      if (added) addGoalApi(added);
    } else if (next.length < goals.length) {
      const removed = goals.find((d) => !next.some((n) => n.id === d.id));
      if (removed) deleteGoalApi(removed.id);
    } else {
      const updated = next.find((n) => {
        const prev = goals.find((d) => d.id === n.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(n);
      });
      if (updated) updateGoalApi(updated);
    }
  }, [goals, addGoalApi, updateGoalApi, deleteGoalApi]);

  const handleObligationsChange = useCallback((next: Obligation[]) => {
    if (next.length > obligations.length) {
      const added = next.find((n) => !obligations.some((d) => d.id === n.id));
      if (added) addObligationApi(added);
    } else if (next.length < obligations.length) {
      const removed = obligations.find((d) => !next.some((n) => n.id === d.id));
      if (removed) deleteObligationApi(removed.id);
    } else {
      const updated = next.find((n) => {
        const prev = obligations.find((d) => d.id === n.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(n);
      });
      if (updated) updateObligationApi(updated);
    }
  }, [obligations, addObligationApi, updateObligationApi, deleteObligationApi]);

  const handleTransactions = useCallback((ts: Transaction[]) => {
    toast.success('Imported ' + ts.length + ' transactions');
  }, []);

  if (!token) {
    return (
      <div className="p-4 max-w-sm mx-auto space-y-2">
        <h1 className="text-xl font-semibold">Project Thrive Login</h1>
        <input className="w-full p-2 border" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 border" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={handleLogin}>Login</Button>
          <Button variant="secondary" onClick={handleRegister}>Register</Button>
        </div>
      </div>
    );
  }

  function handleExport(kind: 'json'|'csv'|'pdf') {
    const payload = { budgets, recurring, goals, debts, bnpl };
    if (kind === 'json') exportJSON('chatpay-data.json', payload);
    if (kind === 'csv') exportCSVBudgets('chatpay-budgets.csv', budgets);
    if (kind === 'pdf') exportPDF('chatpay-summary.pdf',
      'ChatPay Summary\n\n' +
      'Budgets: ' + budgets.length + '\n' +
      'Recurring: ' + recurring.length + '\n' +
      'Goals: ' + goals.length + '\n' +
      'Debts: ' + debts.length + '\n' +
      'BNPL: ' + bnpl.length + '\n'
    );
  }

  function handleImport(payload: ImportPayload) {
    try {
      payload.budgets.forEach((b) => addBudget(b));
      handleDebtsChange(payload.debts);
      setRecurring(payload.recurring);
      handleGoalsChange(payload.goals);
      if (payload.obligations) handleObligationsChange(payload.obligations);
      if (payload.bnpl) payload.bnpl.forEach((p) => addBnplApi(p));
      if (payload.transactions) handleTransactions(payload.transactions);
      toast.success('Import complete');
    } catch (e) {
      toast.error('Import failed: ' + (e as any)?.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" className="w-6 h-6" />
            <div className="font-semibold">ChatPay v6.1 — Project Thrive</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={tab==='dashboard'?'primary':'secondary'} onClick={()=>setTab('dashboard')}>Dashboard</Button>
            <Button variant={tab==='budgets'?'primary':'secondary'} onClick={()=>setTab('budgets')}>Budgets</Button>
            <Button variant={tab==='projection'?'primary':'secondary'} onClick={()=>setTab('projection')}>Projection</Button>
            <Button variant={tab==='reports'?'primary':'secondary'} onClick={()=>setTab('reports')}>Reports</Button>
            <Button variant="secondary" onClick={()=>setShowManageDebts(true)}>Debts</Button>
            <Button variant="secondary" onClick={()=>setShowManageGoals(true)}>Goals</Button>
            <Button variant="secondary" onClick={()=>setShowManageObligations(true)}>Obligations</Button>
            <Button variant="secondary" onClick={()=>setShowBNPL(true)}>BNPL</Button>
            <Button variant="secondary" onClick={()=>setShowShiftImpact(true)}>Shift Impact</Button>
            <Button variant="secondary" onClick={()=>setShowCalc(true)}>Calculator</Button>
            <Button variant="secondary" onClick={()=>setShowImport(true)}>Import</Button>
            <Button variant="secondary" onClick={()=>handleExport('json')}>Export JSON</Button>
            <Button variant="secondary" onClick={()=>handleExport('csv')}>CSV</Button>
            <Button variant="secondary" onClick={()=>handleExport('pdf')}>PDF</Button>
            <Button variant="secondary" onClick={()=>setToken(null)}>Logout</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Months to Payoff (Budget ${monthlyDebtBudget})</div>
                <div className="text-2xl font-semibold">{plan.months}</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Interest</div>
                <div className="text-2xl font-semibold">${plan.totalInterest.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Strategy</div>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1 rounded ${strategy==='avalanche'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'}`} onClick={()=>setStrategy('avalanche')}>Avalanche</button>
                  <button className={`px-3 py-1 rounded ${strategy==='snowball'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'}`} onClick={()=>setStrategy('snowball')}>Snowball</button>
                </div>
              </div>
            </div>
            <DebtScheduleViewer plan={plan} />
          </div>
        )}

        {tab === 'budgets' && (
          <BudgetTracker
            budgets={budgets}
            onAdd={handleAddBudget}
            onUpdate={handleUpdateBudget}
            onDelete={handleDeleteBudget}
          />
        )}

        {tab === 'projection' && (
          <CashFlowProjection currentBalance={0} recurring={recurring} months={12} />
        )}

        {tab === 'reports' && (
          <Suspense fallback={<div>Loading reports...</div>}>
            <div className="space-y-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-2">Debt Velocity</div>
                <DebtVelocityChart plan={plan} />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-2">Spending Heatmap</div>
                <SpendingHeatmap matrix={heatmap} />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-2">Goal Waterfall</div>
                <GoalWaterfall goals={goals.map(g=>({ name:g.name, current:g.current, target:g.target }))} />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-2">Income Flow</div>
                <SankeyFlow flows={flows} />
              </div>
            </div>
          </Suspense>
        )}
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={()=>setPaletteOpen(false)}
        commands={[
          { id: 'goto-dashboard', label: 'Go to: Dashboard', action: ()=> setTab('dashboard') },
          { id: 'goto-budgets', label: 'Go to: Budgets', action: ()=> setTab('budgets') },
          { id: 'goto-projection', label: 'Go to: Projection', action: ()=> setTab('projection') },
          { id: 'goto-reports', label: 'Go to: Reports', action: ()=> setTab('reports') },
          { id: 'open-bnpl', label: 'Open: BNPL Tracker', action: ()=> setShowBNPL(true) },
          { id: 'open-shift', label: 'Open: Shift Impact', action: ()=> setShowShiftImpact(true) },
          { id: 'open-debts', label: 'Open: Manage Debts', action: ()=> setShowManageDebts(true) },
          { id: 'open-goals', label: 'Open: Manage Goals', action: ()=> setShowManageGoals(true) },
          { id: 'open-obligations', label: 'Open: Manage Obligations', action: ()=> setShowManageObligations(true) },
          { id: 'open-import', label: 'Open: Import', action: ()=> setShowImport(true) },
          { id: 'open-calc', label: 'Open: Calculator', action: ()=> setShowCalc(true) },
        ]}
      />

      <BNPLTrackerModal open={showBNPL} onClose={()=>setShowBNPL(false)} plans={bnpl} />
      <ShiftImpactModal open={showShiftImpact} onClose={()=>setShowShiftImpact(false)} />
      <ManageDebtsModal open={showManageDebts} onClose={()=>setShowManageDebts(false)} debts={debts} onChange={handleDebtsChange} />
      <ManageGoalsModal open={showManageGoals} onClose={()=>setShowManageGoals(false)} goals={goals} onChange={handleGoalsChange} />
      <ManageObligationsModal open={showManageObligations} onClose={()=>setShowManageObligations(false)} obligations={obligations} onChange={handleObligationsChange} />
      <ImportDataModal
        open={showImport}
        onClose={()=>setShowImport(false)}
        onImport={handleImport}
        budgets={budgets}
        onTransactions={handleTransactions}
      />
      <CalculatorModal open={showCalc} onClose={()=>setShowCalc(false)} debts={debts} />
    </div>
  );
}
