#!/bin/bash

echo "🚀 Setting up Xpert Expense Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI installed"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your actual values:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - OPENAI_API_KEY"
    echo ""
    echo "🔗 Get Supabase credentials from: https://supabase.com/dashboard"
    echo "🔗 Get OpenAI API key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
fi

# Start Supabase (if not already running)
echo "🗄️  Starting Supabase..."
supabase start

# Run database migrations
echo "🔄 Running database migrations..."
supabase db reset

echo "✅ Database setup complete!"

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
npm run db:generate

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update .env.local with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "📚 For deployment to Vercel:"
echo "1. Push your code to GitHub"
echo "2. Connect to Vercel"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "🔗 Documentation: https://github.com/yourusername/xpert-expense-manager"
