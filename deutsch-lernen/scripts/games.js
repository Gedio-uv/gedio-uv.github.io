/**
 * games.js — Games Hub orchestrator
 * Manages the Games view, switching between the hub menu and specific games.
 */

import { get as getProgress } from './progress.js';
import { loadSettings } from './settings.js';
import { callAI } from './search.js';
import { fetchImage } from './images.js';

export function initGames() {
  const gamesHub = document.getElementById('games-hub');
  if (!gamesHub) return;

  const gameCards = gamesHub.querySelectorAll('.game-card');
  const backBtns = document.querySelectorAll('.game-back-btn');
  const gameAreas = document.querySelectorAll('.game-area');

  // Open specific game
  gameCards.forEach(card => {
    card.addEventListener('click', () => {
      const gameId = card.dataset.game;
      if (!gameId) return;

      // Hide hub
      gamesHub.classList.add('hidden');
      
      // Hide all game areas, then show the target one
      gameAreas.forEach(area => area.classList.add('hidden'));
      const targetArea = document.getElementById(`game-area-${gameId}`);
      if (targetArea) {
        targetArea.classList.remove('hidden');
      }

      // Initialize the chosen game
      if (gameId === 'quiz') startQuiz();
      else if (gameId === 'wasistdas') startWasIstDas();
      else if (gameId === 'correct') startCorrect();
      else if (gameId === 'hangman') startHangman();
      else if (gameId === 'sentencetype') startSentenceType();
      else if (gameId === 'alphabet') startAlphabet();
    });
  });

  // Back button handling
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gameAreas.forEach(area => area.classList.add('hidden'));
      gamesHub.classList.remove('hidden');
    });
  });
}

function getWords(count = 5) {
  const hist = getProgress().searchHistory || [];
  
  // A large pool of default words so games are never repetitive
  const defaultWords = [
    { word: 'Hund', nativeTranslation: 'Dog' }, { word: 'Katze', nativeTranslation: 'Cat' },
    { word: 'Haus', nativeTranslation: 'House' }, { word: 'Wasser', nativeTranslation: 'Water' },
    { word: 'Apfel', nativeTranslation: 'Apple' }, { word: 'Brot', nativeTranslation: 'Bread' },
    { word: 'Käse', nativeTranslation: 'Cheese' }, { word: 'Milch', nativeTranslation: 'Milk' },
    { word: 'Buch', nativeTranslation: 'Book' }, { word: 'Tisch', nativeTranslation: 'Table' },
    { word: 'Stuhl', nativeTranslation: 'Chair' }, { word: 'Fenster', nativeTranslation: 'Window' },
    { word: 'Tür', nativeTranslation: 'Door' }, { word: 'Auto', nativeTranslation: 'Car' },
    { word: 'Fahrrad', nativeTranslation: 'Bicycle' }, { word: 'Zug', nativeTranslation: 'Train' },
    { word: 'Flugzeug', nativeTranslation: 'Airplane' }, { word: 'Baum', nativeTranslation: 'Tree' },
    { word: 'Blume', nativeTranslation: 'Flower' }, { word: 'Sonne', nativeTranslation: 'Sun' },
    { word: 'Mond', nativeTranslation: 'Moon' }, { word: 'Stern', nativeTranslation: 'Star' },
    { word: 'Stadt', nativeTranslation: 'City' }, { word: 'Straße', nativeTranslation: 'Street' },
    { word: 'Schule', nativeTranslation: 'School' }, { word: 'Arbeit', nativeTranslation: 'Work' },
    { word: 'Freund', nativeTranslation: 'Friend' }, { word: 'Familie', nativeTranslation: 'Family' },
    { word: 'Mutter', nativeTranslation: 'Mother' }, { word: 'Vater', nativeTranslation: 'Father' },
    { word: 'Kind', nativeTranslation: 'Child' }, { word: 'Geld', nativeTranslation: 'Money' },
    { word: 'Zeit', nativeTranslation: 'Time' }, { word: 'Uhr', nativeTranslation: 'Clock/Watch' },
    { word: 'Essen', nativeTranslation: 'Food' }, { word: 'Trinken', nativeTranslation: 'Drink' },
    { word: 'Fleisch', nativeTranslation: 'Meat' }, { word: 'Gemüse', nativeTranslation: 'Vegetable' },
    { word: 'Obst', nativeTranslation: 'Fruit' }, { word: 'Kaffee', nativeTranslation: 'Coffee' },
    { word: 'Tee', nativeTranslation: 'Tea' }, { word: 'Bier', nativeTranslation: 'Beer' },
    { word: 'Wein', nativeTranslation: 'Wine' }, { word: 'Schuh', nativeTranslation: 'Shoe' },
    { word: 'Hemd', nativeTranslation: 'Shirt' }, { word: 'Hose', nativeTranslation: 'Pants' },
    { word: 'Kleid', nativeTranslation: 'Dress' }, { word: 'Mantel', nativeTranslation: 'Coat' },
    { word: 'Hut', nativeTranslation: 'Hat' }, { word: 'Tasche', nativeTranslation: 'Bag' },
    { word: 'Brille', nativeTranslation: 'Glasses' }, { word: 'Kopf', nativeTranslation: 'Head' },
    { word: 'Hand', nativeTranslation: 'Hand' }, { word: 'Fuß', nativeTranslation: 'Foot' },
    { word: 'Auge', nativeTranslation: 'Eye' }, { word: 'Ohr', nativeTranslation: 'Ear' }
  ];

  // Combine history and defaults, ensuring variety
  let allWords = [...hist, ...defaultWords];

  // Clean words: strip leading articles (der, die, das, ein, eine) so games don't include them
  allWords = allWords.map(w => {
    let cleanWord = w.word.replace(/^(der|die|das|ein|eine)\s+/i, '').trim();
    return { ...w, word: cleanWord };
  });

  // Deduplicate by word
  const seen = new Set();
  const uniqueWords = [];
  for (const w of allWords) {
    const lower = w.word.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueWords.push(w);
    }
  }

  // Return requested count, randomized
  return uniqueWords.sort(() => 0.5 - Math.random()).slice(0, count);
}

// ================= QUIZ =================
function startQuiz() {
  const words = getWords(50);
  let currentQ = 0;
  let score = 0;
  
  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const progressEl = document.getElementById('quiz-progress');
  const resultEl = document.getElementById('quiz-result');
  const quizInner = document.getElementById('music-quiz');

  resultEl.classList.add('hidden');
  resultEl.innerHTML = '';
  optionsEl.classList.remove('hidden');
  questionEl.classList.remove('hidden');

  function renderQ() {
    if (currentQ >= words.length) {
      // Quiz over
      questionEl.classList.add('hidden');
      optionsEl.classList.add('hidden');
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `<h4>Quiz Completed!</h4><p>Score: ${score} / ${words.length}</p>`;
      return;
    }
    const currentWord = words[currentQ];
    progressEl.textContent = `${currentQ + 1} / ${words.length}`;
    questionEl.textContent = `What is the meaning of "${currentWord.word}"?`;

    // generate options
    let otherWords = getWords(8).filter(w => w.word !== currentWord.word);
    let options = [currentWord, ...otherWords.slice(0, 3)].sort(() => 0.5 - Math.random());
    
    optionsEl.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'music-quiz__option';
      btn.textContent = opt.nativeTranslation || opt.word;
      btn.onclick = () => {
        if (opt.word === currentWord.word) score++;
        currentQ++;
        renderQ();
      };
      optionsEl.appendChild(btn);
    });
  }

  if (words.length === 0) {
    questionEl.textContent = "Not enough words to play. Search some words first!";
    optionsEl.innerHTML = '';
    progressEl.textContent = '0 / 0';
  } else {
    renderQ();
  }
}

// ================= WAS IST DAS =================
async function startWasIstDas() {
  const area = document.getElementById('game-area-wasistdas');
  const words = getWords(4);
  const target = words[0];
  
  let html = `
    <div style="text-align: center; margin-top: 16px;">
      <h3 style="margin-bottom: 16px; color: var(--c-text-1);">Was ist das?</h3>
      <div id="wasistdas-img-container" style="width: 100%; height: 200px; border-radius: 12px; background: var(--c-surface-2); margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
        <span class="loader"><span class="loader__dot"></span><span class="loader__dot"></span><span class="loader__dot"></span></span>
      </div>
      <div id="wasistdas-options" style="display: flex; flex-direction: column; gap: 8px;"></div>
      <div id="wasistdas-result" style="margin-top: 16px; font-weight: bold; min-height: 24px;"></div>
    </div>
  `;
  
  // Only inject the dynamic content, not the back button which is already there
  let container = area.querySelector('.game-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'game-container';
    area.appendChild(container);
  }
  container.innerHTML = html;

  const imgContainer = document.getElementById('wasistdas-img-container');
  const optionsEl = document.getElementById('wasistdas-options');
  const resultEl = document.getElementById('wasistdas-result');

  // Fetch image
  const imgUrl = await fetchImage(target.word, loadSettings().unsplashKey);
  if (imgUrl) {
    imgContainer.innerHTML = `<img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
  } else {
    imgContainer.innerHTML = `<span>(Image not found for ${target.word})</span>`;
  }

  // Options
  let options = [...words].sort(() => 0.5 - Math.random());
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'music-quiz__option';
    btn.textContent = opt.word;
    btn.onclick = () => {
      if (opt.word === target.word) {
        btn.style.borderColor = 'green';
        resultEl.textContent = 'Richtig! (Correct)';
        resultEl.style.color = 'green';
        setTimeout(startWasIstDas, 1500);
      } else {
        btn.style.borderColor = 'red';
        resultEl.textContent = 'Falsch! (Wrong)';
        resultEl.style.color = 'red';
      }
    };
    optionsEl.appendChild(btn);
  });
}

// ================= CORRECT THE SENTENCE =================
async function startCorrect() {
  const area = document.getElementById('game-area-correct');
  
  let container = area.querySelector('.game-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'game-container';
    area.appendChild(container);
  }
  
  container.innerHTML = `
    <div style="text-align: center; margin-top: 16px;">
      <h3 style="margin-bottom: 8px; color: var(--c-text-1);">Correct the Sentence</h3>
      <p style="color: var(--c-text-2); margin-bottom: 16px; font-size: 14px;">Find and fix the grammar error.</p>
      
      <div id="correct-loading" style="padding: 24px;">
        <span class="loader"><span class="loader__dot"></span><span class="loader__dot"></span><span class="loader__dot"></span></span>
      </div>

      <div id="correct-game" class="hidden">
        <div id="correct-sentence" style="font-size: 18px; margin-bottom: 16px; padding: 16px; background: var(--c-surface-2); border-radius: 8px;"></div>
        <input type="text" id="correct-input" class="search-bar__input" style="width: 100%; margin-bottom: 16px; padding: 12px; background: var(--c-surface-2); border: 1px solid var(--c-border); color: white; border-radius: 8px;" autocomplete="off" spellcheck="false" />
        <button id="correct-submit" class="btn-primary" style="width: 100%;">Check</button>
        <div id="correct-result" style="margin-top: 16px; font-weight: bold; min-height: 24px;"></div>
        <button id="correct-next" class="btn-secondary hidden" style="width: 100%; margin-top: 8px;">Next</button>
      </div>
    </div>
  `;

  const loading = document.getElementById('correct-loading');
  const game = document.getElementById('correct-game');
  const sentenceEl = document.getElementById('correct-sentence');
  const inputEl = document.getElementById('correct-input');
  const submitBtn = document.getElementById('correct-submit');
  const resultEl = document.getElementById('correct-result');
  const nextBtn = document.getElementById('correct-next');

  // Request AI
  const prompt = `Return a JSON object with two fields: "wrong" containing a very simple German sentence with exactly one basic grammatical or spelling error, and "correct" containing the fixed sentence. Example: {"wrong":"Ich bin Hunger", "correct":"Ich habe Hunger"}. Output ONLY raw JSON, no markdown.`;
  
  try {
    const raw = await callAI(loadSettings().geminiKey, prompt);
    const data = JSON.parse(raw);
    
    loading.classList.add('hidden');
    game.classList.remove('hidden');
    
    sentenceEl.textContent = data.wrong;
    inputEl.value = data.wrong;
    
    submitBtn.onclick = () => {
      const val = inputEl.value.trim();
      if (val === data.correct) {
        resultEl.textContent = 'Excellent!';
        resultEl.style.color = 'green';
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
      } else {
        resultEl.textContent = 'Not quite. Try again!';
        resultEl.style.color = 'red';
      }
    };
    
    nextBtn.onclick = startCorrect;
    
  } catch (err) {
    loading.innerHTML = `<p style="color:red">Failed to generate sentence. Please try again.</p>`;
  }
}

// ================= HANGMAN =================
function startHangman() {
  const area = document.getElementById('game-area-hangman');
  const words = getWords(1);
  const word = words[0].word.toUpperCase();
  let guesses = [];
  let mistakes = 0;
  const maxMistakes = 6;
  
  let container = area.querySelector('.game-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'game-container';
    area.appendChild(container);
  }
  
  function render() {
    let wordDisplay = word.split('').map(char => {
      if (!char.match(/[A-ZÄÖÜß]/)) return char;
      return guesses.includes(char) ? char : '_';
    }).join(' ');

    const isWon = !wordDisplay.includes('_');
    const isLost = mistakes >= maxMistakes;

    let keyboardHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß'.split('').map(char => {
      const isGuessed = guesses.includes(char);
      return `<button class="hangman-key" style="padding: 8px; margin: 2px; border-radius: 4px; background: var(--c-surface-3); border: none; color: white; cursor: pointer; opacity: ${isGuessed ? 0.5 : 1}" ${isGuessed || isWon || isLost ? 'disabled' : ''} data-char="${char}">${char}</button>`;
    }).join('');

    container.innerHTML = `
      <div style="text-align: center; margin-top: 16px;">
        <h3 style="margin-bottom: 8px; color: var(--c-text-1);">Hangman</h3>
        <p style="color: var(--c-text-2); margin-bottom: 16px; font-size: 14px;">${words[0].nativeTranslation || 'Guess the word'}</p>
        
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin-bottom: 24px;">
          ${wordDisplay}
        </div>
        
        <div style="margin-bottom: 16px; color: ${isLost ? 'red' : 'var(--c-text-2)'}">
          Mistakes: ${mistakes} / ${maxMistakes}
        </div>
        
        ${isWon ? `<div style="color: green; font-weight: bold; margin-bottom: 16px;">You won!</div>` : ''}
        ${isLost ? `<div style="color: red; font-weight: bold; margin-bottom: 16px;">Game Over. The word was ${word}.</div>` : ''}
        
        <div style="display: flex; flex-wrap: wrap; justify-content: center; max-width: 300px; margin: 0 auto;">
          ${keyboardHTML}
        </div>
        
        ${isWon || isLost ? `<button id="hangman-next" class="btn-primary" style="margin-top: 24px;">Next Word</button>` : ''}
      </div>
    `;

    container.querySelectorAll('.hangman-key').forEach(btn => {
      btn.onclick = () => {
        const char = btn.dataset.char;
        if (!guesses.includes(char)) {
          guesses.push(char);
          if (!word.includes(char)) mistakes++;
          render();
        }
      };
    });

    const nextBtn = document.getElementById('hangman-next');
    if (nextBtn) nextBtn.onclick = startHangman;
  }
  
  render();
}

// ================= SENTENCE TYPE =================
export function startSentenceType() {
  const sentences = [
    { text: "Ich gebe ____ Mann das Buch.", missing: "dem", case: "Dativ" },
    { text: "Wir sehen ____ Hund im Park.", missing: "den", case: "Akkusativ" },
    { text: "____ Auto ist rot.", missing: "Das", case: "Nominativ" },
    { text: "Das Haus ____ Vaters ist groß.", missing: "des", case: "Genitiv" },
    { text: "Sie hilft ____ Kind.", missing: "dem", case: "Dativ" },
    { text: "Er kauft ____ Blume für sie.", missing: "die", case: "Akkusativ" },
    { text: "____ Frau singt ein Lied.", missing: "Die", case: "Nominativ" },
    { text: "Die Farbe ____ Kleides ist schön.", missing: "des", case: "Genitiv" },
    { text: "Ich danke ____ Freund.", missing: "dem", case: "Dativ" },
    { text: "Wir brauchen ____ Schlüssel.", missing: "den", case: "Akkusativ" }
  ].sort(() => 0.5 - Math.random());
  
  let currentQ = 0;
  let score = 0;
  
  const questionEl = document.getElementById('sentencetype-question');
  const optionsEl = document.getElementById('sentencetype-options');
  const resultEl = document.getElementById('sentencetype-result');
  const nextBtn = document.getElementById('sentencetype-next');
  const progressEl = document.getElementById('sentencetype-progress');
  
  resultEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  
  function renderQ() {
    if (currentQ >= sentences.length) {
      questionEl.innerHTML = "Spiel beendet!";
      optionsEl.classList.add('hidden');
      nextBtn.classList.add('hidden');
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `Dein Score: ${score} / ${sentences.length}`;
      return;
    }
    
    optionsEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    const s = sentences[currentQ];
    progressEl.textContent = `Score: ${score}`;
    questionEl.innerHTML = s.text.replace('____', '<strong>____</strong>');
    
    Array.from(optionsEl.children).forEach(btn => {
      btn.disabled = false;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.onclick = () => {
        // Disable all
        Array.from(optionsEl.children).forEach(b => b.disabled = true);
        const selected = btn.dataset.case;
        if (selected === s.case) {
          btn.style.background = 'rgba(34, 197, 94, 0.2)';
          btn.style.borderColor = '#22c55e';
          score++;
          resultEl.innerHTML = `<span style="color:#22c55e">Richtig!</span> Das fehlende Wort ist "<strong>${s.missing}</strong>".`;
        } else {
          btn.style.background = 'rgba(239, 68, 68, 0.2)';
          btn.style.borderColor = '#ef4444';
          // Find correct
          const correctBtn = Array.from(optionsEl.children).find(b => b.dataset.case === s.case);
          if (correctBtn) {
            correctBtn.style.background = 'rgba(34, 197, 94, 0.2)';
            correctBtn.style.borderColor = '#22c55e';
          }
          resultEl.innerHTML = `<span style="color:#ef4444">Falsch!</span> Es ist <strong>${s.case}</strong> ("${s.missing}").`;
        }
        progressEl.textContent = `Score: ${score}`;
        resultEl.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
      };
    });
  }
  
  nextBtn.onclick = () => {
    currentQ++;
    renderQ();
  };
  
  renderQ();
}

// ================= ALPHABET SPIEL =================
let alphabetInterval = null;
export function startAlphabet() {
  const setupEl = document.getElementById('alphabet-setup');
  const gameplayEl = document.getElementById('alphabet-gameplay');
  const gameoverEl = document.getElementById('alphabet-gameover');
  
  setupEl.classList.remove('hidden');
  gameplayEl.classList.add('hidden');
  gameoverEl.classList.add('hidden');
  
  if (alphabetInterval) clearInterval(alphabetInterval);
  
  document.getElementById('alphabet-start-btn').onclick = () => {
    const players = parseInt(document.getElementById('alphabet-players').value) || 2;
    const timeMins = parseInt(document.getElementById('alphabet-time').value) || 5;
    
    setupEl.classList.add('hidden');
    gameplayEl.classList.remove('hidden');
    
    playAlphabetGame(players, timeMins);
  };
}

function playAlphabetGame(numPlayers, timeMins) {
  let timeLeft = timeMins * 60;
  let currentPlayer = 1;
  
  const timerEl = document.getElementById('alphabet-timer');
  const playerEl = document.getElementById('alphabet-player-indicator');
  const wheelEl = document.getElementById('roulette-wheel');
  const nextBtn = document.getElementById('alphabet-next-player-btn');
  
  let availableLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  let currentLetter = "?";
  let isSpinning = false;
  
  function updateTimerUI() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    if (timeLeft <= 10) timerEl.style.color = '#ef4444';
    else timerEl.style.color = 'var(--c-accent)';
  }
  
  function endGame() {
    clearInterval(alphabetInterval);
    document.getElementById('alphabet-gameplay').classList.add('hidden');
    const gameoverEl = document.getElementById('alphabet-gameover');
    gameoverEl.classList.remove('hidden');
    document.getElementById('alphabet-loser-text').textContent = `Spieler ${currentPlayer} hat verloren!`;
  }
  
  alphabetInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
  
  async function spinRoulette() {
    if (availableLetters.length === 0) {
      availableLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    }
    
    isSpinning = true;
    nextBtn.disabled = true;
    wheelEl.style.color = 'rgba(255,255,255,0.5)';
    
    // Spin animation effect
    let spins = 0;
    const spinInterval = setInterval(() => {
      wheelEl.textContent = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*26)];
      wheelEl.style.transform = `rotateY(${spins * 45}deg) scale(1.1)`;
      spins++;
    }, 50);
    
    setTimeout(() => {
      clearInterval(spinInterval);
      const idx = Math.floor(Math.random() * availableLetters.length);
      currentLetter = availableLetters.splice(idx, 1)[0];
      wheelEl.textContent = currentLetter;
      wheelEl.style.transform = `rotateY(0deg) scale(1)`;
      wheelEl.style.color = 'white';
      
      isSpinning = false;
      nextBtn.disabled = false;
    }, 2000); // 2 seconds spin
  }
  
  nextBtn.onclick = () => {
    if (isSpinning) return;
    
    currentPlayer++;
    if (currentPlayer > numPlayers) {
      currentPlayer = 1;
      // Round complete, spin for a new letter
      spinRoulette();
    }
    playerEl.textContent = `Spieler ${currentPlayer}`;
  };
  
  document.getElementById('alphabet-restart-btn').onclick = () => {
    startAlphabet();
  };
  
  updateTimerUI();
  playerEl.textContent = `Spieler 1`;
  spinRoulette();
}
