const express = require('express');
const router = express.Router();
const { analyzeATS } = require('../controllers/atsController');
const { protect } = require('../middleware/auth');

router.post('/score', protect, analyzeATS);

module.exports = router;
