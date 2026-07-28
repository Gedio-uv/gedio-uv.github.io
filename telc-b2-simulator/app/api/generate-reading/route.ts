import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.AI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ error: 'AI_API_KEY is not configured.' }, { status: 500 });
    }

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `
        You are an expert German language examiner creating a practice test for the TELC B2 Zertifikat Deutsch.
        Create a "Leseverstehen Teil 1" (Reading Comprehension Part 1) exercise.
        
        Rules:
        - The topic should be related to everyday life, work, or society in Germany.
        - Create 4 short texts (about 80-100 words each).
        - Create 6 headlines (2 are distractors).
        - Map the correct headline to each text.
        - The language MUST be strictly at the B2 level (complex sentences, specific vocabulary).
        - All output text must be in German.
        
        CRITICAL INSTRUCTION:
        You MUST output ONLY a valid JSON object matching the following structure. Do not output any markdown formatting (like \`\`\`json), just the raw JSON:
        {
          "title": "Leseverstehen Teil 1",
          "instructions": "Ordnen Sie den Texten (1-4) die passenden Überschriften (A-F) zu. Zwei Überschriften passen nicht.",
          "headlines": ["Überschrift A", "Überschrift B", "Überschrift C", "Überschrift D", "Überschrift E", "Überschrift F"],
          "texts": [
            { "id": "text1", "content": "Text 1 content...", "correctHeadlineIndex": 0 },
            { "id": "text2", "content": "Text 2 content...", "correctHeadlineIndex": 2 },
            { "id": "text3", "content": "Text 3 content...", "correctHeadlineIndex": 4 },
            { "id": "text4", "content": "Text 4 content...", "correctHeadlineIndex": 5 }
          ]
        }
      `,
    });

    // Attempt to parse the JSON
    let parsedObject;
    try {
      const cleanText = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
      parsedObject = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", text);
      return NextResponse.json({ error: 'Failed to parse AI response.', details: text }, { status: 500 });
    }

    return NextResponse.json({ success: true, exam: parsedObject });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate exam.', details: error.message }, { status: 500 });
  }
}
