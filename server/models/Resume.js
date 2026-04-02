const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  originalContent: {
    type: Object, // Can contain name, education, experience array, skills, projects
    required: true
  },
  optimizedContent: {
    type: Object, // Re-written bullet points
    default: {}
  },
  atsScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
