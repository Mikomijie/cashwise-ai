import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, Plus, Receipt, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getMonthlyExpensesByCategory,
  getMonthlyExpenseTotal,
  getLatestUserProfile
} from '@/db/api';
import type { Expense, UserProfile } from '@/types';
import { format } from 'date-fns';

const CATEGORIES = ['Food', 'Transport', 'Data/Airtime', 'Rent', 'Entertainment', 'Other'];

export default function ExpenseTrackerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [expensesData, categoryData, totalData, profileData] = await Promise.all([
      getExpenses(),
      getMonthlyExpensesByCategory(),
      getMonthlyExpenseTotal(),
      getLatestUserProfile()
    ]);
    setExpenses(expensesData);
    setCategoryTotals(categoryData);
    setMonthlyTotal(totalData);
    setUserProfile(profileData);
    setIsLoading(false);
  };

  const handleAddExpense = async () => {
    if (!category || !amount || !currency.trim() || !expenseDate) return;

    const expense = await createExpense({
      category,
      amount: Number.parseFloat(amount),
      currency: currency,
      expense_date: expenseDate,
      note: note || undefined
    });

    if (expense) {
      await loadData();
      setCategory('');
      setAmount('');
      setCurrency('');
      setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
      setNote('');
      setIsDialogOpen(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const success = await deleteExpense(id);
    if (success) {
      await loadData();
    }
  };

  const formatCurrency = (amt: number, curr: string) => {
    return `${curr} ${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getBudgetComparison = () => {
    if (!userProfile?.monthly_income) return null;
    
    const income = Number.parseFloat(userProfile.monthly_income.replace(/[^0-9.]/g, ''));
    if (isNaN(income) || income === 0) return null;

    const percentSpent = (monthlyTotal / income) * 100;
    const isOverBudget = percentSpent > 80;

    return {
      income,
      percentSpent,
      isOverBudget,
      remaining: income - monthlyTotal
    };
  };

  const budgetComparison = getBudgetComparison();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center gap-4 px-4">
            <Skeleton className="h-10 w-10 bg-muted" />
            <Skeleton className="h-6 w-48 bg-muted" />
          </div>
        </header>
        <main className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-6 h-32 w-full bg-muted" />
          <Skeleton className="h-64 w-full bg-muted" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl">Expense Tracker</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {/* Monthly Summary */}
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="mb-4 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Total Spent This Month</p>
              <p className="text-3xl font-bold text-primary md:text-4xl">
                {expenses.length > 0 && expenses[0].currency} {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Budget Comparison */}
            {budgetComparison && (
              <div className={`mt-4 rounded-lg p-4 ${budgetComparison.isOverBudget ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {budgetComparison.isOverBudget ? (
                      <TrendingUp className="h-5 w-5 text-destructive" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-semibold">
                      {budgetComparison.isOverBudget ? 'Over Budget' : 'Under Budget'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${budgetComparison.isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                    {budgetComparison.percentSpent.toFixed(1)}% of income
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {budgetComparison.isOverBudget 
                    ? `You've spent ${formatCurrency(monthlyTotal - budgetComparison.income, expenses[0]?.currency || 'USD')} more than your income`
                    : `You have ${formatCurrency(budgetComparison.remaining, expenses[0]?.currency || 'USD')} remaining this month`
                  }
                </p>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Spending by Category</p>
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <div key={cat} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="font-medium">{cat}</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(total, expenses[0]?.currency || 'USD')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Expense Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Log New Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="e.g., NGN, KES, USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  placeholder="e.g., lunch with friends"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button onClick={handleAddExpense} className="w-full">
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expenses List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Expenses ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No expenses logged yet. Start tracking your spending! 💰</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold">{expense.category}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                        {expense.note && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {expense.note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
