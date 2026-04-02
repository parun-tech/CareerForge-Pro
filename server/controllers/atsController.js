const { calculateATSScore } = require('../services/atsService');

// @desc    Calculate ATS Score
// @route   POST /api/ats/score
// @access  Private
const analyzeATS = async (req, res) => {
  try {
    const { resumeText, jdKeywords } = req.body;
    
    if (!resumeText || !jdKeywords) {
      return res.status(400).json({ message: 'Please provide resumeText and jdKeywords' });
    }

    const result = calculateATSScore(resumeText, jdKeywords);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  analyzeATS
};
