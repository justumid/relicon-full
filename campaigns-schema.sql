-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    objective TEXT DEFAULT 'awareness',
    status TEXT DEFAULT 'active',
    budget_total DECIMAL(10,2) DEFAULT 0,
    budget_daily DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    target_audience JSONB DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE USING (auth.uid()::text = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
