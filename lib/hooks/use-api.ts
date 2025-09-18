import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface Group {
  id: string
  name: string
  description?: string
  group_code: string
  created_at: string
  archived?: boolean
  memberCount?: number
  totalExpenses?: number
  members?: Array<{
    email: string
    name: string
    role: 'admin' | 'member'
  }>
}

export interface Expense {
  id: string
  group_id: string
  title: string
  description?: string
  amount: number
  paid_by_email: string
  paid_by_name: string
  category: string
  ai_category?: string
  ai_confidence?: number
  date: string
  expense_splits: Array<{
    id: string
    user_email: string
    user_name: string
    amount: number
    ratio: number
    settled?: boolean
  }>
}

export interface Transfer {
  id: string
  group_id: string
  from_user_email: string
  from_user_name: string
  to_user_email: string
  to_user_name: string
  amount: number
  currency: string
  description?: string
  date: string
  created_at: string
  updated_at: string
}

export interface Insights {
  totalSpent: number
  expenseCount: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface GroupMember {
  id: string
  user_email: string
  user_name: string
  role: 'admin' | 'member'
}

// Query Keys
export const queryKeys = {
  groups: (userEmail: string) => ['groups', userEmail] as const,
  group: (groupId: string) => ['group', groupId] as const,
  expenses: (groupId: string) => ['expenses', groupId] as const,
  transfers: (groupId: string) => ['transfers', groupId] as const,
  insights: (groupId: string) => ['insights', groupId] as const,
  groupMembers: (groupId: string) => ['groupMembers', groupId] as const,
}

// API Functions
const api = {
  // Groups
  async getGroups(userEmail: string): Promise<Group[]> {
    const response = await fetch(`/api/groups?userEmail=${encodeURIComponent(userEmail)}`)
    const { groups, error } = await response.json()
    if (error) throw new Error(error)
    return groups || []
  },

  async getGroup(groupId: string): Promise<Group> {
    const response = await fetch(`/api/groups?groupId=${groupId}`)
    const { group, error } = await response.json()
    if (error) throw new Error(error)
    return group
  },

  async createGroup(data: {
    name: string
    description?: string
    userEmail: string
    userName: string
  }): Promise<Group> {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { group, error } = await response.json()
    if (error) throw new Error(error)
    return group
  },

  async deleteGroup(groupId: string, userEmail: string, userName: string): Promise<void> {
    const response = await fetch(`/api/groups?groupId=${groupId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, userName }),
    })
    const { error } = await response.json()
    if (error) throw new Error(error)
  },

  async archiveGroup(groupId: string, userEmail: string, userName: string, archived: boolean = true): Promise<void> {
    const response = await fetch(`/api/groups?groupId=${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived, userEmail, userName }),
    })
    const { error } = await response.json()
    if (error) throw new Error(error)
  },

  // Expenses
  async getExpenses(groupId: string): Promise<Expense[]> {
    const response = await fetch(`/api/expenses?groupId=${groupId}`)
    const { expenses } = await response.json()
    return expenses || []
  },

  async createExpense(data: {
    groupId: string
    title: string
    description?: string
    amount: number
    date?: string
    category?: string
    paidByEmail: string
    paidByName: string
    splits: Array<{
      userEmail: string
      userName: string
      amount: number
      ratio: number
    }>
  }): Promise<Expense> {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { expense, error } = await response.json()
    if (error) throw new Error(error)
    return expense
  },

  async updateExpense(expenseId: string, data: {
    title?: string
    description?: string
    amount?: number
    category?: string
    splits?: Array<{
      userEmail: string
      userName: string
      amount: number
      ratio: number
    }>
    userEmail?: string
    userName?: string
  }): Promise<Expense> {
    const response = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseId, ...data }),
    })
    const { expense, error } = await response.json()
    if (error) throw new Error(error)
    return expense
  },

  async deleteExpense(expenseId: string, userEmail: string, userName: string): Promise<void> {
    const response = await fetch(`/api/expenses?expenseId=${expenseId}&userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`, {
      method: 'DELETE',
    })
    const { error } = await response.json()
    if (error) throw new Error(error)
  },

  // Transfers
  async getTransfers(groupId: string): Promise<Transfer[]> {
    const response = await fetch(`/api/transfers?groupId=${groupId}`)
    const { transfers, error } = await response.json()
    if (error) throw new Error(error)
    return transfers || []
  },

  async createTransfer(data: {
    groupId: string
    fromUserEmail: string
    fromUserName: string
    toUserEmail: string
    toUserName: string
    amount: number
    description?: string
  }): Promise<Transfer> {
    const response = await fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { transfer, error } = await response.json()
    if (error) throw new Error(error)
    return transfer
  },

  async updateTransfer(data: {
    transferId: string
    fromUserEmail: string
    fromUserName: string
    toUserEmail: string
    toUserName: string
    amount: number
    description?: string
    userEmail: string
    userName: string
  }): Promise<Transfer> {
    const response = await fetch('/api/transfers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { transfer, error } = await response.json()
    if (error) throw new Error(error)
    return transfer
  },

  async deleteTransfer(transferId: string, userEmail: string, userName: string, groupId?: string): Promise<void> {
    const response = await fetch(`/api/transfers?transferId=${transferId}&userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`, {
      method: 'DELETE',
    })
    const { error } = await response.json()
    if (error) throw new Error(error)
  },

  // Insights
  async getInsights(groupId: string): Promise<Insights> {
    const response = await fetch(`/api/insights?groupId=${groupId}`)
    const insights = await response.json()
    return insights
  },

  // Group Members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await fetch(`/api/group-members?groupId=${groupId}`)
    const { members, error } = await response.json()
    if (error) throw new Error(error)
    return members || []
  },

  async addGroupMember(data: {
    groupId: string
    userEmail: string
    userName: string
    role: 'admin' | 'member'
    addedByEmail: string
    addedByName: string
  }): Promise<GroupMember> {
    const response = await fetch('/api/group-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { member, error } = await response.json()
    if (error) throw new Error(error)
    return member
  },

  async removeGroupMember(memberId: string, removedByEmail: string, removedByName: string): Promise<void> {
    const response = await fetch(`/api/group-members?memberId=${memberId}&removedByEmail=${removedByEmail}&removedByName=${removedByName}`, {
      method: 'DELETE',
    })
    const { error } = await response.json()
    if (error) throw new Error(error)
  },

  async updateGroupMember(memberId: string, role: 'admin' | 'member'): Promise<GroupMember> {
    const response = await fetch('/api/group-members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    })
    const { member, error } = await response.json()
    if (error) throw new Error(error)
    return member
  },
}

// React Query Hooks
export function useGroups(userEmail: string) {
  return useQuery({
    queryKey: queryKeys.groups(userEmail),
    queryFn: () => api.getGroups(userEmail),
    enabled: !!userEmail,
  })
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => api.getGroup(groupId),
    enabled: !!groupId,
  })
}

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: queryKeys.expenses(groupId),
    queryFn: () => api.getExpenses(groupId),
    enabled: !!groupId,
  })
}

export function useInsights(groupId: string) {
  return useQuery({
    queryKey: queryKeys.insights(groupId),
    queryFn: () => api.getInsights(groupId),
    enabled: !!groupId,
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => api.getGroupMembers(groupId),
    enabled: !!groupId,
  })
}

export function useTransfers(groupId: string) {
  return useQuery({
    queryKey: queryKeys.transfers(groupId),
    queryFn: () => api.getTransfers(groupId),
    enabled: !!groupId,
  })
}

// Mutation Hooks
export function useCreateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createGroup,
    onSuccess: (group, variables) => {
      // Invalidate and refetch groups for the user
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(variables.userEmail) })
      toast.success(`Group "${group.name}" created! Code: ${group.group_code}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create group')
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, userEmail, userName }: { groupId: string; userEmail: string; userName: string }) =>
      api.deleteGroup(groupId, userEmail, userName),
    onSuccess: (_, variables) => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(variables.userEmail) })
      toast.success('Group deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete group')
    },
  })
}

export function useArchiveGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, userEmail, userName, archived }: { groupId: string; userEmail: string; userName: string; archived: boolean }) =>
      api.archiveGroup(groupId, userEmail, userName, archived),
    onSuccess: (_, variables) => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(variables.userEmail) })
      toast.success('Group archived successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive group')
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createExpense,
    onSuccess: (expense, variables) => {
      // Invalidate expenses and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(variables.groupId) })
      toast.success('Expense added successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add expense')
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ expenseId, ...data }: { expenseId: string } & Parameters<typeof api.updateExpense>[1]) =>
      api.updateExpense(expenseId, data),
    onSuccess: (expense) => {
      // Invalidate expenses and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(expense.group_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(expense.group_id) })
      toast.success('Expense updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense')
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ expenseId, userEmail, userName, groupId }: { 
      expenseId: string; 
      userEmail: string; 
      userName: string;
      groupId: string;
    }) => api.deleteExpense(expenseId, userEmail, userName),
    onSuccess: (_, variables) => {
      // Invalidate expenses and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(variables.groupId) })
      toast.success('Expense deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense')
    },
  })
}

export function useAddGroupMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.addGroupMember,
    onSuccess: (_, variables) => {
      // Invalidate group members for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(variables.groupId) })
      toast.success('Member added successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add member')
    },
  })
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ memberId, removedByEmail, removedByName, groupId }: {
      memberId: string;
      removedByEmail: string;
      removedByName: string;
      groupId: string;
    }) => api.removeGroupMember(memberId, removedByEmail, removedByName),
    onSuccess: (_, variables) => {
      // Invalidate group members for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(variables.groupId) })
      toast.success('Member removed successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })
}

export function useUpdateGroupMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ memberId, role, groupId }: {
      memberId: string;
      role: 'admin' | 'member';
      groupId: string;
    }) => api.updateGroupMember(memberId, role),
    onSuccess: (_, variables) => {
      // Invalidate group members for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(variables.groupId) })
      toast.success('Member role updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member role')
    },
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createTransfer,
    onSuccess: (transfer, variables) => {
      // Invalidate transfers, expenses, and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(variables.groupId) })
      toast.success('Transfer created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create transfer')
    },
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.updateTransfer,
    onSuccess: (transfer, variables) => {
      // Invalidate transfers, expenses, and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers(transfer.group_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(transfer.group_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(transfer.group_id) })
      toast.success('Transfer updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update transfer')
    },
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ transferId, userEmail, userName, groupId }: { 
      transferId: string; 
      userEmail: string; 
      userName: string;
      groupId: string;
    }) => api.deleteTransfer(transferId, userEmail, userName, groupId),
    onSuccess: (_, variables) => {
      // Invalidate transfers, expenses, and insights for the group
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(variables.groupId) })
      toast.success('Transfer deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transfer')
    },
  })
}
