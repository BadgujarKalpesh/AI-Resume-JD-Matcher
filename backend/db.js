const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'matcher.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT,
    job_title TEXT,
    score INTEGER,
    explanation TEXT,
    suggestions TEXT,
    resume_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

try {
  db.prepare(`ALTER TABLE evaluations ADD COLUMN resume_path TEXT`).run();
} catch (e) {
  // Column likely already exists
}

module.exports = {
  saveEvaluation: (data) => {
    const stmt = db.prepare(`
      INSERT INTO evaluations (candidate_name, job_title, score, explanation, suggestions, resume_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.name, data.jobTitle, data.score, data.explanation, JSON.stringify(data.suggestions), data.resumePath);
  },
  getEvaluations: (limit = 10, offset = 0) => {
    return db.prepare('SELECT * FROM evaluations ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  },
  getTotalCount: () => {
    return db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count;
  },
  deleteEvaluation: (id) => {
    return db.prepare('DELETE FROM evaluations WHERE id = ?').run(id);
  },
  getEvaluationById: (id) => {
    return db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
  }
};
