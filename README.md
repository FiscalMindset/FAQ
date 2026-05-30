# FAQ Generator - Production-Ready MERN Stack Application

<div align="center">

![Status](https://img.shields.io/badge/status-production--ready-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-6.0%2B-green)

**A scalable, production-ready FAQ management system with AI-powered suggestions**

*[Report Bug](https://github.com/FiscalMindset/FAQ/issues) • [Request Feature](https://github.com/FiscalMindset/FAQ/issues)*

</div>

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Public Internet                                 │
│                    👤 User                    👤 Admin                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Vercel CDN (Frontend)                          │
│                     React + Vite + Tailwind CSS                             │
│                         https://your-app.vercel.app                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │                    │
                                      │ REST API          │ REST API
                                      ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Render Cloud (Backend)                          │
│                      Express.js + Node.js API Server                        │
│                    https://faq-generator-api.onrender.com                    │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                    │                    │
                    │ mongoose           │ Gemini SDK         │
                    ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MongoDB Atlas (Database)                           │
│                    Cluster with Replica Set + Atlas Search                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Google Gemini Pro (AI)                             │
│                        FAQ Generation & Suggestions                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User submits question                    Admin workflow
      │                                        │
      ▼                                        ▼
┌─────────┐    POST /api/questions    ┌─────────────────┐
│ Client  │ ─────────────────────────►│   Express API   │
└─────────┘                           └────────┬────────┘
      │                                        │
      │                                        ▼
      │                              ┌─────────────────┐
      │                              │    MongoDB      │
      │                              │  Question saved │
      │                              │    (status: new)│
      │                              └────────┬────────┘
      │                                        │
      │                                        ▼
      │                              ┌─────────────────┐
      │                              │  Admin groups   │
      │                              │  questions      │
      │                              └────────┬────────┘
      │                                        │
      │                                        ▼
      │                              ┌─────────────────┐
      │                              │ Gemini AI       │
      │                              │ suggests FAQ    │
      │                              └────────┬────────┘
      │                                        │
      │                                        ▼
      │                              ┌─────────────────┐
      │                              │ FAQ saved       │
      │                              │ (status:draft)  │
      │                              └────────┬────────┘
      │                                        │
      │                                        ▼
      │                              ┌─────────────────┐
      │                              │ Admin approves  │
      │                              │ and publishes   │
      │                              └────────┬────────┘
      │                                        │
      ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Public User visits homepage                          │
│                   GET /api/faqs/published → FAQs displayed                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                   USERS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│  _id          : ObjectId (auto)                                             │
│  username     : String (unique, required)                                   │
│  email        : String (unique, required, lowercase)                        │
│  password_hash: String (bcrypt hashed)                                      │
│  role         : Enum ['USER', 'ADMIN']  ←── admin@samagama.in auto-promoted │
│  created_at   : Date (default: now)                                         │
│  updated_at   : Date (auto on update)                                       │
└──────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ 1:N (one user submits many questions)
                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                 QUESTIONS                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  _id          : ObjectId (auto)                                             │
│  text         : String (required)                                           │
│  category     : String (default: 'general')                                 │
│  source       : String (default: 'manual')                                  │
│  status       : Enum ['new','grouped','reviewed','converted_to_faq','rejected']│
│  submitted_by : ObjectId (ref: User, nullable for guests)                   │
│  is_guest     : Boolean                                                     │
│  guest_email  : String (nullable)                                           │
│  created_at   : Date                                                        │
│  updated_at   : Date                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ N:1 (many questions contribute to one FAQ)
                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                   FAQS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│  _id             : ObjectId (auto)                                          │
│  question        : String (required)                                        │
│  answer          : String (required)                                        │
│  category        : String (default: 'general')                              │
│  status          : Enum ['draft','approved','published','rejected']         │
│  source_questions: Array<ObjectId> (ref: Question)                          │
│  created_at      : Date                                                     │
│  updated_at      : Date                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### FAQ Status Workflow

```
                                    ┌──────────────────┐
                                    │                  │
    ┌─────────┐                     │                  │
    │ [START] │                     │                  │
    └────┬────┘                     │                  │
         │ User submits             ▼                  │
         ▼                          │                  │
    ┌─────────┐                     │                  │
    │   NEW   │ ────────────────────┘                  │
    └────┬────┘       Admin rejects                    │
         │                                          ▲
         │ Admin groups similar questions            │
         ▼                                          │
    ┌──────────┐                                    │
    │ GROUPED  │                                    │
    └────┬─────┘                                    │
         │                                          │
         │ Admin reviews                            │
         ▼                                          │
    ┌──────────┐                                    │
    │ REVIEWED │                                    │
    └────┬─────┘                                    │
         │                                          │
         │ Admin selects + Gemini AI suggests       │
         ▼                                          │
    ┌────────┐                                      │
    │ DRAFT  │ ─────────────────────────────────────┘
    └────┬───┘        Admin approves              Admin rejects
         │                                         │
         │                                         ▼
         ▼                                   ┌──────────┐
    ┌───────────┐                            │ REJECTED │
    │ APPROVED  │                            └────┬─────┘
    └─────┬─────┘                                  │
         │                                        │
         │ Admin publishes                        │
         ▼                                        ▼
    ┌────────────┐                          ┌──────────┐
    │ PUBLISHED  │                          │ REJECTED │
    └──────┬─────┘                          └──────────┘
           │
           │ Everyone sees on homepage
           ▼
      [PUBLIC]
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Request Flow                                   │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────┐
     │   Client    │
     │ JWT in      │
     │ localStorage│
     └──────┬──────┘
            │ Bearer Token
            ▼
     ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
     │    CORS     │ ───► │  JWT Auth   │ ───► │Rate Limiter │
     │  Middleware │      │ Middleware  │      │   (100/min) │
     └─────────────┘      └──────┬──────┘      └─────────────┘
                                 │
                                 ▼
                          ┌─────────────┐      ┌─────────────┐
                          │   Input     │      │  Helmet.js  │
                          │ Validation  │      │  Security   │
                          └─────────────┘      └─────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  Controller │
                          │   Logic     │
                          └─────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  Response   │
                          └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI Framework |
| **Build Tool** | Vite | 5.x | Fast dev/build |
| **Styling** | Tailwind CSS | 3.x | Responsive design |
| **Routing** | React Router | 6.x | Client-side routing |
| **HTTP Client** | Axios | 1.x | API communication |
| **Backend** | Express.js | 4.x | REST API server |
| **Runtime** | Node.js | 18.x | JavaScript runtime |
| **Database** | MongoDB | 6.x | NoSQL database |
| **ODM** | Mongoose | 8.x | MongoDB object modeling |
| **Auth** | JWT | 9.x | Token-based auth |
| **Hashing** | bcryptjs | 2.x | Password hashing |
| **AI** | Gemini Pro | 0.21.x | FAQ generation |
| **Frontend Host** | Vercel | - | Edge CDN |
| **Backend Host** | Render | - | Cloud server |
| **Database Host** | MongoDB Atlas | - | Cloud DB |

---

## Project Structure

```
FAQ Generator/
│
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
├── DEVELOPER_GUIDE.md            # Team developer documentation
│
├── package.json                  # Root scripts (install:all, dev:server, etc.)
│
├── server/                       # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB connection logic
│   │   │
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.js    # Login, register
│   │   │   ├── faq.controller.js     # CRUD FAQs
│   │   │   ├── question.controller.js # CRUD questions + AI suggest
│   │   │   └── user.controller.js    # User management
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verify + requireAdmin
│   │   │
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   └── FAQ.js
│   │   │
│   │   ├── routes/              # Express routes
│   │   │   ├── auth.routes.js
│   │   │   ├── faq.routes.js
│   │   │   ├── question.routes.js
│   │   │   └── user.routes.js
│   │   │
│   │   ├── app.js               # Express app setup
│   │   ├── server.js            # Entry point
│   │   └── seed.js              # Database seeder
│   │
│   ├── package.json             # Dependencies + scripts
│   ├── .env                     # Local env (gitignored)
│   └── .env.example             # Env template
│
└── client/                       # Frontend React app
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx       # Navbar + footer
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state management
    │   │
    │   ├── pages/               # Route pages
    │   │   ├── Home.jsx         # Public FAQs homepage
    │   │   ├── Login.jsx        # Login form
    │   │   ├── Register.jsx     # Registration form
    │   │   ├── SubmitQuestion.jsx # Question submission
    │   │   ├── Dashboard.jsx    # User dashboard
    │   │   ├── AdminQuestions.jsx # Admin: manage questions
    │   │   ├── AdminFAQs.jsx    # Admin: manage FAQs
    │   │   └── AdminUsers.jsx   # Admin: manage users
    │   │
    │   ├── services/
    │   │   └── api.js           # Axios instance with interceptors
    │   │
    │   ├── App.jsx              # Router setup
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Tailwind directives
    │
    ├── index.html               # HTML template
    ├── vite.config.js           # Vite configuration
    ├── tailwind.config.js       # Tailwind configuration
    ├── postcss.config.js        # PostCSS for Tailwind
    ├── package.json             # Dependencies + scripts
    └── .env.example             # Env template
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login, get JWT |

### Questions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions` | Admin | List all questions |
| POST | `/api/questions` | Any | Submit question |
| POST | `/api/questions/group` | Admin | Group questions |
| POST | `/api/questions/suggest-faq` | Admin | Get AI suggestion |
| PATCH | `/api/questions/:id/status` | Admin | Update status |
| DELETE | `/api/questions/:id` | Admin | Delete question |

### FAQs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/faqs/published` | None | List published FAQs |
| GET | `/api/faqs` | Admin | List all FAQs |
| GET | `/api/faqs/:id` | Admin | Get single FAQ |
| POST | `/api/faqs` | Admin | Create FAQ |
| PUT | `/api/faqs/:id` | Admin | Update FAQ |
| PATCH | `/api/faqs/:id/status` | Admin | Update status |
| DELETE | `/api/faqs/:id` | Admin | Delete FAQ |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/stats` | Admin | Get user stats |
| GET | `/api/users/:id` | User | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | None | API info |
| GET | `/health` | None | Server health |

---

## Environment Variables

### Server (.env)

```bash
# Required
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_64_character_random_string
GEMINI_API_KEY=your_google_gemini_api_key

# Optional
CLIENT_URL=http://localhost:5173          # Frontend URL for CORS
PORT=5000                                 # Server port
ADMIN_EMAIL=admin@samagama.in            # Auto-promote to ADMIN
NODE_ENV=development                      # or production
```

### Client (.env)

```bash
# Required (for production)
VITE_API_URL=https://your-backend.onrender.com
```

---

## Deployment

### Backend - Render

1. Create GitHub repo and push code
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables from `.env`
6. Deploy

### Frontend - Vercel

1. Import GitHub repo in Vercel
2. Configure:
   - **Root Directory**: `client`
   - **Framework**: Vite
3. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy

### MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user (Security → Database Access)
3. Whitelist IP `0.0.0.0/0` (for development)
4. Get connection string (Connect → Connect your application)
5. Replace `<password>` in connection string

### Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create API key
3. Add to `GEMINI_API_KEY` in Render

---

## Local Development

```bash
# Install all dependencies
npm run install:all

# Run server (Terminal 1)
cd server && npm run dev

# Run client (Terminal 2)
cd client && npm run dev

# Seed database
cd server && node src/seed.js
```

---

## License

MIT License