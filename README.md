## HRMS Lite (Full-Stack)

Lightweight HRMS application to **manage employees** and **track daily attendance**.

### Tech stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Deployment targets**: Vercel/Netlify (frontend), Render/Railway (backend)

### Features

- **Employee management**
  - Add employee (unique Employee ID)
  - List employees
  - Delete employee (cascades attendance)
- **Attendance**
  - Mark attendance by date (Present/Absent)
  - View employee attendance history
  - **Bonus**: filter attendance by date range + total present days per employee
- **UX**
  - Loading / empty / error states
  - Simple, clean, production-like layout

---

## Local setup

### Prerequisites

- Node.js 20+ (recommended)
- Docker (recommended for local MongoDB)

### 1) Start MongoDB

From repo root:

```bash
docker compose up -d
```

### 2) Configure environment variables

This environment blocks committing `.env.example`, so examples are provided as `env.example`.

Create the env files:

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### 3) Install dependencies

```bash
npm install
```

### 5) Run the apps

In two terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api/health`

Notes:
- If you see `EADDRINUSE` for port 4000, another process is already using it. Stop that process or run `PORT=4001 npm run dev`.
- Backend `npm run dev` defaults to an in-memory DB for local dev. To use Mongo, run `npm run dev:mongo`.
- If the frontend shows Vite proxy errors like `ECONNREFUSED ::1:4000`, set `frontend/.env` to `VITE_API_PROXY_TARGET=http://127.0.0.1:4001` (or whatever port your backend uses).

---

## API (high level)

- **Employees**
  - `GET /api/employees`
  - `POST /api/employees`
  - `DELETE /api/employees/:employeeId`
  - `GET /api/employees/:employeeId/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Attendance**
  - `POST /api/attendance` (upserts per employeeId+date to prevent duplicates)
  - `GET /api/attendance/employee/:employeeId?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Dashboard**
  - `GET /api/summary`

### Validation & errors

- **400**: required fields / invalid email / invalid date format
- **404**: employee not found
- **409**: duplicate employee ID (unique constraint)

---

## Deployment

### Backend (Render)

Create a new **Web Service** from the `backend/` folder.

- **Build command**

```bash
npm install && npm run build
```

- **Start command**

```bash
npm start
```

- **Environment variables**
  - `MONGODB_URI`: MongoDB connection string
  - `PORT`: (optional) Render provides a port; leaving unset is fine if your platform sets it
  - `FRONTEND_ORIGIN`: your deployed frontend URL (for CORS), e.g. `https://your-app.vercel.app`

### Frontend (Vercel / Netlify)

Deploy from the `frontend/` folder.

- **Build**: `npm run build`
- **Output directory**: `dist`
- **Environment variable**
  - `VITE_API_BASE_URL`: your deployed backend base URL, e.g. `https://your-api.onrender.com`

### Full-stack on Vercel (single project)

This repo supports deploying **frontend + backend** in one Vercel project:

- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **API**: served by Vercel Functions at `/api/*`

Environment variables (Vercel project settings):
- **Recommended (persistent data)**: set `MONGODB_URI` to your MongoDB Atlas connection string.
  - Ensure Atlas **Network Access** allows Vercel (often simplest for demos: allow `0.0.0.0/0`).
- **Optional (demo / no persistence)**: set `USE_MEMORY_DB=true` to run without Mongo.
- **Optional**: set `REQUIRE_MONGO=true` to fail deployments/requests if Mongo is not reachable.

---

## Assumptions / limitations

- Single admin user; **no auth** (as requested).
- Attendance uses **date-only** values (`YYYY-MM-DD`) to avoid timezone ambiguity.
- Marking attendance for the same date again **updates** the status (prevents duplicates cleanly).


