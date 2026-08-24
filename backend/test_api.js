const http = require('http');

const endpoints = [
  '/api/health',
  '/api/mla-data',
  '/api/daily-updates',
  '/api/events',
  '/api/grievances',
  '/api/hero-slides',
  '/api/live-news',
  '/api/volunteer-slides',
  '/api/appointments',
  '/api/volunteers',
  '/api/volunteer-photos',
  '/api/admins',
  '/api/social-posts',
  '/api/social-profiles'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:5000${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ endpoint, status: res.statusCode, ok: res.statusCode === 200, length: data.length });
      });
    });
    req.on('error', (err) => {
      resolve({ endpoint, status: 'ERROR', error: err.message });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ endpoint, status: 'TIMEOUT' });
    });
  });
}

async function run() {
  console.log('Testing CDO API endpoints on http://127.0.0.1:5000:');
  for (const ep of endpoints) {
    const result = await testEndpoint(ep);
    if (result.ok) {
      console.log(`✅ [${result.status}] ${result.endpoint} (${result.length} bytes)`);
    } else {
      console.log(`❌ [${result.status}] ${result.endpoint} - ${result.error || 'Failed'}`);
    }
  }
}

run();
