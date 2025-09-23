// netlify/functions/update-config.js
import { getStore } from '@netlify/blobs';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    const store = getStore({ name: 'config-store' });
    await store.set('config.json', JSON.stringify(data, null, 2), { contentType: 'application/json' });
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: `Errore: ${e.message}` };
  }
}
function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
