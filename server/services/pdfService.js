const puppeteer = require('puppeteer');

const generatePDF = async (htmlContent) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load completely
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error("Puppeteer Error:", error);
    throw new Error("Failed to generate PDF");
  }
};

module.exports = {
  generatePDF
};
