const { OpenAI } = require('openai');

const rewriteBulletPoints = async (bullets, keywords) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `
Rewrite the following resume bullet points to make them more professional, impactful, and measurable.
Incorporate as many of these keywords as naturally possible: ${keywords.join(', ')}.
These points should be ATS optimized. Do not hallucinate metrics, but add placeholders like [X]% if metrics are missing so the user can fill them in.
Return ONLY the rewritten bullet points, separated by newlines. Do not include any other text.

Original Bullets:
${bullets.map(b => '- ' + b).join('\n')}
    `;

    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content.split('\n').map(b => b.replace(/^- /, '').trim()).filter(b => b);
  } catch (error) {
    console.error("OpenAI Error:", error);
    return bullets; // fallback to original
  }
};

const generateCoverLetter = async (resumeContent, jdText) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `
Write a professional cover letter based on the following Resume and Job Description.
Keep it concise, engaging, and highlight how the resume experience aligns with the job description.

Resume:
${JSON.stringify(resumeContent)}

Job Description:
${jdText}
    `;

    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error generating cover letter. Please try again.";
  }
};

module.exports = {
  rewriteBulletPoints,
  generateCoverLetter
};
