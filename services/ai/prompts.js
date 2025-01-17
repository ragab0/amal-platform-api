const CV = require("../../models/cvModel");

const systemPrompt = {
  content: `You are a professional CV writer helping to create professional CVs that are compatible with ATS systems.
    Your task is to help the user by generating a professional description in Arabic. Format your responses
    using markdown syntax. RESTRICTED TO ARABIC LANGUAGE, YOU MUST RESPONSE DIRECT WITH VALID MARKDOWN SYNTAX BY 100%
    , SO WITH NO ANY INTRODUCTION OR EXPLANATION JUST THE PROFESSIONAL DESCRIPTION IN VALID MARKDOWN SYNTAX.

    
    Please ensure all content is:
    - ATS-friendly
    - Well-structured
    - Professional in tone
    - Properly formatted in markdown
    - Optimized for Arabic language
    - Markdown available RESTRICTED options only for:
    [Italic, Bold, Ordered List, Unordered List, Numbered List, Bullet List]
    `,
  role: "system",
};

const generalContent = (name = "experience", data) => ({
  content: `
    Write a professional description for my ${name} which is ${JSON.stringify(
    data
  )}
     ${
       data.additionalUserTips
         ? `Additional requirements: ${data.additionalUserTips}`
         : ""
     }`,
  role: "user",
});

const generatePrompts = {
  experience: (data, _) => generalContent("experience", data, _),
  education: (data, _) =>
    generalContent(
      "education and what should i have learned in that 'field'",
      data,
      _
    ),
  course: (data, _) =>
    generalContent(
      "course and breifly what should i have learned or applied or gained or achieved in that 'course' - Restricted to response with the description itself only, no additional information",
      data,
      _
    ),
  volunteering: (data, _) =>
    generalContent(
      "volunteering and what activities should i have done or experience should i have gained",
      data,
      _
    ),
  about: (_, user) =>
    generalContent("about", {
      myHeadline: user.headline,
    }),
  skillsGeneralDesc: (data, _) => generalContent("skills", data, _),
  interests: (data, _) =>
    generalContent(
      "interests/hobies generaly in life for someone that interests in 'the provided data'",
      data,
      _
    ),
};

module.exports = {
  generatePrompts,
  systemPrompt,
  currentPropmps: Object.keys(generatePrompts),
};
