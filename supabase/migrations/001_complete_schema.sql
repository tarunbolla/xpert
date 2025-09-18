-- Complete Database Schema for Expense Tracking App
-- This file contains the complete, consolidated database schema

-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_email)
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  paid_by_email TEXT NOT NULL,
  paid_by_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- AI-generated fields
  ai_category TEXT,
  ai_confidence DECIMAL(3,2)
);

-- Create expense_splits table (with ratio field included)
CREATE TABLE expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  ratio INTEGER DEFAULT 1,
  settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to explain the ratio field
COMMENT ON COLUMN expense_splits.ratio IS 'Split ratio for this user (e.g., 1, 2, 3 for different split amounts)';

-- Create transfers table for settlement payments
CREATE TABLE transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  from_user_email TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_email TEXT NOT NULL,
  to_user_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure users are different
  CONSTRAINT different_users CHECK (from_user_email != to_user_email),
  -- Ensure positive amount
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'expense', 'group', 'split', 'transfer'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  changes JSONB,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_groups_code ON groups(group_code);
CREATE INDEX idx_groups_archived ON groups(archived);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_email ON group_members(user_email);
CREATE INDEX idx_transfers_group_id ON transfers(group_id);
CREATE INDEX idx_transfers_from_user ON transfers(from_user_email);
CREATE INDEX idx_transfers_to_user ON transfers(to_user_email);
CREATE INDEX idx_transfers_date ON transfers(date);

-- Enable Row Level Security (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using group codes for access control)
CREATE POLICY "Allow public read access to groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to groups" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to groups" ON groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to groups" ON groups FOR DELETE USING (true);

CREATE POLICY "Allow public read access to group_members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to group_members" ON group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to group_members" ON group_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to group_members" ON group_members FOR DELETE USING (true);

CREATE POLICY "Allow public read access to expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to expenses" ON expenses FOR DELETE USING (true);

CREATE POLICY "Allow public read access to expense_splits" ON expense_splits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to expense_splits" ON expense_splits FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to transfers" ON transfers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to transfers" ON transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to transfers" ON transfers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to transfers" ON transfers FOR DELETE USING (true);

CREATE POLICY "Allow public read access to audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Function to generate group codes
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM groups WHERE group_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate group code on insert
CREATE OR REPLACE FUNCTION set_group_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_code IS NULL OR NEW.group_code = '' THEN
    NEW.group_code := generate_group_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-generate group codes
CREATE TRIGGER trigger_set_group_code
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_group_code();

-- Triggers to update updated_at
CREATE TRIGGER trigger_update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_transfers_updated_at
  BEFORE UPDATE ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();