import React, { useCallback, useMemo, useState } from 'react';
import Button from './components/Button';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import useHotkeys from './hooks/useHotkeys';
import BudgetTracker from './components/BudgetTracker';
import CashFlowProjection from './components/CashFlowProjection';
import BNPLTrackerModal from './components/BNPLTrackerModal';
import ShiftImpactModal from './components/ShiftImpactModal';
import DebtScheduleViewer from './components/DebtScheduleViewer';
import ManageDebtsModal from './components/modals/ManageDebtsModal';
import ManageGoalsModal from './components/modals/ManageGoalsModal';
import ManageObligationsModal from './components/modals/ManageObligationsModal';
import ImportDataModal from './components/modals/ImportDataModal';
import CalculatorModal from './components/modals/CalculatorModal';
import { payoff } from './logic/debt';
import { evaluateBadges } from './logic/badges';
import { SEEDED } from './utils/constants';
import { exportJSON, exportCSV, exportPDF, exportCSVBudgets } from './utils/export';
import toast from 'react-hot-toast';
import DebtVelocityChart from './components/reports/DebtVelocityChart';
import SpendingHeatmap from './components/reports/SpendingHeatmap';
import GoalWaterfall from './components/reports/GoalWaterfall';
import SankeyFlow from './components/reports/SankeyFlow';
import { Budget, Goal, RecurringTransaction, Obligation, Debt, BNPLPlan } from './types';

type Tab = 'dashboard' | 'budgets' | 'projection' | 'reports';

export default function App(){
  const [tab, setTab] = useState<Tab>('dashboard');
  const [strategy, setStrategy] = useState<'avalanche'|'snowball'>('avalanche');

  const [budgets, setBudgets] = useState<Budget[]>(() => SEEDED.budgets as Budget[]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => SEEDED.recurring as RecurringTransaction[]);
  const [goals, setGoals] = useState<Goal[]>(() => SEEDED.goals as Goal[]);
  const [debts, setDebts] = useState<Debt[]>(() => SEEDED.debts.map(d => ({ ...d })));
  const [bnplPlans, setBnplPlans] = useState<BNPLPlan[]>(SEEDED.bnpl);
  const [obligations, setObligations] = useState<Obligation[]>([]);

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

  const handleAddBudget = useCallback((b: Budget) => {
    setBudgets(prev => [...prev, b]);
  }, []);

  const handleUpdateBudget = useCallback((b: Budget) => {
    setBudgets(prev => prev.map(x => x.id === b.id ? b : x));
  }, []);

  const handleDeleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(x => x.id !== id));
  }, []);

  function handleExport(kind: 'json'|'csv'|'pdf') {
    const payload = { budgets, recurring, goals, debts, bnplPlans };
    if (kind === 'json') exportJSON('chatpay-data.json', payload);
    if (kind === 'csv') exportCSVBudgets('chatpay-budgets.csv', budgets);
    if (kind === 'pdf') exportPDF('chatpay-summary.pdf',
      'ChatPay Summary\n\n' +
      'Budgets: ' + budgets.length + '\n' +
      'Recurring: ' + recurring.length + '\n' +
      'Goals: ' + goals.length + '\n' +
      'Debts: ' + debts.length + '\n' +
      'BNPL: ' + bnplPlans.length + '\n'
    );
  }

  function handleImport(payload: any) {
    try {
      if (payload.budgets) setBudgets(payload.budgets);
      if (payload.debts) setDebts(payload.debts);
      if (payload.recurring) setRecurring(payload.recurring);
      if (payload.goals) setGoals(payload.goals);
      if (payload.bnplPlans) setBnplPlans(payload.bnplPlans);
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

      <BNPLTrackerModal open={showBNPL} onClose={()=>setShowBNPL(false)} plans={bnplPlans} />
      <ShiftImpactModal open={showShiftImpact} onClose={()=>setShowShiftImpact(false)} />
      <ManageDebtsModal open={showManageDebts} onClose={()=>setShowManageDebts(false)} debts={debts} onChange={setDebts} />
      <ManageGoalsModal open={showManageGoals} onClose={()=>setShowManageGoals(false)} goals={goals} onChange={setGoals} />
      <ManageObligationsModal open={showManageObligations} onClose={()=>setShowManageObligations(false)} obligations={obligations} onChange={setObligations} />
      <ImportDataModal open={showImport} onClose={()=>setShowImport(false)} onImport={handleImport} />
      <CalculatorModal open={showCalc} onClose={()=>setShowCalc(false)} debts={debts} />
    </div>
  );
}
