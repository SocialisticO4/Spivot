/**
 * Supabase Data Hooks
 * Frontend hooks for fetching data from Supabase
 */
import { supabase } from './supabase'
import { DashboardMetrics, CashflowAnalysis, InventoryItem, Transaction, AgentLog, SpivotScore } from './types'

// Backend API URL for AI agent operations
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || ''

// ============ Database Operations (Supabase Direct) ============

export async function getInventory(userId: number = 1): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data || []
}

export async function getTransactions(userId: number = 1, limit: number = 100): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getAgentLogs(limit: number = 50): Promise<AgentLog[]> {
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function createInventoryItem(item: Partial<InventoryItem>) {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item as any])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createTransaction(transaction: Partial<Transaction>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction as any])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ AI Agent Operations (AWS Lambda Backend) ============

export async function getDashboardMetrics(userId: number = 1): Promise<DashboardMetrics> {
  // First try backend, fallback to local calculation
  try {
    if (BACKEND_API_URL) {
      const res = await fetch(`${BACKEND_API_URL}/dashboard/metrics?user_id=${userId}`)
      if (res.ok) return res.json()
    }
  } catch (e) {
    console.log('Backend unavailable, using local calculation')
  }
  
  // Local fallback: calculate from Supabase data
  const transactions = await getTransactions(userId)
  const inventory = await getInventory(userId)
  
  const credits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const debits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
  const balance = credits - debits
  const burnRate = debits / 30
  const runway = burnRate > 0 ? Math.floor(balance / burnRate) : 999
  
  const pendingOrders = inventory.filter(i => i.qty < i.reorder_level).length
  const inventoryValue = inventory.reduce((sum, i) => sum + (i.qty * i.unit_cost), 0)
  
  return {
    cash_runway_days: runway,
    spivot_score: 650, // Default score
    pending_orders: pendingOrders,
    forecast_accuracy: 0.87,
    burn_rate: burnRate,
    total_inventory_value: inventoryValue
  }
}

export async function getCashflowAnalysis(userId: number = 1): Promise<CashflowAnalysis> {
  try {
    if (BACKEND_API_URL) {
      const res = await fetch(`${BACKEND_API_URL}/dashboard/cashflow?user_id=${userId}`)
      if (res.ok) return res.json()
    }
  } catch (e) {
    console.log('Backend unavailable, using local calculation')
  }
  
  // Local fallback
  const transactions = await getTransactions(userId)
  const credits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const debits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
  const balance = credits - debits
  const burnRate = debits / 30
  
  return {
    burn_rate: burnRate,
    cash_runway_days: burnRate > 0 ? Math.floor(balance / burnRate) : 999,
    current_balance: balance,
    alert_level: balance / burnRate < 20 ? 'critical' : balance / burnRate < 45 ? 'warning' : 'normal',
    monthly_inflow: credits,
    monthly_outflow: debits
  }
}

export async function getSpivotScore(userId: number = 1): Promise<SpivotScore> {
  try {
    if (BACKEND_API_URL) {
      const res = await fetch(`${BACKEND_API_URL}/cashflow/score?user_id=${userId}`)
      if (res.ok) return res.json()
    }
  } catch (e) {
    console.log('Backend unavailable, using default score')
  }
  
  // Default fallback
  return {
    score: 650,
    cash_consistency: 75,
    revenue_growth: 5,
    vendor_payment_history: 80,
    risk_level: 'medium'
  }
}

// Document processing (requires AI backend)
export async function uploadDocument(file: File, userId: number = 1) {
  if (!BACKEND_API_URL) {
    throw new Error('Backend API required for document processing')
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await fetch(`${BACKEND_API_URL}/documents/upload?user_id=${userId}`, {
    method: 'POST',
    body: formData
  })
  
  if (!res.ok) throw new Error('Failed to upload document')
  return res.json()
}

// Forecast (requires AI backend)
export async function getDemandForecast(userId: number = 1, days: number = 30) {
  if (!BACKEND_API_URL) {
    throw new Error('Backend API required for forecasting')
  }
  
  const res = await fetch(`${BACKEND_API_URL}/forecast/demand?user_id=${userId}&days=${days}`)
  if (!res.ok) throw new Error('Failed to get forecast')
  return res.json()
}
