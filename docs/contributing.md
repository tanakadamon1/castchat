# Contributing Guide

## Overview

Welcome to the CastChat project! This guide will help you understand how to contribute to the development of the VRChat Cast Recruitment Board.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Team Roles](#team-roles)
- [Communication](#communication)

## Getting Started

### Prerequisites

1. **Development Environment**
   - Node.js v20.x or later
   - npm v10.x or later
   - Git 2.x or later
   - VS Code (recommended)

2. **Account Setup**
   - GitHub account with repository access
   - Discord/Slack for team communication
   - Figma access (for design team)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/castchat.git
   cd castchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   ./scripts/setup-env.sh
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

We follow a modified Git Flow strategy:

```
main
├── develop
    ├── feature/123-user-authentication
    ├── feature/124-post-creation
    └── bugfix/125-login-error
```

### Creating a Feature

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/[issue-number]-[short-description]
   ```

2. **Make changes**
   - Write code following our standards
   - Add/update tests
   - Update documentation

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/123-user-authentication
   # Create Pull Request on GitHub
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Build system changes
- `ci:` CI/CD changes
- `chore:` Other changes

**Examples:**
```
feat: add Google OAuth authentication
fix: resolve login redirect issue on mobile
docs: update API documentation for posts endpoint
style: format components with prettier
refactor: simplify user profile logic
test: add unit tests for post creation
```

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use meaningful variable and function names

```typescript
// Good
interface User {
  id: string
  displayName: string
  email: string
}

const getUserById = async (userId: string): Promise<User | null> => {
  // implementation
}

// Bad
const getUser = async (id: any): Promise<any> => {
  // implementation
}
```

### Vue.js Components

- Use Composition API with `<script setup>`
- Define props and emits with TypeScript
- Use single-file components (.vue)
- Follow naming conventions

```vue
<script setup lang="ts">
interface Props {
  title: string
  isVisible?: boolean
}

interface Emits {
  close: []
  submit: [data: FormData]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Component styles */
</style>
```

### CSS/Styling

- Use Tailwind CSS utilities
- Create custom components in @/components/ui
- Follow responsive design principles
- Use semantic HTML elements

```vue
<template>
  <article class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
    <p class="text-gray-600">{{ description }}</p>
  </article>
</template>
```

### File Organization

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   └── features/       # Feature-specific components
├── views/              # Page components
├── composables/        # Vue composables
├── stores/             # Pinia stores
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.vue`)
- **Files**: kebab-case (`user-profile.ts`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes**: Tailwind utilities or kebab-case

## Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Test component logic separately from UI
- Use descriptive test names
- Aim for 80%+ code coverage

```typescript
// tests/unit/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from '@/utils/format'

describe('formatDate', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).toBe('2024年1月15日')
  })
})
```

### Integration Tests

- Test complete user flows
- Use real database operations (test environment)
- Mock external services
- Cover critical paths

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect } from 'vitest'
import { signUpTestUser, signInTestUser } from './setup'

describe('Authentication Flow', () => {
  it('should allow user to sign up and sign in', async () => {
    await signUpTestUser('user1')
    const session = await signInTestUser('user1')
    expect(session.user).toBeDefined()
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Pull Request Process

### Before Creating a PR

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run quality checks**
   ```bash
   npm run lint:fix
   npm run type-check
   npm test
   npm run build
   ```

3. **Update documentation**
   - Add/update inline comments
   - Update relevant documentation files
   - Add changelog entry if needed

### PR Requirements

- [ ] Descriptive title and description
- [ ] Links to related issues
- [ ] Screenshots for UI changes
- [ ] All tests passing
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Reviewed by at least one team member

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated

## Related Issues
Closes #123
```

### Code Review Guidelines

**For Reviewers:**
- Check code quality and standards
- Verify functionality works as expected
- Ensure tests are adequate
- Look for security issues
- Provide constructive feedback

**For Authors:**
- Respond to feedback promptly
- Make requested changes
- Explain design decisions when necessary
- Keep PRs focused and manageable

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- Device: Desktop
- OS: Windows 11

## Screenshots
(if applicable)
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## User Story
As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
```

## Team Roles

### Infrastructure Team
**Responsibilities:**
- Environment setup and maintenance
- CI/CD pipeline management
- Security and monitoring
- Deployment processes

**Workflow:**
- Monitor system health
- Respond to infrastructure issues
- Review security-related PRs
- Manage environment variables

### Backend Team
**Responsibilities:**
- Database design and implementation
- API development
- Authentication and authorization
- Data validation and security

**Workflow:**
- Design database schemas
- Implement Supabase functions
- Create API documentation
- Review data-related PRs

### Frontend Team
**Responsibilities:**
- User interface implementation
- Vue.js application development
- State management
- Responsive design

**Workflow:**
- Implement UI components
- Connect to backend APIs
- Handle user interactions
- Ensure responsive design

### Design Team
**Responsibilities:**
- User experience design
- Visual design creation
- Design system maintenance
- Usability testing

**Workflow:**
- Create wireframes and mockups
- Design components in Figma
- Conduct user research
- Review UI implementation

## Communication

### Channels

- **#general**: General team discussion
- **#development**: Development-related discussions
- **#design**: Design feedback and reviews
- **#deployments**: Deployment notifications
- **#incidents**: Issue reports and resolution

### Meetings

- **Daily Standup** (15 min): Progress updates and blockers
- **Weekly Planning** (1 hour): Sprint planning and reviews
- **Monthly Retrospective** (1 hour): Process improvements

### Documentation

- Keep documentation up to date
- Document decisions and rationale
- Use clear, concise language
- Include examples and code snippets

## Getting Help

### Resources

- **Development Setup**: [docs/development-setup.md](./development-setup.md)
- **API Documentation**: [docs/api-documentation.md](./api-documentation.md)
- **Deployment Guide**: [docs/deployment-guide.md](./deployment-guide.md)
- **Security Guidelines**: [docs/security-checklist.md](./security-checklist.md)

### Contact

- **General Questions**: #development channel
- **Technical Issues**: Create GitHub issue
- **Urgent Matters**: Direct message team leads
- **Infrastructure Issues**: @infra-team

## Recognition

We appreciate all contributions to the project! Contributors will be recognized in:

- Project README
- Release notes
- Team meetings
- Annual appreciation events

Thank you for contributing to CastChat! 🚀