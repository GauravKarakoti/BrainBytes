# 🔄 CI/CD Pipelines & Automation

BrainBytes uses **GitHub Actions** to automate quality checks, ensuring that every contribution meets the project's standards before it reaches production.

## 🛠️ Automated Workflows

Below is a detailed breakdown of the pipelines triggered on every Pull Request and Push to `main` or `develop` branches.

| Workflow | Purpose | Key Checks |
| :--- | :--- | :--- |
| **🌐 Web App CI** | Frontend Integrity | Linting, Type Checking (`tsc`), and Production Build |
| **🔗 Smart Contract CI** | Blockchain Validation | Hardhat Compilation, Unit Tests, & Coverage |
| **🗄️ Database Schema CI** | Prevent Schema Drift | Drizzle-kit validation & Migration testing (Postgres 16) |
| **🚀 Deployment** | Production Release | Vercel Deployment & Post-deployment Health Checks |

---

## 🔍 Deep Dive: Workflow Details

### 1. Web Application CI
**File:** `.github/workflows/web-app-ci.yml`
Ensures the Next.js 14 application is stable.
- ✅ **Linting**: ESLint validation for code style.
- ✅ **Type Checking**: Running `pnpm tsc --noEmit` to catch TypeScript errors.
- ✅ **Build**: Verifies that `pnpm build` succeeds without errors.

### 2. Smart Contract CI
**File:** `.github/workflows/smart-contract-ci.yml`
Prevents breaking changes in the $BYTE token logic.
- ✅ **Compilation**: Compiles Solidity files using Hardhat.
- ✅ **Tests**: Runs the full test suite using Waffle/Chai.
- ✅ **Coverage**: Generates metrics to ensure high test coverage.

### 3. Database Schema Verification
**File:** `.github/workflows/database-schema-ci.yml`
Uses Drizzle ORM to maintain data integrity.
- ✅ **Schema Check**: `pnpm drizzle-kit check` to verify consistency.
- ✅ **Migration Test**: Runs migrations against a temporary PostgreSQL instance to ensure they apply cleanly.

---

## 💻 Running Workflows Locally

To save time and avoid failing CI on GitHub, you can test these workflows locally using `act`.

```bash
# Install act
brew install act

# Run the Web App CI specifically
act -j web-app-ci

# Run with your GitHub Secrets (if needed)
act -s GITHUB_TOKEN=your_token
```

---
[⬅️ Back to README](../README.md)
