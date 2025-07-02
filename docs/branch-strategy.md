# Git Branch Strategy - VRChat Cast Recruitment Board

## Overview
This document outlines the branching strategy for the VRChat Cast Recruitment Board project. We follow a modified Git Flow strategy optimized for continuous deployment with Vercel.

## Branch Types

### 1. Main Branch (`main`)
- **Purpose**: Production-ready code
- **Deploy**: Automatically deployed to production via Vercel
- **Protection**: Protected branch with required reviews
- **Merge**: Only through Pull Requests with approval

### 2. Development Branch (`develop`)
- **Purpose**: Integration branch for features
- **Deploy**: Automatically deployed to staging environment
- **Merge**: Features and fixes are merged here first

### 3. Feature Branches (`feature/*`)
- **Naming**: `feature/[issue-number]-[short-description]`
- **Example**: `feature/12-user-authentication`
- **Created from**: `develop`
- **Merged to**: `develop`
- **Lifecycle**: Deleted after merge

### 4. Bug Fix Branches (`bugfix/*`)
- **Naming**: `bugfix/[issue-number]-[short-description]`
- **Example**: `bugfix/23-login-error`
- **Created from**: `develop`
- **Merged to**: `develop`
- **Lifecycle**: Deleted after merge

### 5. Hotfix Branches (`hotfix/*`)
- **Naming**: `hotfix/[issue-number]-[short-description]`
- **Example**: `hotfix/45-critical-security-fix`
- **Created from**: `main`
- **Merged to**: `main` AND `develop`
- **Lifecycle**: Deleted after merge

### 6. Release Branches (`release/*`)
- **Naming**: `release/[version-number]`
- **Example**: `release/1.2.0`
- **Created from**: `develop`
- **Merged to**: `main` AND `develop`
- **Purpose**: Final testing and bug fixes before production

## Workflow

### Feature Development
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/123-add-search-filter

# 2. Work on feature
git add .
git commit -m "feat: implement search filter for posts"

# 3. Push to remote
git push origin feature/123-add-search-filter

# 4. Create Pull Request to develop
# 5. After review and approval, merge to develop
# 6. Delete feature branch
```

### Hotfix Process
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/456-fix-payment-error

# 2. Fix the issue
git add .
git commit -m "fix: resolve payment processing error"

# 3. Push to remote
git push origin hotfix/456-fix-payment-error

# 4. Create Pull Request to main
# 5. After merge to main, also merge to develop
git checkout develop
git merge hotfix/456-fix-payment-error
```

## Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Build system or dependencies
- `ci:` CI/CD configuration
- `chore:` Other changes that don't modify src or test files

### Examples:
```
feat: add user profile editing functionality
fix: resolve login redirect issue on mobile
docs: update API documentation for auth endpoints
style: format code with prettier
refactor: simplify post filtering logic
perf: optimize image loading with lazy loading
test: add unit tests for user service
build: update dependencies to latest versions
ci: add deployment workflow for staging
chore: update license year
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews (minimum 1)
- Dismiss stale pull request approvals
- Require status checks to pass (CI/CD)
- Require branches to be up to date
- Include administrators in restrictions

### Develop Branch
- Require pull request reviews (minimum 1)
- Require status checks to pass (CI/CD)
- No direct pushes allowed

## Deployment Strategy

### Environments
1. **Production** (`main` branch)
   - URL: https://castchat.jp
   - Auto-deployed via Vercel

2. **Staging** (`develop` branch)
   - URL: https://staging.castchat.jp
   - Auto-deployed via Vercel

3. **Preview** (Pull Requests)
   - Dynamic URLs per PR
   - Auto-deployed via Vercel

## Version Tagging

We use semantic versioning (MAJOR.MINOR.PATCH):

```bash
# After merging release to main
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

## Best Practices

1. **Keep branches up to date**: Regularly merge or rebase from parent branch
2. **Small, focused commits**: Each commit should represent one logical change
3. **Descriptive branch names**: Include issue number and brief description
4. **Clean history**: Use interactive rebase to clean up commits before PR
5. **Delete merged branches**: Keep repository clean
6. **Review before merge**: All code must be reviewed
7. **Test before merge**: Ensure all tests pass

## Pull Request Template

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
- [ ] Manual testing completed
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
```

## Emergency Procedures

### Rolling Back Production
```bash
# Find the last known good commit
git log --oneline -n 10

# Create a revert commit
git revert [bad-commit-hash]
git push origin main
```

### Force Push Recovery
If someone accidentally force pushes:
1. Contact team immediately
2. Check reflog on local machines
3. Restore from backup if needed

## Tools Integration

### GitHub Actions
- Automated testing on all PRs
- Deployment triggers for main and develop
- Code quality checks

### Vercel
- Preview deployments for all PRs
- Automatic production deployment from main
- Staging deployment from develop

This strategy ensures code quality, enables continuous deployment, and maintains a clean Git history.