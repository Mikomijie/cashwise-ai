-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Data/Airtime', 'Rent', 'Entertainment', 'Other')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  expense_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_profile_id ON expenses(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to expenses"
  ON expenses FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to expenses"
  ON expenses FOR DELETE
  USING (true);