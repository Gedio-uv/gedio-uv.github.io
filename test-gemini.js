import { lookupWord } from './deutsch-lernen/scripts/search.js';

async function test() {
  try {
    const res = await lookupWord('Haus', 'zh', 'Simplified Chinese', '');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
test();
