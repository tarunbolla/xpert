// Expense Categories Configuration
// This file contains all expense categories used throughout the application

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation', 
  'Accommodation',
  'Activities & Entertainment',
  'Shopping',
  'Healthcare',
  'Groceries',
  'Gas & Fuel',
  'Utilities',
  'Insurance',
  'Education',
  'Personal Care',
  'Gifts & Donations',
  'Other'
] as const

// Type for expense categories
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// Category descriptions for AI analysis
export const CATEGORY_DESCRIPTIONS = {
  'Food & Dining': 'Restaurants, cafes, bars, food delivery, dining out',
  'Transportation': 'Flights, trains, buses, taxis, car rentals, ride-sharing, parking',
  'Accommodation': 'Hotels, Airbnb, hostels, vacation rentals, lodging',
  'Activities & Entertainment': 'Tours, museums, shows, sports, movies, concerts, attractions',
  'Shopping': 'Clothing, electronics, souvenirs, general retail purchases',
  'Healthcare': 'Medical expenses, pharmacy, doctor visits, health services',
  'Groceries': 'Supermarket shopping, food for home cooking',
  'Gas & Fuel': 'Gas stations, fuel for vehicles',
  'Utilities': 'Electricity, water, internet, phone bills, home services',
  'Insurance': 'Car insurance, health insurance, travel insurance',
  'Education': 'Courses, books, educational materials, training',
  'Personal Care': 'Haircuts, spa, cosmetics, personal hygiene products',
  'Gifts & Donations': 'Presents, charitable donations, tips',
  'Other': 'Anything that doesn\'t fit the above categories'
} as const
