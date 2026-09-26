# 🛡️ VeriVote — Secure Online Voting System with SHA-256 Hash-Chain Ledger

A web-based, tamper-evident online voting platform featuring **2-Factor OTP Authentication**, **Short-Lived JWT Authorization**, **Decoupled Ballot Identity**, and an **Immutable SHA-256 Hash-Chain Ledger** (Mini Blockchain) with real-time audit capabilities and an interactive Viva Tamper Demonstration tool.

---

## 🌟 Core Value Proposition & Viva Criteria Met

1. **Authentication (Who You Are)**: Registration with voter ID & email validation + 2FA OTP verification on every login via console/email.
2. **Authorization (One Vote Per Voter)**: Enforced at both database schema level (`hasVoted` map) and API request level.
3. **Integrity (Tamper-Proof Ledger)**: Votes are chained using SHA-256 block hashes (`currentHash = SHA256(index + electionId + candidateId + timestamp + previousHash)`). Changing any past vote breaks the hash chain mathematically.
4. **Transparency & Ballot Secrecy**: Votes are stored in a `VoteBlock` collection **without voter identity**. Voters receive an official **Receipt SHA-256 Hash** to verify inclusion without exposing candidate selection.

---

## 🏗️ Recommended & Implemented Tech Stack

| Layer | Technology | Purpose |
| font-mono | --- | --- |
| **Frontend** | React.js (Vite) + TailwindCSS + Lucide Icons + Recharts | Responsive, glassmorphism UI, step-by-step voting wizard |
| **Backend** | Node.js + Express.js | REST APIs, JWT session control, security middlewares |
| **Database** | MongoDB (Mongoose) + Memory Server Fallback | Flexible schema, unique constraints, zero-config local execution |
| **Security** | SHA-256 Hash-Chaining, Helmet.js, Express-Rate-Limit, Bcrypt.js | Defense against brute force, NoSQL injection, and tamper detection |
| **Auth** | JWT + 2FA OTP (Nodemailer / Dev Console Mode) | Enterprise 2-Factor Authentication flow |

---

## 📁 Complete Folder & File Structure

```
secure-voting-system/
├── backend/
│   ├── config/
│   │   └── db.js               # Database connection with auto-fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, OTP, 2FA, JWT issuance
│   │   ├── electionController.js # Election CRUD, turnout metrics, publish results
│   │   └── voteController.js   # Decoupled vote casting, ledger audit, tamper demo
│   ├── middleware/
│   │   ├── auth.js             # JWT & Admin authorization guard
│   │   └── rateLimiter.js      # Rate limits for login & OTP routes
│   ├── models/
│   │   ├── Voter.js            # Voter registration & hasVoted map
│   │   ├── Election.js         # Election metadata & candidate manifestos
│   │   └── VoteBlock.js        # Decoupled immutable hash-chain ledger blocks
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── electionRoutes.js
│   │   └── voteRoutes.js
│   ├── utils/
│   │   ├── otp.js              # Crypto OTP generator & Nodemailer/Console output
│   │   └── ledger.js           # SHA-256 block calculation, verifyChain & tamper simulation
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express application entrypoint & auto-seeder
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js # Centralized Axios HTTP client
    │   ├── components/
    │   │   ├── CandidateCard.jsx # Candidate selection UI card
    │   │   ├── Navbar.jsx      # Navigation header with role switcher
    │   │   ├── OtpModal.jsx    # Sleek 2FA OTP input modal with dev code badge
    │   │   └── Timer.jsx       # Countdown timer for active voting window
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth & voting state provider
    │   ├── pages/
    │   │   ├── AdminPanel.jsx  # Election management & Viva Tamper Inspector
    │   │   ├── Dashboard.jsx   # Voter home, active elections list
    │   │   ├── Login.jsx       # Password login with 2FA OTP prompt
    │   │   ├── ReceiptPage.jsx # SHA-256 vote receipt verifier tool
    │   │   ├── Register.jsx    # Registration form with instant OTP verify
    │   │   ├── Results.jsx     # Visual charts & winner declaration
    │   │   └── VotePage.jsx    # Interactive 4-Step Voting Wizard
    │   ├── App.jsx             # Route definitions & protection wrapper
    │   ├── index.css           # Tailwind + navy glassmorphism theme
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Step-by-Step Setup Guide (How to Run on Your System)

### Prerequisites Needed
Before starting, make sure you have the following installed on your system:
1. **Node.js**: (Version 18.x or 20.x recommended) — Download from [nodejs.org](https://nodejs.org/).
2. **NPM**: Comes automatically bundled with Node.js.
3. **MongoDB** *(Optional)*: If you have local MongoDB or MongoDB Atlas, put your connection string in `backend/.env`. If you don't have MongoDB installed, **the backend automatically falls back to an embedded in-memory database** so it runs instantly with ZERO configuration!

---

### Step 1: Extract the ZIP Archive
Extract `secure-voting-system.zip` into any folder on your computer.

---

### Step 2: Set Up & Run Backend

Open a terminal (Command Prompt / PowerShell / Terminal) in the `backend` folder:

```bash
cd backend

# Install dependencies
npm install

# Start the server (Dev Mode with auto-reseed)
npm start
```

Upon launching, the backend will display:
```
==================================================
🚀 SECURE VOTING BACKEND RUNNING ON PORT 5000
🌐 Base URL: http://localhost:5000
🔐 Tamper-Evident Ledger Engine Active (SHA-256)
==================================================
```

---

### Step 3: Set Up & Run Frontend

Open a **second terminal** window in the `frontend` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The terminal will provide your local web URL:
```
  VITE v5.2.11  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser!

---

## 🔑 Default Accounts (Auto-Seeded for Instant Testing)

When the server starts for the first time, it automatically creates sample accounts and an active election:

| Role | Email | Password | Voter ID |
| --- | --- | --- | --- |
| **Administrator** | `admin@voting.gov` | `admin123` | `ADMIN-2026-001` |
| **Voter #1** | `alice@example.com` | `voter123` | `VOTER-8849-001` |
| **Voter #2** | `bob@example.com` | `voter123` | `VOTER-8849-002` |

> **Note on OTPs**: OTPs are sent via Nodemailer if configured in `backend/.env`. For offline dev/viva testing, the 6-digit OTP code is **printed directly in the backend terminal console** AND displayed in a **gold badge on the screen modal** for zero-delay demonstration!

---

## 🎯 How to Give an Impressive Viva Presentation

1. **Demonstrate 2FA Auth**:
   - Log in with `alice@example.com` / `voter123`.
   - Show the 2FA OTP prompt pop up. Copy the dev OTP code and log in.
2. **Demonstrate Decoupled Voting**:
   - Click on the active **National Technology Council Presidential Election 2026**.
   - Step through the 4-step wizard: Verify Credentials -> Pick Candidate -> Lock Ballot -> Receive SHA-256 Receipt.
   - Show the receipt hash: `e.g. 7f8a9b...`. Copy this receipt hash!
3. **Demonstrate Double-Voting Prevention**:
   - Try voting again on the same election with Alice. Show that the button changes to "Ballot Locked & Chain Recorded" and the API rejects duplicate attempts.
4. **Demonstrate Receipt Verification**:
   - Go to **Verify Receipt** in the top navigation. Paste the copied receipt hash. Show how the ledger confirms inclusion without revealing who Alice voted for.
5. **Demonstrate Viva Tamper Simulation (The Highlight!)**:
   - Log out and log in as Admin (`admin@voting.gov` / `admin123`).
   - Open **Admin Panel & Audit**.
   - Click **Run Chain Audit** — show the green **LEDGER INTEGRITY VERIFIED (PASSED)** message with all block hashes intact.
   - Now click **Simulate Tamper** — this directly alters a candidate choice in the database.
   - Watch the chain audit instantly turn RED: **SECURITY ALERT: TAMPERING DETECTED!** with the exact broken block index identified. Explain how SHA-256 hash-chaining prevents silent vote tampering!

---

## 🔌 API Endpoint Documentation

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register new voter & send OTP |
| `POST` | `/api/auth/verify-registration-otp` | Public | Verify registration passcode |
| `POST` | `/api/auth/login/step1` | Public | Verify email/password & issue 2FA OTP |
| `POST` | `/api/auth/login/step2` | Public | Verify 2FA OTP & return JWT token |
| `GET` | `/api/auth/me` | Voter | Get current profile & voting status |
| `GET` | `/api/elections` | Voter | List all elections |
| `GET` | `/api/elections/:id/results` | Voter | Fetch tally results (if published/ended) |
| `POST` | `/api/elections` | Admin | Create a new election |
| `PUT` | `/api/elections/:id/publish` | Admin | Publish election results |
| `POST` | `/api/votes/cast` | Voter | Cast ballot & append block to ledger |
| `GET` | `/api/votes/receipt/:hash` | Public | Look up cryptographic proof of inclusion |
| `GET` | `/api/votes/audit/:electionId` | Voter/Admin | Audit SHA-256 hash-chain validity |
| `POST` | `/api/votes/simulate-tamper` | Admin | Viva Demo: simulate DB vote edit |

---

## ⚖️ License & Credits
Built for Academic Evaluation & Security Demonstration. SHA-256 Hash Chain Protocol Implementation.
#   O n l i n e _ V o t i n g _ S y s t e m  
 