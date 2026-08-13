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

## Deployment

The frontend deploys to Vercel and the backend to Render, both from `main`.

The optional Java PDF layout service (`pdf-service/`) is declared as a Render
Blueprint in [`render.yaml`](render.yaml). From the Render dashboard choose
**Blueprints → New Blueprint Instance** and point it at this repository; the
Docker runtime, root directory, `/health` check and a generated
`PDF_SERVICE_TOKEN` are all applied from that file.

Then set three variables on the **backend** service so it starts using it:

| Variable | Value |
| --- | --- |
| `PDF_SERVICE_URL` | the deployed service URL |
| `PDF_SERVICE_TOKEN` | must match the value Render generated for the service |
| `PDF_SERVICE_TIMEOUT_MS` | `30000` on the free tier |

The timeout override matters: the default is 15s, and a cold JVM on a free
instance takes 10–20s to answer. Without it the first upload after an idle
period times out and silently falls back to `pdf-parse`, losing the layout
warnings. Leaving the service undeployed entirely is also supported — uploads
work exactly as before, minus those warnings.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
