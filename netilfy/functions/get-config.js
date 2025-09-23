import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const store = getStore({ name: 'config-store' });
    let text = await store.get('config.json', { type: 'text' });
    if (!text) {
      text = await fs.readFile('config.json', 'utf8'); // fallback prima pubblicazione
      await store.set('config.json', text, { contentType: 'application/json' });
    }
    return { statusCode: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' }, body: text };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: `Errore: ${e.message}` };
  }
}
function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
