const OpenAI = require("openai");
require("dotenv").config();

async function matchResumeWithJD(resumeText, jobDescription) {
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const prompt = `
    Analyze the following Resume against the Job Description (JD).
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Return a strictly formatted JSON object with the following fields:
    - score: A number from 0 to 100 representing the match fit.
    - explanation: A short, 1-2 sentence justification for the score.
    - edit_suggestions: An array of 2-3 actionable bullet points on how the candidate can improve their resume for this specific JD.
    - candidate_name: The candidate's name extracted from the resume (default to "Unknown").
    - job_title: The target job title or role extracted from the JD (default to "Position").

    Do not include any other text, markdown formatting (like \`\`\`json), or explanations outside the JSON object.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert HR recruiter and technical hiring manager. Return results in JSON format." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" }
    });

    const textResult = response.choices[0].message.content;
    const cleanedText = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("LLM Error:", error);
    throw new Error("Failed to process resume with Groq: " + error.message);
  }
}

module.exports = { matchResumeWithJD };
