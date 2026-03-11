import { supabase } from './supabase';

/**
 * Initialize sample data for demo purposes
 * This creates realistic financial data for first-time users
 */
export async function initializeSampleData(userProfileId: string): Promise<boolean> {
  try {
    // Check if sample data already exists
    const { data: existingGoals } = await supabase
      .from('savings_goals')
      .select('id')
      .eq('user_profile_id', userProfileId)
      .limit(1);

    if (existingGoals && existingGoals.length > 0) {
      console.log('Sample data already exists for this user');
      return true;
    }

    // Sample Savings Goals
    const savingsGoals = [
      {
        user_profile_id: userProfileId,
        goal_name: 'Emergency Fund',
        target_amount: 50000,
        current_amount: 32000,
        currency: 'NGN',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      },
      {
        user_profile_id: userProfileId,
        goal_name: 'New Laptop',
        target_amount: 150000,
        current_amount: 45000,
        currency: 'NGN',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months
      },
      {
        user_profile_id: userProfileId,
        goal_name: 'Business Capital',
        target_amount: 200000,
        current_amount: 80000,
        currency: 'NGN',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      },
    ];

    const { error: goalsError } = await supabase
      .from('savings_goals')
      .insert(savingsGoals);

    if (goalsError) {
      console.error('Error creating sample savings goals:', goalsError);
      return false;
    }

    // Sample Debts
    const debts = [
      {
        user_profile_id: userProfileId,
        debt_name: 'Friend Loan',
        total_amount: 20000,
        amount_paid: 12000,
        currency: 'NGN',
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days
        is_paid: false,
      },
      {
        user_profile_id: userProfileId,
        debt_name: 'Phone Payment Plan',
        total_amount: 45000,
        amount_paid: 45000,
        currency: 'NGN',
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        is_paid: true,
      },
      {
        user_profile_id: userProfileId,
        debt_name: 'SACCO Loan',
        total_amount: 100000,
        amount_paid: 35000,
        currency: 'NGN',
        due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 months
        is_paid: false,
      },
    ];

    const { error: debtsError } = await supabase
      .from('debts')
      .insert(debts);

    if (debtsError) {
      console.error('Error creating sample debts:', debtsError);
      return false;
    }

    // Sample Expenses (last 30 days)
    const expenses = [
      // This week
      {
        user_profile_id: userProfileId,
        category: 'food',
        amount: 3500,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Groceries at the market',
      },
      {
        user_profile_id: userProfileId,
        category: 'transport',
        amount: 1200,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Uber to work',
      },
      {
        user_profile_id: userProfileId,
        category: 'data_airtime',
        amount: 2000,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'MTN data bundle',
      },
      {
        user_profile_id: userProfileId,
        category: 'entertainment',
        amount: 5000,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Movie night with friends',
      },
      // Last week
      {
        user_profile_id: userProfileId,
        category: 'food',
        amount: 4200,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Restaurant lunch',
      },
      {
        user_profile_id: userProfileId,
        category: 'rent',
        amount: 35000,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Monthly rent payment',
      },
      {
        user_profile_id: userProfileId,
        category: 'transport',
        amount: 800,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Bus fare',
      },
      // Earlier this month
      {
        user_profile_id: userProfileId,
        category: 'food',
        amount: 6500,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Weekly groceries',
      },
      {
        user_profile_id: userProfileId,
        category: 'data_airtime',
        amount: 1500,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Airtime top-up',
      },
      {
        user_profile_id: userProfileId,
        category: 'entertainment',
        amount: 3000,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Concert ticket',
      },
      {
        user_profile_id: userProfileId,
        category: 'transport',
        amount: 2500,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Taxi rides',
      },
      {
        user_profile_id: userProfileId,
        category: 'food',
        amount: 5800,
        currency: 'NGN',
        expense_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: 'Food shopping',
      },
    ];

    const { error: expensesError } = await supabase
      .from('expenses')
      .insert(expenses);

    if (expensesError) {
      console.error('Error creating sample expenses:', expensesError);
      return false;
    }

    console.log('✅ Sample data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return false;
  }
}
