const https = require('https');
const http = require('http');

exports.handler = async (event) => {
    // CORS headers for preflight and responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, mcss-target-url, mcss-api-key',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: 'OK' };
    }

    // Support both lowercase and Title-Case headers
    const targetUrl = event.headers['mcss-target-url'] || event.headers['MCSS-Target-Url'];
    const apiKey = event.headers['mcss-api-key'] || event.headers['MCSS-Api-Key'];

    if (!targetUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing mcss-target-url header' })
        };
    }

    console.log(`[PROXY] Forwarding ${event.httpMethod} to: ${targetUrl}`);

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
                    'Accept': 'application/json'
                },
                // CRITICAL: This allows self-signed/invalid certs on the home server
                rejectUnauthorized: false,
                timeout: 8000
            };

            const req = transport.request(targetUrl, options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: data
                    });
                });
            });

            req.on('error', (e) => {
                console.error('[PROXY ERROR]', e.message);
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: e.message,
                        context: "Failed to connect to MCSS server. Is it online and port 25560 forwarded?"
                    })
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    statusCode: 504,
                    headers,
                    body: JSON.stringify({ error: "Connection Timeout (8s)" })
                });
            });

            if (event.body) {
                req.write(event.body);
            }
            req.end();

        } catch (err) {
            resolve({
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Invalid Target URL: " + err.message })
            });
        }
    });
};
