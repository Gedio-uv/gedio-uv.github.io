import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.AI_API_KEY || '',
});

export const maxDuration = 30; // 30 seconds

// Static bank of pre-recorded audio interviews
const AUDIO_BANK = [
  {
    id: "interview-1",
    audioUrl: "/audio/interview-1.mp3",
    transcript: `**Hörverstehen Teil 2 – Interview**

**Moderatorin:** Guten Tag und herzlich willkommen zu unserer Sendung! Heute geht es um ein Thema, das uns alle betrifft: die Zukunft der Arbeit. Bei mir im Studio ist Herr Dr. Berger, Arbeitsmarktforscher. Schön, dass Sie da sind!

**Gast:** Vielen Dank für die Einladung, ich freue mich sehr.

**Moderatorin:** Herr Dr. Berger, immer mehr Unternehmen bieten ihren Mitarbeitern Homeoffice an. Wie beurteilen Sie diese Entwicklung?

**Gast:** Also, grundsätzlich finde ich das sehr positiv. Studien zeigen, dass viele Beschäftigte produktiver arbeiten, wenn sie flexibler entscheiden können, wo und wann sie ihre Aufgaben erledigen. Allerdings sollte man nicht vergessen, dass nicht jeder Beruf dafür geeignet ist. Ein Krankenpfleger oder eine Verkäuferin können schließlich nicht von zu Hause aus arbeiten.

**Moderatorin:** Das stimmt. Aber könnte man nicht sagen, dass durch die Digitalisierung ohnehin immer mehr Berufe verschwinden werden?

**Gast:** Das wird oft behauptet, aber ich würde das differenzierter betrachten. Es werden zwar einige Tätigkeiten automatisiert, gleichzeitig entstehen aber auch völlig neue Berufsfelder, die es vor zehn Jahren noch gar nicht gab. Wenn wir uns heute die IT-Branche anschauen, sehen wir, wie viele neue Stellen dort geschaffen wurden.

**Moderatorin:** Was würden Sie jungen Menschen raten, die sich gerade für einen Berufsweg entscheiden müssen?

**Gast:** Ich würde ihnen empfehlen, sich nicht nur auf ein einziges Fachgebiet zu beschränken. Wer flexibel bleibt und bereit ist, sich ständig weiterzubilden, wird auf dem Arbeitsmarkt der Zukunft deutlich bessere Chancen haben.

**Moderatorin:** Vielen Dank, Herr Dr. Berger, für dieses aufschlussreiche Gespräch!

**Gast:** Sehr gerne, auf Wiedersehen!`
  }
];

export async function POST() {
  try {
    // Select a random audio from the bank
    const selectedAudio = AUDIO_BANK[Math.floor(Math.random() * AUDIO_BANK.length)];

    const prompt = `
      You are an expert German language teacher creating a TELC B2 exam.
      I have the following transcript for a "Hörverstehen Teil 2" (Listening Comprehension) exercise:
      
      "${selectedAudio.transcript}"
      
      Requirements:
      1. Create exactly 5 "Richtig oder Falsch" (True or False) statements based strictly on this transcript.
      2. The statements should test B2 level comprehension (e.g. using synonyms or paraphrasing the original text).
      
      You MUST return your response as a RAW JSON object. DO NOT wrap it in markdown code blocks. DO NOT include any other text.
      The JSON MUST strictly follow this structure:
      {
        "title": "Hörverstehen Teil 2",
        "instructions": "Hören Sie den folgenden Text. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.",
        "questions": [
          {
            "id": 1,
            "statement": "Der Gast arbeitet seit 10 Jahren im Bereich Künstliche Intelligenz.",
            "options": ["Richtig", "Falsch"],
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

    let jsonString = text;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const generatedData = JSON.parse(jsonString);
    
    // Inject the audio URL and transcript into the response
    const examData = {
      ...generatedData,
      audioUrl: selectedAudio.audioUrl,
      transcript: selectedAudio.transcript
    };

    return Response.json({ success: true, exam: examData });

  } catch (error: any) {
    console.error('Error in generate-listening:', error);
    return Response.json({ error: error.message || 'Failed to generate listening module' }, { status: 500 });
  }
}
