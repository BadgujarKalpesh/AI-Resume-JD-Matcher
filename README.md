# 🧠 AI Resume Match

> An intelligent, full-stack web application that uses a Large Language Model (LLM) to score how well a candidate's resume matches a given Job Description — with actionable improvement suggestions and a persistent evaluation leaderboard.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technical Decisions](#-technical-decisions)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)

---

## 🔍 Overview

**AI Resume Match** is a tool designed for recruiters, hiring managers, and job seekers. It accepts a PDF or plain-text resume and a pasted Job Description (JD), then leverages the **Groq API** (running Llama 3.3 70B) to return:

- A **match score** from 0–100
- A concise **AI-generated explanation** of the score
- **2–3 actionable suggestions** to improve the resume for that specific JD

All evaluations are saved to a local SQLite database and accessible from a paginated **Leaderboard** view, where users can review, detail, download the original resume file, or delete past records.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 Resume Upload | Accepts PDF and plain `.txt` resume files |
| 🤖 AI Analysis | Groq LLM scores the resume against the JD (0–100) |
| 💡 Improvement Tips | 2–3 specific, actionable edit suggestions per analysis |
| 🏆 Leaderboard | Paginated history of all past evaluations |
| 👁️ Detail View | Modal popup showing full explanation and suggestions |
| 📥 Resume Download | Download the original uploaded resume file per record |
| 🗑️ Delete Record | Remove any evaluation and its stored resume from disk |
| 🌙 Dark Mode | Full dark/light mode support via Tailwind CSS |

---

## 🏗️ System Architecture

The application follows a classic **client–server** (2-tier) architecture, with a clear separation between the React frontend and the Node.js/Express backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Frontend  (Vite, port 5173)          │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  MatcherForm │  │ResultDisplay │  │  Leaderboard │  │   │
│  │  │  (Upload UI) │  │ (Score Card) │  │  (History)   │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │   │
│  │         │                 │                  │          │   │
│  │         └─────────────────┴──────────────────┘          │   │
│  │                         Axios HTTP                       │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │  REST API (multipart/form-data & JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Node.js / Express Backend  (port 5002)         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   evaluationRoutes.js                    │  │
│  │  POST /api/match  ·  GET /api/evaluations  ·             │  │
│  │  GET /api/resume/:id  ·  DELETE /api/evaluations/:id     │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                │
│  ┌─────────────▼──────────────┐  ┌──────────────────────────┐  │
│  │  evaluationController.js   │  │       pdfParser.js        │  │
│  │  (Orchestration Layer)     │◄─┤  (pdf-parse / fs.read)   │  │
│  └─────────────┬──────────────┘  └──────────────────────────┘  │
│                │                                                │
│  ┌─────────────▼──────────────┐  ┌──────────────────────────┐  │
│  │          llm.js            │  │          db.js            │  │
│  │  (Groq API via openai SDK) │  │  (better-sqlite3 DAL)    │  │
│  └─────────────┬──────────────┘  └──────────────┬───────────┘  │
└────────────────┼────────────────────────────────┼──────────────┘
                 │                                │
                 ▼                                ▼
       ┌──────────────────┐            ┌──────────────────────┐
       │  Groq Cloud API  │            │   matcher.db         │
       │  llama-3.3-70b   │            │   (SQLite on-disk)   │
       └──────────────────┘            └──────────────────────┘
```

### Request Flow — Resume Analysis

```
Browser
  │
  ├─1─► POST /api/match  (multipart: resume file + jobDescription text)
  │
  │     Backend
  │       ├─2─► multer saves file → uploads/
  │       ├─3─► pdfParser extracts raw text from PDF (or reads .txt)
  │       ├─4─► llm.js sends {resumeText, jobDescription} to Groq API
  │       ├─5─► Groq returns structured JSON { score, explanation,
  │       │              edit_suggestions, candidate_name, job_title }
  │       ├─6─► db.js inserts record into evaluations table (SQLite)
  │       └─7─► res.json(analysis) ──────────────────────────────────►
  │
  └─8─► ResultDisplay renders score card + suggestions
```

---

## 🧠 Technical Decisions

### 1. Groq API with OpenAI-Compatible SDK
The backend uses the **`openai` npm package** pointed at Groq's base URL (`https://api.groq.com/openai/v1`). This decision was made because:
- Groq provides blazing-fast LLM inference (~500 tokens/sec) with a free tier suitable for prototyping.
- Using the OpenAI-compatible interface means the LLM provider can be swapped (to real OpenAI, Azure, local Ollama, etc.) by changing two environment variables: `GROQ_API_KEY` and the `baseURL`.
- The model defaults to `llama-3.3-70b-versatile` — a high-quality open-weights model with strong instruction-following.

### 2. Structured JSON Output via `response_format`
The LLM is instructed to return a strict `json_object` via `response_format: { type: "json_object" }`. This eliminates the need for brittle regex parsing and ensures the response is always a predictable JSON structure with predictable keys (`score`, `explanation`, `edit_suggestions`, `candidate_name`, `job_title`).

### 3. SQLite via `better-sqlite3` (Synchronous DAL)
Instead of a heavyweight database server (PostgreSQL, MySQL), **SQLite** with the `better-sqlite3` driver was chosen because:
- Zero infrastructure — the database is a single file (`matcher.db`) on disk.
- `better-sqlite3` uses synchronous APIs, which are simpler, faster for light workloads, and safer within a single-process Node app.
- The schema is minimal (one `evaluations` table), making SQLite a perfect fit.

### 4. File Storage with Multer (`uploads/` directory)
Uploaded resumes are stored on disk via **Multer** rather than in the database as BLOBs. This keeps the SQLite file small and allows the backend to stream original file downloads directly via `res.download()`.

### 5. PDF Parsing with `pdf-parse`
The `pdfParser.js` utility handles both input types:
- For `application/pdf`, it uses **`pdf-parse`** to extract all text content.
- For plain text files, it simply reads the file with `fs.readFileSync`.
This keeps the parsing logic isolated and easy to extend (e.g., adding `.docx` support in the future).

### 6. React + Vite Frontend
The frontend is bootstrapped with **Vite** for fast HMR (Hot Module Replacement) and build times. It uses:
- **Tailwind CSS** for utility-first styling with built-in dark mode support.
- **Axios** for HTTP requests to the backend (configured via `VITE_API_BASE_URL` env var).
- **lucide-react** for consistent, lightweight SVG icons.
- **React Router DOM** is installed for potential future multi-page navigation.

### 7. Pagination on the Leaderboard
The `/api/evaluations` endpoint supports `?page=N&limit=N` query parameters. The frontend fetches 5 records per page. This prevents loading the entire evaluation history into memory at once, keeping the UI snappy even with hundreds of records.

### 8. Monorepo Layout with Separate `package.json` Files
The project is laid out as a simple monorepo: separate `backend/` and `frontend/` directories, each with their own `node_modules` and `package.json`. The root `package.json` serves as a convenience wrapper for shared scripts.

---

## 📁 Project Structure

```
resume-jd-matcher/
│
├── backend/                      # Express.js API server
│   ├── controllers/
│   │   └── evaluationController.js   # Request handlers (match, list, download, delete)
│   ├── routes/
│   │   └── evaluationRoutes.js       # Route definitions + Multer middleware
│   ├── utils/
│   │   └── pdfParser.js              # PDF/TXT text extraction utility
│   ├── uploads/                      # Multer upload destination (gitignored)
│   ├── db.js                         # SQLite database layer (better-sqlite3)
│   ├── llm.js                        # Groq LLM integration (OpenAI SDK)
│   ├── server.js                     # Express app entry point
│   ├── matcher.db                    # SQLite database file (gitignored)
│   └── package.json
│
├── frontend/                     # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── MatcherForm.jsx       # Resume upload + JD input form
│   │   │   ├── ResultDisplay.jsx     # Score card + suggestions panel
│   │   │   └── Leaderboard.jsx       # Paginated evaluation history table
│   │   ├── App.jsx                   # Root component, view routing (analyze / leaderboard)
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### `POST /api/match`
Analyze a resume against a job description.

| | |
|---|---|
| **Content-Type** | `multipart/form-data` |
| **Body** | `resume` (file: PDF or .txt), `jobDescription` (string) |

**Response `200 OK`:**
```json
{
  "score": 82,
  "explanation": "The candidate has strong experience in Node.js and REST APIs, which are central to the role, but lacks explicit mention of Kubernetes and CI/CD pipelines.",
  "edit_suggestions": [
    "Add a dedicated 'DevOps' section highlighting any experience with Docker or Kubernetes.",
    "Quantify achievements in your current role (e.g., 'reduced API latency by 30%').",
    "Mention any CI/CD tools used (GitHub Actions, Jenkins) in the relevant project descriptions."
  ],
  "candidate_name": "Jane Doe",
  "job_title": "Senior Backend Engineer"
}
```

---

### `GET /api/evaluations`
Fetch paginated evaluation history.

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `5` | Records per page |

**Response `200 OK`:**
```json
{
  "data": [ { "id": 1, "candidate_name": "Jane Doe", "job_title": "...", "score": 82, "explanation": "...", "suggestions": ["..."], "resume_path": "...", "created_at": "..." } ],
  "pagination": { "total": 42, "page": 1, "limit": 5, "totalPages": 9 }
}
```

---

### `GET /api/resume/:id`
Download the original resume file for a given evaluation record.

| Param | Description |
|---|---|
| `id` | Evaluation record ID |

**Response:** File download (PDF or .txt), or `404` if the record/file is not found.

---

### `DELETE /api/evaluations/:id`
Delete an evaluation record **and** its stored resume file from disk.

| Param | Description |
|---|---|
| `id` | Evaluation record ID |

**Response `200 OK`:**
```json
{ "message": "Evaluation and resume deleted successfully" }
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A free [Groq API Key](https://console.groq.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/resume-jd-matcher.git
cd resume-jd-matcher
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5002
```

Start the backend server:

```bash
node server.js
# or for development with hot-reload:
npx nodemon server.js
```

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5002
```

Start the frontend dev server:

```bash
npm run dev
```

### 4. Open in browser

Navigate to **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Your Groq Cloud API key |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | The Groq model to use |
| `PORT` | No | `5002` | Port for the Express server |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ Yes | Base URL of the backend API (e.g. `http://localhost:5002`) |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 5.x | HTTP server & routing |
| Multer | 2.x | Multipart file upload handling |
| `openai` SDK | 6.x | Groq API client (OpenAI-compatible) |
| `better-sqlite3` | 12.x | Synchronous SQLite database access |
| `pdf-parse` | 1.x | PDF text extraction |
| `dotenv` | 17.x | Environment variable loading |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI library |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling & dark mode |
| Axios | 1.x | HTTP client |
| React Router DOM | 6.x | Client-side routing |
| lucide-react | 0.344 | SVG icon library |

### AI / LLM
| Service | Model | Purpose |
|---|---|---|
| [Groq Cloud](https://groq.com/) | `llama-3.3-70b-versatile` | Ultra-fast resume-JD analysis |

---


---

<div align="center">
  <strong>Built with ❤️ using React, Node.js, and Groq AI</strong>
</div>
