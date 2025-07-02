# Development Environment Setup Guide

## Prerequisites

### Required Software
- **Node.js** v20.x or later
- **npm** v10.x or later
- **Git** 2.x or later
- **Code Editor** (VS Code recommended)

### Optional Software
- **Supabase CLI** - For local database development
- **Vercel CLI** - For deployment and preview
- **Docker** - For containerized development

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/castchat.git
cd castchat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Run the setup script to create environment files:

```bash
./scripts/setup-env.sh
```

This will create:
- `.env` - Production environment variables
- `.env.local` - Local development environment variables

### 4. Configure Environment Variables

Update `.env.local` with your development values:

```env
# Application
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME="VRChat Cast Recruitment Board - Dev"

# Supabase (get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development
VITE_DEBUG_MODE=true
```

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript checks

# Testing
npm test            # Run all tests
npm run test:unit   # Run unit tests
npm run test:e2e    # Run E2E tests
```

## Project Structure

```
castchat/
├── .github/            # GitHub Actions and templates
├── docs/               # Documentation
├── public/             # Static assets
├── scripts/            # Build and setup scripts
├── src/                # Source code
│   ├── assets/         # Images, styles, etc.
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables
│   ├── router/         # Vue Router config
│   ├── stores/         # Pinia stores
│   ├── utils/          # Utility functions
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.ts         # Application entry
├── supabase/           # Supabase configuration
│   ├── migrations/     # Database migrations
│   ├── functions/      # Edge functions
│   └── config.toml     # Supabase config
├── .env.example        # Environment template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vercel.json         # Vercel config
└── vite.config.ts      # Vite config
```

## Database Setup

### Option 1: Cloud Supabase (Recommended)

1. Create a project at [Supabase](https://supabase.com)
2. Copy the project URL and anon key to `.env.local`
3. Run migrations:
   ```bash
   npx supabase db push
   ```

### Option 2: Local Supabase

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Update `.env.local` with local URLs:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your-local-anon-key
   ```

## Git Workflow

### Branch Strategy

We follow a modified Git Flow:

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/123-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/123-feature-name
   # Create PR on GitHub
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## VS Code Setup

### Recommended Extensions

Install these extensions for the best development experience:

- Vue - Official
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

### Settings

The project includes VS Code settings in `.vscode/settings.json`

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### Node Version Issues
```bash
# Use nvm to switch Node versions
nvm use 20
```

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Environment Variables Not Loading

1. Check file names (`.env.local` not `.env.local.txt`)
2. Restart development server
3. Check for syntax errors in env files

### TypeScript Errors

```bash
# Rebuild TypeScript
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## Security Guidelines

1. **Never commit secrets**
   - Use `.env.local` for secrets
   - Check `.gitignore` includes env files

2. **API Keys**
   - Use environment variables
   - Rotate keys regularly
   - Use different keys for dev/prod

3. **Dependencies**
   - Run `npm audit` regularly
   - Keep dependencies updated
   - Review dependabot PRs

## Performance Tips

1. **Use Vue DevTools** for component debugging
2. **Enable source maps** in development
3. **Use Chrome DevTools Performance** tab
4. **Monitor bundle size** with `npm run build`

## Deployment

### Preview Deployments

Every PR gets a preview URL via Vercel

### Staging Deployment

Push to `develop` branch deploys to staging

### Production Deployment

1. Create PR from `develop` to `main`
2. Get approval from reviewers
3. Merge to deploy to production

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-org/castchat/issues)
- **Discord**: Join our developer Discord
- **Team**: Contact @infra-team

## Next Steps

1. Set up your local environment
2. Read the [Contributing Guide](./contributing.md)
3. Check available issues
4. Start coding!

---

Happy coding! 🚀