# Contributing to Smart Thermostat Scheduler

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Smart Thermostat Scheduler project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 16+
- npm 8+
- Docker and Docker Compose (for running services)
- TypeScript knowledge

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/thermostat-scheduler.git`
3. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```
4. Start the development environment:
   ```bash
   docker-compose up
   ```

## Development Workflow

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b bugfix/issue-description
```

Branch naming convention:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test improvements
- `refactor/` - Code refactoring

### Making Changes

1. Make your changes in the appropriate directory (`backend/` or `frontend/`)
2. Follow the existing code style and patterns
3. Add tests for new functionality
4. Update documentation as needed

### Testing

Run tests before submitting a pull request:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Committing

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add schedule persistence to database"
git commit -m "fix: correct thermostat temperature calculation"
git commit -m "docs: update API documentation"
```

Use the following prefixes:
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Build process, dependencies, etc.

## Pull Request Process

1. **Before Creating a PR:**
   - Update your branch with the latest main: `git rebase origin/main`
   - Run all tests locally
   - Ensure code follows the project's style guidelines

2. **Create the PR:**
   - Push your branch: `git push origin your-branch-name`
   - Open a pull request on GitHub
   - Fill out the PR template completely
   - Reference any related issues: "Fixes #123"

3. **PR Guidelines:**
   - Keep PRs focused and reasonably sized
   - Include a clear description of changes
   - Add screenshots for UI changes
   - Ensure all CI checks pass

4. **Review Process:**
   - Respond to reviewer feedback promptly
   - Update your PR branch for requested changes
   - Code reviews must be approved before merging

## Project Structure

```
smart-thermostat-scheduler/
├── backend/              # Express.js backend
│   ├── src/
│   │   ├── app.ts       # Main application
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/ # React components
│   │   └── utils/      # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── documentation/       # Project documentation
├── tst/                 # Tests
└── docker-compose.yml   # Docker configuration
```

## Coding Standards

### TypeScript

- Use strict mode
- Add type annotations for function parameters and return types
- Avoid `any` types - use proper typing
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for classes)

### React Components

- Use functional components with hooks
- Keep components focused and reusable
- Extract logic into custom hooks when appropriate
- Add PropTypes or TypeScript interfaces for props

### Express Controllers

- Keep routes thin - push logic to services
- Use async/await consistently
- Return appropriate HTTP status codes
- Handle errors gracefully

## Documentation

- Update README.md for user-facing changes
- Update API documentation for backend changes
- Add inline comments for complex logic
- Keep CHANGELOG.md updated with significant changes

## Reporting Bugs

When reporting bugs, include:

- **Description:** Clear description of the issue
- **Steps to Reproduce:** Exact steps to reproduce the problem
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** OS, Node.js version, relevant software versions
- **Screenshots:** If applicable

## Suggesting Enhancements

- Use a clear, descriptive title
- Provide detailed description of the enhancement
- Explain the use case and benefits
- Suggest possible implementation approach if applicable

## Questions or Need Help?

- Check existing issues and discussions
- Review documentation in the `/documentation` folder
- Create a GitHub discussion for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
