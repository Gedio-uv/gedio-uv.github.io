/**
 * grammar.js — Simple, language-aware German grammar reference
 * Shows WHEN to use each case — no example words, just clear rules.
 */

/* ── UI strings per language ── */
const G = {
  en: {
    tabs: ['Cases', 'Articles', 'Verbs', 'Word Order'],
    casesIntro: 'German has 4 grammatical cases. Each one tells you the role a word plays in the sentence.',
    cases: [
      {
        color: 'nom',
        name: 'Nominative',
        fn: 'Subject — who or what does the action',
        when: [
          'The subject performing the verb',
          'After <em>sein</em> (to be): <em>Er ist ein Arzt.</em>',
          'The word answering the question <strong>Who?</strong> (Wer?)',
        ],
        arts: ['der', 'die', 'das', 'die'],
        changed: [false, false, false, false],
      },
      {
        color: 'akk',
        name: 'Accusative',
        fn: 'Direct object — what/whom receives the action',
        when: [
          'The direct object of a verb (answering <strong>What? / Whom?</strong>)',
          'After these prepositions: <em>durch, für, gegen, ohne, um, bis, entlang</em>',
          'Time expressions without preposition: <em>jeden Tag, nächsten Monat</em>',
        ],
        arts: ['den', 'die', 'das', 'die'],
        changed: [true, false, false, false],
        note: '⚡ Only masculine changes: <strong>der → den</strong> &nbsp;/&nbsp; <strong>ein → einen</strong>',
      },
      {
        color: 'dat',
        name: 'Dative',
        fn: 'Indirect object — to/for whom',
        when: [
          'The indirect object (answering <strong>To whom? / For whom?</strong>)',
          'After these prepositions: <em>mit, nach, bei, seit, von, zu, aus, außer, gegenüber, ab</em>',
          'After two-way prepositions when expressing location (where?): <em>in, an, auf, hinter, neben, über, unter, vor, zwischen</em>',
        ],
        arts: ['dem', 'der', 'dem', 'den+n'],
        changed: [true, true, true, true],
        note: '📌 Plural nouns add <strong>-n</strong> in dative: <em>die Kinder → den Kindern</em>',
      },
      {
        color: 'gen',
        name: 'Genitive',
        fn: 'Possession — of, whose',
        when: [
          'Showing possession (equivalent to <strong>\'s</strong> or <strong>of</strong>)',
          'After prepositions: <em>wegen, trotz, während, anstatt, aufgrund, innerhalb</em>',
          'Masculine/neuter nouns add <strong>-s</strong> or <strong>-es</strong>',
        ],
        arts: ['des', 'der', 'des', 'der'],
        changed: [true, true, true, true],
        note: '💡 In spoken German, Dative often replaces Genitive informally',
      },
    ],
    artIntro: 'German articles change by case, gender, and number.',
    defArtTitle: 'Definite Article (the)',
    indefArtTitle: 'Indefinite Article (a / an)',
    artNote: 'Values <span class="changed">highlighted in gold</span> differ from the Nominative.',
    colHeaders: ['Case', 'Masc.', 'Fem.', 'Neut.', 'Plural'],
    caseShortNames: ['Nom', 'Akk', 'Dat', 'Gen'],
    verbIntro: 'Master <em>sein</em> and <em>haben</em> first — they form the basis of all German tenses.',
    verbSein: 'sein (to be)',
    verbHaben: 'haben (to have)',
    verbReg: 'Regular verbs: machen (to make / to do)',
    verbRegNote: 'Pattern: drop <em>-en</em>, add endings <strong>-e · -st · -t · -en · -t · -en</strong>',
    pronouns: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
    seinForms:  ['bin','bist','ist','sind','seid','sind'],
    seinNative: ['I am','you are','he/she/it is','we are','you (pl.) are','they/you (formal) are'],
    habenForms:  ['habe','hast','hat','haben','habt','haben'],
    habenNative: ['I have','you have','he/she/it has','we have','you (pl.) have','they/you (formal) have'],
    machenForms:  ['mache','machst','macht','machen','macht','machen'],
    machenNative: ['I make','you make','he/she makes','we make','you (pl.) make','they/you (formal) make'],
    orderIntro: 'Word order in German follows strict rules. The most important: <strong>the verb always comes second</strong>.',
    orderRules: [
      {
        badge: 'V2 Rule', badgeColor: '',
        desc: 'The conjugated verb always occupies <strong>position 2</strong> in a main clause.',
        examples: [
          { slots: ['Ich', 'lerne', 'Deutsch.'], native: 'I learn German.' },
          { slots: ['Heute', 'lerne', 'ich Deutsch.'], native: "Today I learn German. (subject shifts, verb doesn't)" },
        ],
      },
      {
        badge: 'Questions', badgeColor: 'order-badge--orange',
        desc: 'Yes/No: verb first. W-questions: W-word then verb.',
        examples: [
          { slots: ['Lernst', 'du Deutsch?'], native: 'Do you learn German?' },
          { slots: ['Was', 'lernst', 'du?'], native: 'What do you learn?' },
        ],
      },
      {
        badge: 'Subordinate clauses', badgeColor: 'order-badge--green',
        desc: 'Conjunctions push the verb to the <strong>very end</strong>.',
        examples: [
          { slots: ['Ich weiß, dass er Deutsch', 'lernt.'], native: 'I know that he learns German.' },
        ],
        note: 'Common conjunctions: <em>dass, weil, wenn, ob, obwohl, damit, weil</em>',
      },
    ],
    wWords: '📌 W-words: <em>Wer</em> (who) · <em>Was</em> (what) · <em>Wo</em> (where) · <em>Wann</em> (when) · <em>Wie</em> (how) · <em>Warum</em> (why)',
  },

  es: {
    tabs: ['Casos', 'Artículos', 'Verbos', 'Orden'],
    casesIntro: 'El alemán tiene 4 casos gramaticales. Cada uno indica el rol de una palabra en la oración.',
    cases: [
      {
        color: 'nom', name: 'Nominativ', fn: 'Sujeto — quién realiza la acción',
        when: ['El sujeto que realiza el verbo', 'Después de <em>sein</em> (ser/estar): <em>Er ist ein Arzt.</em>', 'La palabra que responde a <strong>¿Quién?</strong> (Wer?)'],
        arts: ['der','die','das','die'], changed: [false,false,false,false],
      },
      {
        color: 'akk', name: 'Akkusativ', fn: 'Objeto directo — qué / a quién recibe la acción',
        when: ['Objeto directo del verbo (responde a <strong>¿Qué? / ¿A quién?</strong>)', 'Después de: <em>durch, für, gegen, ohne, um, bis, entlang</em>', 'Expresiones de tiempo sin preposición: <em>jeden Tag, nächsten Monat</em>'],
        arts: ['den','die','das','die'], changed: [true,false,false,false],
        note: '⚡ Solo cambia el masculino: <strong>der → den</strong> / <strong>ein → einen</strong>',
      },
      {
        color: 'dat', name: 'Dativ', fn: 'Objeto indirecto — a quién / para quién',
        when: ['Objeto indirecto (responde a <strong>¿A quién? / ¿Para quién?</strong>)', 'Después de: <em>mit, nach, bei, seit, von, zu, aus, außer, gegenüber, ab</em>', 'Con preposiciones de dos vías cuando indica ubicación (¿dónde?): <em>in, an, auf, hinter, neben, über, unter, vor, zwischen</em>'],
        arts: ['dem','der','dem','den+n'], changed: [true,true,true,true],
        note: '📌 Los sustantivos en plural añaden <strong>-n</strong> en dativo: <em>die Kinder → den Kindern</em>',
      },
      {
        color: 'gen', name: 'Genitiv', fn: 'Posesión — de, cuyo',
        when: ['Indica pertenencia (equivale a <strong>de</strong> en español)', 'Después de: <em>wegen, trotz, während, anstatt, aufgrund, innerhalb</em>', 'Sustantivos masculinos/neutros añaden <strong>-s</strong> o <strong>-es</strong>'],
        arts: ['des','der','des','der'], changed: [true,true,true,true],
        note: '💡 En alemán hablado, el Dativ reemplaza frecuentemente al Genitiv de forma informal',
      },
    ],
    artIntro: 'Los artículos en alemán cambian según el caso, género y número.',
    defArtTitle: 'Artículo Definido (el/la/los/las)',
    indefArtTitle: 'Artículo Indefinido (un/una)',
    artNote: 'Los valores <span class="changed">en dorado</span> cambian respecto al Nominativ.',
    colHeaders: ['Caso','Masc.','Fem.','Neut.','Plural'],
    caseShortNames: ['Nom','Akk','Dat','Gen'],
    verbIntro: 'Aprende primero <em>sein</em> y <em>haben</em> — son la base de todos los tiempos verbales en alemán.',
    verbSein: 'sein (ser / estar)',
    verbHaben: 'haben (tener)',
    verbReg: 'Verbos regulares: machen (hacer)',
    verbRegNote: 'Patrón: quita <em>-en</em>, añade <strong>-e · -st · -t · -en · -t · -en</strong>',
    pronouns: ['ich','du','er/sie/es','wir','ihr','sie/Sie'],
    seinForms:  ['bin','bist','ist','sind','seid','sind'],
    seinNative: ['yo soy/estoy','tú eres/estás','él/ella es/está','nosotros somos','vosotros sois','ellos son / Usted es'],
    habenForms:  ['habe','hast','hat','haben','habt','haben'],
    habenNative: ['yo tengo','tú tienes','él/ella tiene','nosotros tenemos','vosotros tenéis','ellos tienen / Usted tiene'],
    machenForms:  ['mache','machst','macht','machen','macht','machen'],
    machenNative: ['yo hago','tú haces','él/ella hace','nosotros hacemos','vosotros hacéis','ellos hacen / Usted hace'],
    orderIntro: 'El orden de palabras en alemán sigue reglas estrictas. La más importante: <strong>el verbo siempre ocupa la 2ª posición</strong>.',
    orderRules: [
      {
        badge: 'Regla V2', badgeColor: '',
        desc: 'El verbo conjugado siempre ocupa la <strong>posición 2</strong> en una oración principal.',
        examples: [
          { slots: ['Ich','lerne','Deutsch.'], native: 'Yo aprendo alemán.' },
          { slots: ['Heute','lerne','ich Deutsch.'], native: 'Hoy aprendo alemán. (el sujeto se mueve, el verbo no)' },
        ],
      },
      {
        badge: 'Preguntas', badgeColor: 'order-badge--orange',
        desc: 'Sí/No: verbo primero. W-Fragen: palabra W luego verbo.',
        examples: [
          { slots: ['Lernst','du Deutsch?'], native: '¿Aprendes alemán?' },
          { slots: ['Was','lernst','du?'], native: '¿Qué aprendes?' },
        ],
      },
      {
        badge: 'Subordinadas', badgeColor: 'order-badge--green',
        desc: 'Las conjunciones envían el verbo al <strong>final</strong>.',
        examples: [
          { slots: ['Ich weiß, dass er Deutsch','lernt.'], native: 'Sé que él aprende alemán.' },
        ],
        note: 'Conjunciones comunes: <em>dass, weil, wenn, ob, obwohl, damit</em>',
      },
    ],
    wWords: '📌 Palabras W: <em>Wer</em> (quién) · <em>Was</em> (qué) · <em>Wo</em> (dónde) · <em>Wann</em> (cuándo) · <em>Wie</em> (cómo) · <em>Warum</em> (por qué)',
  },
};

// Fallback for unsupported languages → English grammar tables
['pt','fr','it','zh','ja','ko','ru','tr','pl'].forEach(l => { G[l] = G['en']; });
G['de'] = { ...G['en'],
  tabs: ['Fälle','Artikel','Verben','Wortstellung'],
  casesIntro: 'Das Deutsche hat 4 grammatische Fälle, die die Rolle jedes Worts im Satz bestimmen.',
  artIntro: 'Deutsche Artikel ändern sich je nach Fall, Genus und Numerus.',
  defArtTitle: 'Bestimmter Artikel (der/die/das)',
  indefArtTitle: 'Unbestimmter Artikel (ein/eine)',
  artNote: 'Werte <span class="changed">in Gold</span> ändern sich gegenüber dem Nominativ.',
  colHeaders: ['Fall','Mask.','Fem.','Neutr.','Plural'],
  caseShortNames: ['Nom','Akk','Dat','Gen'],
  verbIntro: 'Lerne zuerst <em>sein</em> und <em>haben</em> — sie bilden die Grundlage aller deutschen Zeitformen.',
};

/* ── HTML helpers ── */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function buildCasesPanel(g) {
  const defArts = [
    ['der','die','das','die'],
    ['den','die','das','die'],
    ['dem','der','dem','den'],
    ['des','der','des','der'],
  ];
  const defChanged = [
    [false,false,false,false],
    [true,false,false,false],
    [true,true,true,true],
    [true,true,true,true],
  ];

  return `<p class="grammar-intro">${g.casesIntro}</p>
  ${g.cases.map((c,i) => `
    <div class="case-card case-card--${c.color}">
      <div class="case-card__header">
        <span class="case-badge case-badge--${c.color}">${c.name}</span>
        <span class="case-card__function">${c.fn}</span>
      </div>
      <ul class="case-when-list">
        ${c.when.map(w => `<li>${w}</li>`).join('')}
      </ul>
      <div class="case-articles">
        ${defArts[i].map((a,j) => `<span class="case-art${defChanged[i][j]?' case-art--changed':''}">${a}</span>`).join('')}
      </div>
      ${c.note ? `<p class="case-card__note">${c.note}</p>` : ''}
    </div>`).join('')}`;
}

function buildArticlesPanel(g) {
  const def = [
    ['der','die','das','die'],
    ['den','die','das','die'],
    ['dem','der','dem','den'],
    ['des','der','des','der'],
  ];
  const indef = [
    ['ein','eine','ein','–'],
    ['einen','eine','ein','–'],
    ['einem','einer','einem','–'],
    ['eines','einer','eines','–'],
  ];
  const defCh = [
    [false,false,false,false],[true,false,false,false],
    [true,true,true,true],[true,true,true,true],
  ];
  const indefCh = [
    [false,false,false,false],[true,false,false,false],
    [true,true,true,false],[true,true,true,false],
  ];
  const cases = ['nom','akk','dat','gen'];

  function table(rows, changed, title) {
    return `<h3 class="grammar-table-title">${title}</h3>
    <div class="grammar-table-wrap">
      <table class="grammar-table">
        <thead><tr>${g.colHeaders.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map((row,i)=>`<tr class="row-${cases[i]}">
            <td><span class="case-badge case-badge--${cases[i]} case-badge--sm">${g.caseShortNames[i]}</span></td>
            ${row.map((v,j)=>`<td${changed[i][j]?' class="changed"':''}>${v}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  return `<p class="grammar-intro">${g.artIntro}</p>
    ${table(def, defCh, g.defArtTitle)}
    ${table(indef, indefCh, g.indefArtTitle)}
    <div class="grammar-tip"><span class="grammar-tip__icon">💡</span><p>${g.artNote}</p></div>`;
}

function buildVerbsPanel(g) {
  function verbCard(name, forms, native) {
    return `<div class="verb-card">
      <div class="verb-card__header"><h3 class="verb-card__name">${name}</h3></div>
      <div class="verb-conjugation">
        ${g.pronouns.map((p,i)=>`<div class="verb-row">
          <span class="verb-pronoun">${p}</span>
          <span class="verb-form">${forms[i]}</span>
          <span class="verb-native">${native[i]}</span>
        </div>`).join('')}
      </div>
    </div>`;
  }

  const machenColored = ['e','st','t','en','t','en'].map((s,i) => `mach<em>${s}</em>`);

  return `<p class="grammar-intro">${g.verbIntro}</p>
    ${verbCard(g.verbSein, g.seinForms, g.seinNative)}
    ${verbCard(g.verbHaben, g.habenForms, g.habenNative)}
    <div class="verb-card">
      <div class="verb-card__header"><h3 class="verb-card__name">${g.verbReg}</h3></div>
      <div class="verb-conjugation">
        ${g.pronouns.map((p,i)=>`<div class="verb-row">
          <span class="verb-pronoun">${p}</span>
          <span class="verb-form">${machenColored[i]}</span>
          <span class="verb-native">${g.machenNative[i]}</span>
        </div>`).join('')}
      </div>
      <p class="verb-card__note">${g.verbRegNote}</p>
    </div>`;
}

function buildOrderPanel(g) {
  return `<p class="grammar-intro">${g.orderIntro}</p>
  ${g.orderRules.map(rule => `
    <div class="order-rule">
      <div class="order-rule__label">
        <span class="order-badge ${rule.badgeColor}">${rule.badge}</span>
        <span>${rule.desc}</span>
      </div>
      <div class="order-examples">
        ${rule.examples.map(ex => `
          <div class="order-ex">
            <div class="order-ex__slots">
              ${ex.slots.map((t,i) => {
                const n = ex.slots.length;
                let cls;
                if (n === 3) cls = i===0?'slot slot--1':i===1?'slot slot--v':'slot slot--3';
                else         cls = i===0?'slot slot--v':'slot slot--3';
                return `<span class="${cls}">${esc(t)}</span>`;
              }).join('')}
            </div>
            <p class="order-ex__native">${ex.native}</p>
          </div>`).join('')}
      </div>
      ${rule.note ? `<p class="order-rule__note">${rule.note}</p>` : ''}
    </div>`).join('')}
  <div class="grammar-tip"><span class="grammar-tip__icon">📌</span><p>${g.wWords}</p></div>`;
}

const PANELS = ['cases','articles','verbs','order'];
const BUILDERS = [buildCasesPanel, buildArticlesPanel, buildVerbsPanel, buildOrderPanel];

/**
 * Render the grammar view.
 * @param {string} lang - native language code (en, es, pt, fr, it, de)
 */
export function renderGrammarView(lang) {
  const g = G[lang] || G['en'];

  // Tabs
  const tabsBar = document.getElementById('grammar-tabs-bar');
  if (tabsBar) {
    tabsBar.innerHTML = PANELS.map((key,i) =>
      `<button class="grammar-tab${i===0?' active':''}" data-gtab="${key}" role="tab" aria-selected="${i===0}">${g.tabs[i]}</button>`
    ).join('');

    tabsBar.querySelectorAll('.grammar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsBar.querySelectorAll('.grammar-tab').forEach(t => {
          t.classList.remove('active'); t.setAttribute('aria-selected','false');
        });
        document.querySelectorAll('.grammar-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected','true');
        document.getElementById(`gtab-${tab.dataset.gtab}`)?.classList.add('active');
      });
    });
  }

  // Content
  const wrap = document.getElementById('grammar-content');
  if (!wrap) return;

  wrap.innerHTML = PANELS.map((key,i) =>
    `<div id="gtab-${key}" class="grammar-panel${i===0?' active':''}" role="tabpanel">
      ${BUILDERS[i](g)}
    </div>`
  ).join('');
}
