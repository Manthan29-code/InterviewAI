# InterviewAI

InterviewAI is a full-stack web application that helps candidates prepare for interviews using AI.

Users can upload a resume, add their self-description and a target job description, and receive:
- A job match score
- Technical and behavioral interview questions with guidance
- Skill gap analysis
- A day-wise preparation plan
- A tailored resume PDF

## Features

- Cookie-based authentication with JWT
- Secure protected routes
- Resume upload and text extraction from PDF
- AI-generated interview preparation report
- Report history and detailed report pages
- AI-generated, downloadable resume PDF
- Neumorphism-inspired frontend design system

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router DOM
- Redux Toolkit + Redux Persist
- Tailwind CSS 4

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- Google GenAI SDK (Gemini)
- Puppeteer (PDF generation)
- Multer (file upload)
- bcryptjs + jsonwebtoken

## Monorepo Structure

```text
interviewAI/
  backend/
    server.js
    package.json
    src/
      app.js
      config/
      controllers/
      middleware/
      model/
      routes/
      service/
  frontend/
    package.json
    src/
      components/
      pages/
      services/
      store/
  docs/
    api-overview.md
    controllers/
```

## Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended
- MongoDB (local or Atlas)
- Gemini API key

## Environment Variables

Create a `.env` file inside `backend/`.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Optional frontend env in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Local Setup

### 1) Install dependencies

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Start backend

In one terminal:

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`.

### 3) Start frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Scripts

### Backend (`backend/package.json`)

- `npm run dev` - Run backend with nodemon
- `npm test` - Placeholder test script (currently not implemented)

### Frontend (`frontend/package.json`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Model

- Auth uses an HTTP cookie named `token`
- JWT token is generated on register/login
- Logout clears cookie and stores token in a blacklist collection
- Protected routes validate token and blacklist status

Frontend requests must include credentials:

- Fetch: `credentials: "include"`

## API Overview

Base URL: `http://localhost:3000`

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/get-me` - Get current logged-in user

### Interview Reports

- `POST /api/interview` - Create interview report
- `GET /api/interview` - Get all reports for logged-in user
- `GET /api/interview/report/:interviewId` - Get one report by id
- `GET /api/interview/resume/pdf/:interviewReportId` - Download generated resume PDF

### Report Creation Request

`POST /api/interview` expects `multipart/form-data`:

- `resume` (PDF file, max 3 MB)
- `selfDescription` (string)
- `jobDescription` (string)

## Data Models (Summary)

### User

- username (unique)
- email (unique)
- password (hashed)

### InterviewReport

- title
- jobDescription
- resume
- selfDescription
- matchScore (0-100)
- technicalQuestions[]
- behavioralQuestions[]
- skillGaps[]
- preparationPlan[]
- user (ObjectId)
- timestamps

### Blacklist Token

- token
- timestamps

## Application Flow

1. User registers or logs in
2. User creates a new report from dashboard
3. User uploads resume + self-description + job description
4. Backend parses resume PDF and calls Gemini
5. AI response is validated and saved in MongoDB
6. User views detailed report
7. User can download tailored resume as PDF

## CORS and Cookie Notes

- Backend CORS origin is set to `http://localhost:5173`
- Cookie auth requires frontend and backend to run on configured local ports
- Cross-origin requests must include credentials

## Troubleshooting

### Mongo connection fails

- Check `MONGO_URI`
- Ensure MongoDB service/Atlas cluster is reachable

### 401 on protected routes

- Make sure frontend sends credentials
- Login again to refresh cookie
- Confirm token has not been blacklisted after logout

### Resume upload fails

- Confirm file is a PDF
- Confirm file size is under 3 MB

### Gemini-related failures

- Check `GEMINI_API_KEY`
- Ensure API key has access to Gemini model used in the backend

## Known Limitations

- No automated tests configured yet
- Limited central error handling around AI calls
- No queue/retry mechanism for long AI/PDF operations
- No rate limiting on auth/report endpoints

## Documentation

Additional docs are available in:

- `docs/api-overview.md`
- `docs/controllers/auth.controllers.md`

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make focused changes
4. Run frontend lint and verify backend startup
5. Open a pull request with clear description

## Roadmap Ideas

- Add test coverage (unit + integration)
- Add request validation and global error handling
- Add rate limiting and hardening for production
- Add report generation jobs/queue for scale
- Add password reset and email verification

## License

Copyright (c) 2026 Manthan
Licensed under the MIT License. You are free to use, copy, and modify this software, provided this notice is included.
