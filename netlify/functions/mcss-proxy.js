const https = require('https');
const http = require('http');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, mcss-target-url, mcss-api-key',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: 'OK' };
    }

    const targetUrl = event.headers['mcss-target-url'] || event.headers['MCSS-Target-Url'];
    const apiKey = event.headers['mcss-api-key'] || event.headers['MCSS-Api-Key'];

    if (!targetUrl) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing mcss-target-url header' }) };
    }

    console.log(`[NETLIFY-PROXY] Forwarding ${event.httpMethod} to: ${targetUrl}`);

    return new Promise((resolve) => {
        try {
            const url = new URL(targetUrl);
            const isHttps = url.protocol === 'https:';
            const transport = isHttps ? https : http;

            const options = {
                method: event.httpMethod,
                headers: {
                    'apiKey': apiKey || '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Netlify-Proxy-Bridge/1.0'
                },
                rejectUnauthorized: false, // Bypass self-signed certs
                timeout: 10000
            };

            const req = transport.request(targetUrl, options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    console.log(`[NETLIFY-PROXY] Target responded: ${res.statusCode}`);
                    resolve({
                        statusCode: res.statusCode,
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: data
                    });
                });
            });

            req.on('error', (e) => {
                console.error('[NETLIFY-PROXY ERROR]', e.code, e.message);
                let errorMsg = e.message;
                if (e.code === 'ECONNRESET' || e.message.includes('socket hang up')) {
                    errorMsg = "Connection Reset (Socket Hang Up). This happens if the server closes the connection abruptly. Check if your MCSS server supports HTTPS on port 25560 or if it's strictly HTTP.";
                }
                resolve({
                    statusCode: 502,
                    headers,
                    body: JSON.stringify({
                        error: errorMsg,
                        code: e.code,
                        target: targetUrl
                    })
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    statusCode: 504,
                    headers,
                    body: JSON.stringify({ error: "Connection Timeout (10s)" })
                });
            });

            if (event.body) req.write(event.body);
            req.end();

        } catch (err) {
            resolve({
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Invalid Configuration: " + err.message })
            });
        }
    });
};
