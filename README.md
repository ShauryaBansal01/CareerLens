# CareerLens 🎯

<div align="center">
  <p><strong>An AI-powered career optimization platform built to help software engineers navigate the modern hiring landscape.</strong></p>
  <p>🚀 <strong>Live Demo: <a href="https://career-lens-vert.vercel.app" target="_blank">CareerLens</a></strong></p>
</div>

---

## 📖 Table of Contents
1. [About the Project](#-about-the-project)
2. [Key Features in Detail](#-key-features-in-detail)
3. [Architecture & Tech Stack](#️-architecture--tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
6. [Environment Variables](#-environment-variables)
7. [API Endpoints](#-api-endpoints)
8. [Future Roadmap](#-future-roadmap)
9. [License](#-license)

---

## 💡 About the Project

**CareerLens** is designed to solve a critical problem for job seekers: getting past the ATS (Applicant Tracking System) and tailoring resumes to specific Job Descriptions (JDs) without spending hours formatting documents. 

By leveraging the **Google Gemini API**, CareerLens intelligently parses uploaded unstructured resume text, extracts key entities (Skills, Education, Experience), and automatically generates a strictly formatted, professional, ATS-compliant **LaTeX** document. When a user finds a job they want to apply for, they simply input the JD, and the AI rewrites their bullet points using the STAR method, emphasizing keywords and matching their experience directly to the job requirements.

---

## ✨ Key Features in Detail

### 1. 📄 Intelligent Resume Parsing & Extraction
- Upload your existing resume (PDF/Text) and let the AI extract a structured JSON representation of your career history.
- Automatically categorizes **Skills, Education, Experience**, and **Projects**.

### 2. ⚡ AI-Powered LaTeX Generation
- Generates a **beautiful, standard "article" class LaTeX resume** instantly.
- Uses strict margins, professional serif fonts (TeX Gyre Termes), and a clean **4-corner layout** that recruiters expect.
- Fully ATS-friendly: Avoids complex tables, graphs, or multi-column layouts that break ATS parsers.

### 3. 🎯 Job Description (JD) Tailoring
- Paste a Job Description for a role you want.
- The AI dynamically **rewrites your experience bullets** to highlight overlapping keywords, technologies, and achievements.
- Employs the **STAR method** (Situation, Task, Action, Result) to maximize impact.
- Automatically reorders your `Skills` section to prioritize the tools required for the specific job.

### 4. 🕒 Resume Versioning & History
- Never lose an old resume! CareerLens saves your **Base Resume** and creates new versioned entries for every tailored resume.
- Keep track of which resume version you used for which job application.

### 5. 🌙 Modern, Responsive UI
- Built with **React** and **Tailwind CSS**.
- Fluid animations powered by **Framer Motion**.
- First-class support for **Dark Mode** matching system preferences.

### 6. 📧 Seamless Communication
- Integrated SMTP setup to handle welcome emails, password resets, and notifications.

---

## 🛠️ Architecture & Tech Stack

**Frontend (Client):**
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **State Management**: React Context API / Hooks

**Backend (Server):**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **AI Integration**: `@google/genai` (Google Gemini 2.5 Flash/Pro)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

**Hosting & Deployment:**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

> **⚡ Keeping the Backend Awake (Overcoming Free-Tier Limits):**
> Because the backend is hosted on Render's free tier, it spins down after 15 minutes of inactivity, which causes a 30-50 second "cold start" delay for the next user. To ensure a seamless and instant user experience, I integrated **[UptimeRobot](https://uptimerobot.com/)**. It automatically pings the backend's root health-check endpoint every 5 minutes, preventing the server from ever going to sleep and keeping the API awake 24/7.

---

## 📂 Project Structure

```text
CareerLens/
├── backend/
│   ├── config/          # Database and environment configurations
│   ├── controllers/     # Route logic (Auth, Resume processing)
│   ├── middleware/      # JWT verification, Error handling
│   ├── models/          # Mongoose Schemas (User, Resume, ResumeVersion)
│   ├── routes/          # Express API endpoints
│   ├── services/        # Business logic (Gemini API calls, LaTeX generators)
│   └── server.js        # Entry point for Express server
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Reusable UI components (Buttons, Modals, Loaders)
    │   ├── context/     # React Context for global state (AuthContext)
    │   ├── pages/       # Full views (Dashboard, UploadResume, TailorResume)
    │   ├── utils/       # Helper functions (API clients, formatting)
    │   ├── App.jsx      # Root component and router setup
    │   └── index.css    # Tailwind directives and custom styles
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/download/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or an Atlas cluster)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CareerLens.git
cd CareerLens
```

### 2. Setup the Backend Server
```bash
cd backend
npm install
# Run in development mode (uses nodemon)
npm run dev
```
*The backend server will start on `http://localhost:5000` (or your defined PORT).*

### 3. Setup the Frontend Client
Open a new terminal window:
```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```
*The React app will typically be available at `http://localhost:5173`.*

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory. Use the following template:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/careerlens  # Or your MongoDB Atlas connection string

# Authentication
JWT_SECRET=super_secret_jwt_key_here_change_me
JWT_EXPIRE=30d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Configuration (Optional: for email features)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

---

## 📡 API Endpoints (Core)

Here is a brief overview of the main API routes available on the backend:

**Authentication (`/api/auth`)**
- `POST /register` - Register a new user
- `POST /login` - Authenticate user & get token
- `GET /me` - Get current logged-in user details

**Resumes (`/api/resumes`)**
- `POST /upload` - Parse raw resume text and generate Base LaTeX
- `GET /my-resume` - Fetch the user's latest parsed resume data
- `POST /tailor` - Generate a JD-tailored version of the base LaTeX
- `GET /versions` - Get all saved versions of the user's resume

---

## 🔮 Future Roadmap

- [ ] **In-Browser LaTeX Compilation**: Compile LaTeX directly to PDF in the browser using tools like PDFTeX.js or a dedicated microservice.
- [ ] **Cover Letter Generation**: AI-generated cover letters that match the tone of the tailored resume and JD.
- [ ] **Interview Prep Module**: AI-generated mock interview questions based on the uploaded resume and the target job description.
- [ ] **LinkedIn Integration**: Sync basic profile data directly from LinkedIn using OAuth.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
