# King Gai 傾偈

A community confession and sharing forum — like chatting over coffee. ☕

Built as a passion project companion to the **Keng Gai** coffee shop, where customers can express, confess, and connect.

## Features

- **Post confessions/stories** — share happiness, struggles, solutions, and random thoughts
- **Anonymous or alias posting** — post as yourself, anonymously, or with a custom alias
- **Upvote/downvote** — community-driven content ranking
- **Reply threads** — engage in conversations
- **Categories** — organize posts by topic
- **Admin approval** — all posts reviewed before going live
- **Admin panel** — approve, reject, hide, or delete posts

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas free tier)
- **Auth**: JWT tokens + bcrypt

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free) — [Create one here](https://www.mongodb.com/cloud/atlas)

### 1. Clone & Install

```bash
cd king-gai
npm run install:all
```

### 2. Configure Environment

Copy the example env file and fill in your MongoDB URI:

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/kinggai
JWT_SECRET=pick-a-strong-random-secret
ADMIN_EMAIL=admin@kinggai.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Seed Admin User

```bash
cd server
node src/scripts/seedAdmin.js
```

### 4. Run Development

In two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit `http://localhost:3000`

## Deployment (Free)

### Frontend → Vercel

1. Push the `client/` folder to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL` = your backend URL

### Backend → Render

1. Push the `server/` folder to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env`

### Database → MongoDB Atlas

1. Create free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for cloud deployment
4. Copy the connection string to your `.env`

## Project Structure

```
king-gai/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Global CSS
│   │   └── utils/        # API helper
│   └── index.html
├── server/               # Express backend
│   └── src/
│       ├── middleware/    # Auth middleware
│       ├── models/        # Mongoose models
│       ├── routes/        # API routes
│       └── scripts/       # Admin seeder
└── README.md
```

## Categories

Default categories: General, Confessions, Happiness, Struggles, Solutions, Random

You can add more by editing the `CATEGORIES` array in:
- `client/src/pages/Home.jsx`
- `client/src/pages/CreatePost.jsx`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/posts | Get approved posts |
| POST | /api/posts | Create post (pending approval) |
| POST | /api/posts/:id/upvote | Upvote a post |
| POST | /api/posts/:id/downvote | Downvote a post |
| POST | /api/posts/:id/reply | Reply to a post |
| GET | /api/admin/posts/pending | Get pending posts (admin) |
| PATCH | /api/admin/posts/:id/approve | Approve post (admin) |
| PATCH | /api/admin/posts/:id/reject | Reject post (admin) |
| DELETE | /api/admin/posts/:id | Delete post (admin) |

## License

Open source — use it however you like. ☕
