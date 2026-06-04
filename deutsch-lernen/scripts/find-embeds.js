const https = require('https');

async function searchAndTest(query) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        const matches = data.match(/"videoId":"([^"]+)"/g);
        if (!matches) {
          resolve(`No videos found for ${query}`);
          return;
        }
        
        // Extract unique IDs
        const ids = [...new Set(matches.map(m => m.split(':')[1].replace(/"/g, '')))].slice(0, 10);
        
        console.log(`\nTesting top 10 IDs for: ${query}`);
        for (const id of ids) {
          const isEmbeddable = await checkEmbed(id);
          if (isEmbeddable) {
            console.log(`✅ FOUND EMBEDDABLE: ${id}`);
            return resolve(id);
          } else {
            console.log(`❌ Failed: ${id}`);
          }
        }
        resolve(null);
      });
    }).on('error', (err) => resolve(null));
  });
}

async function checkEmbed(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      // We don't need the body, just the status code
      res.on('data', () => {}); 
      res.on('end', () => {
        resolve(res.statusCode === 200);
      });
    }).on('error', () => resolve(false));
  });
}

async function main() {
  await searchAndTest('Nena 99 Luftballons lyric');
  await searchAndTest('Kraftwerk Autobahn official audio');
  await searchAndTest('Cro Easy lyrics');
}

main();
