# InterviewAI

InterviewAI is a full-stack web application that helps job candidates prepare for interviews using AI-generated insights from their resume, self-description, and target job description.

## What This Project Is About

This project lets a user:
- Register and log in with cookie-based authentication.
- Upload a PDF resume.
- Add personal context (`selfDescription`) and target role details (`jobDescription`).
- Generate a structured interview report with:
  - Match score
  - Technical interview questions
  - Behavioral interview questions
  - Skill gaps and severity
  - A preparation plan
- Download a generated, tailored resume PDF.

The backend handles authentication, file upload, PDF parsing, AI report generation, and persistence. The frontend provides a protected dashboard and report workflow.

## Why You Need This

Interview preparation is usually scattered across multiple tools. InterviewAI combines key preparation steps in one workflow:
- Personalized analysis instead of generic interview tips.
- Faster preparation by auto-generating role-specific questions and plan.
- Better focus by highlighting concrete skill gaps.
- Improved application quality with generated resume PDF output.

## Tech Stack

### Frontend
- React (Vite)
- Redux Toolkit + Redux Persist
- React Router

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + Cookie-based auth
- Multer (PDF upload)
- pdf-parse (resume extraction)
- Google GenAI SDK (`@google/genai`)
- Puppeteer (PDF generation)

## Setup Instructions

## 1. Prerequisites

Install these first:
- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB (local or Atlas)
- A Google Gemini API key

## 2. Clone and Install

```bash
# from repository root
cd backend
npm install

cd ../frontend
npm install
```

## 3. Environment Variables

Create a `.env` file in the project root (same level as `backend/` and `frontend/`).

Use this template:

```env
# Required
MONGO_URI=mongodb://127.0.0.1:27017/interviewai
JWT_SECRET=replace_with_strong_random_secret
GEMINI_API_KEY=your_gemini_api_key

# Optional
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
```

Notes:
- Backend reads environment variables via `dotenv` in `backend/server.js`.
- Frontend API defaults to `http://localhost:3000` if `VITE_API_BASE_URL` is not set.

## 4. Run the Application

Run backend:

```bash
cd backend
npm run dev
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 5. Build Frontend (Optional)

```bash
cd frontend
npm run build
npm run preview
```

## Architecture Design

## High-Level Flow

1. User authenticates (register/login).
2. Browser stores auth cookie.
3. User submits resume PDF + text inputs.
4. Backend parses resume text and calls AI service.
5. Structured report is saved to MongoDB.
6. Frontend fetches and displays reports.
7. User can download generated resume PDF.

## Folder Structure

```text
interviewAI/
├── backend/
│   ├── server.js                  # Backend entry point
│   └── src/
│       ├── app.js                 # Express app + middleware + routes
│       ├── config/
│       │   └── database.js        # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controllers.js
│       │   └── interview.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js # Cookie token + blacklist validation
│       │   ├── file.middleware.js # Multer in-memory PDF upload (3 MB limit)
│       │   └── logger.middleware.js
│       ├── model/
│       │   ├── user.model.js
│       │   ├── interviewReport.model.js
│       │   └── blacklist.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       └── service/
│           └── ai.service.js      # Gemini prompt + resume PDF generation
├── frontend/
│   └── src/
│       ├── App.jsx                # Route map
│       ├── pages/                 # Auth, dashboard, report pages
│       ├── components/            # Route protection and UI pieces
│       ├── services/
│       │   └── api.js             # Fetch wrapper with credentials
│       └── store/                 # Redux slices and store setup
└── docs/
    ├── api-overview.md
    └── controllers/
```

## Backend Layer Responsibilities

- `routes/`: Define endpoint paths and middleware chain.
- `controllers/`: Handle request/response and call services/models.
- `service/`: Encapsulate AI generation and PDF generation logic.
- `model/`: MongoDB schemas for users, reports, and blacklisted tokens.
- `middleware/`: Auth checks, file handling, and request logging.

## Frontend Layer Responsibilities

- `pages/`: Feature-level screens (login, dashboard, create report, report detail).
- `components/`: Reusable UI and route guards.
- `services/`: API abstraction (`credentials: include` for cookie auth).
- `store/`: Global auth/report state and persistence.

## API Summary

Base URL: `http://localhost:3000`

Auth routes:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/get-me`

Interview routes (private):
- `POST /api/interview` (multipart/form-data with `resume` field)
- `GET /api/interview`
- `GET /api/interview/report/:interviewId`
- `GET /api/interview/resume/pdf/:interviewReportId`

## Important Runtime Notes

- CORS is configured for `http://localhost:5173`.
- Frontend requests must include credentials (cookies).
- Resume upload limit is 3 MB.
- Protected routes return `401` for missing/invalid/blacklisted tokens.

## Documentation

For deeper backend endpoint details:
- `docs/api-overview.md`
- `docs/controllers/auth.controllers.md`
- `docs/controllers/interview.controller.md`

## Known Gaps You May Want to Improve

- `.env.example` currently includes only `GEMINI_API_KEY`; consider adding all required keys.
- Add `engines` field or `.nvmrc` for explicit Node version guidance.
- Add test scripts and CI checks for safer future changes.
