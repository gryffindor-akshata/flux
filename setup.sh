#!/bin/bash

echo "🚀 Setting up Flux MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Create environment files
echo "⚙️ Creating environment files..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env - Please edit with your database and API keys"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/env.example frontend/.env
    echo "✅ Created frontend/.env - Please edit with your API keys"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Set up your database:"
echo "   createdb flux_mvp"
echo ""
echo "2. Edit environment files:"
echo "   - backend/.env (add your database URL and API keys)"
echo "   - frontend/.env (add your Clerk and Stripe keys)"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run db:migrate"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:5173"
echo ""
echo "📚 See README.md for detailed setup instructions"

