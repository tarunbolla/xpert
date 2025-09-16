import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analyzeExpense } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { groupId, title, description, amount, date, category, paidByEmail, paidByName, splits } = await request.json()

    if (!groupId || !title || !amount || !paidByEmail || !paidByName || !splits) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get existing expenses for AI analysis
    const { data: existingExpenses } = await supabase
      .from('expenses')
      .select('title, amount, date')
      .eq('group_id', groupId)
      .order('date', { ascending: false })
      .limit(10)

    // Use provided category or AI analysis
    let finalCategory: string
    let aiConfidence: number = 1.0

    if (category && category.trim() !== '') {
      // User provided a category
      finalCategory = category
    } else {
      // AI Analysis
      const aiAnalysis = await analyzeExpense(
        title,
        description || '',
        amount
      )
      finalCategory = aiAnalysis.category
      aiConfidence = aiAnalysis.confidence
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        title,
        description,
        amount,
        date: date || new Date().toISOString(),
        paid_by_email: paidByEmail,
        paid_by_name: paidByName,
        category: finalCategory,
        ai_category: finalCategory,
        ai_confidence: aiConfidence,
      })
      .select()
      .single()

    if (expenseError) {
      console.error('Error creating expense:', expenseError)
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }

    // Create expense splits
    const splitsData = splits.map((split: any) => ({
      expense_id: expense.id,
      user_email: split.email,
      user_name: split.name,
      amount: split.amount,
      ratio: split.ratio,
    }))

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsData)

    if (splitsError) {
      console.error('Error creating splits:', splitsError)
      return NextResponse.json({ error: 'Failed to create expense splits' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'expense',
        entity_id: expense.id,
        action: 'CREATE',
        changes: {
          title,
          amount,
          category: finalCategory,
          paid_by: paidByEmail,
        },
        user_email: paidByEmail,
        user_name: paidByName,
      })

    return NextResponse.json({
      expense: {
        ...expense,
        splits: splitsData,
        aiAnalysis: {
          category: finalCategory,
          confidence: aiConfidence,
        },
      },
    })
  } catch (error) {
    console.error('Error in POST /api/expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Get expenses with splits
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_splits (*)
      `)
      .eq('group_id', groupId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Error in GET /api/expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { expenseId, title, description, amount, category, splits, userEmail, userName } = await request.json()

    if (!expenseId || !title || !amount || !userEmail || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current expense for audit log
    const { data: currentExpense } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single()

    if (!currentExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Update expense
    const { data: updatedExpense, error: updateError } = await supabase
      .from('expenses')
      .update({
        title,
        description,
        amount,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating expense:', updateError)
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
    }

    // Update splits if provided
    if (splits) {
      // Delete existing splits
      await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expenseId)

      // Insert new splits
      const splitsData = splits.map((split: any) => ({
        expense_id: expenseId,
        user_email: split.email,
        user_name: split.name,
        amount: split.amount,
        ratio: split.ratio,
      }))

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splitsData)

      if (splitsError) {
        console.error('Error updating splits:', splitsError)
        return NextResponse.json({ error: 'Failed to update expense splits' }, { status: 500 })
      }
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'expense',
        entity_id: expenseId,
        action: 'UPDATE',
        changes: {
          before: {
            title: currentExpense.title,
            amount: currentExpense.amount,
            category: currentExpense.category,
          },
          after: {
            title,
            amount,
            category,
          },
        },
        user_email: userEmail,
        user_name: userName,
      })

    return NextResponse.json({ expense: updatedExpense })
  } catch (error) {
    console.error('Error in PUT /api/expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')
    const userEmail = searchParams.get('userEmail')
    const userName = searchParams.get('userName')

    if (!expenseId || !userEmail || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current expense for audit log
    const { data: currentExpense } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single()

    if (!currentExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Delete expense (cascades to splits due to foreign key)
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (deleteError) {
      console.error('Error deleting expense:', deleteError)
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'expense',
        entity_id: expenseId,
        action: 'DELETE',
        changes: {
          deleted_expense: {
            title: currentExpense.title,
            amount: currentExpense.amount,
            category: currentExpense.category,
            paid_by: currentExpense.paid_by_email,
          },
        },
        user_email: userEmail,
        user_name: userName,
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
