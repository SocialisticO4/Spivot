import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.spivot_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user profile exists, if not create one
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', data.user.id)
        .single();

      if (!existingUser) {
        // Create user profile
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            auth_id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            business_name: 'My Business',
            business_type: 'retail'
          })
          .select()
          .single();

        if (newUser && !userError) {
          // Seed demo data for new user
          await seedDemoData(supabase, newUser.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

async function seedDemoData(supabase: any, userId: number) {
  // Seed inventory items
  const inventoryItems = [
    { user_id: userId, sku: "STL-001", name: "Steel Sheets (1mm)", qty: 45, unit: "kg", reorder_level: 100, lead_time_days: 7, unit_cost: 85 },
    { user_id: userId, sku: "ALU-001", name: "Aluminum Plates", qty: 120, unit: "kg", reorder_level: 80, lead_time_days: 10, unit_cost: 210 },
    { user_id: userId, sku: "RUB-001", name: "Rubber Gaskets", qty: 350, unit: "pieces", reorder_level: 200, lead_time_days: 5, unit_cost: 12 },
    { user_id: userId, sku: "BRK-001", name: "Brake Pads (Set)", qty: 25, unit: "sets", reorder_level: 50, lead_time_days: 14, unit_cost: 450 },
    { user_id: userId, sku: "OIL-001", name: "Hydraulic Oil", qty: 80, unit: "liters", reorder_level: 100, lead_time_days: 3, unit_cost: 180 },
  ];

  await supabase.from('inventory').insert(inventoryItems);

  // Seed transactions (last 30 days)
  const transactions = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add 1-3 transactions per day
    const numTransactions = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numTransactions; j++) {
      const isCredit = Math.random() > 0.4;
      transactions.push({
        user_id: userId,
        date: date.toISOString(),
        amount: isCredit ? Math.round(20000 + Math.random() * 80000) : Math.round(5000 + Math.random() * 30000),
        type: isCredit ? 'credit' : 'debit',
        category: isCredit 
          ? ['Product Sales', 'Service Revenue', 'Advance Payment'][Math.floor(Math.random() * 3)]
          : ['Raw Materials', 'Salaries', 'Utilities', 'Logistics', 'Rent'][Math.floor(Math.random() * 5)],
        description: isCredit ? 'Customer payment received' : 'Business expense'
      });
    }
  }

  await supabase.from('transactions').insert(transactions);

  // Seed agent logs
  const agentLogs = [
    { agent_name: "Visual Eye", action: "System initialized", result: "Ready for document processing", severity: "info" },
    { agent_name: "Prophet", action: "Demand forecast active", result: "Monitoring market trends", severity: "info" },
    { agent_name: "Quartermaster", action: "Inventory scan complete", result: "2 items below reorder point", severity: "warning" },
    { agent_name: "Treasurer", action: "Cashflow analysis", result: "Healthy cash position", severity: "info" },
    { agent_name: "Underwriter", action: "Credit score calculated", result: "Score: 680 (Good)", severity: "info" },
  ];

  await supabase.from('agent_logs').insert(agentLogs);
}
