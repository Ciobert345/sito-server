const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const data = JSON.parse(event.body || '{}');
    const store = getStore({ name: 'config-store' });
    await store.set('config.json', JSON.stringify(data, null, 2), { contentType: 'application/json' });
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: cors(), body: `Errore: ${e.message}` };
  }
};

function cors() { return {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}; }
