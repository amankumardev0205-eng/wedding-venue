import http from 'http';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Ensure emulator env is present
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
process.env.SEED_VENUES = 'false';

import User from './models/User.js';
import { db } from './config/firebaseAdmin.js';

const PORT = 5006;
const BASE_URL = `http://localhost:${PORT}/api`;
const TEST_EMAIL_CUST = `sec-cust-${Date.now()}@example.com`;
const TEST_EMAIL_XSS = `sec-xss-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let server;

async function runTests() {
  console.log('\n==================================================');
  console.log('SECURITY TESTING INTEGRATION SUITE');
  console.log('==================================================\n');

  try {
    const { default: app } = await import('./app.js');
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`✓ Test server started on port ${PORT}`);

    // Pre-clean users from Firestore emulator
    for (const email of [TEST_EMAIL_CUST, TEST_EMAIL_XSS]) {
      const existing = await User.findOne({ email });
      if (existing) {
        await User.findByIdAndDelete(existing.id || existing._id);
      }
    }

    // 1. Verify Helmet Headers
    console.log('\n--- 1. Testing Helmet Headers ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const headers = healthRes.headers;
    
    // Check some standard Helmet headers
    const xFrame = headers.get('x-frame-options');
    const csp = headers.get('content-security-policy');
    const xContentType = headers.get('x-content-type-options');
    
    console.log(`X-Frame-Options: ${xFrame}`);
    console.log(`Content-Security-Policy: ${csp ? 'Present' : 'Missing'}`);
    console.log(`X-Content-Type-Options: ${xContentType}`);
    
    if (xFrame !== 'SAMEORIGIN') throw new Error('Helmet X-Frame-Options not configured correctly');
    if (!csp) throw new Error('Helmet Content-Security-Policy header is missing');
    if (xContentType !== 'nosniff') throw new Error('Helmet X-Content-Type-Options not configured correctly');
    console.log('✓ Helmet headers verified successfully');

    // 2. Verify CORS configurations
    console.log('\n--- 2. Testing CORS Security ---');
    // Trusted origin
    const corsTrustedRes = await fetch(`${BASE_URL}/health`, {
      headers: { 'Origin': 'http://localhost:5173' }
    });
    const allowOrigin = corsTrustedRes.headers.get('access-control-allow-origin');
    const allowCredentials = corsTrustedRes.headers.get('access-control-allow-credentials');
    console.log(`Trusted Origin CORS: ${allowOrigin}, Credentials: ${allowCredentials}`);
    if (allowOrigin !== 'http://localhost:5173') throw new Error('CORS does not accept trusted origin');
    if (allowCredentials !== 'true') throw new Error('CORS does not allow credentials for trusted origin');

    // Untrusted origin
    const corsUntrustedRes = await fetch(`${BASE_URL}/health`, {
      headers: { 'Origin': 'http://malicious-site.com' }
    });
    const allowOriginMalicious = corsUntrustedRes.headers.get('access-control-allow-origin');
    console.log(`Untrusted Origin CORS: ${allowOriginMalicious}`);
    if (allowOriginMalicious === 'http://malicious-site.com') throw new Error('CORS incorrectly allowed untrusted origin');
    console.log('✓ CORS configurations verified successfully');

    // 3. Verify HTTPS redirection in Production environment
    console.log('\n--- 3. Testing HTTPS Enforcement (Production) ---');
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    try {
      // Direct HTTP access should redirect in production
      const redirectRes = await fetch(`${BASE_URL}/health`, {
        redirect: 'manual'
      });
      console.log(`HTTP Request Redirect status: ${redirectRes.status}`);
      if (redirectRes.status !== 301) {
        throw new Error(`Expected redirect status 301, got ${redirectRes.status}`);
      }
      
      // Proved HTTPS access (via proxy header) should pass
      const httpsRes = await fetch(`${BASE_URL}/health`, {
        headers: { 'x-forwarded-proto': 'https' },
        redirect: 'manual'
      });
      console.log(`HTTPS Request Status: ${httpsRes.status}`);
      if (httpsRes.status !== 200) {
        throw new Error(`Expected status 200 with x-forwarded-proto: https, got ${httpsRes.status}`);
      }
    } finally {
      // Restore node env
      process.env.NODE_ENV = originalNodeEnv;
    }
    console.log('✓ HTTPS redirection verified successfully');

    // 4. Verify Input Sanitization (XSS Stripping)
    console.log('\n--- 4. Testing Input Sanitization (XSS) ---');
    const xssPayload = '<b>Hacker</b><script>alert(1)</script>';
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: xssPayload,
        email: TEST_EMAIL_XSS,
        password: TEST_PASSWORD,
        role: 'customer'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${regData.message}`);
    
    // Check if the user returned has tags stripped
    console.log(`Registered name: "${regData.user.name}"`);
    if (regData.user.name !== 'Hacker') {
      throw new Error(`Input was not sanitized. Sanitized output: "${regData.user.name}"`);
    }
    console.log('✓ Input sanitization verified successfully');

    // 5. Verify JWT verification & protected routes
    console.log('\n--- 5. Testing JWT Route Protection ---');
    // Access protected route without token
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    const noTokenData = await noTokenRes.json();
    console.log(`No Token Access Status: ${noTokenRes.status}, Message: ${noTokenData.message}`);
    if (noTokenRes.status !== 401) throw new Error('Protected route accessible without token');

    // Access protected route with invalid token
    const badTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': 'Bearer invalidjwttokenhere' }
    });
    const badTokenData = await badTokenRes.json();
    console.log(`Invalid Token Access Status: ${badTokenRes.status}, Message: ${badTokenData.message}`);
    if (badTokenRes.status !== 401) throw new Error('Protected route accessible with invalid token');
    console.log('✓ JWT Route protection verified successfully');

    // 6. Verify Role-Based Access Control and Role Escalation Prevention
    console.log('\n--- 6. Testing Role Escalation Prevention ---');
    // Login as the customer
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL_XSS,
        password: TEST_PASSWORD
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Try to access admin users endpoint with customer token
    const escalationRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const escalationData = await escalationRes.json();
    console.log(`Customer accessing Admin endpoint status: ${escalationRes.status}, Message: ${escalationData.message}`);
    if (escalationRes.status !== 403) {
      throw new Error(`Expected status 403 Forbidden for unauthorized role, got ${escalationRes.status}`);
    }
    console.log('✓ Role escalation prevention verified successfully');

    // 7. Verify Rate Limiting
    console.log('\n--- 7. Testing Rate Limiting ---');
    let hitRateLimit = false;
    console.log('Sending requests to trigger rate limit (max 100 requests per 15 min)...');
    
    const batchSize = 15;
    for (let i = 0; i < 8; i++) {
      const promises = [];
      for (let j = 0; j < batchSize; j++) {
        promises.push(fetch(`${BASE_URL}/health`));
      }
      const results = await Promise.all(promises);
      if (results.some(r => r.status === 429)) {
        hitRateLimit = true;
        break;
      }
    }

    if (!hitRateLimit) {
      for (let i = 0; i < 20; i++) {
        const res = await fetch(`${BASE_URL}/health`);
        if (res.status === 429) {
          hitRateLimit = true;
          break;
        }
      }
    }

    console.log(`Rate limit triggered: ${hitRateLimit}`);
    if (!hitRateLimit) {
      throw new Error('Rate limiter did not trigger after >100 requests');
    }
    console.log('✓ Rate limiting verified successfully');

    // Clean up test database entries
    console.log('\nCleaning up test data...');
    for (const email of [TEST_EMAIL_CUST, TEST_EMAIL_XSS]) {
      const existing = await User.findOne({ email });
      if (existing) {
        await User.findByIdAndDelete(existing.id || existing._id);
      }
    }

    console.log('\n==================================================');
    console.log('ALL SECURITY INTEGRATION TESTS PASSED SUCCESSFULLY');
    console.log('==================================================\n');
    cleanup(0);
  } catch (error) {
    console.error('\n❌ SECURITY TEST SUITE FAILED:', error.message);
    cleanup(1);
  }
}

function cleanup(exitCode) {
  if (server) {
    server.close(() => {
      console.log('Test server shut down.');
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}

runTests();
