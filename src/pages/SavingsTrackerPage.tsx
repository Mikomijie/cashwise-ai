import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, Plus, Target, TrendingUp, Trash2, Sparkles } from 'lucide-react';
import {
  getSavingsGoals,
  getSavingsEntries,
  createSavingsGoal,
  createSavingsEntry,
  deleteSavingsEntry,
  getTotalSaved
} from '@/db/api';
import type { SavingsGoal, SavingsEntry } from '@/types';
import { format } from 'date-fns';

export default function SavingsTrackerPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<SavingsGoal | null>(null);
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  // Goal form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState('');

  // Entry form state
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryNotes, setEntryNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const goalsData = await getSavingsGoals();
    setGoals(goalsData);

    if (goalsData.length > 0) {
      const goal = goalsData[0];
      setCurrentGoal(goal);
      await loadGoalData(goal.id);
    }

    setIsLoading(false);
  };

  const loadGoalData = async (goalId: string) => {
    const [entriesData, total] = await Promise.all([
      getSavingsEntries(goalId),
      getTotalSaved(goalId)
    ]);
    setEntries(entriesData);
    setTotalSaved(total);
  };

  const handleCreateGoal = async () => {
    if (!goalName.trim() || !targetAmount || !currency.trim()) return;

    const goal = await createSavingsGoal({
      goal_name: goalName,
      target_amount: Number.parseFloat(targetAmount),
      currency: currency
    });

    if (goal) {
      setGoals([goal, ...goals]);
      setCurrentGoal(goal);
      setGoalName('');
      setTargetAmount('');
      setCurrency('');
      setIsGoalDialogOpen(false);
      await loadGoalData(goal.id);
    }
  };

  const handleAddEntry = async () => {
    if (!currentGoal || !entryAmount) return;

    const entry = await createSavingsEntry({
      goal_id: currentGoal.id,
      amount: Number.parseFloat(entryAmount),
      entry_date: entryDate,
      notes: entryNotes || undefined
    });

    if (entry) {
      setEntries([entry, ...entries]);
      setTotalSaved(totalSaved + Number.parseFloat(entryAmount));
      setEntryAmount('');
      setEntryDate(format(new Date(), 'yyyy-MM-dd'));
      setEntryNotes('');
      setIsEntryDialogOpen(false);
    }
  };

  const handleDeleteEntry = async (id: string, amount: number) => {
    const success = await deleteSavingsEntry(id);
    if (success) {
      setEntries(entries.filter(e => e.id !== id));
      setTotalSaved(totalSaved - amount);
    }
  };

  const getProgressPercentage = () => {
    if (!currentGoal || currentGoal.target_amount === 0) return 0;
    return Math.min((totalSaved / currentGoal.target_amount) * 100, 100);
  };

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage();
    
    if (percentage === 0) {
      return "Let's start your savings journey! Every small step counts. 🌱";
    }
    if (percentage < 25) {
      return "Great start! You've taken the first step. Keep the momentum going! 🚀";
    }
    if (percentage < 50) {
      return "You're making progress! Almost halfway there. Keep it up! 💪";
    }
    if (percentage < 75) {
      return "Amazing! You're over halfway to your goal. Don't stop now! ⭐";
    }
    if (percentage < 100) {
      return "So close! You're almost there. The finish line is in sight! 🎯";
    }
    return "Congratulations! You've reached your goal! Time to celebrate! 🎉";
  };

  const formatCurrency = (amount: number, curr: string) => {
    return `${curr} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
          <Skeleton className="mb-6 h-48 w-full bg-muted" />
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
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl">Savings Tracker</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {!currentGoal ? (
          // No Goal State
          <Card className="border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-bold">Set Your First Savings Goal</h2>
              <p className="mb-6 text-muted-foreground">
                Start tracking your savings journey by creating a goal
              </p>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Savings Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Savings Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        placeholder="e.g., Emergency Fund, New Phone"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-amount">Target Amount</Label>
                      <Input
                        id="target-amount"
                        type="number"
                        placeholder="e.g., 50000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
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
                    <Button onClick={handleCreateGoal} className="w-full">
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Progress Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentGoal.goal_name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatCurrency(currentGoal.target_amount, currentGoal.currency)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(totalSaved, currentGoal.currency)}
                    </span>
                    <span className="font-semibold text-primary">
                      {getProgressPercentage().toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Saved</span>
                    <span>
                      {formatCurrency(currentGoal.target_amount - totalSaved, currentGoal.currency)} remaining
                    </span>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm font-medium text-primary md:text-base">
                    {getMotivationalMessage()}
                  </p>
                </div>

                {/* Add Entry Button */}
                <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Log New Savings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Savings Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="entry-amount">Amount</Label>
                        <Input
                          id="entry-amount"
                          type="number"
                          placeholder="e.g., 5000"
                          value={entryAmount}
                          onChange={(e) => setEntryAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entry-date">Date</Label>
                        <Input
                          id="entry-date"
                          type="date"
                          value={entryDate}
                          onChange={(e) => setEntryDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entry-notes">Notes (Optional)</Label>
                        <Input
                          id="entry-notes"
                          placeholder="e.g., Monthly savings"
                          value={entryNotes}
                          onChange={(e) => setEntryNotes(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddEntry} className="w-full">
                        Add Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Savings History */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Savings History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No savings entries yet. Start by logging your first savings!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {formatCurrency(entry.amount, currentGoal.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id, entry.amount)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
