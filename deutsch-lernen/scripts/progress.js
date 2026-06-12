/**
 * progress.js — Centralized state persistence
 * Manages the unified "tolk:progress" localStorage object.
 */

const STORAGE_KEY = 'tolk:progress';
const SCHEMA_VERSION = 1;

const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  level: 'initial',
  uiLanguage: 'en',
  searchHistory: [],
  wordsSearchedCount: 0,
  gamesPlayed: 0,
  flashcardsCompleted: 0,
  streak: 0,
  lastActiveDate: null,
  quizScores: {}
};

/**
 * Get the full state, merging defaults for any missing properties
 * and handling migrations if needed.
 */
export function get() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateFromOld();

    const data = JSON.parse(raw);
    
    // Graceful hydration - merge with defaults
    const state = { ...DEFAULT_STATE, ...data };
    
    return state;
  } catch (err) {
    console.error('Progress parsing error:', err);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Update partial state and save
 * @param {Object} partial 
 */
export function update(partial) {
  const current = get();
  const next = { ...current, ...partial };
  
  // Handle streak updates if this is a new day
  const today = new Date().toISOString().split('T')[0];
  if (next.lastActiveDate !== today) {
    if (current.lastActiveDate) {
      const last = new Date(current.lastActiveDate);
      const now = new Date(today);
      const diffTime = Math.abs(now - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        next.streak += 1;
      } else if (diffDays > 1) {
        next.streak = 1; // reset streak
      }
    } else {
      next.streak = 1; // first day
    }
    next.lastActiveDate = today;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Completely reset user progress
 */
export function reset() {
  localStorage.removeItem(STORAGE_KEY);
  return get();
}

/**
 * Fallback to migrate from old un-namespaced keys (dl_history, app settings)
 */
function migrateFromOld() {
  const state = { ...DEFAULT_STATE };
  
  try {
    // Attempt to migrate old dl_history
    const oldHistory = localStorage.getItem('dl_history');
    if (oldHistory) {
      state.searchHistory = JSON.parse(oldHistory);
      state.wordsSearchedCount = state.searchHistory.length;
    }
    
    // Attempt to migrate old settings
    const oldSettings = localStorage.getItem('dl_settings');
    if (oldSettings) {
      const parsed = JSON.parse(oldSettings);
      if (parsed.difficulty) state.level = parsed.difficulty;
      if (parsed.nativeLang) state.uiLanguage = parsed.nativeLang;
    }
    
    // Save the migrated state immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e) {
    // Ignore migration errors
  }
  
  return state;
}

export function saveToHistory(result) {
  const state = get();
  const history = state.searchHistory.filter(h => h.word !== result.word);
  history.unshift({
    word:            result.word,
    article:         result.article || '',
    nativeTranslation: result.nativeTranslation || '',
    partOfSpeech:    result.partOfSpeech || '',
    timestamp:       Date.now(),
  });
  
  // Cap at 30 items
  const newHistory = history.slice(0, 30);
  
  return update({ 
    searchHistory: newHistory,
    wordsSearchedCount: state.wordsSearchedCount + 1
  });
}
