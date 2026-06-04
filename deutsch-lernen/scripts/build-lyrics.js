const fs = require('fs');
const https = require('https');
const path = require('path');

const songs = [
  {
    videoId: '2oV1KwiTrdM',
    title: '99 Luftballons',
    artist: 'Nena',
    level: 'A2',
    vocabulary: ['Luftballon', 'Horizont', 'singen', 'Krieger', 'fliegen']
  },
  {
    videoId: 'StZcUAPRRac',
    title: 'Sonne',
    artist: 'Rammstein',
    level: 'A1',
    vocabulary: ['Sonne', 'Stern', 'hell', 'kommen', 'alle']
  },
  {
    videoId: 'v0y6oOBZ7Mk',
    title: 'Autobahn',
    artist: 'Kraftwerk',
    level: 'A1',
    vocabulary: ['Autobahn', 'fahren', 'vor', 'Tal', 'Sonne']
  },
  {
    videoId: 'qdtLCfEcPL4',
    title: 'Alles Neu',
    artist: 'Peter Fox',
    level: 'B1',
    vocabulary: ['verbrennen', 'Asche', 'erschlagen', 'vergraben', 'Leben']
  },
  {
    videoId: 'hK-mYC8QQ3A',
    title: 'Easy',
    artist: 'Cro',
    level: 'A2',
    vocabulary: ['Leute', 'sagen', 'wieder', 'außerdem', 'bauen']
  }
];

function fetchLyrics(artist, title) {
  return new Promise((resolve) => {
    https.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.lyrics || '');
        } catch(e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

const hardcodedLyrics = {
  'Cro': `Yeah, ah, na, was geht?
Ich hab's dir doch gesagt
Ich bin immer noch derselbe
Aber alles andere hat sich verändert
Easy, ea-, ea-; ea-, ea-
Easy, ea-, ea-; ea-, ea-
Leute sagen zu mir „Cro das Genie“, denn er flowt wieder wie
Dieser Hova und außerdem baut er die Beats, es ist easy, ea-, ea-; ea-, ea-
Und dieser Typ hier vergleicht sich mit Jay-Z und scheißt auf die Playsi
Denn ich häng' ab mit Rockstars, genauso wie AC—DC, ea-, ea-, ea-, ea-`,
  'Kraftwerk': `Wir fahr'n fahr'n fahr'n auf der Autobahn
Wir fahr'n fahr'n fahr'n auf der Autobahn
Vor uns liegt ein weites Tal
Die Sonne scheint mit Glitzerstrahl
Die Fahrbahn ist ein graues Band
Weiße Streifen, grüner Rand`
};

async function buildMusicJs() {
  const fileContent = [];
  fileContent.push('const YT_SUGGESTIONS = [');

  for (const song of songs) {
    let rawLyrics = await fetchLyrics(song.artist, song.title);
    if (!rawLyrics) {
      rawLyrics = hardcodedLyrics[song.artist] || `${song.title} lyrics not found.`;
    }
    
    // Split by literal newline characters
    const lines = rawLyrics.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    const lyricsArray = lines.map((line, i) => {
      // Just mock timestamps sequentially roughly 3 seconds apart to retain the structure,
      // even if user doesn't care about sync, having incremental timestamps is harmless.
      return `        { line: ${JSON.stringify(line.trim())}, timestamp: ${i * 3} }`;
    }).join(',\n');

    const songBlock = `  {
    videoId: '${song.videoId}',
    title: '${song.title}',
    artist: '${song.artist}',
    level: '${song.level}',
    lyrics: {
      original: [
${lyricsArray}
      ],
      german: [
${lyricsArray}
      ]
    },
    vocabulary: ${JSON.stringify(song.vocabulary)}
  }`;
    fileContent.push(songBlock);
  }
  
  fileContent.push('];');

  // We actually need commas between the song blocks, except the last one!
  // Wait, let's just join the song blocks with ',\n'
  // Actually, fileContent has 'const YT_SUGGESTIONS = [' at index 0, and '];' at the end.
  // The song blocks are from index 1 to fileContent.length - 2.
  const songsJoined = fileContent.slice(1, -1).join(',\n');
  const newArrayBlock = fileContent[0] + '\n' + songsJoined + '\n' + fileContent[fileContent.length - 1];
  
  const targetPath = path.join(__dirname, 'music.js');
  let originalCode = fs.readFileSync(targetPath, 'utf8');
  
  // Replace everything between const YT_SUGGESTIONS = [ ... ];
  const regex = /const YT_SUGGESTIONS = \[[\s\S]*?\];/;
  originalCode = originalCode.replace(regex, newArrayBlock);
  
  fs.writeFileSync(targetPath, originalCode);
  console.log('Successfully updated music.js with full lyrics');
}

buildMusicJs();
