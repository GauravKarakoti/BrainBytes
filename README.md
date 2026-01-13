<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

<div align="center">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=FF0000&width=435&lines=Welcome+to+BrainBytes"/>
    <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <h3 style="color: white; margin: 0; font-size: 1.3em;">🚀 Transform Your Coding Journey with Gamified Learning</h3>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Master DSA through interactive challenges, blockchain rewards, and real-time PvP</p>
    </div>
</div>

<p align="center">
  <b>Quick Links:</b> 
  <a href="https://brainbytes.vercel.app">Live Demo</a> • 
  <a href="./documentation/SETUP.md">Setup Guide</a> • 
  <a href="#architecture">Technical Maps</a> • 
  <a href="./CONTRIBUTING.md">Contribute</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Active-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js"/>
</p>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

---

## 🏗️ Technical Architecture

### ⚔️ PvP Challenge Flow (Real-time)
BrainBytes uses a distributed architecture to handle code execution and real-time updates.

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant A as Next.js Server Action
    participant J as Judge0 API
    participant P as Pusher
    participant DB as PostgreSQL (Drizzle)

    U->>A: Submit Solution
    A->>J: POST /submissions
    J-->>A: Execution Result

    par Sync Data & Notify
        A->>DB: Record Stats & $BYTE Rewards
        A->>P: Emit Real-time Update
    end

    P-->>U: Update UI (Result, XP, Tokens)
```

---

## ⛓️ Web3 Integration Map

How the platform interacts with the **Sepolia Testnet** for rewards.

### 🔗 Architecture Overview

| Layer     | Component                 | Description                                                     |
|----------|---------------------------|-----------------------------------------------------------------|
| Provider | Wagmi / RainbowKit        | Manages wallet connections and Web3 hooks                      |
| Logic    | Ethers.js / Hardhat       | Handles smart contract interaction and gas management          |
| Contract | ByteToken (ERC-20)        | Deployed on Sepolia for gamified token minting and rewards     |
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" />

---

## 📂 Project Structure

Simplified view of the **BrainBytes** modular architecture.

### 🧱 Directory Overview

```plaintext
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   ├── components/     # UI components (shadcn/ui)
│   ├── actions/        # Server Actions (Logic & Mutations)
│   ├── db/             # Drizzle ORM Schema & Migrations
│   ├── lib/            # Shared utilities (Pusher, Auth0, Wagmi)
│   └── contracts/      # Solidity Smart Contracts (Hardhat)
├── documentation/      # Modular Documentation 📄
└── scripts/            # Database Seeding & Deployments
```
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" /> 

---

## 📚 Technical Deep Dives
To make it easier for contributors, we have moved detailed specs to the `documentation/` folder:
* **🚀 [Installation & Setup](documentation/SETUP.md) -** Get the project running locally.
* **🔐 [Security Architecture](./SECURITY.md) -** Auth0 patterns & CI/CD scanning.
* **📚 [Learning Curriculum](documentation/LEARNING_PATHS.md) -** Python/JS DSA path details.
* **🔄 [CI/CD Pipelines](documentation/PIPELINES.md) -** GitHub Actions workflows.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

---

## 🤝 Contributing
We love community help! Check our [Contributing Guide](./CONTRIBUTING.md) for **ECWOC'26** guidelines.

<div align="left"> <h2>💙 Contributors</h2> <img src="https://api.vaunt.dev/v1/github/entities/GauravKarakoti/repositories/BrainBytes/contributors?format=svg&limit=54" width="100%" /> </div>

<p align="center">MIT Licensed | © 2024-2026 Gaurav Karakoti</p>
