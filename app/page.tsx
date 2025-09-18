'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, UsersIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  const handleGetStarted = () => {
    if (!user) {
      signInWithGoogle()
    } else {
      router.push('/groups')
    }
  }

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Mobile-first Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-pro">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Xpert</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || user.email || 'User'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-green-600">
                        {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="hidden sm:inline text-gray-900 font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <span className="sm:hidden text-gray-900 font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-pro">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Xpert Expense Manager
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Smart group expense management for holidays, travel, and shared adventures.
                <br className="hidden sm:block" />
                <span className="text-green-600 font-semibold">Split costs effortlessly and focus on the fun.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
              <button
                onClick={handleGetStarted}
                className="btn-primary flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {user ? 'Manage Groups' : 'Sign in with Google'}
              </button>
              <Link
                href="/demo"
                className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-pro">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-section"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Powerful Features for Smart Expense Management
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Everything you need to manage group expenses efficiently, with smart categorization and real-time collaboration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card-elevated text-center group"
                role="article"
                aria-labelledby="ai-analysis-title"
              >
                <div className="card-body">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors duration-200" aria-hidden="true">
                    <SparklesIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 id="ai-analysis-title" className="card-title">Smart Categorization</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automatic expense categorization to help organize your expenses into relevant categories.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card-elevated text-center group"
                role="article"
                aria-labelledby="group-management-title"
              >
                <div className="card-body">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-200 transition-colors duration-200" aria-hidden="true">
                    <UsersIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 id="group-management-title" className="card-title">Group Management</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create groups for your trips, invite friends, and manage expenses together seamlessly with real-time collaboration.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="card-elevated text-center group"
                role="article"
                aria-labelledby="smart-insights-title"
              >
                <div className="card-body">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-200 transition-colors duration-200" aria-hidden="true">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 id="smart-insights-title" className="card-title">Spending Analytics</h3>
                  <p className="text-gray-600 leading-relaxed">
                    View detailed spending breakdowns by category, track totals, and analyze your group's expense patterns.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card-elevated text-center group"
                role="article"
                aria-labelledby="settlement-title"
              >
                <div className="card-body">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-200 transition-colors duration-200" aria-hidden="true">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 id="settlement-title" className="card-title">Easy Settlements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track who owes what and create transfers between group members to settle balances effortlessly.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="container-pro">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Perfect for Your Next Trip
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-green-100 mb-6 sm:mb-8 leading-relaxed">
              Whether it's a weekend getaway with friends or a family vacation, 
              Xpert Expense Manager makes splitting costs effortless and transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg w-full sm:w-auto"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {user ? 'Manage Groups' : 'Sign in with Google'}
              </button>
              <Link
                href="/demo"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors text-base sm:text-lg w-full sm:w-auto text-center"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

