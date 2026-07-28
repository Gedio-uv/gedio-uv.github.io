import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.AI_API_KEY || '',
});

export const maxDuration = 30; // 30 seconds

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as Blob;
    const topic = formData.get('topic') as string;

    if (!file) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 1. Transcribe with Whisper (Groq)
    // Create a new FormData to send to Groq API
    const whisperFormData = new FormData();
    whisperFormData.append('file', file, 'audio.webm'); // Groq accepts webm
    whisperFormData.append('model', 'whisper-large-v3');
    whisperFormData.append('language', 'de'); // Force German
    whisperFormData.append('response_format', 'verbose_json');

    const transcriptionRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: whisperFormData
    });

    if (!transcriptionRes.ok) {
      const errorText = await transcriptionRes.text();
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const transcriptionData = await transcriptionRes.json();
    const transcript = transcriptionData.text;

    if (!transcript || transcript.trim().length === 0) {
      return Response.json({ 
        success: true, 
        transcript: "",
        feedback: {
          scoreSummary: "0% - Audio nicht erkannt",
          mistakesAnalysis: [{
            questionId: "Aussprache",
            explanation: "Wir konnten keine Worte erkennen. Bitte überprüfen Sie Ihr Mikrofon und sprechen Sie deutlich.",
            keyVocabulary: []
          }],
          recommendations: ["Versuchen Sie, langsamer und deutlicher zu sprechen."]
        }
      });
    }

    // 2. Evaluate with Llama 3
    const prompt = `
      You are an expert German language tutor evaluating a student's TELC B2 Mündliche Prüfung (Teil 1: Präsentation).
      The student was asked to talk about the following topic: "${topic}".
      
      Here is the raw transcription of what the system heard the student say:
      "${transcript}"
      
      Evaluate the response based on:
      1. Comprehensibility & Pronunciation: Did Whisper transcribe words that make no sense phonetically? If the sentence is broken with weird words, assume the student mispronounced them.
      2. Relevance: Did they actually talk about the topic?
      3. Grammar & B2 Vocabulary.
      
      You MUST return your response as a RAW JSON object. DO NOT wrap it in markdown code blocks. DO NOT include any other text.
      The JSON MUST strictly follow this structure:
      {
        "scoreSummary": "Ein kurzer ermutigender Satz mit einer geschätzten Verständlichkeits-Punktzahl (z.B. 'Verständlichkeit: 80% - Gute Präsentation!')",
        "mistakesAnalysis": [
          {
            "questionId": "Aussprache / Grammatik",
            "explanation": "Why a specific phrase or word didn't make sense or was grammatically incorrect. E.g. 'Das System hat X gehört, wahrscheinlich meintest du Y'.",
            "keyVocabulary": ["Wort 1"]
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

    return Response.json({ 
      success: true, 
      transcript: transcript,
      feedback: feedbackData 
    });

  } catch (error: any) {
    console.error('Error in evaluate-speaking:', error);
    return Response.json({ error: error.message || 'Failed to evaluate speaking module' }, { status: 500 });
  }
}
