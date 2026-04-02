const { rewriteBulletPoints, generateCoverLetter } = require('../services/aiService');
const { extractKeywords } = require('../services/jdParser');

// @desc    Analyze Job Description
// @route   POST /api/ai/analyze-jd
// @access  Private
const analyzeJD = async (req, res) => {
  try {
    const { jdText } = req.body;
    if (!jdText) {
      return res.status(400).json({ message: 'Please provide job description text' });
    }

    const { keywords, rankedKeywords } = extractKeywords(jdText);
    res.status(200).json({ keywords, rankedKeywords });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rewrite Resume
// @route   POST /api/ai/rewrite
// @access  Private
const rewriteResume = async (req, res) => {
  try {
    const { bullets, keywords } = req.body;
    
    if (!bullets || !Array.isArray(bullets) || !keywords) {
      return res.status(400).json({ message: 'Please provide bullets array and keywords' });
    }

    const optimizedBullets = await rewriteBulletPoints(bullets, keywords);
    res.status(200).json({ optimizedBullets });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate Cover Letter
// @route   POST /api/ai/cover-letter
// @access  Private
const createCoverLetter = async (req, res) => {
  try {
    const { resumeContent, jdText } = req.body;
    
    if (req.user.plan !== 'pro') {
      return res.status(403).json({ message: 'Cover letters are a Pro feature. Please upgrade.' });
    }

    const coverLetter = await generateCoverLetter(resumeContent, jdText);
    res.status(200).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  analyzeJD,
  rewriteResume,
  createCoverLetter
};
