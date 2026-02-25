# AI-Powered Resume & JD Matcher (MVP)

An expert-level tool that evaluates a candidate's resume against a job description using Gemini AI. It provides a fit score, a detailed explanation, and actionable improvement suggestions.

## 🚀 Features
- **PDF/Text Support**: Upload resumes in `.pdf` or `.txt` format.
- **AI Analysis**: Uses Gemini 1.5 Flash to compare JD requirements with resume experience.
- **Match Score**: 0-100 score indicating the technical and cultural fit.
- **Actionable Suggestions**: 2-3 bullet points on how to tailor the resume for the JD.
- **Leaderboard**: Automatically saves every evaluation to a local SQLite database for ranking.

## 🛠️ System Architecture
The project follows a modular Full-Stack JavaScript architecture:

- **Frontend**: React 18 with Vite, Tailwind CSS for styling, and Lucide React for iconography.
- **Backend**: Node.js with Express, Multer for file processing, and `pdf-parse` for text extraction.
- **AI**: Google Generative AI (Gemini SDK) for semantic matching and NLP.
- **Database**: SQLite (via `better-sqlite3`) for lightweight, serverless persistence.

### Decision Log
- **Gemini 1.5 Flash**: Chosen for its fast response times and high token limit, making it ideal for processing long resumes and JDs.
- **Better-SQLite3**: Chosen for its synchronous API which simplifies MVP code while maintaining high performance.
- **Tailwind CSS**: Used to create a "premium" feel with glassmorphism and smooth transitions without heavy UI libraries.

## 📦 Setup & Execution

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key. [Get one here](https://aistudio.google.com/app/apikey).

### 1. Backend Setup
```bash
cd backend
npm install
# Rename .env.sample to .env and add your GEMINI_API_KEY
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧠 AI Prompt Engineering
The system uses a **Strict JSON Output** strategy. The prompt forces the LLM to behave as a technical recruiter, ensuring the output is always parseable and follows a specific schema. This avoids common LLM issues like "talkativeness" and ensures the UI can reliably display the data.

```javascript
// Example Prompt Snippet
"Return a strictly formatted JSON object with the following fields: 
score, explanation, edit_suggestions, candidate_name, job_title."
```

---
Built with ❤️ by Antigravity AI
