# Pulse — MERN Project Management App

A full-stack project & task management tool built on the MERN stack with role-based
access control, a Kanban board, dashboards with charts, and a polished, responsive UI.

```
D:/aman-ass/
├── backend/      Node.js + Express + MongoDB (Mongoose)
└── frontend/     React + Vite + Tailwind + React Query
```

## Stack

**Backend** — Express, Mongoose, JWT (access + refresh-cookie), bcryptjs,
express-validator, helmet, cors, morgan, express-rate-limit.

**Frontend** — React 18, Vite, Tailwind CSS, React Router, React Query,
React Hook Form + Zod, Recharts, Lucide icons, react-hot-toast.

## Quick start

You'll need MongoDB running locally (default `mongodb://127.0.0.1:27017`) or any
Mongo connection string in `backend/.env`.

```bash
# 1. Backend
cd backend
npm install
npm run seed       # optional: load demo users + projects + tasks
npm run dev        # starts on http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Open <http://localhost:5173>. If you ran the seed, sign in with one of:

| Email             | Password    | Role    |
| ----------------- | ----------- | ------- |
| admin@pm.app      | admin123    | admin   |
| manager@pm.app    | manager123  | manager |
| dev@pm.app        | dev12345    | member  |
| sara@pm.app       | sara12345   | member  |

If you skip the seed, the **first registered user automatically becomes admin**.

## Environment

Both `backend/.env` and `frontend/.env` are tracked locally and ignored by git.
Examples are provided as `.env.example`.

```
# backend/.env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/pm_app
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

## Features

### Authentication & RBAC
- Email + password sign up / sign in
- Short-lived access token + httpOnly refresh-cookie rotation
- Three roles: **admin**, **manager**, **member**
- Protected routes on the client; route-level RBAC on the API
- Members only see projects they own or are members of

### Projects
- CRUD with name, description, status, priority, color, dates, members
- Kanban board per project with drag-and-drop status changes
- Progress meter, member roster, owner badge
- Admin/manager/owner can edit + delete

### Tasks
- CRUD with title, description, status, priority, project, assignee, due date
- Filterable list view + table
- Per-status columns on the project board
- Overdue indicator, assignee picker scoped to project members

### Dashboard
- Active projects, open tasks, overdue, team-size / my-tasks stat cards
- 7-day completion area chart (Recharts)
- Tasks-by-status donut
- Recent activity feed

### UX
- Responsive layout (mobile sidebar drawer, table reflows)
- Skeleton loaders, empty states, toast notifications
- Inline form validation with helpful messages
- Accessible buttons, dialogs, focus states

## API surface (high level)

```
POST   /api/auth/register           Public
POST   /api/auth/login              Public
POST   /api/auth/refresh            Cookie
POST   /api/auth/logout             —
GET    /api/auth/me                 Auth
PATCH  /api/auth/me                 Auth
POST   /api/auth/change-password    Auth

GET    /api/users                   Auth
GET    /api/users/:id               Auth
PATCH  /api/users/:id/role          Admin
PATCH  /api/users/:id/active        Admin
DELETE /api/users/:id               Admin

GET    /api/projects                Auth (filtered by membership for members)
GET    /api/projects/:id            Auth
POST   /api/projects                Admin / Manager
PATCH  /api/projects/:id            Owner / Manager / Admin
DELETE /api/projects/:id            Owner / Manager / Admin

GET    /api/tasks                   Auth
GET    /api/tasks/:id               Auth
POST   /api/tasks                   Auth (must access project)
PATCH  /api/tasks/:id               Auth (assignee or project owner+)
DELETE /api/tasks/:id               Owner / Manager / Admin

GET    /api/dashboard/stats         Auth
GET    /api/health                  Public
```

## Scripts

```
backend/    npm run dev | npm start | npm run seed
frontend/   npm run dev | npm run build | npm run preview
```
