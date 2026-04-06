const express = require('express');
const router = express.Router();
const { createPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, createPDF);

module.exports = router;
