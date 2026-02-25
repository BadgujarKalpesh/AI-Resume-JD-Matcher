const fs = require('fs');
const { matchResumeWithJD } = require('../llm');
const db = require('../db');
const { parseResume } = require('../utils/pdfParser');

const path = require('path');

exports.matchResume = async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        const resumeText = await parseResume(req.file);
        const analysis = await matchResumeWithJD(resumeText, jobDescription);

        db.saveEvaluation({
            name: analysis.candidate_name,
            jobTitle: analysis.job_title,
            score: analysis.score,
            explanation: analysis.explanation,
            suggestions: analysis.edit_suggestions,
            resumePath: req.file.path
        });

        res.json(analysis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.downloadResume = (req, res) => {
    try {
        const { id } = req.params;
        const record = db.getEvaluationById(id);

        if (!record || !record.resume_path) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        if (!fs.existsSync(record.resume_path)) {
            return res.status(404).json({ error: 'File no longer exists on server' });
        }

        res.download(record.resume_path, `resume_${record.candidate_name.replace(/\s+/g, '_')}${path.extname(record.resume_path)}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEvaluations = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const evaluations = db.getEvaluations(limit, offset);
        const total = db.getTotalCount();

        res.json({
            data: evaluations.map(e => ({
                ...e,
                suggestions: JSON.parse(e.suggestions)
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvaluation = (req, res) => {
    try {
        const { id } = req.params;
        const record = db.getEvaluationById(id);

        if (record && record.resume_path && fs.existsSync(record.resume_path)) {
            fs.unlinkSync(record.resume_path);
        }

        db.deleteEvaluation(id);
        res.json({ message: 'Evaluation and resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
