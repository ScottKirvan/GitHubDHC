# Contributing to GitHubDHC

First off, thank you for considering contributing to GitHubDHC! It's people like you that make this template better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible using our bug report template.

**Guidelines for bug reports:**
- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what you expected to see
- Include screenshots if applicable
- Note your environment (OS, version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, use our feature request template and include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Examples of how the feature would be used
- Why this enhancement would be useful

### Pull Requests

**Before submitting a pull request:**

1. Fork the repository and create your branch from `main`
2. If you've added code, add tests if applicable
3. Ensure your code follows the existing style
4. Make sure your commits follow our commit message conventions
5. Update documentation as needed

**Commit Message Convention:**

We use [Conventional Commits](https://www.conventionalcommits.org/) with semantic versioning:

- `feat:` - New features (bumps MINOR version)
- `fix:` - Bug fixes (bumps PATCH version)
- `feat!:` or `fix!:` - Breaking changes (bumps MAJOR version)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add Python .gitignore template
fix: correct LICENSE badge URL in README
docs: update installation instructions
feat!: change template initialization workflow
```

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md is handled automatically by Release Please
3. The PR will be merged once you have approval from a maintainer
4. Your PR should pass all checks and have no merge conflicts

## Development Setup

1. Fork and clone the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Test your changes by creating a new repository from your template
5. Submit a pull request

## Project Structure

```
GitHubDHC/
├── .github/
│   ├── gitignore-templates/  # Example .gitignore files
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   ├── workflows/            # GitHub Actions
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/                   # Images and CSS for GitHub Pages
├── notes/                    # CHANGELOG, VERSION, TODO
├── README.md
├── LICENSE.md
└── CONTRIBUTING.md
```

## Testing

When making changes to the template initialization workflow, test by:

1. Creating a new repository from your modified template
2. Verifying the workflow runs successfully
3. Checking that all repository references are updated correctly
4. Confirming the workflow deletes itself after completion

## Questions?

Feel free to open an issue for questions or reach out via:
- [LinkedIn](https://www.linkedin.com/in/scottkirvan/)
- [Discord](https://discord.gg/TN6XJSNK5Y)

Thank you for your contributions!
