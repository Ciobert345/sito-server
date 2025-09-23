onst fs = require('fs');
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors() };
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const store = getStore({ name: 'config-store' });
    let text = await store.get('config.json', { type: 'text' });
    if (!text) {
      text = fs.readFileSync('config.json', 'utf8'); // fallback primo deploy
      await store.set('config.json', text, { contentType: 'application/json' });
    }
    return { statusCode: 200, headers: { ...cors(), 'Content-Type': 'application/json' }, body: text };
  } catch (e) {
    return { statusCode: 500, headers: cors(), body: `Errore: ${e.message}` };
  }
};

function cors() { return {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}; }
