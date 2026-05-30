# FAQ Generator

A MERN stack FAQ management system with AI-powered FAQ suggestions using Google Gemini API.

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Hosting:** Vercel (client) + Render (server) + MongoDB Atlas

## Features

- User registration/login with JWT authentication
- Role-based access (USER/ADMIN)
- FAQ approval workflow: new → grouped → reviewed → draft → approved → published
- AI-powered FAQ suggestion using Gemini Pro
- Admin dashboard for user/question/FAQ management
- Responsive design

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_64_char_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
ADMIN_EMAIL=admin@example.com
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Run Development

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

Visit http://localhost:5173

### Seed Database

```bash
cd server && node src/seed.js
```

## Deployment

### MongoDB Atlas

1. Create free cluster at https://mongodb.com/atlas
2. Get connection string (replace password)

### Backend - Render

1. Fork this repo to GitHub
2. Go to https://render.com and connect GitHub
3. Create **Web Service** for backend:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables from `.env`
5. Set `NODE_ENV=production`

### Frontend - Vercel

1. Go to https://vercel.com and import repo
2. Set root directory to `client`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://your-app.onrender.com`)
4. Deploy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/questions | List questions (admin) |
| POST | /api/questions | Submit question |
| POST | /api/questions/group | Group questions (admin) |
| POST | /api/questions/suggest-faq | Get AI suggestion (admin) |
| GET | /api/faqs | List all FAQs (admin) |
| GET | /api/faqs/published | List published FAQs |
| POST | /api/faqs | Create FAQ (admin) |
| PATCH | /api/faqs/:id/status | Update FAQ status (admin) |
| GET | /api/users | List users (admin) |
| PUT | /api/users/:id | Update user (admin) |

## FAQ Workflow

1. **User submits question** → status: `new`
2. **Admin groups similar questions** → status: `grouped`
3. **Admin selects questions → Gemini suggests FAQ** → saved as `draft`
4. **Admin approves** → status: `approved`
5. **Admin publishes** → status: `published`
6. **Visible to everyone on homepage**

## User Roles

- **USER:** Submit questions, view published FAQs
- **ADMIN:** All user permissions + manage questions, FAQs, users

## Admin Access

Set `ADMIN_EMAIL` in `.env`. Any user registering with that email becomes ADMIN automatically.

## Project Structure

```
FAQ Generator/
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/Layout.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json
```