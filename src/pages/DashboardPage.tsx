import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import {
  MessageSquare,
  Target,
  AlertCircle,
  Receipt,
  Heart,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  getMonthlyExpensesByCategory,
  getSavingsGoals,
  getSavingsEntries,
  getDebts,
  getMonthlyExpenseTotal,
  getLatestUserProfile
} from '@/db/api';
import type { UserProfile } from '@/types';
import { format, subMonths } from 'date-fns';

const CHART_COLORS = ['#16a34a', '#eab308', '#22c55e', '#facc15', '#4ade80', '#fde047'];

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [savingsData, setSavingsData] = useState<any[]>([]);
  const [debtData, setDebtData] = useState<any[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    const [profile, categoryTotals, goals, debts, monthlyTotal] = await Promise.all([
      getLatestUserProfile(),
      getMonthlyExpensesByCategory(),
      getSavingsGoals(),
      getDebts(),
      getMonthlyExpenseTotal()
    ]);

    setUserProfile(profile);

    // Prepare expense pie chart data
    const expenseChartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Number(value)
    }));
    setExpenseData(expenseChartData);

    // Prepare savings line chart data (last 6 months)
    if (goals.length > 0) {
      const goal = goals[0];
      const entries = await getSavingsEntries(goal.id);
      
      const monthlyData: Record<string, number> = {};
      entries.forEach(entry => {
        const month = format(new Date(entry.entry_date), 'MMM yyyy');
        monthlyData[month] = (monthlyData[month] || 0) + entry.amount;
      });

      const savingsChartData = Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        amount: Number(amount)
      }));
      setSavingsData(savingsChartData);
    }

    // Prepare debt timeline data
    const unpaidDebts = debts.filter(d => d.status === 'unpaid');
    const paidDebts = debts.filter(d => d.status === 'paid');
    const debtChartData = [
      { name: 'Unpaid', value: unpaidDebts.reduce((sum, d) => sum + d.amount, 0) },
      { name: 'Paid', value: paidDebts.reduce((sum, d) => sum + d.amount, 0) }
    ];
    setDebtData(debtChartData);

    // Prepare income vs expenses data
    if (profile?.monthly_income) {
      const income = Number.parseFloat(profile.monthly_income.replace(/[^0-9.]/g, ''));
      if (!isNaN(income)) {
        const incomeExpenseData = [
          { category: 'Income', amount: income },
          { category: 'Expenses', amount: monthlyTotal }
        ];
        setIncomeVsExpenses(incomeExpenseData);
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-48 bg-muted" />
          </div>
        </header>
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full bg-muted" />
            <Skeleton className="h-80 w-full bg-muted" />
            <Skeleton className="h-80 w-full bg-muted" />
            <Skeleton className="h-80 w-full bg-muted" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">
              Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}! 👋
            </h1>
            <p className="text-sm text-muted-foreground">Here's your financial overview</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Spending by Category - Pie Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p>No expense data yet. Start tracking! 📊</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Progress - Line Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Savings Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savingsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={savingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p>No savings data yet. Set a goal! 🎯</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debt Status - Pie Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Debt Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debtData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={debtData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#16a34a" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p>No debt data. You're debt free! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income vs Expenses - Bar Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeVsExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={incomeVsExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p>Add income and expenses to see comparison 💰</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Link to="/chat" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span className="text-sm">AI Coach</span>
                </Button>
              </Link>
              <Link to="/conversations" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span className="text-sm">Chat History</span>
                </Button>
              </Link>
              <Link to="/savings" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span className="text-sm">Savings</span>
                </Button>
              </Link>
              <Link to="/debts" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <span className="text-sm">Debts</span>
                </Button>
              </Link>
              <Link to="/expenses" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <Receipt className="h-6 w-6 text-primary" />
                  <span className="text-sm">Expenses</span>
                </Button>
              </Link>
              <Link to="/health-score" className="w-full">
                <Button variant="outline" className="h-20 w-full flex-col gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <span className="text-sm">Health Score</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
