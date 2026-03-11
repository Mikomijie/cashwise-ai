import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, Plus, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import {
  getDebts,
  createDebt,
  markDebtAsPaid,
  deleteDebt,
  getTotalOwed
} from '@/db/api';
import type { Debt } from '@/types';
import { format } from 'date-fns';

export default function DebtTrackerPage() {
  const [unpaidDebts, setUnpaidDebts] = useState<Debt[]>([]);
  const [paidDebts, setPaidDebts] = useState<Debt[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [creditorName, setCreditorName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [unpaid, paid, total] = await Promise.all([
      getDebts(undefined, 'unpaid'),
      getDebts(undefined, 'paid'),
      getTotalOwed()
    ]);
    setUnpaidDebts(unpaid);
    setPaidDebts(paid);
    setTotalOwed(total);
    setIsLoading(false);
  };

  const handleAddDebt = async () => {
    if (!creditorName.trim() || !amount || !currency.trim() || !dueDate) return;

    const debt = await createDebt({
      creditor_name: creditorName,
      amount: Number.parseFloat(amount),
      currency: currency,
      due_date: dueDate,
      reason: reason || undefined
    });

    if (debt) {
      setUnpaidDebts([debt, ...unpaidDebts]);
      setTotalOwed(totalOwed + Number.parseFloat(amount));
      setCreditorName('');
      setAmount('');
      setCurrency('');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setReason('');
      setIsDialogOpen(false);
    }
  };

  const handleMarkAsPaid = async (debt: Debt) => {
    const success = await markDebtAsPaid(debt.id);
    if (success) {
      setUnpaidDebts(unpaidDebts.filter(d => d.id !== debt.id));
      setPaidDebts([{ ...debt, status: 'paid', paid_at: new Date().toISOString() }, ...paidDebts]);
      setTotalOwed(totalOwed - debt.amount);
    }
  };

  const handleDeleteDebt = async (id: string, amount: number, isPaid: boolean) => {
    const success = await deleteDebt(id);
    if (success) {
      if (isPaid) {
        setPaidDebts(paidDebts.filter(d => d.id !== id));
      } else {
        setUnpaidDebts(unpaidDebts.filter(d => d.id !== id));
        setTotalOwed(totalOwed - amount);
      }
    }
  };

  const formatCurrency = (amt: number, curr: string) => {
    return `${curr} ${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h1 className="text-lg font-semibold md:text-xl">Debt Tracker</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {/* Total Owed Counter */}
        <Card className="mb-6 border-2 border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="mb-2 text-sm text-muted-foreground">Total Amount Owed</p>
            <p className="text-3xl font-bold text-destructive md:text-4xl">
              {unpaidDebts.length > 0 && unpaidDebts[0].currency} {totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {unpaidDebts.length === 0 && (
              <div className="mt-4 rounded-lg bg-primary/10 p-4">
                <p className="text-lg font-semibold text-primary">
                  You're debt free! 🎉 Keep it up!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Debt Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Log New Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Debt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creditor">Who You Owe</Label>
                <Input
                  id="creditor"
                  placeholder="e.g., John, Bank, Friend"
                  value={creditorName}
                  onChange={(e) => setCreditorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 50000"
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
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., borrowed for rent"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button onClick={handleAddDebt} className="w-full">
                Add Debt
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unpaid Debts */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Unpaid Debts ({unpaidDebts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidDebts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No unpaid debts. You're doing great! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      isOverdue(debt.due_date) ? 'border-destructive bg-destructive/5' : 'bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold">{debt.creditor_name}</span>
                          <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                            Unpaid
                          </span>
                          {isOverdue(debt.due_date) && (
                            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-destructive">
                          {formatCurrency(debt.amount, debt.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(debt.due_date), 'MMM dd, yyyy')}
                        </p>
                        {debt.reason && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Reason: {debt.reason}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(debt)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark Paid
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDebt(debt.id, debt.amount, false)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cleared Debts */}
        {paidDebts.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Cleared Debts ({paidDebts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paidDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="rounded-lg border bg-card p-4 opacity-60 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold line-through">{debt.creditor_name}</span>
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            Paid
                          </span>
                        </div>
                        <p className="text-lg font-bold line-through">
                          {formatCurrency(debt.amount, debt.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Paid on: {debt.paid_at ? format(new Date(debt.paid_at), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                        {debt.reason && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Reason: {debt.reason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDebt(debt.id, debt.amount, true)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
