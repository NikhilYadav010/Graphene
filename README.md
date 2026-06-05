# TaskFlow — Project & Task Management

A full-stack project management app built with React, Node.js/Express, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios, Vite |
| Backend | Node.js, Express, JWT Auth |
| Database | MongoDB (Mongoose) |
| Deployment | Railway |

## Features

- User registration and login with JWT authentication
- Role-based access control (RBAC)
- Create and manage projects
- Create, assign, and track tasks
- Dashboard with overview stats

## Project Structure

```
Project-Task-Management/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth & RBAC middleware
│   │   ├── models/        # Mongoose models (User, Project, Task)
│   │   ├── routes/        # API routes
│   │   └── server.js      # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project details |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/health` | Health check |

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
# Create .env file (see below)
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Deployment (Railway)

### Backend
Set these environment variables in Railway:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for JWT signing
- `CLIENT_URL` — Your deployed frontend URL

### Frontend
The `VITE_API_URL` is set in `frontend/.env.production` and gets baked into the build automatically.

## Docker (local)

```bash
docker-compose up --build
```

Runs backend on port `5001` and frontend on port `8080`.
