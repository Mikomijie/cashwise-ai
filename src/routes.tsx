import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage';
import SavingsTrackerPage from './pages/SavingsTrackerPage';
import DebtTrackerPage from './pages/DebtTrackerPage';
import ExpenseTrackerPage from './pages/ExpenseTrackerPage';
import FinancialHealthScorePage from './pages/FinancialHealthScorePage';
import DashboardPage from './pages/DashboardPage';
import ConversationHistoryPage from './pages/ConversationHistoryPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Onboarding',
    path: '/onboarding',
    element: <OnboardingPage />
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    name: 'Chat',
    path: '/chat',
    element: <ChatPage />
  },
  {
    name: 'Conversation History',
    path: '/conversations',
    element: <ConversationHistoryPage />
  },
  {
    name: 'Savings Tracker',
    path: '/savings',
    element: <SavingsTrackerPage />
  },
  {
    name: 'Debt Tracker',
    path: '/debts',
    element: <DebtTrackerPage />
  },
  {
    name: 'Expense Tracker',
    path: '/expenses',
    element: <ExpenseTrackerPage />
  },
  {
    name: 'Financial Health Score',
    path: '/health-score',
    element: <FinancialHealthScorePage />
  }
];

export default routes;
