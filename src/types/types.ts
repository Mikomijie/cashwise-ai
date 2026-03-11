export interface Conversation {
  id: string;
  title: string;
  user_profile_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  contents: GeminiContent[];
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{ text: string }>;
    };
    finishReason: string;
    index: number;
  }>;
}

export interface UserProfile {
  id: string;
  name: string;
  monthly_income?: string;
  main_spending?: string;
  financial_goal?: string;
  created_at: string;
}

export interface OnboardingData {
  name: string;
  monthly_income: string;
  main_spending: string;
  financial_goal: string;
}

export interface SavingsGoal {
  id: string;
  user_profile_id?: string | null;
  goal_name: string;
  target_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsEntry {
  id: string;
  goal_id: string;
  amount: number;
  entry_date: string;
  notes?: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_profile_id?: string | null;
  creditor_name: string;
  amount: number;
  currency: string;
  due_date: string;
  reason?: string | null;
  status: 'unpaid' | 'paid';
  created_at: string;
  paid_at?: string | null;
}

export interface Expense {
  id: string;
  user_profile_id?: string | null;
  category: 'Food' | 'Transport' | 'Data/Airtime' | 'Rent' | 'Entertainment' | 'Other';
  amount: number;
  currency: string;
  expense_date: string;
  note?: string | null;
  created_at: string;
}
