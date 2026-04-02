const express = require('express');
const router = express.Router();
const { createResume, getResumes, updateResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getResumes);
router.route('/create').post(protect, createResume);
router.route('/update/:id').put(protect, updateResume);

module.exports = router;
