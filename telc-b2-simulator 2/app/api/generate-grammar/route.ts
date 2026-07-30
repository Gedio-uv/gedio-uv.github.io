import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';

const groq = createGroq({
  apiKey: process.env.AI_API_KEY || '',
});

export const maxDuration = 30; // 30 seconds

export async function POST() {
  try {
    const prompt = `
      You are an expert German language teacher creating a TELC B2 exam.
      Generate a "Sprachbausteine Teil 1" (Grammar and Vocabulary) exercise.
      
      Requirements:
      1. Write a formal letter or email in German (approx. 150-200 words).
      2. The text should have exactly 10 missing words/phrases, represented by placeholders [1], [2], ... [10].
      3. For each placeholder, provide exactly 3 options (a, b, c), where only one is correct.
      4. The vocabulary and grammar tested should be strictly B2 level (connectors, prepositions, adjectives, passive, subjunctive II, etc.).
      
      You MUST return your response as a RAW JSON object. DO NOT wrap it in markdown code blocks. DO NOT include any other text.
      The JSON MUST strictly follow this structure:
      {
        "title": "Sprachbausteine Teil 1",
        "instructions": "Lesen Sie den folgenden Text. Welche Wörter (a, b oder c) passen in die Lücken? Markieren Sie Ihre Lösungen.",
        "text": "Sehr geehrte Damen und Herren,\\n\\nich schreibe Ihnen, [1] ich ein Problem mit meiner letzten Bestellung habe...",
        "blanks": [
          {
            "id": 1,
            "options": ["weil", "denn", "obwohl"],
            "correctOptionIndex": 0
          }
        ]
      }
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: prompt,
      temperature: 0.7,
    });

    // Clean up potential markdown formatting if the model disobeys
    let jsonString = text;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const examData = JSON.parse(jsonString);

    return Response.json({ success: true, exam: examData });

  } catch (error: any) {
    console.error('Error in generate-grammar:', error);
    return Response.json({ error: error.message || 'Failed to generate grammar module' }, { status: 500 });
  }
}
