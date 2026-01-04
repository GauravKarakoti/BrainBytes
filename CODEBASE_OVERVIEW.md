# BrainBytes - Comprehensive Codebase Overview

## Project Summary
**BrainBytes** is a gamified, interactive platform for learning Data Structures and Algorithms (DSA) across multiple programming languages. It features real-time competitive coding, blockchain rewards, community forums, and a comprehensive progression system.

**Tech Stack:**
- **Frontend:** Next.js 14.2, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (Neon Serverless), Drizzle ORM
- **Authentication:** Auth0
- **Blockchain:** Ethereum (Sepolia), Hardhat, Solidity, Wagmi, viem
- **Real-time:** Pusher
- **Payments:** Stripe
- **AI/Chat:** Google Generative AI (Gemini 2.5 Flash)
- **Admin Panel:** React Admin

---

## Architecture Overview

### Directory Structure

```
├── app/                          # Next.js app directory
│   ├── (landing)/               # Public landing page
│   ├── (user)/                  # Protected user routes
│   │   ├── (dashboard)/         # Main dashboard with parallel routes
│   │   ├── courses/             # Course selection
│   │   └── @userProgress/       # Slot for progress sidebar
│   ├── api/                     # API routes
│   │   ├── auth/               # Auth0 callback
│   │   ├── chat/               # AI chatbot endpoint
│   │   ├── user/               # User profile management
│   │   ├── webhooks/           # Stripe webhooks
│   │   ├── pusher/             # Real-time auth
│   │   └── cron/               # Scheduled tasks
│   ├── admin/                   # Admin dashboard
│   ├── lesson/                  # Individual lesson pages
│   └── layout.tsx               # Root layout with providers
├── components/                   # React components
│   ├── landing/                 # Landing page sections
│   ├── user/                    # User dashboard components
│   │   ├── learn/              # Learning interface
│   │   ├── lesson/             # Lesson components (Quiz)
│   │   ├── shop/               # Shop interface
│   │   ├── leaderboard/        # Leaderboard display
│   │   ├── forum/              # Forum components
│   │   ├── compete/            # P2P competition
│   │   ├── quests/             # Quest display
│   │   ├── courses/            # Course selection
│   │   └── *MenuItems          # Navigation items
│   ├── admin/                   # Admin management components
│   ├── chatbot/                 # AI chatbot component
│   ├── modals/                  # Reusable modals
│   ├── motion/                  # Framer Motion animations
│   ├── theme/                   # Theme provider & toggle
│   ├── ui/                      # Shadcn/ui components
│   ├── providers.tsx            # Wagmi & Query client setup
│   ├── Analytics.tsx            # Vercel Analytics
│   └── ChatBot.tsx              # AI assistant
├── db/                           # Database layer
│   ├── schema/                  # Drizzle schema definitions
│   │   ├── courses.ts           # Course schema
│   │   ├── units.ts             # Unit schema
│   │   ├── lessons.ts           # Lesson schema
│   │   ├── challenges.ts        # Challenge & options schema
│   │   ├── userProgress.ts      # User progression schema
│   │   ├── challengeProgress.ts # Challenge completion tracking
│   │   ├── userSubscription.ts  # Stripe subscription data
│   │   ├── quests.ts            # Daily/weekly quests
│   │   ├── challengeMatches.ts  # P2P match data
│   │   └── forum.ts             # Forum threads & posts
│   ├── queries/                 # Database query functions
│   │   ├── courses.ts           # Course queries
│   │   ├── units.ts             # Unit queries with progress
│   │   ├── lessons.ts           # Lesson queries with challenges
│   │   ├── userProgress.ts      # User progress queries
│   │   ├── leaderboard.ts       # Ranking queries
│   │   └── forum.ts             # Forum queries
│   └── drizzle.ts               # Drizzle client setup
├── actions/                      # Server actions
│   ├── challenge.ts             # Challenge completion, token minting
│   ├── selectCourse.ts          # Course selection logic
│   ├── shop.ts                  # Shop purchases
│   ├── quest.ts                 # Quest progress updates
│   ├── forum.ts                 # Forum create/update/delete
│   ├── challengeMatch.ts        # P2P match creation & submission
│   ├── saveWallet.ts            # Wallet address management
│   ├── user-subscription.ts     # Stripe checkout
│   ├── redeemVoucher.ts         # Voucher redemption
│   └── admin/                   # Admin CRUD operations
│       ├── courseActions.ts     # Manage courses
│       ├── unitActions.ts       # Manage units
│       ├── lessonActions.ts     # Manage lessons
│       ├── challengeActions.ts  # Manage challenges
│       ├── challengeOptionActions.ts
│       └── types.ts
├── config/                       # Configuration files
│   ├── courses.ts               # Course metadata
│   ├── languages.ts             # Language configuration
│   ├── levels.ts                # Level milestones (0-8)
│   ├── quests.ts                # Quest definitions
│   ├── shop.ts                  # Shop item definitions
│   └── metadata.ts              # SEO metadata
├── lib/                          # Utility functions
│   ├── auth0.ts                 # Auth0 helpers
│   ├── admin.ts                 # Admin authorization
│   ├── ethers.ts                # Blockchain token minting
│   ├── stripe.ts                # Stripe client
│   ├── token.ts                 # Token balance queries
│   ├── sounds.ts                # Sound effects manager
│   ├── utils.ts                 # General utilities
│   ├── errors.ts                # Custom error classes
│   └── hooks/
│       └── useUserProfile.ts
├── store/                        # Zustand stores
│   ├── use-exit-modal.ts
│   ├── use-hearts-modal.ts
│   └── use-practice-modal.ts
├── contracts/                    # Solidity smart contracts
│   └── ByteToken.sol            # ERC20 token with minting
├── scripts/                      # Utility scripts
│   ├── seed.ts                  # Database seeding
│   ├── deploy.ts                # Smart contract deployment
│   ├── update-user-data.ts      # User data migration
│   └── material-hsl.json        # Design tokens
├── styles/                       # Global styles
│   ├── globals.css              # Tailwind + custom CSS
│   ├── fonts.ts                 # Font imports
│   └── clerk.css                # Clerk component styles
├── public/                       # Static assets
│   ├── img/                     # Images, flags, icons
│   ├── sounds/                  # Audio effects
│   └── logo.svg
├── drizzle/                      # Database migrations
│   ├── 0000-0005_*.sql         # Migration files
│   └── meta/                    # Migration metadata
├── artifacts/                    # Compiled smart contracts
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose setup
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── drizzle.config.ts            # Drizzle Kit configuration
├── hardhat.config.ts            # Hardhat configuration
├── middleware.ts                # Auth0 middleware
├── package.json                 # Dependencies
└── vercel.json                  # Vercel deployment config
```

---

## Core Features

### 1. **User Authentication & Progression**

**Authentication:** Auth0-based OAuth
- `lib/auth0.ts` - Session management
- `middleware.ts` - Route protection for authenticated users
- Protected routes: `/learn`, `/shop`, `/leaderboard`, `/quests`, `/forum`, `/compete`

**User Progress Tracking:**
- `db/schema/userProgress.ts` - Central user data store
  - Points (XP)
  - Hearts (lives)
  - Gems (currency)
  - Wallet address (blockchain)
  - Level (0-8, based on points)
  - Active course selection
- `db/queries/userProgress.ts` - Progress fetching with caching
- Level system: Newbie → Legend (8 levels)

### 2. **Course & Learning Structure**

**Hierarchical Organization:**
```
Course (Python, JavaScript, C++, etc.)
  └── Unit (Arrays & Strings, Linked Lists, etc.)
       └── Lesson (Array Basics, Two Pointers, etc.)
            └── Challenge (MCQ or Coding)
                 └── Challenge Options
```

**Database Schema:**
- `db/schema/courses.ts` - Course definitions
- `db/schema/units.ts` - Course units with ordering
- `db/schema/lessons.ts` - Individual lessons with unit reference
- `db/schema/challenges.ts` - Challenge content and metadata
- `db/schema/challengeProgress.ts` - User completion tracking

**Progress Queries:**
- `db/queries/lessons.ts` - Fetch lesson with challenges and user progress
- `db/queries/units.ts` - Get all units with lesson progress
- Course completion detection when all lessons done

### 3. **Challenge System**

**Challenge Types (enum: SELECT, HINT, CODE):**
- **SELECT:** Multiple-choice challenges with immediate feedback
- **HINT:** Hint-based questions
- **CODE:** Coding challenges (future feature with Judge0 integration)

**Challenge Structure:**
```typescript
{
  id, type, question, lessonId, order,
  problemDescription, testCases, 
  stubCodePy/Js/Java/Cpp,
  challengeOptions[] // { option, correct, imageSrc, audioSrc }
}
```

**Challenge Completion:**
- `actions/challenge.ts` - `upsertChallengeProgress()`
  - Awards 10 points per correct answer
  - Mints 5 BYTE tokens
  - Triggers quest updates
  - Checks for lesson & unit completion
  - Triggers milestone quests
- Sound effects for correct/incorrect answers
- Hearts system (5 default, refillable)

### 4. **Gamification System**

**Points & Rewards:**
- 10 XP per correct challenge
- 5 BYTE tokens per correct challenge
- Points unlock levels (0→100, 100→250, etc.)
- Hearts regeneration: 5 default, purchasable via shop

**Level System** (`config/levels.ts`):
```
Level 0: Newbie     (0 points)
Level 1: Beginner   (100 points)
Level 2: Apprentice (250 points)
...
Level 8: Legend     (10,000 points)
```

**Leaderboard:**
- `db/queries/leaderboard.ts` - Top 10 users by points
- User rank calculation based on total points
- Caching with 60-second revalidation

### 5. **Quest System** (Daily/Weekly/Milestone)

**Quest Types:**
- **Daily:** Complete 3 lessons, speed demon, daily streaks
- **Weekly:** Complete 20 lessons
- **Progress:** Solve 10 coding challenges
- **Milestone:** Points milestones, leaderboard rankings
- **Challenge:** Perfect score completions

**Quest Rewards:**
- Points (20-200)
- Gems (3-25)
- Tracked per user in `userQuestProgress`

**Quest Management** (`actions/quest.ts`):
- `updateQuestProgress()` - Increment quest counters
- `checkMilestoneQuests()` - Trigger milestone completions
- `resetDailyQuests()` - Cron job at midnight
- `resetWeeklyQuests()` - Cron job on Mondays
- Cron endpoint: `/api/cron` (requires `CRON_SECRET`)

### 6. **Shop & Currency System**

**Currencies:**
- **Points (XP):** Earned from challenges
- **Gems:** Earned from quests
- **BYTE:** ERC20 tokens on blockchain

**Shop Items** (`config/shop.ts`):
1. Refill Hearts (5 hearts) - 50 BYTE cost
2. Amazon Voucher ($5) - 500 BYTE cost
3. Exclusive Badge - 1000 BYTE cost
4. XP Bonus - 10 gems → 100 bonus points

**Purchase Logic** (`actions/shop.ts`):
- `purchaseWithCurrency()` - Deduct currency and grant rewards
- Validates sufficient balance
- Revalidates cache after purchase

### 7. **Blockchain Integration**

**Smart Contract:** `contracts/ByteToken.sol`
- ERC20 token with minting capability
- AccessControl for MINTER_ROLE
- Deployed on Sepolia testnet

**Blockchain Setup** (`lib/ethers.ts`):
- viem integration with JSON RPC provider
- Server wallet with minting authority
- Automatic token minting on challenge completion

**Wallet Management:**
- `components/user/ConnectWalletButton.tsx` - Wagmi integration
- MetaMask connection for Sepolia chain
- `actions/saveWallet.ts` - Persist wallet address to DB
- Wallet validation using `viem` (`isAddress`)
- Balance tracking in `lib/token.ts`

**Providers Setup** (`components/providers.tsx`):
- Wagmi config (Sepolia chain)
- React Query for data synchronization

### 8. **Real-time P2P Competition**

**Challenge Matches:**
- `db/schema/challengeMatches.ts` - Match data
- Match states: pending → in_progress → completed

**Match Workflow** (`actions/challengeMatch.ts`):
1. `findOrJoinMatch()` - Create or join pending match
2. Player 1 creates match, Player 2 joins (Pusher notification)
3. Both players submit code for same challenge
4. Judge0 API evaluates submissions (external service)
5. Winner determined by test case results

**Pusher Integration:**
- Real-time match notifications
- Private channels: `private-match-{matchId}`
- Auth via `/api/pusher/auth`
- Language support: JS, Python, Java, C++, Go, Rust, TypeScript, Kotlin, Swift

### 9. **Community Forum**

**Forum Structure:**
- **Threads:** Discussion topics with author, timestamps
- **Posts:** Replies to threads (nested with parent post reference)
- **Relations:** Thread → Posts (one-to-many, recursive)

**Forum Operations** (`actions/forum.ts`):
- `createThread()` - Create discussion topic
- `updateThread()` - Edit/pin/lock (admin only)
- `deleteThread()` - Remove thread
- `createPost()` - Reply to thread
- `updatePost()` - Edit reply
- `deletePost()` - Remove reply

**Forum Queries** (`db/queries/forum.ts`):
- `getForumThreads()` - Sorted by pin status, activity
- `getForumThreadById()` - Get thread with all posts
- `getForumPostById()` - Individual post retrieval

### 10. **Subscription System**

**Stripe Integration** (`lib/stripe.ts`):
- Monthly subscription: $20/month
- Unlimited hearts benefit
- Billing portal for existing customers

**Subscription Flow** (`actions/user-subscription.ts`):
- `createStripeUrl()` - Generate checkout session
- Metadata: userId for reference

**Webhook Processing** (`app/api/webhooks/stripe/route.ts`):
- `checkout.session.completed` - Create subscription record
- `invoice.payment_succeeded` - Renew subscription
- Stores: stripeCustomerId, subscriptionId, priceId, periodEnd

**Subscription Queries:**
- `getUserSubscription()` - Check subscription status
- `isActive` flag based on current_period_end

### 11. **AI Chatbot (ByteBot)**

**Chatbot Component** (`components/chatbot/Chatbot.tsx`):
- Floating button with popover interface
- Message history with user/assistant separation
- Loading states with spinner

**AI Backend** (`app/api/chat/route.ts`):
- Google Generative AI (Gemini 2.5 Flash)
- System prompt with BrainBytes feature context
- Authentication required (Auth0)
- Max duration: 30 seconds

**Features:**
- Platform feature explanation
- User guidance and FAQ
- Friendly, encouraging tone
- Streaming responses

### 12. **Admin Panel**

**Admin Components:**
- `components/admin/App.tsx` - React Admin interface
- `components/admin/Course/Unit/Lesson/Challenge/ChallengeOption.tsx` - CRUD views

**Admin Actions:**
- `actions/admin/courseActions.ts` - Create/read/update/delete courses
- `actions/admin/unitActions.ts` - Manage units
- `actions/admin/lessonActions.ts` - Manage lessons
- `actions/admin/challengeActions.ts` - Manage challenges
- Authorization via `getIsAdmin()` (email whitelist)

**Admin Features:**
- List with pagination, sorting, filtering
- Create/edit/delete records
- Data validation
- Cache revalidation after changes

### 13. **User Profile & Wallet Management**

**Profile API** (`app/api/user/profile/route.ts`):
- `GET` - Fetch user info and progress
- `PATCH` - Update name and avatar
- Avatar URL validation

**Wallet Management:**
- Save wallet address
- Validate Ethereum address format
- Check for duplicate wallet assignments
- Display BYTE balance from blockchain

---

## Database Schema Details

### User Progress (`userProgress`)
```typescript
{
  userId: string (PK),
  userName: string,
  userImgSrc: string (avatar),
  activeCourseId: number (FK),
  hearts: number (default: 5),
  points: number (default: 0),
  gems: number (default: 0),
  wallet_address: string (unique, nullable),
  level: number (0-8, default: 0)
}
```

### Courses
```typescript
{
  id: number (PK),
  title: string,
  altCode: string (2-char code like 'py', 'js')
}
```

### Units
```typescript
{
  id: number (PK),
  title: string,
  description: string,
  courseId: number (FK → courses),
  order: number (sequence within course)
}
```

### Lessons
```typescript
{
  id: number (PK),
  title: string,
  unitId: number (FK → units),
  order: number (sequence within unit)
}
```

### Challenges & Options
```typescript
challenges {
  id: number (PK),
  type: enum ('SELECT' | 'HINT' | 'CODE'),
  question: string,
  lessonId: number (FK),
  order: number,
  problemDescription: string,
  testCases: jsonb,
  stubCodePy/Js/Java/Cpp: string
}

challengeOptions {
  id: number (PK),
  challengeId: number (FK),
  option: string,
  correct: boolean,
  imageSrc: string (optional),
  audioSrc: string (optional)
}
```

### Progress Tracking
```typescript
challengeProgress {
  id: number (PK),
  userId: string,
  challengeId: number (FK),
  completed: boolean (default: false)
}

userQuestProgress {
  id: number (PK),
  userId: string,
  questId: number (FK),
  currentProgress: number,
  completed: boolean,
  lastCompletedAt: timestamp
}
```

### Real-time & Communication
```typescript
challengeMatches {
  id: number (PK),
  challengeId: number (FK),
  playerOneId: string,
  playerTwoId: string (nullable),
  playerOneCode/Language: string,
  playerTwoCode/Language: string,
  status: enum ('pending' | 'in_progress' | 'completed' | 'cancelled'),
  winnerId: string (nullable),
  startedAt/endedAt: timestamp
}

forumThreads {
  id: number (PK),
  title: string,
  body: string,
  authorId: string,
  authorName: string,
  authorAvatar: string,
  isPinned: boolean,
  isLocked: boolean,
  createdAt/updatedAt/lastActivityAt: timestamp
}

forumPosts {
  id: number (PK),
  threadId: number (FK),
  parentPostId: number (FK, self-referential),
  authorId: string,
  body: string,
  isDeleted: boolean,
  createdAt/updatedAt: timestamp
}
```

### Billing
```typescript
userSubscription {
  userId: string (PK),
  stripeCustomerId: string (unique),
  stripeSubscriptionId: string (unique),
  stripePriceId: string,
  stripeCurrentPeriodEnd: timestamp
}
```

---

## Key Server Actions

### Challenge Completion (`actions/challenge.ts`)
```typescript
upsertChallengeProgress(challengeId: number)
  ├─ Validate user exists
  ├─ Check challenge not already completed
  ├─ Award 10 points & 5 BYTE tokens
  ├─ Update level based on new points
  ├─ Mint tokens via blockchain
  ├─ Update quest progress
  ├─ Check lesson/unit completion
  └─ Revalidate caches

reduceHearts()
  └─ Deduct 1 heart on wrong answer

updateLessonCompletion()
  └─ Mark lesson complete when all challenges done
```

### Course Selection (`actions/selectCourse.ts`)
```typescript
selectCourse(courseId: number)
  ├─ Validate course exists & has lessons
  ├─ Create or update user progress
  ├─ Set active course
  └─ Redirect to /learn
```

### Shop Purchase (`actions/shop.ts`)
```typescript
purchaseWithCurrency(itemId: number)
  ├─ Validate item exists
  ├─ Check sufficient currency
  ├─ Deduct cost
  ├─ Award reward (hearts/points/gems)
  └─ Revalidate caches
```

### Quest Updates (`actions/quest.ts`)
```typescript
updateQuestProgress(userId, questType, increment)
  ├─ Find quests of type
  ├─ Increment progress
  ├─ Award rewards when target met
  ├─ Update user gems/points
  └─ Revalidate caches

resetDailyQuests()
  └─ Reset all daily quests at midnight

resetWeeklyQuests()
  └─ Reset weekly quests on Mondays
```

### Forum Operations (`actions/forum.ts`)
```typescript
createThread({ title, body })
  ├─ Validate inputs
  ├─ Create thread with auth user as author
  └─ Revalidate forum cache

updateThread(threadId, updates)
  ├─ Authorize (author or admin)
  ├─ Update allowed fields
  └─ Revalidate cache

deleteThread(threadId)
  ├─ Authorize (author or admin)
  ├─ Delete all associated posts
  └─ Revalidate cache

createPost({ threadId, parentPostId, body })
  ├─ Support nested replies
  ├─ Validate thread exists
  └─ Revalidate cache
```

### P2P Matching (`actions/challengeMatch.ts`)
```typescript
findOrJoinMatch(challengeId, language)
  ├─ Check existing player 1 match
  ├─ Look for pending match to join
  │  └─ If found: set player 2, start match, notify via Pusher
  └─ If not found: create new match

submitP2PChallenge(matchId, code, language)
  ├─ Authorize player in match
  ├─ Save submission code
  ├─ Run test cases via Judge0 API
  ├─ Compare outputs
  ├─ Determine winner
  └─ Update match status
```

### Blockchain Integration
```typescript
// Automatic on challenge completion:
const amount = ethers.parseUnits(5, 18); // 5 BYTE tokens
await byteTokenContract.mint(walletAddress, amount);

// Get balance:
const balance = await contract.balanceOf(walletAddress);
const formatted = ethers.formatUnits(balance, 18);
```

### Stripe Webhook (`app/api/webhooks/stripe/route.ts`)
```typescript
POST /api/webhooks/stripe
  ├─ Verify signature
  ├─ Handle checkout.session.completed
  │  └─ Create userSubscription record
  ├─ Handle invoice.payment_succeeded
  │  └─ Update subscription periodEnd
  └─ Return 200
```

---

## State Management

### Zustand Stores (`store/`)
```typescript
// Exit Modal
useExitModal: { isOpen, onOpen, onClose }

// Hearts Modal  
useHeartsModal: { isOpen, onOpen, onClose }

// Practice Modal
usePracticeModal: { isOpen, onOpen, onClose }
```

### React Query
```typescript
// In providers.tsx
QueryClient configured for caching and deduplication
```

### Environment Variables Required

**Authentication:**
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_ADMIN_EMAILS`

**Database:**
- `DATABASE_URL` (Neon PostgreSQL)

**Blockchain:**
- `NEXT_PUBLIC_BYTE_TOKEN_ADDRESS`
- `RPC_PROVIDER_URL` (Sepolia)
- `SERVER_WALLET_PRIVATE_KEY`

**External APIs:**
- `NEXT_PUBLIC_JUDGE0_HOST`
- `JUDGE0_API_KEY`
- `STRIPE_API_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_PUSHER_APP_KEY`
- `PUSHER_APP_ID`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

**AI:**
- Google Generative AI (API key auto-loaded from environment)

---

## API Routes

### Authentication
- `GET/POST /api/auth/[auth0]` - Auth0 callback

### User
- `GET /api/user/profile` - Fetch user profile
- `PATCH /api/user/profile` - Update user info

### Real-time
- `POST /api/pusher/auth` - Authenticate Pusher channel

### Webhooks
- `POST /api/webhooks/stripe` - Stripe event handling

### Chat
- `POST /api/chat` - AI chatbot messages

### Cron
- `GET /api/cron` - Reset daily/weekly quests (Bearer token required)

---

## Frontend Architecture

### Layouts (Nested Routes)
```
layout.tsx (Root - Auth0 Provider, Theme, Modals)
├── (landing)/
│   └── layout.tsx (Public)
│       └── page.tsx (Hero, Courses, Metrics, etc.)
└── (user)/
    └── layout.tsx (SideMenu + MobileSheet)
        ├── @userProgress/ (Slot)
        │   └── default.tsx (User Stats Sidebar)
        ├── courses/
        │   └── page.tsx (Course Selection)
        └── (dashboard)/
            ├── @main/ (Slot)
            │   ├── learn/page.tsx (Units & Lessons)
            │   ├── shop/page.tsx (Items & Purchase)
            │   ├── leaderboard/page.tsx (Top Users)
            │   ├── quests/page.tsx (Quest Grid)
            │   ├── forum/page.tsx (Thread List)
            │   ├── forum/[threadId]/page.tsx (Thread Detail)
            │   ├── compete/page.tsx (Match Finder)
            │   └── compete/[challengeId]/page.tsx (Match Room)
            └── @userProgress/ (Slot)
```

### Component Hierarchy
```
Components
├── Landing
│   ├── Hero (Call-to-action with animations)
│   ├── Courses (Showcase available courses)
│   ├── Metrics (Stats and metrics display)
│   ├── Fluency (Language fluency section)
│   ├── Reasons (Why use BrainBytes)
│   ├── Footer (Footer with links)
│   └── Header (Navigation)
├── User Dashboard
│   ├── SideMenu (Navigation sidebar)
│   ├── SideMenuItem (Nav item)
│   ├── SideMenuUserButton (Profile button)
│   ├── SideMenuThemeButton (Dark mode toggle)
│   ├── UserProgress (Stats display)
│   ├── MobileSheet (Mobile navigation)
│   └── ConnectWalletButton (Wagmi integration)
├── Learning
│   ├── Unit (Unit container)
│   ├── UnitBanner (Unit header)
│   ├── LearnButton (Lesson button with progress)
│   │   ├── ButtonBase
│   │   ├── ActiveButton
│   │   ├── CurrentButton
│   │   └── LockedButton
│   ├── StickyWrapper (Sidebar layout)
│   ├── FeedWrapper (Main content layout)
│   └── Quiz (Challenge component)
├── Shop
│   ├── ShopGrid (Item grid)
├── Leaderboard
│   ├── LeaderboardList (User rankings)
├── Quests
│   ├── QuestGrid (Quest cards)
├── Forum
│   ├── ThreadList (Thread overview)
│   ├── ThreadDetail (Thread with posts)
│   ├── ThreadComposer (Create thread)
│   ├── PostComposer (Create reply)
│   └── utils (Content sanitization)
├── Competition
│   ├── CompetitionRoom (Match interface)
├── Admin
│   ├── App (React Admin dashboard)
│   ├── Course (CRUD component)
│   ├── Unit (CRUD component)
│   ├── Lesson (CRUD component)
│   ├── Challenge (CRUD component)
│   └── ChallengeOption (CRUD component)
├── Chatbot
│   └── Chatbot (AI assistant popover)
├── Modals
│   ├── exit-modal (Confirm exit)
│   ├── hearts-modal (Hearts exhausted)
│   └── practice-modal (Practice mode)
├── UI (Shadcn)
│   ├── button
│   ├── input
│   ├── dialog
│   ├── drawer
│   ├── sheet
│   ├── popover
│   ├── checkbox
│   ├── separator
│   ├── skeleton
│   ├── aspect-ratio
│   ├── pill (Custom)
│   ├── adaptive-modal (Custom)
│   └── sonner (Toast)
├── Theme
│   ├── provider (next-themes)
│   ├── toggle (Theme switcher)
│   ├── useToggle (Hook)
│   └── constants
└── Motion (Framer Motion)
    ├── AnimatedTitle
    ├── AnimatedList
    ├── AnimatedNumber
    ├── AnimatedHeroDecor
    └── index (MotionDiv export)
```

### Key Hooks
```typescript
// Built-in
useUser() // Auth0
useAccount() // Wagmi
useConnect() // Wagmi
useDisconnect() // Wagmi
useSwitchChain() // Wagmi

// Custom
useSound() // Sound manager
useToggle() // Theme toggle

// State
useExitModal() // Zustand
useHeartsModal() // Zustand
usePracticeModal() // Zustand
```

---

## Styling & Design

### Tailwind CSS
- Configured in `tailwind.config.ts`
- Custom colors and animations
- Responsive design with mobile-first approach

### Fonts
- Custom fonts imported in `styles/fonts.ts`
- Applied in root layout

### Icons
- Lucide React for UI icons
- SVG files for custom graphics
- Next.js Image optimization for flag icons

### Dark Mode
- next-themes provider
- Automatic system preference detection
- Toggle in sidebar

### Animations
- Framer Motion for complex animations
- Tailwind animations for simple effects
- Fade-in, slide, scale transitions

---

## Deployment & Configuration

### Docker
- `Dockerfile` for containerization
- `docker-compose.yml` for local development

### Vercel Deployment
- `vercel.json` configuration
- Next.js standalone output
- Environment variables via Vercel dashboard

### Database Migrations
- Drizzle Kit for schema management
- SQL migration files in `drizzle/` folder
- Scripts: `db:gen`, `db:migrate`, `db:push`, `db:studio`

### Blockchain
- Hardhat for smart contract development
- Sepolia testnet configuration
- `scripts/deploy.ts` for contract deployment

---

## Security Considerations

1. **Authentication:** Auth0 middleware enforces login for protected routes
2. **Admin Authorization:** Email whitelist in `getIsAdmin()`
3. **Blockchain:** Server-side minting with private key management
4. **Stripe:** Webhook signature verification
5. **Pusher:** Channel authorization before broadcasting
6. **User Data:** Proper access control in queries and mutations
7. **Input Validation:** Sanitization in forum and profile updates
8. **Cron Jobs:** Bearer token validation

---

## Performance Optimizations

1. **Caching:**
   - React cache() for server-side data deduplication
   - Next.js unstable_cache() for longer-lived caches
   - Revalidation tags for selective cache invalidation

2. **Database:**
   - Indexed queries for lessons and challenges
   - Batch operations with Promise.all()
   - Efficient joins with Drizzle relations

3. **Frontend:**
   - Image optimization with Next.js Image
   - Code splitting with dynamic imports
   - Concurrent rendering with React 18

4. **Real-time:**
   - Pusher for efficient WebSocket communication
   - Selective channel subscriptions

---

## Future Enhancements

1. **CODE Challenge Type:** Full coding challenge execution
2. **Mobile App:** React Native version
3. **Video Lessons:** Tutorial content
4. **Peer Review:** User solution reviews
5. **Team Challenges:** Group competitions
6. **Achievement Badges:** Visual badges
7. **Analytics:** Performance tracking
8. **IDE Integration:** VS Code extension
9. **Payment Options:** More cryptocurrencies
10. **Internationalization:** Multi-language support

---

## Maintenance & Monitoring

- **Logs:** Console logging with timestamps
- **Error Handling:** Custom error classes
- **Analytics:** Vercel Analytics integration
- **Database:** Drizzle logging in dev mode
- **Webhooks:** Stripe event logging

---

## Summary

BrainBytes is a comprehensive full-stack platform combining:
- **Learning:** Gamified curriculum with structured progression
- **Community:** Forum for peer interaction
- **Competition:** Real-time P2P coding battles
- **Rewards:** Blockchain tokens and traditional gamification
- **Payments:** Stripe subscriptions for premium features
- **AI:** Intelligent chatbot for user assistance

The codebase is well-organized, type-safe (TypeScript), and production-ready with proper authentication, database management, and error handling.
