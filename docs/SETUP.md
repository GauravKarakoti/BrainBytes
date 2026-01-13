# 🚀 Getting Started Guide

Follow this guide to set up **BrainBytes** on your local machine for development and testing.

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or higher
- **pnpm**: Fast, disk space efficient package manager (`npm install -g pnpm`)
- **PostgreSQL**: A running instance (Recommended: [Neon.tech](https://neon.tech/))
- **Accounts**: You will need free tier accounts for **Auth0**, **Pusher**, and **Judge0**.

---

## 📦 Installation Steps

### 1. Clone & Install
```
git clone [https://github.com/GauravKarakoti/BrainBytes.git](https://github.com/GauravKarakoti/BrainBytes.git)
cd BrainBytes
pnpm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```
cp .env.example .env
```
Open `.env` and fill in your credentials:
* **Database:** `DATABASE_URL` from Neon.
* **Auth0:** Domain, Client ID, and Secret.
* **Pusher:** App ID, Key, and Secret for real-time features.
* **Blockchain:** Sepolia RPC URL and your private key (for testing rewards).
* **Judge0:** API Key for code execution.

### 3. Database Initialization
Sync your schema and populate the initial data (courses, levels, and quests):
```
pnpm db:push
pnpm db:seed
```

### 4. Smart Contract Deployment (Optional)
To test $BYTE token features locally:
```
pnpm env:load pnpm tsx ./scripts/deploy.ts
```

---

## 🛠️ Development Workflow
Run the development server:
```
pnpm dev
```

The app will be live at http://localhost:3000.

---

## 📜 Available Commands

| Command              | Action                                                                 |
|----------------------|------------------------------------------------------------------------|
| `pnpm dev`           | Start the development server with Hot Module Replacement               |
| `pnpm build`         | Create an optimized production build of the application                |
| `pnpm start`         | Run the compiled production version                                    |
| `pnpm lint`          | Run ESLint to identify and fix code quality issues                      |
| `pnpm db:push`       | Sync the Drizzle schema directly with the database                      |
| `pnpm db:studio`     | Open a local GUI (Drizzle Studio) to view and edit your data            |
| `pnpm db:seed`       | Populate the database with initial courses, units, and quests          |
| `pnpm db:update-users` | Manually refresh user statistics and leaderboard rankings           |

---

## 💡 Pro-Tips
* **Admin Access:** Add your email to `AUTH0_ADMIN_EMAILS` in `.env` to access the admin dashboard.
* **Web3 Wallet:** Use a MetaMask test account on the Sepolia network to test claiming rewards.

---

[⬅️ Back to README](../README.md)
