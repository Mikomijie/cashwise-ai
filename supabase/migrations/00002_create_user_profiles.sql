-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_income TEXT,
  main_spending TEXT,
  financial_goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_profile_id to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_conversations_user_profile_id ON conversations(user_profile_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to user_profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to user_profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to user_profiles"
  ON user_profiles FOR UPDATE
  USING (true);