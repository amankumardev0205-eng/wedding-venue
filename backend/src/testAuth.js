import http from 'http';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Ensure emulator env is present
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

// Disable database seeder during integration test
process.env.SEED_VENUES = 'false';

import User from './models/User.js';
import { db } from './config/firebaseAdmin.js';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;
const TEST_EMAIL = `test-user-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Test User';

let server;

// Helper to query firestore emulator directly for validation
async function getUserDocFromEmulator(email) {
  const snapshot = await db.collection('users').where('email', '==', email).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function runTests() {
  console.log('\n==================================================');
  console.log('AUTHENTICATION INTEGRATION TEST');
  console.log('==================================================\n');

  try {
    const { default: app } = await import('./app.js');
    // 1. Start test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`✓ Test server started on port ${PORT}`);

    // Clean up if somehow user already exists
    const preUser = await User.findOne({ email: TEST_EMAIL });
    if (preUser) {
      await User.findByIdAndDelete(preUser.id || preUser._id);
    }

    let token = null;

    // 2. Test successful registration
    console.log('Testing registration...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'customer'
      })
    });

    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${await regRes.text()}`);
    }

    const regData = await regRes.json();
    if (!regData.success || !regData.token) {
      throw new Error('Registration response success or token is missing!');
    }
    console.log('✓ Registration succeeds');
    console.log('✓ JWT returned after registration');

    // Verify stored user in Firestore emulator
    const userDoc = await getUserDocFromEmulator(TEST_EMAIL);
    if (!userDoc) {
      throw new Error('User was not created in the Firestore emulator!');
    }
    console.log('✓ User created in the Firestore emulator');

    if (!userDoc.passwordHash) {
      throw new Error('Stored user does not contain a passwordHash field!');
    }
    if (userDoc.passwordHash === TEST_PASSWORD) {
      throw new Error('Stored password in Firestore is PLAINTEXT! Hashing failed!');
    }
    if (!userDoc.passwordHash.startsWith('$2a$')) {
      throw new Error(`Stored password hash "${userDoc.passwordHash}" is not a valid bcrypt hash!`);
    }
    console.log('✓ Password is hashed in Firestore');

    // 3. Test Registration Validation
    console.log('Testing registration validation...');

    // A. Missing required fields (missing name)
    const valRes1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-val@example.com',
        password: 'password'
      })
    });
    if (valRes1.status !== 400) {
      throw new Error(`Validation check (missing name) expected 400, got ${valRes1.status}`);
    }
    const valData1 = await valRes1.json();
    if (valData1.success !== false) {
      throw new Error('Validation response success should be false');
    }
    console.log('✓ Missing fields rejected');

    // B. Invalid email format
    const valRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'bad-email-format',
        password: 'password'
      })
    });
    if (valRes2.status !== 400) {
      throw new Error(`Validation check (invalid email) expected 400, got ${valRes2.status}`);
    }
    console.log('✓ Invalid email rejected');

    // C. Password too short (< 6 chars)
    const valRes3 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Password User',
        email: 'short-pwd@example.com',
        password: '123'
      })
    });
    if (valRes3.status !== 400) {
      throw new Error(`Validation check (short password) expected 400, got ${valRes3.status}`);
    }
    console.log('✓ Short password rejected');
    console.log('✓ Invalid registration rejected');

    // 4. Test Login
    console.log('Testing login...');

    // A. Incorrect password
    const loginResWrong = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: 'wrongpassword'
      })
    });
    if (loginResWrong.status !== 401) {
      throw new Error(`Login with wrong password expected 401, got ${loginResWrong.status}: ${await loginResWrong.text()}`);
    }
    const loginWrongData = await loginResWrong.json();
    if (loginWrongData.token || loginWrongData.success === true) {
      throw new Error('Login with wrong password returned success or token!');
    }
    console.log('✓ Incorrect password returns 401');

    // B. Correct password
    const loginResCorrect = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    if (loginResCorrect.status !== 200) {
      throw new Error(`Login with correct password expected 200, got ${loginResCorrect.status}`);
    }
    const loginCorrectData = await loginResCorrect.json();
    if (!loginCorrectData.success || !loginCorrectData.token) {
      throw new Error('Login response success or token is missing!');
    }
    token = loginCorrectData.token;
    console.log('✓ Correct login succeeds');
    console.log('✓ JWT returned after login');

    // 5. Test Protected Route (/api/auth/me)
    console.log('Testing protected auth route /api/auth/me...');

    // A. Without Authorization header
    const meResNoHeader = await fetch(`${BASE_URL}/auth/me`, { method: 'GET' });
    if (meResNoHeader.status !== 401) {
      throw new Error(`/api/auth/me unauthenticated expected 401, got ${meResNoHeader.status}`);
    }
    console.log('✓ /api/auth/me rejects unauthenticated request');

    // B. With invalid JWT
    const meResBadHeader = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer bad_token_here' }
    });
    if (meResBadHeader.status !== 401) {
      throw new Error(`/api/auth/me with invalid JWT expected 401, got ${meResBadHeader.status}`);
    }
    console.log('✓ /api/auth/me rejects invalid JWT');

    // C. With valid JWT
    const meResValidHeader = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (meResValidHeader.status !== 200) {
      throw new Error(`/api/auth/me with valid JWT expected 200, got ${meResValidHeader.status}`);
    }
    const meData = await meResValidHeader.json();
    if (!meData.success || !meData.user || meData.user.email !== TEST_EMAIL) {
      throw new Error('Protected route returned incorrect user information!');
    }
    console.log('✓ /api/auth/me accepts valid JWT');

    // Clean up test user
    console.log('Cleaning up...');
    const userToDelete = await User.findOne({ email: TEST_EMAIL });
    if (userToDelete) {
      await User.findByIdAndDelete(userToDelete.id || userToDelete._id);
    }
    console.log('✓ Test user cleaned up');

    // Close server
    await new Promise((resolve) => server.close(resolve));
    console.log('✓ Test server shut down');

    console.log('\n==================================================');
    console.log('ALL AUTHENTICATION TESTS PASSED');
    console.log('==================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    
    // Ensure cleanup in case of failures
    try {
      const userToDelete = await User.findOne({ email: TEST_EMAIL });
      if (userToDelete) {
        await User.findByIdAndDelete(userToDelete.id || userToDelete._id);
        console.log('✓ Test user cleaned up (fallback)');
      }
    } catch (e) {
      console.error('Error during fallback user delete:', e.message);
    }

    if (server) {
      server.close();
      console.log('✓ Test server shut down (fallback)');
    }
    process.exit(1);
  }
}

runTests();
