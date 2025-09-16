'use client'

import { motion } from 'framer-motion'
import { SparklesIcon, ChartBarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container-pro">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Xpert</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </a>
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
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              See Xpert Expense Manager in Action
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">
              Experience how AI makes expense management effortless for your next trip.
              <br className="hidden sm:block" />
              <span className="text-green-600 font-semibold">Smart, simple, and powerful.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="section-padding bg-white">
        <div className="container-pro">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card-elevated"
                role="article"
                aria-labelledby="ai-analysis-demo-title"
              >
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <SparklesIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 id="ai-analysis-demo-title" className="text-2xl font-semibold text-gray-900">AI-Powered Analysis</h2>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2 font-medium">You add:</div>
                      <div className="font-semibold text-gray-900">"Lunch at beach cafe" - $45</div>
                    </div>
                    
                    <div className="text-center text-gray-400" aria-hidden="true">
                      <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                      <div className="text-sm text-green-600 mb-3 font-medium">AI analyzes:</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Category:</span>
                          <span className="font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">Food & Dining</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Confidence:</span>
                          <span className="font-semibold text-green-600">95%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Duplicate Check:</span>
                          <span className="font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">No duplicates found</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card-elevated"
                role="article"
                aria-labelledby="smart-insights-demo-title"
              >
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <ChartBarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 id="smart-insights-demo-title" className="text-2xl font-semibold text-gray-900">Smart Insights</h2>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">$1,250</div>
                        <div className="text-sm text-gray-600 font-medium">Total Spent</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">23</div>
                        <div className="text-sm text-gray-600 font-medium">Expenses</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600 mb-1">$54</div>
                        <div className="text-sm text-gray-600 font-medium">Average</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1" aria-hidden="true">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-green-600 mb-2 font-medium">AI Insights:</div>
                          <p className="text-green-800 leading-relaxed">
                            "You've spent 40% of your budget on food. Consider cooking more meals 
                            to stay within budget for the remaining days."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Group Management Demo */}
      <section className="section-padding bg-gray-50">
        <div className="container-pro">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card-elevated mb-16"
              role="article"
              aria-labelledby="group-management-demo-title"
            >
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 id="group-management-demo-title" className="text-2xl font-semibold text-gray-900">Group Management</h2>
                </div>
              </div>
              
              <div className="card-body">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                      <span className="text-3xl font-bold text-green-600">1</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Create Group</h3>
                    <p className="text-gray-600 leading-relaxed">Set up your trip group and get a unique code to share with friends</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                      <span className="text-3xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Share Code</h3>
                    <p className="text-gray-600 leading-relaxed">Invite friends using the group code for seamless collaboration</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                      <span className="text-3xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Track Together</h3>
                    <p className="text-gray-600 leading-relaxed">Everyone adds expenses and sees real-time updates and insights</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Audit Trail Demo */}
      <section className="section-padding bg-white">
        <div className="container-pro">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="card-elevated"
              role="article"
              aria-labelledby="audit-trail-demo-title"
            >
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <ClockIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 id="audit-trail-demo-title" className="text-2xl font-semibold text-gray-900">Complete Audit Trail</h2>
                </div>
              </div>
              
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">John Doe</span> created expense "Dinner at Restaurant"
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">AI</span> categorized as "Food & Dining" (95% confidence)
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" aria-hidden="true"></div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Sarah Smith</span> updated split amounts
                    </div>
                    <div className="text-sm text-gray-500">1 hour ago</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="container-pro">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Try It?</h2>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Start managing your next trip's expenses with AI-powered insights and seamless group collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg"
              >
                Get Started
              </a>
              <a
                href="/groups"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors text-lg"
              >
                Create Group
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
