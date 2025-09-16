'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, UserGroupIcon, ClipboardDocumentListIcon, TrashIcon, ArchiveBoxIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useGroups, useCreateGroup, useDeleteGroup, useArchiveGroup, type Group } from '@/lib/hooks/use-api'


export default function GroupsPage() {
  const router = useRouter()
  const [userPersona, setUserPersona] = useState<{ name: string; email: string } | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [showGroupActions, setShowGroupActions] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  // React Query hooks
  const { data: groups = [], isLoading: groupsLoading, error: groupsError } = useGroups(userPersona?.email || '')
  const createGroupMutation = useCreateGroup()
  const deleteGroupMutation = useDeleteGroup()
  const archiveGroupMutation = useArchiveGroup()

  useEffect(() => {
    // Check for existing persona
    const savedPersona = localStorage.getItem('userPersona')
    if (savedPersona) {
      const persona = JSON.parse(savedPersona)
      setUserPersona(persona)
    } else {
      // Redirect to home if no persona
      router.push('/')
    }
  }, [])

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowGroupActions(null)
    }

    if (showGroupActions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showGroupActions])


  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required')
      return
    }

    if (!userPersona) {
      toast.error('User information not found')
      return
    }

    try {
      const group = await createGroupMutation.mutateAsync({
        name: newGroupName,
        description: newGroupDescription,
        userEmail: userPersona.email,
        userName: userPersona.name,
      })
      
      // Reset form
      setNewGroupName('')
      setNewGroupDescription('')
      setShowCreateForm(false)

      // Navigate to group
      router.push(`/groups/${group.id}`)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const deleteGroup = async () => {
    if (!selectedGroup || !userPersona) return

    try {
      await deleteGroupMutation.mutateAsync({
        groupId: selectedGroup.id,
        userEmail: userPersona.email,
        userName: userPersona.name,
      })
      
      setShowDeleteModal(false)
      setSelectedGroup(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const archiveGroup = async () => {
    if (!selectedGroup || !userPersona) return

    try {
      await archiveGroupMutation.mutateAsync({
        groupId: selectedGroup.id,
        userEmail: userPersona.email,
        userName: userPersona.name,
        archived: !selectedGroup.archived, // Toggle the archived state
      })
      
      setShowArchiveModal(false)
      setSelectedGroup(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const joinGroup = () => {
    const groupCode = prompt('Enter group code:')
    if (groupCode) {
      // TODO: Implement group joining logic
      toast.success(`Joining group with code: ${groupCode}`)
    }
  }

  if (!userPersona) {
    return <div>Loading...</div>
  }

  if (groupsError) {
    return <div>Error loading groups: {groupsError.message}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Navigation Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container-pro">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button
                onClick={() => router.push('/')}
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
                  <UserGroupIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900 font-poppins">Groups</span>
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
      <div className="container-pro py-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile-first Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 font-poppins">Your Groups</h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Track expenses and split costs with friends</p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={joinGroup}
                className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Join Group</span>
                <span className="sm:hidden">Join</span>
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center gap-2 flex-1 sm:flex-none text-sm"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create Group</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Create Group Form - Following Best Practices */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated mb-8"
              role="dialog"
              aria-labelledby="create-group-title"
              aria-describedby="create-group-description"
            >
              <div className="card-header">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 id="create-group-title" className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">Create New Group</h2>
                    <p id="create-group-description" className="text-sm text-gray-600 mt-1">Set up a new expense tracking group for your trip</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="group-name" className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                      Group Name *
                    </label>
                    <input
                      id="group-name"
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Hawaii Trip 2024"
                      className="input-field"
                      required
                      aria-describedby="group-name-help"
                    />
                    <p id="group-name-help" className="text-xs text-gray-500 mt-1">Choose a descriptive name for your group</p>
                  </div>
                  <div>
                    <label htmlFor="group-description" className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                      Description (Optional)
                    </label>
                    <textarea
                      id="group-description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Brief description of your trip or group..."
                      rows={3}
                      className="input-field resize-none"
                      aria-describedby="group-description-help"
                    />
                    <p id="group-description-help" className="text-xs text-gray-500 mt-1">Add details about your trip or group purpose</p>
                  </div>
                </div>
              </div>
              
              <div className="card-action">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={createGroup}
                    disabled={createGroupMutation.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[44px]"
                    aria-describedby="create-button-help"
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" aria-hidden="true" />
                        <span>Create Group</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary px-6 sm:px-8 min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
                <p id="create-button-help" className="text-xs text-gray-500 mt-2">Create your group and start tracking expenses</p>
              </div>
            </motion.div>
          )}

          {/* Empty State - Following Best Practices */}
          {groups.length === 0 ? (
            <div className="card-elevated text-center" role="region" aria-labelledby="empty-state-title">
              <div className="card-body">
                <div className="max-w-lg mx-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 md:mb-10" aria-hidden="true">
                    <UserGroupIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                  </div>
                  <h3 id="empty-state-title" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 font-poppins">No groups yet</h3>
                  <p className="text-gray-500 mb-8 sm:mb-10 md:mb-12 leading-relaxed font-medium text-base sm:text-lg">
                    Create your first group to start managing expenses for your next trip! 
                    Invite friends and track shared costs effortlessly.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary flex items-center gap-2 sm:gap-3 mx-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]"
                    aria-describedby="empty-state-help"
                  >
                    <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                    <span>Create Your First Group</span>
                  </button>
                  <p id="empty-state-help" className="text-xs text-gray-500 mt-3">Start by creating a group for your next trip</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Groups Summary Card */}
              <div className="card-elevated mb-6">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 font-poppins">All Groups</h2>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex flex-row items-center justify-between gap-6">
                    <div className="text-left">
                      <div className="text-xs font-semibold text-gray-600 mb-1">Active Groups</div>
                      <div className="text-xl font-bold text-gray-900">
                        {groups.filter(g => !g.archived).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {groups.filter(g => !g.archived).length === 1 ? 'Group' : 'Groups'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-600 mb-1">Total Balance</div>
                      <div className="text-xl font-bold text-green-500">
                        ${groups.filter(g => !g.archived).reduce((sum, group) => sum + (group.totalExpenses || 0), 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Across all groups</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="text-sm font-semibold text-gray-500 px-4 py-2 bg-gray-50 rounded-full">
                  All Groups
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              {/* Groups List */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="divide-y divide-gray-100">
                  {groups.map((group) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => router.push(`/groups/${group.id}`)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View group ${group.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/groups/${group.id}`)
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                            {group.name}
                            {group.archived && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Archived
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            {group.description && (
                              <span className="line-clamp-1">{group.description}</span>
                            )}
                            <span>Code: {group.group_code} • {group.memberCount || 0} members</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-bold text-gray-900">
                              ${(group.totalExpenses || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowGroupActions(showGroupActions === group.id ? null : group.id)
                                }}
                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition-colors duration-200"
                                aria-label={`More actions for ${group.name}`}
                                aria-expanded={showGroupActions === group.id}
                                aria-haspopup="true"
                              >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </button>
                              
                              {showGroupActions === group.id && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10" role="menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedGroup(group)
                                      setShowArchiveModal(true)
                                      setShowGroupActions(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 min-h-[44px]"
                                    role="menuitem"
                                  >
                                    <ArchiveBoxIcon className="w-4 h-4 text-gray-500" />
                                    <span>{group.archived ? 'Unarchive Group' : 'Archive Group'}</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedGroup(group)
                                      setShowDeleteModal(true)
                                      setShowGroupActions(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 min-h-[44px]"
                                    role="menuitem"
                                  >
                                    <TrashIcon className="w-4 h-4 text-red-500" />
                                    <span>Delete Group</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            <div className="card-padding border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Group</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{selectedGroup.name}"</strong>? 
                This action cannot be undone and will permanently remove all expenses, members, and data associated with this group.
              </p>
            </div>
            
            <div className="flex gap-2 justify-end card-padding border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGroup(null)
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={deleteGroup}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete Group
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto">
              <div className="card-padding">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ArchiveBoxIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedGroup.archived ? 'Unarchive Group' : 'Archive Group'}</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {selectedGroup.archived ? (
                    <>Are you sure you want to unarchive <strong>"{selectedGroup.name}"</strong>? 
                    The group will be restored to your active groups list and you can continue managing expenses.</>
                  ) : (
                    <>Are you sure you want to archive <strong>"{selectedGroup.name}"</strong>? 
                    The group will be hidden from your active groups list but can be restored later. All data will be preserved.</>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end card-padding border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setShowArchiveModal(false)
                  setSelectedGroup(null)
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={archiveGroup}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
              >
                {selectedGroup?.archived ? 'Unarchive Group' : 'Archive Group'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
