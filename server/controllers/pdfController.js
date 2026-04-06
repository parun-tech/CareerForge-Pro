const { generatePDF } = require('../services/pdfService');

// @desc    Generate PDF from HTML
// @route   POST /api/pdf/generate
// @access  Private
const createPDF = async (req, res) => {
  try {
    const { htmlContent } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ message: 'Please provide htmlContent' });
    }

    const pdfBuffer = await generatePDF(htmlContent);

    // Send the PDF buffer to the client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="resume.pdf"'
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

module.exports = {
  createPDF
};
