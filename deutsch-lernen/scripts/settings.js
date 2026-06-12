/**
 * settings.js — Settings persistence module
 * Reads/writes all app configuration to localStorage.
 */

import { get as getProgress, update as updateProgress } from './progress.js';

const KEYS = {
  GEMINI_KEY:    'dl_gemini_key',
  UNSPLASH_KEY:  'dl_unsplash_key',
  SPEECH_RATE:   'dl_speech_rate',
};

/**
 * Load all settings from localStorage and progress.
 */
export function loadSettings() {
  const prog = getProgress();
  return {
    difficulty:   prog.level || null,
    nativeLang:   prog.uiLanguage || null,
    geminiKey:    localStorage.getItem(KEYS.GEMINI_KEY)   || '',
    unsplashKey:  localStorage.getItem(KEYS.UNSPLASH_KEY) || '',
    speechRate:   parseFloat(localStorage.getItem(KEYS.SPEECH_RATE) || '0.9'),
  };
}

/**
 * Save the difficulty level.
 * @param {'initial'|'advanced'} level
 */
export function saveDifficulty(level) {
  updateProgress({ level });
}

/**
 * Save API keys.
 * @param {string} geminiKey
 * @param {string} unsplashKey
 */
export function saveApiKeys(geminiKey, unsplashKey) {
  if (geminiKey.trim()) localStorage.setItem(KEYS.GEMINI_KEY, geminiKey.trim());
  if (unsplashKey.trim()) localStorage.setItem(KEYS.UNSPLASH_KEY, unsplashKey.trim());
}

/**
 * Save speech rate.
 * @param {number} rate
 */
export function saveSpeechRate(rate) {
  localStorage.setItem(KEYS.SPEECH_RATE, String(rate));
}

/**
 * Save detected native language.
 * @param {string} lang - e.g. 'es'
 */
export function saveNativeLang(lang) {
  updateProgress({ uiLanguage: lang });
}

/**
 * Clear all settings (reset).
 */
export function clearSettings() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

/**
 * Check if the app has been initialized (difficulty has been chosen).
 */
export function isInitialized() {
  return !!localStorage.getItem('tolk:progress') || !!localStorage.getItem('dl_difficulty');
}
