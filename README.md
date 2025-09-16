# Xpert Expense Manager

AI-enabled group expense management for holidays and travel.

## Features

- 🤖 **AI-Powered Analysis**: Automatic expense categorization and duplicate detection
- 👥 **Group Management**: Create groups for trips and invite friends
- 📊 **Smart Insights**: Detailed spending breakdowns and budget analysis
- 🔍 **Audit Trail**: Complete history of all expense changes
- 📱 **Mobile-Friendly**: Responsive design for use on any device
- 💾 **Local Storage**: No accounts needed - personas stored locally

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time)
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel
- **Icons**: Heroicons, Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd xpert-expense-manager
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
```bash
# Supabase CLI is already included as dev dependency
# Start local Supabase
npx supabase start

# Run migrations
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > lib/database.types.ts
```

4. Configure environment variables
```bash
cp env.example .env.local
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key

5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Add these to your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Usage

1. **Create a Persona**: Enter your name and email (stored locally)
2. **Create a Group**: Set up a group for your trip
3. **Add Expenses**: Add expenses with automatic AI categorization
4. **Track Spending**: View insights and spending breakdowns
5. **Share Group**: Use group codes to invite others

## API Endpoints

- `POST /api/groups` - Create a new group
- `GET /api/groups?code=<code>` - Get group by code
- `POST /api/expenses` - Add a new expense
- `GET /api/expenses?groupId=<id>` - Get group expenses
- `GET /api/insights?groupId=<id>` - Get spending insights

## Database Schema

### Groups
- `id`: UUID primary key
- `name`: Group name
- `description`: Optional description
- `group_code`: Unique 6-character code
- `created_at`: Timestamp

### Expenses
- `id`: UUID primary key
- `group_id`: Foreign key to groups
- `title`: Expense title
- `description`: Optional description
- `amount`: Decimal amount
- `category`: Expense category
- `paid_by_email`: Email of person who paid
- `paid_by_name`: Name of person who paid
- `ai_category`: AI-suggested category
- `ai_confidence`: Confidence score (0-1)
- `is_duplicate`: Boolean flag
- `date`: Expense date

### Expense Splits
- `id`: UUID primary key
- `expense_id`: Foreign key to expenses
- `user_email`: Email of person splitting
- `user_name`: Name of person splitting
- `amount`: Split amount
- `settled`: Boolean flag

### Audit Logs
- `id`: UUID primary key
- `entity_type`: Type of entity (expense, group, split)
- `entity_id`: ID of the entity
- `action`: Action performed (CREATE, UPDATE, DELETE)
- `changes`: JSON of changes made
- `user_email`: Email of user who made change
- `user_name`: Name of user who made change
- `created_at`: Timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
