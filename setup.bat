@echo off
echo 🚀 Setting up Xpert Expense Manager...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if Supabase CLI is available locally (from dev dependencies)
npx supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Supabase CLI not found in dev dependencies...
    echo Installing Supabase CLI as dev dependency...
    npm install supabase --save-dev
)

echo ✅ Supabase CLI available

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local not found. Creating from template...
    copy env.example .env.local
    echo 📝 Please edit .env.local with your actual values:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo    - OPENAI_API_KEY
    echo.
    echo 🔗 Get Supabase credentials from: https://supabase.com/dashboard
    echo 🔗 Get OpenAI API key from: https://platform.openai.com/api-keys
    echo.
    pause
)

REM Start Supabase (if not already running)
echo 🗄️  Starting Supabase...
npx supabase start

REM Run database migrations
echo 🔄 Running database migrations...
npx supabase db reset

echo ✅ Database setup complete!

REM Generate TypeScript types
echo 🔧 Generating TypeScript types...
npx supabase gen types typescript --local > lib/database.types.ts

echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. Update .env.local with your credentials
echo 2. Run 'npm run dev' to start development server
echo 3. Visit http://localhost:3000
echo.
echo 📚 For deployment to Vercel:
echo 1. Push your code to GitHub
echo 2. Connect to Vercel
echo 3. Add environment variables in Vercel dashboard
echo 4. Deploy!
echo.
echo 🔗 Documentation: https://github.com/yourusername/xpert-expense-manager
pause
