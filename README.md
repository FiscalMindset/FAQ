# FAQ Generator - Production-Ready MERN Stack Application

<div align="center">

![Status](https://img.shields.io/badge/status-production--ready-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-6.0%2B-green)

**A scalable, production-ready FAQ management system with AI-powered suggestions**

*[Samagama.in](https://samagama.in) • Report Bug • Request Feature*

</div>

---

## 📐 Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Frontend - Vercel"]
        UI["React + Vite + Tailwind CSS"]
        RC["React Context / Auth"]
        AX["Axios HTTP Client"]
    end

    subgraph Server["Backend - Render"]
        EX["Express.js Server"]
        MW["JWT Auth Middleware"]
        RCtrl["Route Controllers"]
        GM["Gemini AI Service"]
    end

    subgraph Database["MongoDB Atlas"]
        MDB["MongoDB Clusters"]
        RS["Replica Set"]
        AT["Atlas Search Index"]
    end

    subgraph External["External Services"]
        GG["Google Gemini API"]
        MG["MongoDB Atlas"]
    end

    Client -->|"HTTPS / REST API"| Server
    Server -->|" mongoose "| Database
    Server -->|" Gemini SDK"| External
    EX --> MW --> RCtrl
    RCtrl --> GM
    GM --> GG

    style Client fill:#61dafb,color:#000
    style Server fill:#68a063,color:#fff
    style Database fill:#00684a,color:#fff
```

## 🔄 Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant G as Gemini AI
    participant D as MongoDB

    Note over U,D: FAQ Submission & Approval Flow

    U->>C: Submit Question
    C->>S: POST /api/questions
    S->>D: Save Question (status: new)
    D-->>S: Question Created
    S-->>C: 201 Created
    C-->>U: Success Message

    Note over U,D: Admin Workflow

    U->>C: Login as Admin
    C->>S: POST /api/auth/login
    S->>D: Verify User
    D-->>S: User Data
    S-->>C: JWT Token

    C->>S: GET /api/questions?status=new
    S-->>C: Questions List

    C->>S: POST /api/questions/group
    S->>D: Update Questions (status: grouped)
    D-->>S: Updated
    S-->>C: Grouped Questions

    C->>S: POST /api/questions/suggest-faq
    S->>G: Generate FAQ
    G-->>S: Suggested Q&A
    S->>D: Save FAQ (status: draft)
    D-->>S: FAQ Created
    S-->>C: Suggested FAQ

    C->>S: PATCH /api/faqs/:id/status
    S->>D: Update status → published
    D-->>S: Updated
    S-->>C: Published FAQ

    Note over U,D: Public User Flow

    U->>C: Visit Homepage
    C->>S: GET /api/faqs/published
    S->>D: Find Published FAQs
    D-->>S: FAQ List
    S-->>C: FAQs
    C-->>U: Display FAQs
```

## 🏗️ System Architecture

```mermaid
flowchart LR
    subgraph Internet["Public Internet"]
        U1[("👤 User")]
        U2[("👤 Admin")]
    end

    subgraph Cloud["Cloud Infrastructure"]
        subgraph Vercel["Vercel CDN"]
            FE[("Frontend App")]
        end

        subgraph Render["Render Cloud"]
            API[("API Server")]
        end

        subgraph Atlas["MongoDB Atlas"]
            DB[(("Database"))]
        end
    end

    subgraph External["External APIs"]
        GEM[("Gemini AI"))]
    end

    U1 -->|HTTPS| FE
    U2 -->|HTTPS| FE
    FE -->|REST API| API
    API -->|mongoose| DB
    API -->|HTTPS| GEM

    style Vercel fill:#000,color:#fff
    style Render fill:#ff0000,color:#fff
    style Atlas fill:#00684a,color:#fff
```

## 📊 Database Schema

```mermaid
erDiagram
    USER ||--o{ QUESTION : submits
    USER {
        string username
        string email
        string password_hash
        enum role "USER|ADMIN"
        date created_at
        date updated_at
    }

    QUESTION ||--o{ FAQ : "contributes to"
    QUESTION {
        string text
        string category
        string source
        enum status "new|grouped|reviewed|converted_to_faq|rejected"
        ObjectId submitted_by
        boolean is_guest
        string guest_email
        date created_at
        date updated_at
    }

    FAQ {
        string question
        string answer
        string category
        enum status "draft|approved|published|rejected"
        array source_questions
        date created_at
        date updated_at
    }
```

## 🔐 Security Architecture

```mermaid
flowchart TB
    subgraph Client["Client Side"]
        TOKEN["JWT in localStorage"]
        AX["Axios Interceptor"]
    end

    subgraph Server["Server Side"]
        CORS["CORS Middleware"]
        AUTH["JWT Verification"]
        RATE["Rate Limiter"]
        VAL["Input Validation"]
    end

    subgraph Protection["Security Layers"]
        SSL["SSL/TLS Encryption"]
        HB["Helmet.js Headers"]
        SAN["Sanitization"]
    end

    Client --> |Bearer Token| CORS
    CORS --> AUTH
    AUTH --> RATE
    RATE --> VAL
    VAL --> Protection

    style Security fill:#ff6b6b,color:#fff
```

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | UI Framework |
| **Styling** | Tailwind CSS v3 | Responsive Design |
| **Routing** | React Router v6 | Client-side Routing |
| **HTTP** | Axios | API Communication |
| **Backend** | Express.js | REST API Server |
| **Database** | MongoDB + Mongoose | Data Persistence |
| **Auth** | JWT + bcryptjs | Authentication |
| **AI** | Google Gemini Pro | FAQ Generation |
| **Hosting** | Vercel + Render | Cloud Deployment |

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas Account
- Google Gemini API Key
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/FiscalMindset/FAQ.git
cd FAQ

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Start development servers
cd server && npm run dev  # Terminal 1 - API on :5000
cd client && npm run dev  # Terminal 2 - UI on :5173
```

### Required Environment Variables

```bash
# server/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_64_char_random_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
ADMIN_EMAIL=admin@samagama.in
NODE_ENV=development
```

---

## 📦 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get JWT |

### Questions (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions` | List all questions |
| `POST` | `/api/questions` | Submit new question |
| `POST` | `/api/questions/group` | Group selected questions |
| `POST` | `/api/questions/suggest-faq` | Get AI-generated FAQ |
| `PATCH` | `/api/questions/:id/status` | Update question status |
| `DELETE` | `/api/questions/:id` | Delete question |

### FAQs (Protected + Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/faqs/published` | List published FAQs (Public) |
| `GET` | `/api/faqs` | List all FAQs (Admin) |
| `POST` | `/api/faqs` | Create new FAQ (Admin) |
| `PUT` | `/api/faqs/:id` | Update FAQ (Admin) |
| `PATCH` | `/api/faqs/:id/status` | Update FAQ status (Admin) |
| `DELETE` | `/api/faqs/:id` | Delete FAQ (Admin) |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/stats` | Get user statistics |
| `PUT` | `/api/users/:id` | Update user role |
| `DELETE` | `/api/users/:id` | Delete user |

---

## 🔄 FAQ Workflow

```mermaid
stateDiagram-v2
    [*] --> New: User Submits
    New --> Grouped: Admin Groups
    Grouped --> Reviewed: Admin Reviews
    Reviewed --> Draft: Admin Selects + AI Suggests
    Draft --> Approved: Admin Approves
    Approved --> Published: Admin Publishes
    Approved --> Rejected: Admin Rejects
    New --> Rejected: Admin Rejects
    Grouped --> Rejected: Admin Rejects
    Published --> [*]
    Rejected --> [*]
```

| Status | Description | Access |
|--------|-------------|--------|
| `new` | Just submitted | Admin only |
| `grouped` | Similar questions grouped | Admin only |
| `reviewed` | Group reviewed | Admin only |
| `draft` | AI FAQ generated | Admin only |
| `approved` | Ready to publish | Admin only |
| `published` | Visible to everyone | Public |
| `rejected` | Not suitable | Admin only |

---

## 🌍 Deployment

### Backend - Render

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository

3. **Create Web Service**
   - **Name**: `faq-generator-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   GEMINI_API_KEY=your_key
   CLIENT_URL=https://your-frontend.vercel.app
   PORT=5000
   ADMIN_EMAIL=admin@samagama.in
   NODE_ENV=production
   ```

5. **Deploy**
   - Render will auto-deploy on GitHub push

### Frontend - Vercel

1. **Import GitHub Repo**
   - Go to [vercel.com](https://vercel.com)
   - Import `FiscalMindset/FAQ`

2. **Configure**
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`

3. **Environment Variables**
   ```
   VITE_API_URL=https://faq-generator-api.onrender.com
   ```

4. **Deploy**
   - Vercel will auto-deploy on GitHub push

### MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user with read-write access
3. Whitelist IP `0.0.0.0/0` for initial setup (restrict later)
4. Get connection string from Atlas dashboard
5. Replace `<password>` in connection string

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create API key
3. Add to `GEMINI_API_KEY` env variable

---

## 🧪 Production Checklist

```mermaid
flowchart LR
    subgraph Security["🔒 Security"]
        S1[SSL/TLS]
        S2[Rate Limiting]
        S3[JWT Expiry]
        S4[Input Validation]
        S5[CORS Config]
    end

    subgraph Performance["⚡ Performance"]
        P1[Indexing]
        P2[Caching]
        P3[Compression]
        P4[CDN]
    end

    subgraph Monitoring["📊 Monitoring"]
        M1[Error Tracking]
        M2[Analytics]
        M3[Uptime]
        M4[Logging]
    end
```

- [ ] Enable CORS for production domain only
- [ ] Set JWT expiry to 7 days
- [ ] Enable rate limiting (100 req/min)
- [ ] Add input sanitization
- [ ] Use Helmet.js security headers
- [ ] Enable MongoDB Atlas backup
- [ ] Set up monitoring (Sentry/DataDog)
- [ ] Configure auto-scaling on Render
- [ ] Use Vercel Edge Network
- [ ] Enable Gzip compression
- [ ] Add database indexing

---

## 📁 Project Structure

```
FAQ Generator/
├── README.md
├── .gitignore
├── package.json                 # Root package.json
│
├── server/                      # Backend - Express.js
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── faq.controller.js
│   │   │   ├── question.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   └── FAQ.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── faq.routes.js
│   │   │   ├── question.routes.js
│   │   │   └── user.routes.js
│   │   ├── app.js              # Express app
│   │   ├── server.js           # Server entry
│   │   └── seed.js             # Database seeder
│   ├── package.json
│   ├── .env                     # Local env (gitignored)
│   └── .env.example            # Env template
│
└── client/                      # Frontend - React + Vite
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx      # App layout
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state
    │   ├── pages/
    │   │   ├── Home.jsx        # Public FAQs
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── SubmitQuestion.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AdminQuestions.jsx
    │   │   ├── AdminFAQs.jsx
    │   │   └── AdminUsers.jsx
    │   ├── services/
    │   │   └── api.js          # Axios instance
    │   ├── App.jsx             # Router
    │   ├── main.jsx            # Entry point
    │   └── index.css           # Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env.example
```

---

## 🔧 Scripts

```bash
# Root
npm run install:all     # Install all dependencies
npm run dev:server      # Start server (dev)
npm run dev:client      # Start client (dev)
npm run build:client    # Build for production

# Server
cd server
npm run start           # Production start
npm run dev             # Development with nodemon
node src/seed.js        # Seed database

# Client
cd client
npm run dev             # Vite dev server
npm run build           # Production build
npm run preview         # Preview production build
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

<div align="center">

**Built with ❤️ by [Samagama.in](https://samagama.in)**

</div>