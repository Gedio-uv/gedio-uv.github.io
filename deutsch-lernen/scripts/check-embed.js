const https = require('https');

const songs = [
  { artist: 'Nena', title: '99 Luftballons', id: 'La4Dcd1aUcE' },
  { artist: 'Rammstein', title: 'Sonne', id: 'StZcUAPRRac' },
  { artist: 'Kraftwerk', title: 'Autobahn', id: 'iukUNxnC2xw' },
  { artist: 'Peter Fox', title: 'Alles Neu', id: 'qdtLCfEcPL4' },
  { artist: 'Cro', title: 'Easy', id: '8Xz590x0nEU' }
];

async function checkEmbed(song) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${song.id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(`${song.artist} - ${song.title} (${song.id}): EMBEDDABLE`);
        } else {
          resolve(`${song.artist} - ${song.title} (${song.id}): NOT EMBEDDABLE (Status ${res.statusCode})`);
        }
      });
    }).on('error', (err) => {
      resolve(`${song.artist} - ${song.title} (${song.id}): ERROR ${err.message}`);
    });
  });
}

async function main() {
  for (const song of songs) {
    console.log(await checkEmbed(song));
  }
}

main();
