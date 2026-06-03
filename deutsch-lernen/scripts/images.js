/**
 * images.js — Image fetching module
 * Strategy:
 *   1. If Unsplash key provided → try Unsplash (real photos, fast)
 *   2. Fallback → Pollinations.ai (AI-generated, free, no key needed)
 *      Preloads the image with a timeout so we never get a blank invisible state.
 */

const UNSPLASH_BASE     = 'https://api.unsplash.com';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const CACHE = new Map();

/**
 * Fetch an image URL for a given concept.
 * @param {string} query       - English concept/noun (from imageQuery field)
 * @param {string} [unsplashKey] - Optional Unsplash access key
 * @param {string} [partOfSpeech] - 'verb', 'adjective', etc.
 * @returns {Promise<string|null>}
 */
export async function fetchImage(query, unsplashKey, partOfSpeech) {
  if (!query || query.trim() === '') return null;

  const cacheKey = `${query.toLowerCase().trim()}|${partOfSpeech||''}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  const isAction = partOfSpeech &&
    ['verb', 'adverb', 'adjective', 'preposition'].includes(partOfSpeech.toLowerCase());

  let url = null;

  // Try Unsplash for concrete nouns (fast, real photos)
  if (unsplashKey && !isAction) {
    url = await fetchUnsplash(query, unsplashKey);
  }

  // Pollinations.ai as primary (verbs/adjectives) or fallback
  if (!url) {
    url = await fetchPollinations(query, partOfSpeech);
  }

  if (url) CACHE.set(cacheKey, url);
  return url;
}

/**
 * Fetch from Unsplash.
 */
async function fetchUnsplash(query, apiKey) {
  try {
    const params = new URLSearchParams({
      query,
      per_page: 5,
      orientation: 'landscape',
      content_filter: 'high',
      client_id: apiKey,
    });

    const response = await fetch(`${UNSPLASH_BASE}/search/photos?${params}`, {
      headers: { 'Accept-Version': 'v1' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results?.length) return null;

    const idx = Math.floor(Math.random() * Math.min(data.results.length, 5));
    return data.results[idx]?.urls?.regular || null;

  } catch {
    return null;
  }
}

/**
 * Build a Pollinations.ai prompt URL, then preload it.
 * Returns the URL if the image loads within 15 s, otherwise null.
 */
async function fetchPollinations(query, partOfSpeech) {
  let prompt;
  if (partOfSpeech === 'verb') {
    prompt = `person performing action of ${query}, candid photography, natural light, cinematic, no text`;
  } else if (partOfSpeech === 'adjective') {
    prompt = `visual representation of ${query} concept, photography, vibrant, no text, no words`;
  } else {
    prompt = `${query}, clean professional photography, natural light, sharp focus, no text`;
  }

  const seed = Math.floor(Math.random() * 9999);
  const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=800&height=500&nologo=true&model=flux&seed=${seed}`;

  // Preload: only return URL if the image actually loads (max 15 s)
  const loaded = await preloadWithTimeout(url, 15000);
  return loaded ? url : null;
}

/**
 * Attempt to load an image URL within `ms` milliseconds.
 * @param {string} url
 * @param {number} ms
 * @returns {Promise<boolean>}
 */
function preloadWithTimeout(url, ms) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, ms);
    img.onload  = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

/**
 * Preload an image URL (exported helper).
 */
export function preloadImage(url) {
  return preloadWithTimeout(url, 10000);
}

