import { supabase } from './supabase';
import type { Conversation, Message, UserProfile, SavingsGoal, SavingsEntry, Debt, Expense } from '@/types';

// User Profile API
export async function createUserProfile(data: {
  name: string;
  monthly_income?: string;
  main_spending?: string;
  financial_goal?: string;
}): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert(data)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return profile;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function getLatestUserProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest user profile:', error);
    return null;
  }

  return data;
}

// Conversation API
export async function createConversation(
  title = 'New Conversation',
  userProfileId?: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ 
      title,
      user_profile_id: userProfileId || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
}

export async function getConversations(limit = 20): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getLatestConversation(userProfileId?: string): Promise<Conversation | null> {
  let query = supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (userProfileId) {
    query = query.eq('user_profile_id', userProfileId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching latest conversation:', error);
    return null;
  }

  return data;
}

export async function updateConversationTitle(id: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }

  return true;
}

export async function deleteConversation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
}

// Message API
export async function createMessage(
  conversationId: string,
  role: 'user' | 'model',
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating message:', error);
    return null;
  }

  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Savings Goals API
export async function createSavingsGoal(data: {
  user_profile_id?: string;
  goal_name: string;
  target_amount: number;
  currency: string;
}): Promise<SavingsGoal | null> {
  const { data: goal, error } = await supabase
    .from('savings_goals')
    .insert({
      user_profile_id: data.user_profile_id || null,
      goal_name: data.goal_name,
      target_amount: data.target_amount,
      currency: data.currency
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating savings goal:', error);
    return null;
  }

  return goal;
}

export async function getSavingsGoals(userProfileId?: string): Promise<SavingsGoal[]> {
  let query = supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (userProfileId) {
    query = query.eq('user_profile_id', userProfileId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getSavingsGoal(id: string): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching savings goal:', error);
    return null;
  }

  return data;
}

export async function updateSavingsGoal(
  id: string,
  data: { goal_name?: string; target_amount?: number; currency?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('savings_goals')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating savings goal:', error);
    return false;
  }

  return true;
}

export async function deleteSavingsGoal(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting savings goal:', error);
    return false;
  }

  return true;
}

// Savings Entries API
export async function createSavingsEntry(data: {
  goal_id: string;
  amount: number;
  entry_date: string;
  notes?: string;
}): Promise<SavingsEntry | null> {
  const { data: entry, error } = await supabase
    .from('savings_entries')
    .insert({
      goal_id: data.goal_id,
      amount: data.amount,
      entry_date: data.entry_date,
      notes: data.notes || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating savings entry:', error);
    return null;
  }

  return entry;
}

export async function getSavingsEntries(goalId: string): Promise<SavingsEntry[]> {
  const { data, error } = await supabase
    .from('savings_entries')
    .select('*')
    .eq('goal_id', goalId)
    .order('entry_date', { ascending: false });

  if (error) {
    console.error('Error fetching savings entries:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function deleteSavingsEntry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('savings_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting savings entry:', error);
    return false;
  }

  return true;
}

export async function getTotalSaved(goalId: string): Promise<number> {
  const { data, error } = await supabase
    .from('savings_entries')
    .select('amount')
    .eq('goal_id', goalId);

  if (error) {
    console.error('Error calculating total saved:', error);
    return 0;
  }

  if (!data || !Array.isArray(data)) {
    return 0;
  }

  return data.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

// Debts API
export async function createDebt(data: {
  user_profile_id?: string;
  creditor_name: string;
  amount: number;
  currency: string;
  due_date: string;
  reason?: string;
}): Promise<Debt | null> {
  const { data: debt, error } = await supabase
    .from('debts')
    .insert({
      user_profile_id: data.user_profile_id || null,
      creditor_name: data.creditor_name,
      amount: data.amount,
      currency: data.currency,
      due_date: data.due_date,
      reason: data.reason || null,
      status: 'unpaid'
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating debt:', error);
    return null;
  }

  return debt;
}

export async function getDebts(userProfileId?: string, status?: 'unpaid' | 'paid'): Promise<Debt[]> {
  let query = supabase
    .from('debts')
    .select('*')
    .order('due_date', { ascending: true });

  if (userProfileId) {
    query = query.eq('user_profile_id', userProfileId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching debts:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function markDebtAsPaid(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('debts')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking debt as paid:', error);
    return false;
  }

  return true;
}

export async function deleteDebt(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting debt:', error);
    return false;
  }

  return true;
}

export async function getTotalOwed(userProfileId?: string): Promise<number> {
  let query = supabase
    .from('debts')
    .select('amount')
    .eq('status', 'unpaid');

  if (userProfileId) {
    query = query.eq('user_profile_id', userProfileId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error calculating total owed:', error);
    return 0;
  }

  if (!data || !Array.isArray(data)) {
    return 0;
  }

  return data.reduce((sum, debt) => sum + Number(debt.amount), 0);
}

// Expenses API
export async function createExpense(data: {
  user_profile_id?: string;
  category: string;
  amount: number;
  currency: string;
  expense_date: string;
  note?: string;
}): Promise<Expense | null> {
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      user_profile_id: data.user_profile_id || null,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      expense_date: data.expense_date,
      note: data.note || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating expense:', error);
    return null;
  }

  return expense;
}

export async function getExpenses(userProfileId?: string, startDate?: string, endDate?: string): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (userProfileId) {
    query = query.eq('user_profile_id', userProfileId);
  }

  if (startDate) {
    query = query.gte('expense_date', startDate);
  }

  if (endDate) {
    query = query.lte('expense_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    return false;
  }

  return true;
}

export async function getMonthlyExpensesByCategory(userProfileId?: string, month?: string): Promise<Record<string, number>> {
  const startDate = month || new Date().toISOString().slice(0, 7) + '-01';
  const endDate = month 
    ? new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).toISOString().slice(0, 10)
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);

  const expenses = await getExpenses(userProfileId, startDate, endDate);

  const categoryTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += Number(expense.amount);
  });

  return categoryTotals;
}

export async function getMonthlyExpenseTotal(userProfileId?: string, month?: string): Promise<number> {
  const categoryTotals = await getMonthlyExpensesByCategory(userProfileId, month);
  return Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
}
