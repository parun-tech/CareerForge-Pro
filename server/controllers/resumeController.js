const Resume = require('../models/Resume');
const User = require('../models/User');

// @desc    Create new resume
// @route   POST /api/resume/create
// @access  Private
const createResume = async (req, res) => {
  try {
    const { originalContent } = req.body;

    // Check user plan limits
    const user = await User.findById(req.user.id);
    if (user.plan === 'free' && user.resumesCreated >= 1) {
      return res.status(403).json({ message: 'Free plan limit reached (1 resume max). Please upgrade to Pro.' });
    }

    const resume = await Resume.create({
      userId: req.user.id,
      originalContent,
    });

    user.resumesCreated += 1;
    await user.save();

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user resumes
// @route   GET /api/resume
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update resume
// @route   PUT /api/resume/update/:id
// @access  Private
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Make sure the logged in user matches the resume user
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedResume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createResume,
  getResumes,
  updateResume,
};
