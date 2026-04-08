require('dotenv').config();
const { OpenAI } = require('openai');

async function testGroq() {
  console.log("Checking key length:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : "UNDEFINED");
  console.log("First 8 chars:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 8) : "UNDEFINED");
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: "Say hello!" }],
      max_tokens: 10,
    });
    console.log("SUCCESS!", response.choices[0].message.content);
  } catch (error) {
    console.error("GROQ API ERROR:", error.message);
  }
}
testGroq();
