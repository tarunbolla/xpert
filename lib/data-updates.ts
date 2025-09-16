// Utility functions for updating data in the expense management app

interface UpdateExpenseData {
  expenseId: string
  title: string
  description?: string
  amount: number
  category: string
  splits?: Array<{
    name: string
    email: string
    amount: number
  }>
  userEmail: string
  userName: string
}

interface UpdateGroupData {
  groupId: string
  name: string
  description?: string
  userEmail: string
  userName: string
}

// Update an expense
export async function updateExpense(data: UpdateExpenseData) {
  try {
    const response = await fetch('/api/expenses', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update expense')
    }

    return result.expense
  } catch (error) {
    console.error('Error updating expense:', error)
    throw error
  }
}

// Delete an expense
export async function deleteExpense(expenseId: string, userEmail: string, userName: string) {
  try {
    const response = await fetch(`/api/expenses?expenseId=${expenseId}&userEmail=${userEmail}&userName=${userName}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete expense')
    }

    return result.success
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw error
  }
}

// Update a group
export async function updateGroup(data: UpdateGroupData) {
  try {
    const response = await fetch('/api/groups', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update group')
    }

    return result.group
  } catch (error) {
    console.error('Error updating group:', error)
    throw error
  }
}

// Get audit logs for an entity
export async function getAuditLogs(entityType: 'expense' | 'group', entityId: string) {
  try {
    const response = await fetch(`/api/audit-logs?entityType=${entityType}&entityId=${entityId}`)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch audit logs')
    }

    return result.logs
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}

// Example usage in React components:

/*
// Update an expense
const handleUpdateExpense = async () => {
  try {
    const updatedExpense = await updateExpense({
      expenseId: 'expense-123',
      title: 'Updated Restaurant Name',
      description: 'Updated description',
      amount: 75.50,
      category: 'Food & Dining',
      splits: [
        { name: 'John Doe', email: 'john@example.com', amount: 37.75 },
        { name: 'Jane Smith', email: 'jane@example.com', amount: 37.75 }
      ],
      userEmail: 'john@example.com',
      userName: 'John Doe'
    })
    
    // Refresh the expenses list
    loadExpenses()
  } catch (error) {
    console.error('Failed to update expense:', error)
  }
}

// Delete an expense
const handleDeleteExpense = async (expenseId: string) => {
  try {
    await deleteExpense(expenseId, 'john@example.com', 'John Doe')
    // Refresh the expenses list
    loadExpenses()
  } catch (error) {
    console.error('Failed to delete expense:', error)
  }
}

// Update a group
const handleUpdateGroup = async () => {
  try {
    const updatedGroup = await updateGroup({
      groupId: 'group-123',
      name: 'Updated Trip Name',
      description: 'Updated description',
      userEmail: 'john@example.com',
      userName: 'John Doe'
    })
    
  } catch (error) {
    console.error('Failed to update group:', error)
  }
}

// View audit trail
const handleViewAuditTrail = async (expenseId: string) => {
  try {
    const auditLogs = await getAuditLogs('expense', expenseId)
    // Display audit logs in UI
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  }
}
*/
