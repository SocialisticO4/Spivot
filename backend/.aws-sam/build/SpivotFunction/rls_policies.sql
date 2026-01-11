-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we are in demo mode without full auth sync yet)
-- WARNING: In production, these should check 'auth.uid() = user_id'

-- Users
CREATE POLICY "Public users access" ON users FOR ALL USING (true);

-- Inventory
CREATE POLICY "Public inventory access" ON inventory FOR ALL USING (true);

-- Transactions
CREATE POLICY "Public transactions access" ON transactions FOR ALL USING (true);

-- Documents
CREATE POLICY "Public documents access" ON documents FOR ALL USING (true);

-- Agent Logs
CREATE POLICY "Public agent_logs access" ON agent_logs FOR ALL USING (true);

-- Insert dummy data if empty
INSERT INTO inventory (user_id, sku, name, qty, unit, unit_cost) 
SELECT 1, 'ITEM-001', 'Cotton Yarn', 500, 'kg', 240
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE sku = 'ITEM-001');

INSERT INTO inventory (user_id, sku, name, qty, unit, unit_cost) 
SELECT 1, 'ITEM-002', 'Polyester Fabric', 1200, 'meters', 85
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE sku = 'ITEM-002');
