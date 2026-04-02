/**
 * Service to extract keywords from a Job Description.
 * We can use a simple frequency logic for now, or fallback to an AI wrapper.
 */
const extractKeywords = (jdText) => {
  if (!jdText) return { keywords: [], rankedKeywords: {} };

  // Remove punctuation and convert to lowercase
  const cleanText = jdText.replace(/[^\w\s]/g, '').toLowerCase();
  
  // Exclude common stop words
  const stopWords = ['and', 'the', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we', 'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their', 'news', 'out', 'use', 'any', 'there', 'see', 'only', 'so', 'his', 'when', 'contact', 'here', 'business', 'who', 'web', 'also', 'now', 'help', 'get', 'pm', 'view', 'online', 'first', 'am', 'been', 'would', 'how', 'were', 'me', 's', 'services', 'some', 'these', 'click', 'its', 'like', 'service', 'x', 'than', 'find', 'price', 'date', 'back', 'top', 'people', 'had', 'list', 'name', 'just', 'over', 'state', 'year', 'day', 'into', 'email', 'two', 'health', 'n', 'world', 're', 'next', 'used', 'go', 'b', 'work', 'last', 'most', 'products', 'music', 'buy', 'data', 'make', 'them', 'should', 'product', 'system', 'post', 'her', 'city', 't', 'add', 'policy', 'number', 'such', 'please', 'available', 'copyright', 'support', 'message', 'after', 'best', 'software', 'then', 'jan', 'good', 'video', 'well', 'd', 'where', 'info', 'rights', 'public', 'books', 'high', 'school', 'through', 'm', 'each', 'links', 'she', 'review', 'years', 'order', 'very', 'privacy', 'book', 'items', 'company', 'read', 'group'];

  const words = cleanText.split(/\s+/);
  
  const frequencyMap = {};
  words.forEach(word => {
    if (word.length > 2 && !stopWords.includes(word)) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });

  // Sort by frequency
  const sortedKeywords = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a]);
  
  // Take top 20 keywords
  const topKeywords = sortedKeywords.slice(0, 20);

  const rankedKeywords = {};
  topKeywords.forEach(kw => {
    rankedKeywords[kw] = frequencyMap[kw];
  });

  return {
    keywords: topKeywords,
    rankedKeywords
  };
};

module.exports = {
  extractKeywords
};
