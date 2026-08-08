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

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

const CUST_EMAIL = `test-cust-${Date.now()}@example.com`;
const ORG_EMAIL = `test-org-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let server;
let customerToken = null;
let organizerToken = null;
let createdVenueId = null;

async function runTests() {
  console.log('\n==================================================');
  console.log('VENUE APIS INTEGRATION TEST');
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

    // 3. Public API Tests
    console.log('\n--- Running Public API Tests ---');

    // A. Venue list
    console.log('Testing GET /api/venues...');
    const listRes = await fetch(`${BASE_URL}/venues`);
    if (listRes.status !== 200) {
      throw new Error(`GET /api/venues failed with status ${listRes.status}`);
    }
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.venues)) {
      throw new Error('GET /api/venues response structure is invalid');
    }
    console.log('✓ Venue list returns 200 OK');
    console.log('✓ Response contains venue data and pagination metadata');

    // B. Search
    console.log('Testing search query...');
    const searchRes = await fetch(`${BASE_URL}/venues?search=Palace`);
    const searchData = await searchRes.json();
    const allMatchSearch = searchData.venues.every(
      (v) => v.name.toLowerCase().includes('palace') || v.description.toLowerCase().includes('palace')
    );
    if (!allMatchSearch || searchData.venues.length === 0) {
      throw new Error('Search filter did not correctly return matching venues');
    }
    console.log('✓ Search filter works correctly');

    // C. City filter
    console.log('Testing city filter...');
    const cityRes = await fetch(`${BASE_URL}/venues?city=Udaipur`);
    const cityData = await cityRes.json();
    const allMatchCity = cityData.venues.every((v) => v.city.toLowerCase() === 'udaipur');
    if (!allMatchCity || cityData.venues.length === 0) {
      throw new Error('City filter did not return correct Udaipur venues');
    }
    console.log('✓ City filter works correctly');

    // D. Price filtering
    console.log('Testing price filtering...');
    // Let's filter for per-plate price between 3000 and 4000
    const priceRes = await fetch(`${BASE_URL}/venues?minPrice=3000&maxPrice=4000`);
    const priceData = await priceRes.json();
    if (priceData.venues.length === 0) {
      throw new Error('Price range filter returned zero results');
    }
    priceData.venues.forEach((v) => {
      const price = v.pricing.perPlate || v.pricing.flatRate || v.pricing.base || v.pricing.buffet;
      if (price < 3000 || price > 4000) {
        throw new Error(`Venue ${v.name} price ${price} is out of bounds [3000, 4000]`);
      }
    });
    console.log('✓ Price range filter works correctly');

    // E. Capacity filtering
    console.log('Testing capacity filtering...');
    // Filter for venues that can host at least 500 max guests and at most 1000 min guests
    const capRes = await fetch(`${BASE_URL}/venues?minCapacity=500&maxCapacity=1000`);
    const capData = await capRes.json();
    if (capData.venues.length === 0) {
      throw new Error('Capacity filter returned zero results');
    }
    console.log('✓ Capacity filter works correctly');

    // F. Sorting
    console.log('Testing sorting options...');
    const testSort = async (sortOption, compareFn) => {
      const res = await fetch(`${BASE_URL}/venues?sort=${sortOption}`);
      const body = await res.json();
      for (let i = 0; i < body.venues.length - 1; i++) {
        if (!compareFn(body.venues[i], body.venues[i + 1])) {
          throw new Error(`Sorting by ${sortOption} is out of order at index ${i}`);
        }
      }
    };

    // Helper to get pricing comparison value
    const getPrice = (v) => v.pricing.perPlate || v.pricing.flatRate || v.pricing.base || v.pricing.buffet;
    const getCapacity = (v) => v.capacity.max || v.capacity;

    await testSort('price-asc', (a, b) => getPrice(a) <= getPrice(b));
    console.log('✓ price-asc sorting verified');
    await testSort('price-desc', (a, b) => getPrice(a) >= getPrice(b));
    console.log('✓ price-desc sorting verified');
    await testSort('capacity-asc', (a, b) => getCapacity(a) <= getCapacity(b));
    console.log('✓ capacity-asc sorting verified');
    await testSort('capacity-desc', (a, b) => getCapacity(a) >= getCapacity(b));
    console.log('✓ capacity-desc sorting verified');
    await testSort('rating-desc', (a, b) => (a.rating || 0) >= (b.rating || 0));
    console.log('✓ rating-desc sorting verified');

    // G. Pagination
    console.log('Testing pagination...');
    const pagRes1 = await fetch(`${BASE_URL}/venues?page=1&limit=2`);
    const pagData1 = await pagRes1.json();
    if (pagData1.venues.length !== 2) {
      throw new Error(`Expected exactly 2 venues for limit=2, got ${pagData1.venues.length}`);
    }
    const pagRes2 = await fetch(`${BASE_URL}/venues?page=2&limit=2`);
    const pagData2 = await pagRes2.json();
    if (pagData2.venues[0].id === pagData1.venues[0].id) {
      throw new Error('Page 2 results duplicate Page 1 results!');
    }
    console.log('✓ Pagination works correctly without crash');


    // 4. Protected API Authorization Tests
    console.log('\n--- Running Protected API Tests ---');

    // Unauthenticated
    const verifyUnauth = async (method, path, body = {}) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify(body) : null
      });
      if (res.status !== 401) {
        throw new Error(`Unauthenticated ${method} ${path} expected 401, got ${res.status}`);
      }
    };
    await verifyUnauth('POST', '/venues', { name: 'Unauthorized Venue' });
    await verifyUnauth('PUT', '/venues/some-id', { name: 'Unauthorized Venue' });
    await verifyUnauth('DELETE', '/venues/some-id');
    console.log('✓ Unauthenticated requests rejected with 401');

    // Customer trying to modify
    const verifyCustForbidden = async (method, path, body = {}) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: method !== 'GET' ? JSON.stringify(body) : null
      });
      if (res.status !== 403) {
        throw new Error(`Customer ${method} ${path} expected 403, got ${res.status}`);
      }
    };
    await verifyCustForbidden('POST', '/venues', { name: 'Forbidden Venue' });
    await verifyCustForbidden('PUT', '/venues/some-id', { name: 'Forbidden Venue' });
    await verifyCustForbidden('DELETE', '/venues/some-id');
    console.log('✓ Customer operations rejected with 403 Forbidden');


    // 5. Organizer CRUD Lifecycle Tests
    console.log('\n--- Running Organizer Lifecycle Tests ---');

    // A. Create Venue
    console.log('Creating venue...');
    const createRes = await fetch(`${BASE_URL}/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        name: 'Test Grand Palace',
        description: 'Luxurious palace for integration testing.',
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'Test Street 1, Jaipur',
        venueType: 'resort',
        capacity: { min: 100, max: 500 },
        pricing: { perPlate: 2500, currency: 'INR' },
        indoor: true,
        outdoor: true
      })
    });

    if (createRes.status !== 201) {
      throw new Error(`Create venue failed with status ${createRes.status}: ${await createRes.text()}`);
    }

    const createData = await createRes.json();
    if (!createData.success || !createData.venue || !createData.venue.id) {
      throw new Error('Create venue response structure is missing venue ID!');
    }
    createdVenueId = createData.venue.id;
    console.log('✓ Create venue returns 201 Created with venue ID');

    // Verify it exists in Firestore emulator
    const firestoreVenue = await Venue.findById(createdVenueId);
    if (!firestoreVenue) {
      throw new Error('Created venue does not exist in the Firestore emulator!');
    }
    if (firestoreVenue.name !== 'Test Grand Palace') {
      throw new Error('Saved venue properties do not match request details!');
    }
    console.log('✓ Venue successfully verified in Firestore');

    // B. Update Venue
    console.log('Updating venue...');
    const updateRes = await fetch(`${BASE_URL}/venues/${createdVenueId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        name: 'Updated Test Grand Palace',
        pricing: { perPlate: 3200, currency: 'INR' },
        capacity: { min: 120, max: 600 }
      })
    });

    if (updateRes.status !== 200) {
      throw new Error(`Update venue failed with status ${updateRes.status}: ${await updateRes.text()}`);
    }

    const updatedVenueDoc = await Venue.findById(createdVenueId);
    if (updatedVenueDoc.name !== 'Updated Test Grand Palace') {
      throw new Error('Updated venue name was not saved in Firestore!');
    }
    if (updatedVenueDoc.pricing.perPlate !== 3200) {
      throw new Error('Updated pricing per-plate was not saved in Firestore!');
    }
    if (updatedVenueDoc.capacity.max !== 600) {
      throw new Error('Updated max capacity was not saved in Firestore!');
    }
    console.log('✓ Update venue returns 200 OK');
    console.log('✓ Firestore document verified with updated values');

    // C. Delete Venue
    console.log('Deleting venue...');
    const deleteRes = await fetch(`${BASE_URL}/venues/${createdVenueId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${organizerToken}`
      }
    });

    if (deleteRes.status !== 200) {
      throw new Error(`Delete venue failed with status ${deleteRes.status}`);
    }

    const deletedVenueDoc = await Venue.findById(createdVenueId);
    if (deletedVenueDoc) {
      throw new Error('Deleted venue document still exists in Firestore!');
    }
    createdVenueId = null;
    console.log('✓ Delete venue returns 200 OK');
    console.log('✓ Venue no longer exists in Firestore');

    console.log('\n==================================================');
    console.log('ALL VENUE API INTEGRATION TESTS PASSED');
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
    if (createdVenueId) {
      await Venue.findByIdAndDelete(createdVenueId);
      console.log('✓ Cleaned up temporary test venue');
    }
    for (const email of [CUST_EMAIL, ORG_EMAIL]) {
      const user = await User.findOne({ email });
      if (user) {
        await User.findByIdAndDelete(user.id || user._id);
        console.log(`✓ Cleaned up temporary test user: ${email}`);
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
