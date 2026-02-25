const express = require('express');
const router = express.Router();
const multer = require('multer');
const evaluationController = require('../controllers/evaluationController');

const upload = multer({ dest: 'uploads/' });

router.post('/match', upload.single('resume'), evaluationController.matchResume);
router.get('/evaluations', evaluationController.getEvaluations);
router.get('/resume/:id', evaluationController.downloadResume);
router.delete('/evaluations/:id', evaluationController.deleteEvaluation);

module.exports = router;
