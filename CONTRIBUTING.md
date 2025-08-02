# Contributing to SDGScript

We love your input! We want to make contributing to SDGScript as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🌍 Our Mission

SDGScript aims to make programming more sustainable and socially responsible by integrating the UN Sustainable Development Goals into the development process. Every contribution helps build tools that promote environmental awareness and social impact in software development.

## 🤝 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### 1. Fork the Repository

Fork the repository and create your branch from `main`.

### 2. Make Your Changes

- If you've added code that should be tested, add tests.
- If you've changed APIs, update the documentation.
- Ensure the test suite passes.
- Make sure your code lints.
- Follow our coding standards (see below).

### 3. Test Your Changes

```bash
npm install
npm run build
npm test
npm run lint
```

### 4. Submit a Pull Request

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Include SDGs annotations where appropriate

```typescript
/**
 * @sdg Goal13 ClimateAction
 * @carbonBudget 0.5kWh
 * @description Efficiently process climate data
 */
function processClimateData(data: ClimateData[]): ProcessedData {
  // Implementation
}
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new SDG annotation parser
fix: resolve memory leak in resource tracker
docs: update contributing guidelines
test: add unit tests for analyzer
```

### SDGs Compliance

When contributing code, consider the environmental and social impact:

- ⚡ **Energy Efficiency**: Optimize algorithms for lower power consumption
- 🌱 **Resource Conservation**: Minimize memory usage and network calls
- ♿ **Accessibility**: Ensure features work for all users
- 📚 **Education**: Include clear documentation and examples

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yuis-ice/sdgscript/issues/new?template=bug_report.yml).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Feature Requests

We welcome feature requests! Please use our [feature request template](https://github.com/yuis-ice/sdgscript/issues/new?template=feature_request.yml) and include:

- **SDGs Alignment**: How does this feature contribute to sustainable development?
- **Use Case**: Real-world scenarios where this would be useful
- **Implementation Ideas**: Any thoughts on how it could be implemented
- **Alternatives**: Other solutions you've considered

## 📋 Issue and Pull Request Labels

We use labels to categorize and prioritize issues:

### Type Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers

### SDGs Labels
- `sdg:goal7` - Clean Energy related
- `sdg:goal13` - Climate Action related
- `sdg:goal4` - Education related
- `sdg:goal5` - Gender Equality related
- `sdg:goal12` - Responsible Consumption related

### Priority Labels
- `priority:high` - Critical issues
- `priority:medium` - Important but not urgent
- `priority:low` - Nice to have

## 🏗️ Project Structure

Understanding the project structure will help you contribute effectively:

```
sdgscript/
├── packages/
│   ├── core/              # AST analysis and transformation
│   ├── cli/               # Command-line interface
│   ├── eslint-plugin/     # ESLint integration
│   ├── runtime/           # Runtime monitoring
│   └── vscode-extension/  # VS Code extension
├── examples/              # Usage examples
├── docs/                  # Documentation
└── .github/              # GitHub templates and workflows
```

## 🧪 Testing

We maintain high test coverage to ensure reliability:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test packages/core

# Run integration tests
npm run test:integration
```

### Test Categories

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **CLI Tests**: Test command-line interface
- **Example Tests**: Verify examples work correctly

## 📚 Documentation

Good documentation is crucial for adoption:

- **Code Comments**: Use JSDoc for all public APIs
- **README Updates**: Keep installation and usage instructions current
- **Examples**: Add practical examples for new features
- **API Documentation**: Update type definitions and descriptions

## 🚀 Release Process

Releases are handled by maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create GitHub release with release notes
4. Publish to npm registry
5. Update documentation

## Contributor License Agreement (CLA)

By submitting a pull request or contribution, you agree to the following:

> You grant the project founder a **non-exclusive, irrevocable, worldwide, royalty-free license** to use, modify, sublicense, and relicense your contribution, including the right to incorporate it into dual-licensed or commercial versions of the project.

This ensures that the project can grow sustainably while preserving creator rights.  
If you are contributing on behalf of a company or organization, please contact us in advance.

## 💬 Community

- 🗣️ **GitHub Discussions**: For questions and general discussion
- 🐛 **GitHub Issues**: For bug reports and feature requests
- 📧 **Email**: jobs.fumiya@pm.me for private inquiries

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Recognition

Contributors are recognized in:

- The project README
- Release notes
- GitHub contributors list
- Optional mention in project documentation

Thank you for helping make software development more sustainable! 🌍✨
