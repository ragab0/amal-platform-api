const AppError = require("../../utils/appError");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generatePrompts, systemPrompt } = require("./prompts");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 0.9,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1500,
  responseMimeType: "text/plain",
};

async function generateGeminiContent(type, data, user) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const chat = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt.content }],
        },
      ],
    });

    const prompt = generatePrompts[type](data, user).content;
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log("RESPONSE OF GEMINI:", response.text());
    return response.text();
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateGeminiContent,
};
