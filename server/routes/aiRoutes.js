const express = require('express');
const router = express.Router();
const { analyzeJD, rewriteResume, createCoverLetter } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/analyze-jd', protect, analyzeJD);
router.post('/rewrite', protect, rewriteResume);
router.post('/cover-letter', protect, createCoverLetter);

module.exports = router;
