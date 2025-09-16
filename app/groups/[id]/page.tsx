'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, ChartBarIcon, UserGroupIcon, ClockIcon, UsersIcon, ClipboardDocumentListIcon, BanknotesIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  useGroup, 
  useExpenses, 
  useInsights, 
  useGroupMembers,
  useTransfers,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
  useAddGroupMember,
  useRemoveGroupMember,
  useUpdateGroupMember,
  type Group,
  type Expense,
  type Transfer,
  type Insights,
  type GroupMember
} from '@/lib/hooks/use-api'
import { EXPENSE_CATEGORIES } from '@/lib/config/expense-categories'
import { EditTransferModal } from '@/app/components/EditTransferModal'

interface Balance {
  user_email: string
  user_name: string
  total_paid: number
  total_owed: number
  net_balance: number // positive = should receive money, negative = should pay money
}

interface Settlement {
  from_user: string
  from_name: string
  to_user: string
  to_name: string
  amount: number
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [userPersona, setUserPersona] = useState<{ name: string; email: string } | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showEditExpense, setShowEditExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showManageMembers, setShowManageMembers] = useState(false)
  const [showAddTransfer, setShowAddTransfer] = useState(false)
  const [showEditTransfer, setShowEditTransfer] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
  const [prefilledTransfer, setPrefilledTransfer] = useState<{
    from_user_email: string
    to_user_email: string
    amount: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'balances'>('activity')
  const [balances, setBalances] = useState<Balance[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])

  // React Query hooks
  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(params.id)
  const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useExpenses(params.id)
  const { data: transfers = [], isLoading: transfersLoading, error: transfersError } = useTransfers(params.id)
  const { data: insights, isLoading: insightsLoading, error: insightsError } = useInsights(params.id)
  const { data: groupMembers = [], isLoading: membersLoading, error: membersError } = useGroupMembers(params.id)
  
  // Mutations
  const createExpenseMutation = useCreateExpense()
  const updateExpenseMutation = useUpdateExpense()
  const deleteExpenseMutation = useDeleteExpense()
  const createTransferMutation = useCreateTransfer()
  const updateTransferMutation = useUpdateTransfer()
  const deleteTransferMutation = useDeleteTransfer()
  const addMemberMutation = useAddGroupMember()
  const removeMemberMutation = useRemoveGroupMember()
  const updateMemberMutation = useUpdateGroupMember()

  const isLoading = groupLoading || expensesLoading || insightsLoading

  useEffect(() => {
    // Check for existing persona
    const savedPersona = localStorage.getItem('userPersona')
    if (savedPersona) {
      setUserPersona(JSON.parse(savedPersona))
    } else {
      router.push('/')
      return
    }
  }, [])

  const addExpense = async (expenseData: any) => {
    if (!userPersona) return

    try {
      await createExpenseMutation.mutateAsync({
        groupId: params.id,
        ...expenseData,
      })
      setShowAddExpense(false)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const editExpense = async (expenseData: any) => {
    if (!editingExpense) return

    try {
      await updateExpenseMutation.mutateAsync({
        expenseId: editingExpense.id,
        ...expenseData,
      })
      setShowEditExpense(false)
      setEditingExpense(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowEditExpense(true)
  }

  const handleDeleteExpense = async (expense: Expense) => {
    if (!userPersona) return

    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      try {
        await deleteExpenseMutation.mutateAsync({
          expenseId: expense.id,
          userEmail: userPersona.email,
          userName: userPersona.name,
          groupId: params.id,
        })
        
        // Close the modal after successful deletion
        setShowEditExpense(false)
        setEditingExpense(null)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const addTransfer = async (transferData: any) => {
    if (!userPersona) return

    try {
      await createTransferMutation.mutateAsync({
        groupId: params.id,
        fromUserEmail: userPersona.email,
        fromUserName: userPersona.name,
        ...transferData,
      })
      setShowAddTransfer(false)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const editTransfer = async (transferData: any) => {
    if (!editingTransfer) return

    try {
      await updateTransferMutation.mutateAsync({
        transferId: editingTransfer.id,
        ...transferData,
      })
      setShowEditTransfer(false)
      setEditingTransfer(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const handleEditTransfer = (transfer: Transfer) => {
    setEditingTransfer(transfer)
    setShowEditTransfer(true)
  }

  const handleDeleteTransfer = async (transfer: Transfer) => {
    if (!userPersona) return

    if (confirm(`Are you sure you want to delete this transfer?`)) {
      try {
        await deleteTransferMutation.mutateAsync({
          transferId: transfer.id,
          userEmail: userPersona.email,
          userName: userPersona.name,
          groupId: params.id,
        })
        
        // Close the modal after successful deletion
        setShowEditTransfer(false)
        setEditingTransfer(null)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const handleSettlementTransfer = (settlement: Settlement) => {
    setPrefilledTransfer({
      from_user_email: settlement.from_user,
      to_user_email: settlement.to_user,
      amount: settlement.amount
    })
    setShowAddTransfer(true)
  }

  const handleCardClick = useCallback((item: Expense | Transfer, type: 'expense' | 'transfer') => {
    if (type === 'expense') {
      handleEditExpense(item as Expense)
    } else {
      handleEditTransfer(item as Transfer)
    }
  }, [handleEditExpense, handleEditTransfer])

  // Calculate user's share for an expense
  const calculateUserShare = useCallback((expense: Expense) => {
    if (!userPersona) return { amount: 0, type: 'none' }
    
    const userSplit = expense.expense_splits.find(split => split.user_email === userPersona.email)
    if (!userSplit) return { amount: 0, type: 'none' }
    
    const userAmount = userSplit.amount
    const isPaidByUser = expense.paid_by_email === userPersona.email
    
    if (isPaidByUser) {
      // User paid the expense, show what they paid
      return { amount: userAmount, type: 'paid' }
    } else {
      // User owes money, show what they owe
      return { amount: userAmount, type: 'owe' }
    }
  }, [userPersona])

  // Calculate balances and settlements
  const calculateBalances = useCallback(() => {
    if (!group?.members || expensesLoading || transfersLoading) return

    // Debug logging
    console.log('Calculating balances with:', {
      expenses: expenses.length,
      transfers: transfers.length,
      members: group.members.length,
      expensesLoading,
      transfersLoading
    })
    console.log('Transfers:', transfers)
    console.log('Expenses:', expenses)

    const memberBalances: { [key: string]: Balance } = {}
    
    // Initialize balances for all members
    group.members.forEach(member => {
      memberBalances[member.email] = {
        user_email: member.email,
        user_name: member.name,
        total_paid: 0,
        total_owed: 0,
        net_balance: 0
      }
    })

    // Calculate what each person paid and owes from expenses
    expenses.forEach(expense => {
      // Add to total paid by the person who paid
      if (memberBalances[expense.paid_by_email]) {
        memberBalances[expense.paid_by_email].total_paid += expense.amount
      }

      // Add to total owed by each person who owes
      expense.expense_splits.forEach(split => {
        if (memberBalances[split.user_email]) {
          memberBalances[split.user_email].total_owed += split.amount
        }
      })
    })

    // Calculate net balance from expenses (positive = should receive money, negative = should pay money)
    Object.values(memberBalances).forEach(balance => {
      balance.net_balance = balance.total_paid - balance.total_owed
    })

    // Apply transfers to adjust net balances
    // Transfers reduce the debt of the sender and reduce the credit of the receiver
    transfers.forEach(transfer => {
      if (memberBalances[transfer.from_user_email]) {
        // Sender's debt is reduced (net balance becomes less negative or more positive)
        memberBalances[transfer.from_user_email].net_balance += transfer.amount
      }
      if (memberBalances[transfer.to_user_email]) {
        // Receiver's credit is reduced (net balance becomes less positive or more negative)
        memberBalances[transfer.to_user_email].net_balance -= transfer.amount
      }
    })

    // Round balances to avoid floating point precision issues
    Object.values(memberBalances).forEach(balance => {
      balance.total_paid = Math.round(balance.total_paid * 100) / 100
      balance.total_owed = Math.round(balance.total_owed * 100) / 100
      balance.net_balance = Math.round(balance.net_balance * 100) / 100
    })

    const calculatedBalances = Object.values(memberBalances)
    console.log('Final calculated balances (after transfers):', calculatedBalances)
    setBalances(calculatedBalances)

    // Calculate optimal settlements based on current net balances (after transfers)
    const settlements: Settlement[] = []
    const creditors = calculatedBalances.filter(b => b.net_balance > 0).sort((a, b) => b.net_balance - a.net_balance)
    const debtors = calculatedBalances.filter(b => b.net_balance < 0).sort((a, b) => a.net_balance - b.net_balance)

    console.log('Settlement calculation (after transfers):', {
      calculatedBalances,
      creditors: creditors.map(c => ({ name: c.user_name, balance: c.net_balance })),
      debtors: debtors.map(d => ({ name: d.user_name, balance: d.net_balance }))
    })

    // Create working copies to avoid modifying the working balance data
    const workingCreditors = creditors.map(c => ({ ...c }))
    const workingDebtors = debtors.map(d => ({ ...d }))

    let creditorIndex = 0
    let debtorIndex = 0

    while (creditorIndex < workingCreditors.length && debtorIndex < workingDebtors.length) {
      const creditor = workingCreditors[creditorIndex]
      const debtor = workingDebtors[debtorIndex]
      
      const settlementAmount = Math.min(creditor.net_balance, Math.abs(debtor.net_balance))
      
      if (settlementAmount > 0.01) { // Only create settlements for amounts > 1 cent
        const roundedAmount = Math.round(settlementAmount * 100) / 100
        settlements.push({
          from_user: debtor.user_email,
          from_name: debtor.user_name,
          to_user: creditor.user_email,
          to_name: creditor.user_name,
          amount: roundedAmount
        })

        creditor.net_balance = Math.round((creditor.net_balance - roundedAmount) * 100) / 100
        debtor.net_balance = Math.round((debtor.net_balance + roundedAmount) * 100) / 100
      }

      if (Math.abs(creditor.net_balance) < 0.01) creditorIndex++
      if (Math.abs(debtor.net_balance) < 0.01) debtorIndex++
    }

    console.log('Final settlements (after transfers):', settlements)
    setSettlements(settlements)
  }, [expenses, transfers, group?.members, expensesLoading, transfersLoading])

  // Recalculate balances when expenses change
  useEffect(() => {
    calculateBalances()
  }, [calculateBalances])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner loading-spinner-xl mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group data...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
          <button
            onClick={() => router.push('/groups')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Navigation Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container-pro">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button
                onClick={() => router.push('/groups')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                  <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900 font-poppins truncate">{group.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-green-600">
                  {userPersona?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base hidden sm:inline">{userPersona?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-pro py-4">
        <div className="max-w-7xl mx-auto">
          {/* Truly Symmetric Group Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="p-6">
                {/* Centered Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 font-poppins">{group.name}</h1>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" />
                      <span>{group.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BanknotesIcon className="w-4 h-4" />
                      <span>{insights?.expenseCount || 0} expenses</span>
                    </div>
                    <span className="font-mono text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded">
                      {group.group_code}
                    </span>
                  </div>
                </div>

                {/* Centered Stats */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-8 max-w-md">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">${insights?.totalSpent?.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{insights?.expenseCount || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Expenses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{group.members?.length || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Members</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consistent Action Buttons */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowManageMembers(true)}
                className="btn-primary min-w-[120px]"
              >
                <UsersIcon className="w-5 h-5" />
                <span>Members</span>
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary min-w-[120px]"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Expense</span>
              </button>
              <button
                onClick={() => setShowAddTransfer(true)}
                className="btn-primary min-w-[120px]"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Centered Tab Navigation */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'activity'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                <span>Activity</span>
              </button>
              <button
                onClick={() => setActiveTab('balances')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'balances'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BanknotesIcon className="w-4 h-4" />
                <span>Balances</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' ? (
            <>
              {/* Mobile-first Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Activity List - Mobile: Full width, Desktop: 75% */}
            <div className="lg:col-span-9">

          {/* Improved Activity List */}
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-md flex items-center justify-center" aria-hidden="true">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 font-poppins">Recent Activity</h2>
              </div>
            </div>
            
            {expenses.length === 0 && transfers.length === 0 ? (
              <div className="p-3 sm:p-4 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 font-poppins">No activity yet</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 leading-relaxed">
                    Add your first expense or transfer to start tracking your group's activity.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowAddExpense(true)}
                      className="btn-primary flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
                    >
                      <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowAddTransfer(true)}
                      className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Transfer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-body">
                <div className="space-y-4">
                  {/* Group activities by date */}
                  {(() => {
                    // Combine and sort all activities
                    const allActivities = [...expenses.map(expense => ({ ...expense, type: 'expense' })), ...transfers.map(transfer => ({ ...transfer, type: 'transfer' }))]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    
                    // Group by date
                    const groupedActivities = allActivities.reduce((groups, item) => {
                      const date = new Date(item.date).toDateString()
                      if (!groups[date]) {
                        groups[date] = []
                      }
                      groups[date].push(item)
                      return groups
                    }, {} as Record<string, typeof allActivities>)
                    
                    return (
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div>
                          {Object.entries(groupedActivities).map(([dateString, activities]) => (
                            <div key={dateString}>
                              {/* Date Label */}
                              <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-600">
                                  {new Date(dateString).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              {/* Activities for this date */}
                              <div className="divide-y divide-gray-100">
                                {activities.map((item) => (
                                  <motion.div
                                    key={`${item.type}-${item.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleCardClick(item, item.type as 'expense' | 'transfer')}
                                  >
                                  <div>
                                    <div className="mb-2">
                                      <span className="text-xs text-gray-500 font-medium">
                                        {item.type === 'expense' ? (item as Expense).category : 'Transfer'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                          {item.type === 'expense' ? (item as Expense).title : `${(item as Transfer).from_user_name} → ${(item as Transfer).to_user_name}`}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                          {item.type === 'expense' ? (
                                            <span>${item.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid by {(item as Expense).paid_by_name} • {(item as Expense).expense_splits.length} people</span>
                                          ) : (
                                            <span>${item.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        {item.type === 'expense' && (() => {
                                          const userShare = calculateUserShare(item as Expense)
                                          if (userShare.type === 'none') return null
                                          
                                          return (
                                            <>
                                              <div className={`text-xs font-semibold ${
                                                userShare.type === 'owe' ? 'text-red-600' : 'text-green-600'
                                              }`}>
                                                {userShare.type === 'owe' ? 'You owe' : 'You paid'}
                                              </div>
                                              <div className={`text-xs font-semibold ${
                                                userShare.type === 'owe' ? 'text-red-600' : 'text-green-600'
                                              }`}>
                                                ${userShare.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                              </div>
                                            </>
                                          )
                                        })()}
                                        {item.type === 'transfer' && (() => {
                                          const transfer = item as Transfer
                                          const isReceiver = transfer.to_user_email === userPersona?.email
                                          const isSender = transfer.from_user_email === userPersona?.email
                                          
                                          if (!isReceiver && !isSender) return null
                                          
                                          return (
                                            <>
                                              <div className={`text-xs font-semibold ${
                                                isReceiver ? 'text-green-600' : 'text-blue-600'
                                              }`}>
                                                {isReceiver ? 'You received' : 'You sent'}
                                              </div>
                                              <div className={`text-xs font-semibold ${
                                                isReceiver ? 'text-green-600' : 'text-blue-600'
                                              }`}>
                                                ${transfer.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                              </div>
                                            </>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
              </div>
            </div>

            {/* Category Breakdown - Mobile: Full width below activity, Desktop: Right side (25%) */}
            <div className="lg:col-span-3">
              {insights?.categoryBreakdown && insights.categoryBreakdown.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 sm:p-4 lg:sticky lg:top-8"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 font-poppins">Spending by Category</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {insights.categoryBreakdown.map((category) => (
                      <div key={category.category} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 font-medium">{category.category}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">${category.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-1 sm:h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 sm:p-4">
                  <div className="text-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">No spending data</h3>
                    <p className="text-gray-500 text-xs">Add expenses to see category breakdown</p>
                  </div>
                </div>
              )}
            </div>
          </div>
            </>
          ) : activeTab === 'balances' ? (
            /* Mobile-first Balances Tab */
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
              {/* Member Balances - Mobile: Full width, Desktop: Left Side (70%) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-3 sm:p-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900 font-poppins">Member Balances</h2>
                    </div>
                  </div>
                  
                  {balances.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-poppins">No balances yet</h3>
                      <p className="text-gray-500 text-xs sm:text-sm">Add expenses to see member balances</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {balances.map((balance) => (
                        <motion.div
                          key={balance.user_email}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900">{balance.user_name}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="w-24">Paid: ${balance.total_paid.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <span className="w-24">Owed: ${balance.total_owed.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className={`text-xs font-semibold ${
                                balance.net_balance < 0 
                                  ? 'text-red-600' 
                                  : balance.net_balance > 0 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                              }`}>
                                {balance.net_balance < 0 
                                  ? 'Owes'
                                  : balance.net_balance > 0 
                                    ? 'Gets'
                                    : 'Settled'
                                }
                              </div>
                              <div className={`text-xs font-semibold ${
                                balance.net_balance < 0 
                                  ? 'text-red-600' 
                                  : balance.net_balance > 0 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                              }`}>
                                {balance.net_balance !== 0 
                                  ? `$${Math.abs(balance.net_balance).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : ''
                                }
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Settlement Suggestions - Mobile: Full width below balances, Desktop: Right Side (30%) */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm lg:sticky lg:top-8">
                  <div className="p-3 sm:p-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900 font-poppins">Settlement</h2>
                    </div>
                  </div>
                  
                  {settlements.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-poppins">All settled up!</h3>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {transfers.length > 0 
                          ? `All debts settled through ${transfers.length} transfer${transfers.length !== 1 ? 's' : ''}`
                          : 'No payments needed'
                        }
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="p-3 sm:p-4 border-b border-gray-50">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {transfers.length > 0 
                            ? `After ${transfers.length} transfer${transfers.length !== 1 ? 's' : ''}, ${settlements.length} more payment${settlements.length !== 1 ? 's' : ''} needed:`
                            : `To settle all debts, make these ${settlements.length} payment${settlements.length !== 1 ? 's' : ''}:`
                          }
                        </p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {settlements.map((settlement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                  {settlement.from_name} → {settlement.to_name}
                                </h3>
                                <div className="text-xs text-gray-500">Payment</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                                    ${settlement.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSettlementTransfer(settlement)}
                                  className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 transition-colors duration-200 flex items-center justify-center"
                                  aria-label={`Create transfer for ${settlement.from_name} to ${settlement.to_name}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Transfer Modal */}
      {showAddTransfer && (
        <AddTransferModal
          userPersona={userPersona}
          group={group}
          prefilledData={prefilledTransfer}
          onClose={() => {
            setShowAddTransfer(false)
            setPrefilledTransfer(null)
          }}
          onAdd={addTransfer}
        />
      )}

      {/* Edit Transfer Modal */}
      {showEditTransfer && editingTransfer && (
        <EditTransferModal
          userPersona={userPersona}
          group={group}
          transfer={editingTransfer}
          onClose={() => {
            setShowEditTransfer(false)
            setEditingTransfer(null)
          }}
          onUpdate={editTransfer}
          onDelete={handleDeleteTransfer}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          userPersona={userPersona}
          group={group}
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
        />
      )}

      {/* Edit Expense Modal */}
      {showEditExpense && editingExpense && (
        <EditExpenseModal
          userPersona={userPersona}
          group={group}
          expense={editingExpense}
          onClose={() => {
            setShowEditExpense(false)
            setEditingExpense(null)
          }}
          onUpdate={editExpense}
          onDelete={handleDeleteExpense}
        />
      )}

      {/* Manage Members Modal */}
      {showManageMembers && (
        <ManageMembersModal
          group={group}
          userPersona={userPersona}
          onClose={() => setShowManageMembers(false)}
          onUpdate={() => {}}
        />
      )}
    </div>
  )
}

// Simplified Add Expense Modal Component
function AddExpenseModal({ 
  userPersona, 
  group,
  onClose, 
  onAdd 
}: { 
  userPersona: { name: string; email: string } | null
  group: Group | null
  onClose: () => void
  onAdd: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(), // Default to today in YYYY-MM-DD format
    category: '', // Will be set by AI
    paidByEmail: userPersona?.email || '',
    selectedMembers: [] as string[],
    memberRatios: {} as Record<string, number>
  })

  // Initialize with group members when modal opens
  useEffect(() => {
    if (group?.members) {
      const defaultRatios: Record<string, number> = {}
      group.members.forEach(member => {
        defaultRatios[member.email] = 1
      })
      
      setFormData(prev => ({ 
        ...prev, 
        selectedMembers: group.members?.map(m => m.email) || [],
        memberRatios: defaultRatios
      }))
    }
  }, [group])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount) {
      toast.error('Title and amount are required')
      return
    }

    if (formData.selectedMembers.length === 0) {
      toast.error('Please select at least one person to split with')
      return
    }

    const totalAmount = parseFloat(formData.amount)
    let splits: Array<{ name: string; email: string; amount: number }> = []

    // Calculate total ratio for selected members
    const totalRatio = formData.selectedMembers.reduce((sum, email) => {
      return sum + (formData.memberRatios[email] || 1)
    }, 0)

    if (totalRatio === 0) {
      toast.error('At least one member must have a ratio greater than 0')
      return
    }

    // Split based on ratios
    splits = formData.selectedMembers.map(email => {
      const member = group?.members?.find(m => m.email === email)
      const ratio = formData.memberRatios[email] || 1
      const amount = (totalAmount * ratio) / totalRatio
      
      return {
        name: member?.name || '',
        email: email,
        amount: amount,
        ratio: ratio
      }
    })

    onAdd({
      title: formData.title,
      description: formData.description,
      amount: totalAmount,
      date: formData.date,
      category: formData.category,
      paidByEmail: formData.paidByEmail,
      paidByName: group?.members?.find(m => m.email === formData.paidByEmail)?.name || userPersona?.name,
      splits
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="card-padding border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Expense</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="card-padding space-card">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was paid for? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Dinner at Beach Restaurant"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="input-field pl-8"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid by *
              </label>
              <select
                value={formData.paidByEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, paidByEmail: e.target.value }))}
                className="input-field"
                required
              >
                {group?.members?.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional details..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Auto-selected by AI)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
            >
              <option value="">AI will select category</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile-first Member Selection Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who should this be split between?
            </label>
            {!group?.members ? (
              <div className="flex items-center justify-center py-4">
                <div className="loading-spinner loading-spinner-md"></div>
                <span className="ml-2 text-gray-600">Loading members...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {group.members.map((member) => {
                  const isSelected = formData.selectedMembers.includes(member.email)
                  const ratio = formData.memberRatios[member.email] || 1
                  
                  // Calculate split amount for display
                  const totalRatio = formData.selectedMembers.reduce((sum, email) => {
                    return sum + (formData.memberRatios[email] || 1)
                  }, 0)
                  
                  const splitAmount = formData.amount && isSelected && totalRatio > 0
                    ? ((parseFloat(formData.amount) * ratio) / totalRatio).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'
                  
                  return (
                    <div
                      key={member.email}
                      onClick={() => {
                        if (isSelected) {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedMembers: prev.selectedMembers.filter(email => email !== member.email) 
                          }))
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedMembers: [...prev.selectedMembers, member.email] 
                          }))
                        }
                      }}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                        {/* Member Info */}
                        <div className="col-span-6">
                          <div className={`font-medium truncate text-sm sm:text-base ${
                            isSelected ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {member.name}
                          </div>
                        </div>
                        
                        {/* Ratio Input */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={ratio}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation() // Prevent card click
                              const value = e.target.value
                              const newRatio = value === '' ? 0 : Math.max(0, parseInt(value) || 0)
                              setFormData(prev => ({
                                ...prev,
                                memberRatios: {
                                  ...prev.memberRatios,
                                  [member.email]: newRatio
                                }
                              }))
                            }}
                            onFocus={(e) => e.stopPropagation()}
                            disabled={!isSelected}
                            className={`w-full px-1 sm:px-2 py-1 text-center border rounded text-xs sm:text-sm font-medium ${
                              isSelected 
                                ? 'border-green-300 bg-white text-green-700' 
                                : 'border-gray-200 bg-gray-50 text-gray-400'
                            }`}
                          />
                        </div>
                        
                        {/* Amount Display */}
                        <div className={`col-span-3 text-right ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
                          <div className="text-xs sm:text-sm font-semibold">${splitAmount}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>


          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Edit Expense Modal Component
function EditExpenseModal({ 
  userPersona, 
  group,
  expense,
  onClose, 
  onUpdate,
  onDelete
}: { 
  userPersona: { name: string; email: string } | null
  group: Group | null
  expense: Expense
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: (expense: Expense) => void
}) {
  const [formData, setFormData] = useState({
    title: expense.title,
    description: expense.description || '',
    amount: expense.amount.toString(),
    paidByEmail: expense.paid_by_email,
    selectedMembers: expense.expense_splits?.map(split => split.user_email) || [],
    memberRatios: {} as Record<string, number>
  })

  // Initialize with existing expense data
  useEffect(() => {
    if (expense.expense_splits) {
      const ratios: Record<string, number> = {}
      
      expense.expense_splits.forEach(split => {
        // Use the stored ratio directly
        ratios[split.user_email] = (split as any).ratio || 1
      })
      
      setFormData(prev => ({ 
        ...prev, 
        selectedMembers: expense.expense_splits.map(split => split.user_email),
        memberRatios: ratios
      }))
    }
  }, [expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount) {
      toast.error('Title and amount are required')
      return
    }

    if (formData.selectedMembers.length === 0) {
      toast.error('Please select at least one person to split with')
      return
    }

    const totalAmount = parseFloat(formData.amount)
    let splits: Array<{ name: string; email: string; amount: number }> = []

    // Calculate total ratio for selected members
    const totalRatio = formData.selectedMembers.reduce((sum, email) => {
      return sum + (formData.memberRatios[email] || 1)
    }, 0)

    if (totalRatio === 0) {
      toast.error('At least one member must have a ratio greater than 0')
      return
    }

    // Split based on ratios
    splits = formData.selectedMembers.map(email => {
      const member = group?.members?.find(m => m.email === email)
      const ratio = formData.memberRatios[email] || 1
      const amount = (totalAmount * ratio) / totalRatio
      
      return {
        name: member?.name || '',
        email: email,
        amount: amount,
        ratio: ratio
      }
    })

    onUpdate({
      title: formData.title,
      description: formData.description,
      amount: totalAmount,
      paidByEmail: formData.paidByEmail,
      paidByName: group?.members?.find(m => m.email === formData.paidByEmail)?.name || userPersona?.name,
      splits
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8 max-h-[90vh] flex flex-col"
      >
        <div className="card-padding border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="card-padding space-card">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was paid for? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Dinner at Beach Restaurant"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="input-field pl-8"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid by *
              </label>
              <select
                value={formData.paidByEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, paidByEmail: e.target.value }))}
                className="input-field"
                required
              >
                {group?.members?.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional details..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Member Selection Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who should this be split between?
            </label>
            {!group?.members ? (
              <div className="flex items-center justify-center py-4">
                <div className="loading-spinner loading-spinner-md"></div>
                <span className="ml-2 text-gray-600">Loading members...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {group.members.map((member) => {
                  const isSelected = formData.selectedMembers.includes(member.email)
                  const ratio = formData.memberRatios[member.email] || 1
                  
                  // Calculate split amount for display
                  const totalRatio = formData.selectedMembers.reduce((sum, email) => {
                    return sum + (formData.memberRatios[email] || 1)
                  }, 0)
                  
                  const splitAmount = formData.amount && isSelected && totalRatio > 0
                    ? ((parseFloat(formData.amount) * ratio) / totalRatio).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'
                  
                  return (
                    <div
                      key={member.email}
                      onClick={() => {
                        if (isSelected) {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedMembers: prev.selectedMembers.filter(email => email !== member.email) 
                          }))
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedMembers: [...prev.selectedMembers, member.email] 
                          }))
                        }
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Member Info */}
                        <div className="col-span-6">
                          <div className={`font-medium truncate ${
                            isSelected ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {member.name}
                          </div>
                        </div>
                        
                        {/* Ratio Input */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={ratio}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation() // Prevent card click
                              const value = e.target.value
                              const newRatio = value === '' ? 0 : Math.max(0, parseInt(value) || 0)
                              setFormData(prev => ({
                                ...prev,
                                memberRatios: {
                                  ...prev.memberRatios,
                                  [member.email]: newRatio
                                }
                              }))
                            }}
                            onFocus={(e) => e.stopPropagation()}
                            disabled={!isSelected}
                            className={`w-full px-2 py-1 text-center border rounded text-sm font-medium ${
                              isSelected 
                                ? 'border-green-300 bg-white text-green-700' 
                                : 'border-gray-200 bg-gray-50 text-gray-400'
                            }`}
                          />
                        </div>
                        
                        {/* Amount Display */}
                        <div className={`col-span-3 text-right ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
                          <div className="text-sm font-semibold">${splitAmount}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Update Expense
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Manage Members Modal Component
function ManageMembersModal({ 
  group, 
  userPersona, 
  onClose, 
  onUpdate 
}: { 
  group: Group | null
  userPersona: { name: string; email: string } | null
  onClose: () => void
  onUpdate: (group: Group) => void
}) {
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberName, setNewMemberName] = useState('')

  // React Query hooks
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(group?.id || '')
  const addMemberMutation = useAddGroupMember()
  const removeMemberMutation = useRemoveGroupMember()
  const updateMemberMutation = useUpdateGroupMember()

  const addMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast.error('Email and name are required')
      return
    }

    if (members.some(m => m.user_email === newMemberEmail)) {
      toast.error('Member already exists')
      return
    }

    if (!group || !userPersona) return

    try {
      await addMemberMutation.mutateAsync({
        groupId: group.id,
        userEmail: newMemberEmail,
        userName: newMemberName,
        role: 'member',
        addedByEmail: userPersona.email,
        addedByName: userPersona.name,
      })
      
      setNewMemberEmail('')
      setNewMemberName('')
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const removeMember = async (memberId: string, email: string) => {
    if (email === userPersona?.email) {
      toast.error('Cannot remove yourself')
      return
    }

    if (!group || !userPersona) return

    if (confirm(`Are you sure you want to remove ${email} from the group?`)) {
      try {
        await removeMemberMutation.mutateAsync({
          memberId,
          removedByEmail: userPersona.email,
          removedByName: userPersona.name,
          groupId: group.id,
        })
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const updateMemberRole = async (memberId: string, email: string, role: 'admin' | 'member') => {
    if (email === userPersona?.email) {
      toast.error('Cannot change your own role')
      return
    }

    if (!group) return

    try {
      await updateMemberMutation.mutateAsync({
        memberId,
        role,
        groupId: group.id,
      })
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const saveChanges = async () => {
    onClose()
  }

  if (!group) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="card-padding border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold">Manage Members - {group.name}</h2>
          <p className="text-sm text-gray-600 mt-1">Group Code: <span className="font-mono font-semibold">{group.group_code}</span></p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="card-padding space-y-6">
          {/* Current Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Members</h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.user_email} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Member Info - Compact */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-green-600">
                        {member.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 truncate">{member.user_name}</div>
                      <div className="text-xs text-gray-500 truncate">{member.user_email}</div>
                    </div>
                  </div>
                  
                  {/* Controls - Compact */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, member.user_email, e.target.value as 'admin' | 'member')}
                      disabled={member.user_email === userPersona?.email}
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    
                    {member.user_email !== userPersona?.email && member.id && (
                      <button
                        onClick={() => removeMember(member.id, member.user_email)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Member */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Add New Member</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Member email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={addMember}
                disabled={addMemberMutation.isPending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
        </div>

        <div className="flex gap-2 card-padding border-t border-gray-200 flex-shrink-0">
          <button
            onClick={saveChanges}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Add Transfer Modal Component
function AddTransferModal({ 
  userPersona, 
  group,
  prefilledData,
  onClose, 
  onAdd 
}: { 
  userPersona: { name: string; email: string } | null
  group: Group | undefined
  prefilledData?: {
    from_user_email: string
    to_user_email: string
    amount: number
  } | null
  onClose: () => void
  onAdd: (data: any) => void
}) {
  const [fromUserEmail, setFromUserEmail] = useState(prefilledData?.from_user_email || userPersona?.email || '')
  const [toUserEmail, setToUserEmail] = useState(prefilledData?.to_user_email || '')
  const [amount, setAmount] = useState(prefilledData?.amount?.toString() || '')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromUserEmail || !toUserEmail || !amount || !userPersona || !group) return

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      toast.error('Amount must be positive')
      return
    }

    if (fromUserEmail === toUserEmail) {
      toast.error('Cannot transfer to yourself')
      return
    }

    // Find both users
    const fromUser = group.members?.find(member => member.email === fromUserEmail)
    const toUser = group.members?.find(member => member.email === toUserEmail)
    
    if (!fromUser || !toUser) {
      toast.error('One or both users not found')
      return
    }

    onAdd({
      fromUserEmail,
      fromUserName: fromUser.name,
      toUserEmail,
      toUserName: toUser.name,
      amount: amountNum,
      description: description || undefined,
    })
  }

  if (!group?.members) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="card-padding border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-poppins">Add Transfer</h2>
              <p className="text-gray-500 text-sm">Record a settlement payment</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="card-padding">
            <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer from
              </label>
              <select
                value={fromUserEmail}
                onChange={(e) => setFromUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {group.members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer to
              </label>
              <select
                value={toUserEmail}
                onChange={(e) => setToUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select a member</option>
                {group.members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Settlement for dinner expenses"
              />
            </div>
            </form>
          </div>
        </div>
        
        <div className="flex gap-2 card-padding border-t border-gray-200 flex-shrink-0">
          <button
            type="submit"
            form="transfer-form"
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            Add Transfer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}


