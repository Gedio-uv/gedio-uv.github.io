import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';

const groq = createGroq({
  apiKey: process.env.AI_API_KEY || '',
});

export const maxDuration = 30; // 30 seconds

export async function POST(req: Request) {
  try {
    const { moduleType, examData, userAnswers } = await req.json();

    const prompt = `
      You are an expert German language tutor evaluating a student's TELC B2 practice test.
      The student has just completed the module: ${moduleType}.
      
      Here is the exam content:
      ${JSON.stringify(examData)}
      
      Here are the student's selected answers (mapping index to option):
      ${JSON.stringify(userAnswers)}
      
      Analyze the student's mistakes (if any) and provide targeted feedback IN GERMAN.
      If the student got a perfect score, congratulate them and provide 2 advanced vocabulary words from the text to remember.
      If they made mistakes, explain briefly why their choice was wrong and why the correct answer is right. Highlight key vocabulary they missed.
      
      You MUST return your response as a RAW JSON object. DO NOT wrap it in markdown code blocks. DO NOT include any other text.
      The JSON MUST strictly follow this structure:
      {
        "scoreSummary": "Ein kurzer ermutigender Satz (z.B. 'Gute Arbeit! 3 von 4 richtig.')",
        "mistakesAnalysis": [
          {
            "questionId": "The ID or index of the question they got wrong",
            "explanation": "Why the correct answer is correct, and why their choice was wrong.",
            "keyVocabulary": ["Wort 1", "Wort 2"]
          }
        ],
        "recommendations": [
          "Tipp 1 für das weitere Lernen",
          "Tipp 2"
        ]
      }
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: prompt,
      temperature: 0.7,
    });

    let jsonString = text;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const feedbackData = JSON.parse(jsonString);

    return Response.json({ success: true, feedback: feedbackData });

  } catch (error: any) {
    console.error('Error in generate-feedback:', error);
    return Response.json({ error: error.message || 'Failed to generate feedback' }, { status: 500 });
  }
}
