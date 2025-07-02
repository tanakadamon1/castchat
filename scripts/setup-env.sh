#!/bin/bash

# Environment Setup Script
# This script helps set up environment variables for the project

set -e

echo "🔧 CastChat Environment Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

# Function to create env file from example
create_env_from_example() {
    local example_file=$1
    local target_file=$2
    
    if [ -f "$target_file" ]; then
        echo -e "${YELLOW}⚠${NC}  $target_file already exists. Skipping..."
    else
        cp "$example_file" "$target_file"
        echo -e "${GREEN}✓${NC} Created $target_file from $example_file"
        echo -e "${YELLOW}!${NC} Please update $target_file with your actual values"
    fi
}

# Check for example files
echo ""
echo "Checking example environment files..."
check_file ".env.example"
check_file ".env.local.example"

# Create actual env files
echo ""
echo "Creating environment files..."
create_env_from_example ".env.example" ".env"
create_env_from_example ".env.local.example" ".env.local"

# Check for required tools
echo ""
echo "Checking required tools..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 20.x or later"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
fi

# Check for Supabase CLI (optional)
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase -v)
    echo -e "${GREEN}✓${NC} Supabase CLI $SUPABASE_VERSION"
else
    echo -e "${YELLOW}⚠${NC}  Supabase CLI not found (optional)"
    echo "   Install with: npm install -g supabase"
fi

# Check for Vercel CLI (optional)
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓${NC} Vercel CLI installed"
else
    echo -e "${YELLOW}⚠${NC}  Vercel CLI not found (optional)"
    echo "   Install with: npm install -g vercel"
fi

# Instructions
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update .env.local with your development values"
echo "2. Update .env with your production values"
echo "3. For Supabase:"
echo "   - Create a project at https://supabase.com"
echo "   - Copy the URL and anon key to your .env files"
echo "4. For Vercel:"
echo "   - Run 'vercel' to link your project"
echo "   - Set environment variables in Vercel dashboard"
echo ""
echo "5. Run 'npm install' to install dependencies"
echo "6. Run 'npm run dev' to start development server"
echo ""
echo "For more information, see docs/development-setup.md"