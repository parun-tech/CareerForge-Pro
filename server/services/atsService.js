const calculateATSScore = (resumeText, jdKeywords) => {
  if (!jdKeywords || jdKeywords.length === 0) {
    return { score: 0, missingKeywords: [], suggestions: ["No job description keywords provided."] };
  }

  const cleanResumeText = resumeText.toLowerCase();
  
  let matchCount = 0;
  const matchedKeywords = [];
  const missingKeywords = [];

  jdKeywords.forEach(kw => {
    if (cleanResumeText.includes(kw.toLowerCase())) {
      matchCount++;
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const score = Math.round((matchCount / jdKeywords.length) * 100);

  const suggestions = [];
  if (score < 50) {
    suggestions.push("Your resume is missing many key terms from the job description. Consider using the AI Rewrite feature.");
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Try to organically include these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  if (score >= 80) {
    suggestions.push("Great job! Your resume is highly targeted for this role.");
  }

  return {
    score,
    missingKeywords,
    suggestions
  };
};

module.exports = {
  calculateATSScore
};
