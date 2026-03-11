-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create savings_entries table
CREATE TABLE IF NOT EXISTS savings_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_profile_id ON savings_goals(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_savings_entries_goal_id ON savings_entries(goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_entries_entry_date ON savings_entries(entry_date DESC);

-- Enable RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to savings_goals"
  ON savings_goals FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to savings_goals"
  ON savings_goals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to savings_goals"
  ON savings_goals FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to savings_goals"
  ON savings_goals FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to savings_entries"
  ON savings_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to savings_entries"
  ON savings_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to savings_entries"
  ON savings_entries FOR DELETE
  USING (true);

-- Function to update goal updated_at timestamp
CREATE OR REPLACE FUNCTION update_goal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE savings_goals
  SET updated_at = NOW()
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal timestamp when new entry is added
CREATE TRIGGER update_goal_timestamp_trigger
AFTER INSERT ON savings_entries
FOR EACH ROW
EXECUTE FUNCTION update_goal_timestamp();