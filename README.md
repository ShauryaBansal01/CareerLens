# CareerLens

**AI-Powered Career Optimization**

Build, analyze, and tailor your resume with CareerLens. Upload your resume, generate AI-powered feedback, tailor it to any job description, manage LaTeX versions, and create cover letters — all in one place.

🔗 **Live:** [career-lens-vert.vercel.app](https://career-lens-vert.vercel.app)

---

## Features

Everything you need to land your next role — a complete suite of AI-powered tools designed to optimize every step of your resume building .

| Feature | What it does |
| --- | --- |
| **AI Resume Analyzer** | Get instant ATS score, skill gap analysis, and actionable feedback to optimize your resume for any role. |
| **Smart Upload & Parse** | Upload your PDF resume and let AI extract your skills, experience, and education into a structured profile. |
| **LaTeX Builder** | Create beautifully formatted, ATS-friendly PDFs with our built-in LaTeX editor and AI-powered wizard. |
| **Cover Letter Generator** | Generate tailored cover letters matching your tone and the job description in seconds. |
| **Career Roadmaps** | Discover personalized career paths with curated projects to bridge your skill gaps. |
| **ATS Optimization** | Tailor your resume to specific job descriptions with keyword matching and section rewriting. |

---

## Quick start

### Prerequisites

- **Node.js 20+**
- **MongoDB** — a local instance or a MongoDB Atlas cluster
- **A Google Gemini API key** — the default AI provider ([get one free](https://aistudio.google.com/app/apikey))

### 1. Clone and install

```bash
git clone https://github.com/ShauryaBansal01/CareerLens.git
cd CareerLens

cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in these values — the server exits on startup if `JWT_SECRET` is missing:

| Variable | Required | Notes |
| --- | :---: | --- |
| `JWT_SECRET` | ✅ | Any long random string. Also keys the HMAC used to hash one-time codes, so changing it invalidates outstanding OTPs. |
| `MONGO_URI` | ✅ | Defaults to `mongodb://localhost:27017/careerlens`. |
| `GEMINI_API_KEY` | ✅ | The default AI provider. Users can add their own OpenAI or Anthropic keys in-app. |
| `ENCRYPTION_KEY` | ✅ | 32-byte hex, used to encrypt user-supplied API keys. Generate with:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SMTP_EMAIL`<br>`SMTP_PASSWORD` | ✅ | Required to deliver signup and password-reset codes. |
| `REDIS_URL` | — | Optional. Without it, caching falls back to an in-process store. |
| `SENTRY_DSN` | — | Optional error reporting. |

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run it

In two terminals:

```bash
cd backend  && npm run dev    # http://localhost:5000
cd frontend && npm run dev    # http://localhost:5173
```

---

## Scripts

**Backend** — run from `backend/`

| Command | Description |
| --- | --- |
| `npm run dev` | Start with auto-reload |
| `npm start` | Start for production |
| `npm test` | Run the Jest suite |
| `npm run lint` | Lint (`npm run lint:fix` to autofix) |

**Frontend** — run from `frontend/`

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run lint` | Lint |

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
