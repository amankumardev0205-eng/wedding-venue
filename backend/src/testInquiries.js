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
import Venue from './models/Venue.js';
import Inquiry from './models/Inquiry.js';

const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}/api`;

const CUST_EMAIL = `test-cust-${Date.now()}@example.com`;
const ORG_EMAIL = `test-org-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let server;
let customerToken = null;
let organizerToken = null;
let testVenueId = null;
const createdInquiryIds = [];

async function runTests() {
  console.log('\n==================================================');
  console.log('INQUIRY PAGINATION INTEGRATION TEST');
  console.log('==================================================\n');

  try {
    const { default: app } = await import('./app.js');
    // 1. Start test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`✓ Test server started on port ${PORT}`);

    // Pre-clean if any user accounts with these emails exist
    for (const email of [CUST_EMAIL, ORG_EMAIL]) {
      const existing = await User.findOne({ email });
      if (existing) {
        await User.findByIdAndDelete(existing.id || existing._id);
      }
    }

    // 2. Setup Authentication (Customer & Organizer)
    console.log('Setting up temporary test users...');
    const registerUser = async (name, email, password, role) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (!res.ok) {
        throw new Error(`Failed to register ${role}: ${await res.text()}`);
      }
      const data = await res.json();
      return data.token;
    };

    customerToken = await registerUser('Test Customer', CUST_EMAIL, TEST_PASSWORD, 'customer');
    organizerToken = await registerUser('Test Organizer', ORG_EMAIL, TEST_PASSWORD, 'organizer');
    console.log('✓ Registered and logged in temporary Customer');
    console.log('✓ Registered and logged in temporary Organizer');

    const customerUser = await User.findOne({ email: CUST_EMAIL });
    const organizerUser = await User.findOne({ email: ORG_EMAIL });

    // 3. Create a Test Venue owned by Organizer
    console.log('Creating temporary test venue...');
    const venue = new Venue({
      name: 'Pagination Test Palace',
      description: 'Lawn for testing pagination.',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Test Street 2, Jaipur',
      venueType: 'resort',
      capacity: { min: 100, max: 500 },
      pricing: { perPlate: 2500, currency: 'INR' },
      indoor: true,
      outdoor: true,
      organizer: organizerUser.id,
      unavailableDates: []
    });
    await venue.save();
    testVenueId = venue.id;
    console.log(`✓ Temporary test venue created with ID: ${testVenueId}`);

    // 4. Create 3 Inquiries made by Customer
    console.log('Creating 3 temporary inquiries...');
    const createInquiry = async (message) => {
      const res = await fetch(`${BASE_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          venueId: testVenueId,
          eventDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // 30 days from now
          guestCount: 200,
          eventType: 'wedding',
          message
        })
      });
      if (!res.ok) {
        throw new Error(`Failed to create inquiry: ${await res.text()}`);
      }
      const data = await res.json();
      createdInquiryIds.push(data.inquiry.id || data.inquiry._id);
    };

    await createInquiry('Inquiry 1 message content');
    await createInquiry('Inquiry 2 message content');
    await createInquiry('Inquiry 3 message content');
    console.log(`✓ 3 inquiries created successfully. IDs: ${createdInquiryIds.join(', ')}`);

    // 5. Test Pagination Endpoint (Organizer Role)
    console.log('\n--- Querying Page 1 (Limit = 2) ---');
    const page1Res = await fetch(`${BASE_URL}/inquiries?page=1&limit=2`, {
      headers: { 'Authorization': `Bearer ${organizerToken}` }
    });
    if (page1Res.status !== 200) {
      throw new Error(`GET /api/inquiries page 1 failed: ${page1Res.status}`);
    }
    const page1Data = await page1Res.json();
    if (!page1Data.success) {
      throw new Error('Response success flag is false');
    }

    console.log('Verifying Page 1 pagination metadata...');
    if (page1Data.count !== 2) {
      throw new Error(`Expected count=2 on page 1, got ${page1Data.count}`);
    }
    if (page1Data.total !== 3) {
      throw new Error(`Expected total=3, got ${page1Data.total}`);
    }
    if (page1Data.totalPages !== 2) {
      throw new Error(`Expected totalPages=2, got ${page1Data.totalPages}`);
    }
    if (page1Data.currentPage !== 1) {
      throw new Error(`Expected currentPage=1, got ${page1Data.currentPage}`);
    }
    if (page1Data.limit !== 2) {
      throw new Error(`Expected limit=2, got ${page1Data.limit}`);
    }
    const page1Ids = page1Data.inquiries.map((inq) => inq.id || inq._id);
    console.log(`✓ Page 1 metadata matches. Returned inquiry IDs: ${page1Ids.join(', ')}`);

    console.log('\n--- Querying Page 2 (Limit = 2) ---');
    const page2Res = await fetch(`${BASE_URL}/inquiries?page=2&limit=2`, {
      headers: { 'Authorization': `Bearer ${organizerToken}` }
    });
    if (page2Res.status !== 200) {
      throw new Error(`GET /api/inquiries page 2 failed: ${page2Res.status}`);
    }
    const page2Data = await page2Res.json();

    console.log('Verifying Page 2 pagination metadata...');
    if (page2Data.count !== 1) {
      throw new Error(`Expected count=1 on page 2, got ${page2Data.count}`);
    }
    if (page2Data.total !== 3) {
      throw new Error(`Expected total=3, got ${page2Data.total}`);
    }
    if (page2Data.totalPages !== 2) {
      throw new Error(`Expected totalPages=2, got ${page2Data.totalPages}`);
    }
    if (page2Data.currentPage !== 2) {
      throw new Error(`Expected currentPage=2, got ${page2Data.currentPage}`);
    }
    const page2Ids = page2Data.inquiries.map((inq) => inq.id || inq._id);
    console.log(`✓ Page 2 metadata matches. Returned inquiry IDs: ${page2Ids.join(', ')}`);

    // 6. Verify Duplicates Check
    console.log('\nVerifying no duplicates between Page 1 and Page 2...');
    const duplicateIds = page1Ids.filter((id) => page2Ids.includes(id));
    if (duplicateIds.length > 0) {
      throw new Error(`DUPLICATE INQUIRY IDS DETECTED BETWEEN PAGES: ${duplicateIds.join(', ')}`);
    }
    console.log('✓ No duplicate inquiry IDs detected between page 1 and page 2.');

    console.log('\n==================================================');
    console.log('ALL INQUIRY PAGINATION TESTS PASSED');
    console.log('==================================================\n');

    await cleanup();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

async function cleanup() {
  console.log('Cleaning up temporary resources...');
  try {
    for (const inqId of createdInquiryIds) {
      await Inquiry.findByIdAndDelete(inqId);
      console.log(`✓ Cleaned up test inquiry: ${inqId}`);
    }
    if (testVenueId) {
      await Venue.findByIdAndDelete(testVenueId);
      console.log(`✓ Cleaned up test venue: ${testVenueId}`);
    }
    for (const email of [CUST_EMAIL, ORG_EMAIL]) {
      const user = await User.findOne({ email });
      if (user) {
        await User.findByIdAndDelete(user.id || user._id);
        console.log(`✓ Cleaned up test user: ${email}`);
      }
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('✓ Test server shut down cleanly');
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
}

runTests();
