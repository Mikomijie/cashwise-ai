-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  due_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_profile_id ON debts(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);

-- Enable RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to debts"
  ON debts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to debts"
  ON debts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to debts"
  ON debts FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to debts"
  ON debts FOR DELETE
  USING (true);