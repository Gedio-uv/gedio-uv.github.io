import requests

url = "https://deutsch-lernen-api.guido-usnayo-v.workers.dev/api/chat"
headers = {"Content-Type": "application/json"}
payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {
            "role": "user",
            "content": """You are a German dictionary assistant. Analyze the word or phrase: "Haus"

Determine if it is German or Chinese. Return ONLY a valid JSON object (no markdown, no explanation):

{
  "word": "<German word (base form)>",
  "article": "<der/die/das for nouns, - for others>",
  "plural": "<plural form for nouns, - for others>",
  "ipa": "</IPA transcription/>",
  "partOfSpeech": "<noun/verb/adjective/adverb/preposition/conjunction>",
  "nativeTranslation": "<WRITE TRANSLATION IN Chinese HERE>",
  "synonyms": ["<German synonym 1>", "<German synonym 2>", "<German synonym 3>"],
  "examples": [
    { "german": "<Natural German sentence>", "native": "<WRITE TRANSLATION IN Chinese HERE>" }
  ],
  "grammarNotes": "<Brief grammar note in Chinese>",
  "imageQuery": "house"
}

Rules:
- If input is Chinese, translate to German first.
- If input is German, keep as-is.
- DO NOT leave any field empty!"""
        }
    ],
    "response_format": {"type": "json_object"}
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
