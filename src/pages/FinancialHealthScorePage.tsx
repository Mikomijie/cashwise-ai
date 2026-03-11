import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, Heart, TrendingUp, Target, Wallet, Award } from 'lucide-react';
import {
  getSavingsGoals,
  getSavingsEntries,
  getDebts,
  getExpenses,
  getMonthlyExpenseTotal,
  getLatestUserProfile
} from '@/db/api';
import type { UserProfile } from '@/types';

interface HealthScoreBreakdown {
  savingsConsistency: number;
  debtRepayment: number;
  spendingDiscipline: number;
  goalProgress: number;
  total: number;
}

export default function FinancialHealthScorePage() {
  const [score, setScore] = useState<HealthScoreBreakdown | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateHealthScore();
  }, []);

  const calculateHealthScore = async () => {
    setIsLoading(true);

    const [goals, debts, monthlyExpenses, profile] = await Promise.all([
      getSavingsGoals(),
      getDebts(),
      getMonthlyExpenseTotal(),
      getLatestUserProfile()
    ]);

    setUserProfile(profile);

    // Calculate Savings Consistency (30%)
    let savingsScore = 0;
    if (goals.length > 0) {
      const goal = goals[0];
      const entries = await getSavingsEntries(goal.id);
      
      if (entries.length > 0) {
        const totalSaved = entries.reduce((sum, entry) => sum + entry.amount, 0);
        const progressPercent = (totalSaved / goal.target_amount) * 100;
        savingsScore = Math.min(progressPercent, 100);
      }
    }

    // Calculate Debt Repayment (30%)
    const unpaidDebts = debts.filter(d => d.status === 'unpaid');
    const paidDebts = debts.filter(d => d.status === 'paid');
    let debtScore = 100;
    
    if (debts.length > 0) {
      const paidRatio = paidDebts.length / debts.length;
      debtScore = paidRatio * 100;
    }

    // Calculate Spending Discipline (25%)
    let spendingScore = 100;
    if (profile?.monthly_income) {
      const income = Number.parseFloat(profile.monthly_income.replace(/[^0-9.]/g, ''));
      if (!isNaN(income) && income > 0) {
        const spendingRatio = monthlyExpenses / income;
        if (spendingRatio <= 0.7) {
          spendingScore = 100;
        } else if (spendingRatio <= 0.9) {
          spendingScore = 70;
        } else if (spendingRatio <= 1.0) {
          spendingScore = 40;
        } else {
          spendingScore = 0;
        }
      }
    }

    // Calculate Goal Progress (15%)
    let goalScore = 0;
    if (goals.length > 0) {
      const goal = goals[0];
      const entries = await getSavingsEntries(goal.id);
      const totalSaved = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const progressPercent = (totalSaved / goal.target_amount) * 100;
      goalScore = Math.min(progressPercent, 100);
    }

    // Calculate weighted total
    const totalScore = Math.round(
      (savingsScore * 0.30) +
      (debtScore * 0.30) +
      (spendingScore * 0.25) +
      (goalScore * 0.15)
    );

    setScore({
      savingsConsistency: Math.round(savingsScore),
      debtRepayment: Math.round(debtScore),
      spendingDiscipline: Math.round(spendingScore),
      goalProgress: Math.round(goalScore),
      total: totalScore
    });

    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-primary';
    if (score >= 41) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-primary/10';
    if (score >= 41) return 'bg-accent/10';
    return 'bg-destructive/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Improvement';
  };

  const getMotivationalMessage = (score: number) => {
    if (score >= 71) {
      return "🎉 You're doing amazing! Keep up the great financial habits.";
    } else if (score >= 41) {
      return "💪 You're on the right track! A few improvements will boost your score.";
    } else {
      return "🌱 Every journey starts somewhere. Let's build better habits together!";
    }
  };

  const getImprovementTip = (category: string, score: number) => {
    if (category === 'savingsConsistency') {
      if (score < 50) return 'Start by saving just 10% of your income each month. Small steps lead to big wins! 💰';
      if (score < 80) return 'You\'re saving! Try to increase your savings rate by 5% this month. 📈';
      return 'Excellent savings habit! Consider setting a new, bigger goal. 🎯';
    }
    if (category === 'debtRepayment') {
      if (score < 50) return 'Focus on paying off your smallest debt first. Quick wins build momentum! 🚀';
      if (score < 80) return 'Great progress! Keep chipping away at those debts one by one. 💪';
      return 'Amazing! You\'re crushing your debts. Stay debt-free! 🎉';
    }
    if (category === 'spendingDiscipline') {
      if (score < 50) return 'Track every expense for one week. Awareness is the first step to control. 📝';
      if (score < 80) return 'Good discipline! Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. 💡';
      return 'Excellent spending control! You\'re a budgeting pro. 👏';
    }
    if (category === 'goalProgress') {
      if (score < 50) return 'Set a small, achievable goal first. Success breeds success! 🎯';
      if (score < 80) return 'You\'re making progress! Stay consistent and you\'ll reach your goal. 🏃';
      return 'You\'re so close! Keep pushing, the finish line is in sight! 🏆';
    }
    return '';
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
          <Skeleton className="mb-6 h-64 w-full bg-muted" />
          <Skeleton className="h-96 w-full bg-muted" />
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
            <Heart className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl">Financial Health Score</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {/* Main Score Card */}
        <Card className={`mb-6 border-2 ${score && getScoreBgColor(score.total)}`}>
          <CardContent className="pt-6 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Your Financial Health</span>
            </div>
            
            <div className={`mb-2 text-7xl font-bold md:text-8xl ${score && getScoreColor(score.total)}`}>
              {score?.total || 0}
            </div>
            
            <p className="mb-4 text-xl font-semibold text-muted-foreground">
              {score && getScoreLabel(score.total)}
            </p>
            
            <div className="mx-auto max-w-md rounded-lg bg-background p-4">
              <p className="text-sm font-medium">
                {score && getMotivationalMessage(score.total)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="space-y-4">
          {/* Savings Consistency */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Savings Consistency (30%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{score?.savingsConsistency || 0}%</span>
                <Progress value={score?.savingsConsistency || 0} className="w-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {score && getImprovementTip('savingsConsistency', score.savingsConsistency)}
              </p>
            </CardContent>
          </Card>

          {/* Debt Repayment */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Debt Repayment (30%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{score?.debtRepayment || 0}%</span>
                <Progress value={score?.debtRepayment || 0} className="w-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {score && getImprovementTip('debtRepayment', score.debtRepayment)}
              </p>
            </CardContent>
          </Card>

          {/* Spending Discipline */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Spending Discipline (25%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{score?.spendingDiscipline || 0}%</span>
                <Progress value={score?.spendingDiscipline || 0} className="w-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {score && getImprovementTip('spendingDiscipline', score.spendingDiscipline)}
              </p>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Goal Progress (15%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{score?.goalProgress || 0}%</span>
                <Progress value={score?.goalProgress || 0} className="w-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {score && getImprovementTip('goalProgress', score.goalProgress)}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
