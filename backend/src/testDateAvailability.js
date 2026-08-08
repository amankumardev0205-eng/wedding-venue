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

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

const CUST_EMAIL = `cust-date-${Date.now()}@example.com`;
const ORG_EMAIL = `org-date-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let server;
let customerToken = null;
let organizerToken = null;
let testVenueId = null;
const createdInquiryIds = [];

async function runTests() {
  console.log('\n==================================================');
  console.log('DATE AVAILABILITY HANDLING INTEGRATION TEST');
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

    // 3. Create a Test Venue WITHOUT unavailableDates property
    console.log('Creating temporary test venue without unavailableDates key...');
    const venue = new Venue({
      name: 'Date Availability Palace',
      description: 'Palace for testing unavailableDates defaults.',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Test Street 4, Jaipur',
      venueType: 'resort',
      capacity: { min: 100, max: 500 },
      pricing: { perPlate: 2500, currency: 'INR' },
      indoor: true,
      outdoor: true,
      organizer: organizerUser.id
    });
    // Ensure the key is deleted if the constructor added it, to test safety overrides
    delete venue.unavailableDates;

    await venue.save();
    testVenueId = venue.id;
    console.log(`✓ Temporary test venue created with ID: ${testVenueId}`);

    // Verify it saved without crashing even if unavailableDates was missing
    const savedVenue = await Venue.findById(testVenueId);
    console.log('✓ Venue fetched back successfully');

    // 4. Test Creation of Inquiry on Available Date (Succeeds)
    console.log('\n--- Testing Inquiry Creation on Available Date ---');
    const targetEventDate = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]; // 30 days out

    const createRes = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        venueId: testVenueId,
        eventDate: targetEventDate,
        guestCount: 200,
        eventType: 'wedding',
        message: 'Is this date available?'
      })
    });

    if (createRes.status !== 201) {
      throw new Error(`Inquiry creation failed with status ${createRes.status}: ${await createRes.text()}`);
    }
    const createData = await createRes.json();
    const inquiryId = createData.inquiry.id || createData.inquiry._id;
    createdInquiryIds.push(inquiryId);
    console.log('✓ Inquiry created successfully on available date');

    // 5. Test Mark Date Unavailable (Succeeds and Persists)
    console.log('\n--- Testing mark-unavailable Endpoint ---');
    const blockedDateStart = new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0]; // 45 days out
    const blockedDateEnd = new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0];

    const markRes = await fetch(`${BASE_URL}/inquiries/${inquiryId}/mark-unavailable`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        startDate: blockedDateStart,
        endDate: blockedDateEnd
      })
    });

    if (markRes.status !== 200) {
      throw new Error(`Marking date unavailable failed with status ${markRes.status}: ${await markRes.text()}`);
    }
    console.log('✓ mark-unavailable request returns 200 OK');

    // Verify it is persisted in the database
    const updatedVenue = await Venue.findById(testVenueId);
    const hasBlockedDate = updatedVenue.unavailableDates.some((d) => {
      const dStart = d.start.toDate ? d.start.toDate() : new Date(d.start);
      return dStart.toISOString().split('T')[0] === blockedDateStart;
    });
    if (!hasBlockedDate) {
      throw new Error('Blocked date was not persisted to the venue unavailableDates collection!');
    }
    console.log('✓ Blocked date successfully verified in Firestore');

    // 6. Test Creation of Inquiry on Blocked Date (Fails with 400)
    console.log('\n--- Testing Inquiry Creation on Blocked Date ---');
    const createResBlocked = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        venueId: testVenueId,
        eventDate: blockedDateStart,
        guestCount: 200,
        eventType: 'wedding',
        message: 'I want this date!'
      })
    });

    if (createResBlocked.status !== 400) {
      throw new Error(`Expected status 400 on blocked date inquiry, got ${createResBlocked.status}`);
    }
    const createDataBlocked = await createResBlocked.json();
    if (createDataBlocked.success === true || !createDataBlocked.message.includes('not available')) {
      throw new Error(`Expected error message indicating date unavailable, got: ${JSON.stringify(createDataBlocked)}`);
    }
    console.log('✓ Inquiry creation correctly rejected on blocked date');

    console.log('\n==================================================');
    console.log('ALL DATE AVAILABILITY HANDLING TESTS PASSED');
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
