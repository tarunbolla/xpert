import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Get expenses for analysis
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('category, amount, date')
      .eq('group_id', groupId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses for insights:', error)
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    // Calculate basic statistics
    const totalSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
    const categoryTotals = expenses?.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>) || {}

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount) // Sort by amount in descending order

    return NextResponse.json({
      insights: 'Expense tracking and categorization enabled',
      totalSpent,
      expenseCount: expenses?.length || 0,
      categoryBreakdown,
    })
  } catch (error) {
    console.error('Error in GET /api/insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
