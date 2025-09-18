'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import type { Group, Transfer } from '@/lib/hooks/use-api'

interface EditTransferModalProps {
  user: { name: string; email: string } | null
  group: Group | undefined
  transfer: Transfer
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: (transfer: Transfer) => void
}

export function EditTransferModal({ 
  user, 
  group,
  transfer,
  onClose, 
  onUpdate,
  onDelete
}: EditTransferModalProps) {
  const [fromUserEmail, setFromUserEmail] = useState(transfer.from_user_email)
  const [toUserEmail, setToUserEmail] = useState(transfer.to_user_email)
  const [amount, setAmount] = useState(transfer.amount.toString())
  const [description, setDescription] = useState(transfer.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromUserEmail || !toUserEmail || !amount || !user || !group) return

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      toast.error('Amount must be positive')
      return
    }

    if (fromUserEmail === toUserEmail) {
      toast.error('Cannot transfer to yourself')
      return
    }

    const fromUser = group.members?.find(m => m.email === fromUserEmail)
    const toUser = group.members?.find(m => m.email === toUserEmail)

    if (!fromUser || !toUser) {
      toast.error('Invalid user selection')
      return
    }

    onUpdate({
      transferId: transfer.id,
      fromUserEmail,
      fromUserName: fromUser.name,
      toUserEmail,
      toUserName: toUser.name,
      amount: amountNum,
      description: description.trim() || undefined,
      userEmail: user.email,
      userName: user.name
    })
  }

  const handleDelete = () => {
    onDelete(transfer)
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Transfer</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="card-padding space-card">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From *
              </label>
              <select
                value={fromUserEmail}
                onChange={(e) => setFromUserEmail(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To *
              </label>
              <select
                value={toUserEmail}
                onChange={(e) => setToUserEmail(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Update Transfer
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <TrashIcon className="w-4 h-4" />
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
