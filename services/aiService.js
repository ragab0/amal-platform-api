const { generateOpenAIContent } = require("./ai/openaiService");
const { generateGeminiContent } = require("./ai/geminiService");
const AppError = require("../utils/appError");

async function generateAIContent(type, data, user) {
  // Try OpenAI first && If OpenAI fails, try Gemini;
  try {
    return await generateOpenAIContent(type, data, user);
  } catch (error) {
    try {
      return await generateGeminiContent(type, data, user);
    } catch (geminiError) {
      console.error("1. OpenAI failed:", error);
      console.error("2. Gemini failed:", geminiError);

      // handle both errors together;
      if (
        error.code === "insufficient_quota" &&
        geminiError.message?.includes("quota")
      ) {
        throw new AppError("عذراً، لقد تم تعطيل خدمة AI", 400);
      }
      throw new AppError("فشل توليد المحتوى AI, حاول مجدداً", 400);
    }
  }
}

module.exports = {
  generateAIContent,
};
