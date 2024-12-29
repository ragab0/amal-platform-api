const OpenAI = require("openai");
const AppError = require("../../utils/appError");
const { generatePrompts, systemPrompt } = require("./prompts");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateOpenAIContent(type, data, user) {
  try {
    const prompt = generatePrompts[type](data, user);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, prompt],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateOpenAIContent,
};
