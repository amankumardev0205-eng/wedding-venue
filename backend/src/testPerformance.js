import http from 'http';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Ensure emulator env is present
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
process.env.SEED_VENUES = 'false';

import User from './models/User.js';
import Venue from './models/Venue.js';
import Review from './models/Review.js';
import Inquiry from './models/Inquiry.js';
import { db } from './config/firebaseAdmin.js';

const PORT = 5007;
const BASE_URL = `http://localhost:${PORT}/api`;
let server;

async function runTests() {
  console.log('\n==================================================');
  console.log('PERFORMANCE TESTING SUITE');
  console.log('==================================================\n');

  try {
    const { default: app } = await import('./app.js');
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`✓ Test server started on port ${PORT}`);

    console.log('\nSeeding performance test dataset...');
    // Seed 1 organizer
    const orgEmail = `perf-org-${Date.now()}@example.com`;
    const organizer = new User({
      name: 'Perf Organizer',
      email: orgEmail,
      passwordHash: 'password123',
      role: 'organizer'
    });
    await organizer.save();

    // Seed 1 customer
    const custEmail = `perf-cust-${Date.now()}@example.com`;
    const customer = new User({
      name: 'Perf Customer',
      email: custEmail,
      passwordHash: 'password123',
      role: 'customer'
    });
    await customer.save();

    // Login to get token for protected endpoints
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmail, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Seed 50 Venues to have a realistic list
    console.log('Seeding 50 venues...');
    const venuePromises = [];
    for (let i = 1; i <= 50; i++) {
      const v = new Venue({
        name: `Performance Venue ${i}`,
        description: `This is a test description for performance venue number ${i}. Great wedding hall.`,
        city: i % 2 === 0 ? 'Delhi' : 'Mumbai',
        state: i % 2 === 0 ? 'Delhi' : 'Maharashtra',
        address: `${i} Wedding Lane`,
        venueType: i % 3 === 0 ? 'banquet_hall' : 'lawn',
        capacity: { min: 100, max: 200 + i * 5 },
        pricing: { perPlate: 1000 + i * 20, flatRate: 0 },
        amenities: ['wifi', 'parking', 'ac'],
        indoor: i % 2 === 0,
        outdoor: i % 2 !== 0,
        isActive: true,
        organizer: organizer.id || organizer._id,
        rating: (3 + (i % 3) * 0.7)
      });
      venuePromises.push(v.save());
    }
    const createdVenues = await Promise.all(venuePromises);
    const sampleVenueId = createdVenues[0].id || createdVenues[0]._id;
    console.log(`✓ 50 venues seeded. Sample venue ID: ${sampleVenueId}`);

    // Seed 35 Reviews on the sample venue for pagination tests
    console.log('Seeding 35 reviews on the sample venue...');
    const reviewPromises = [];
    for (let i = 1; i <= 35; i++) {
      const r = new Review({
        customer: customer.id || customer._id,
        venue: sampleVenueId,
        rating: 4,
        title: `Test Review ${i}`,
        comment: `Excellent food and clean place, highly recommended for event planning. Number ${i}`,
        isVerified: true,
        isFlagged: false,
        helpful: i % 5,
        createdAt: new Date(Date.now() - i * 60000)
      });
      reviewPromises.push(r.save());
    }
    await Promise.all(reviewPromises);
    console.log('✓ 35 reviews seeded.');

    // Let's run performance checks
    const timings = {};

    // 1. Measure latency of GET /api/venues (First page, size 12)
    console.log('\nMeasuring GET /api/venues (Listing - Page 1)...');
    let start = performance.now();
    let res = await fetch(`${BASE_URL}/venues?page=1&limit=12`);
    let data = await res.json();
    let end = performance.now();
    timings.venuesListing = end - start;
    console.log(`- Time taken: ${timings.venuesListing.toFixed(2)} ms (Items returned: ${data.venues?.length})`);
    if (!res.ok) throw new Error('Listing request failed');

    // 2. Measure latency of GET /api/venues with search and filter
    console.log('\nMeasuring GET /api/venues (Search & Filter - Mumbai lawns)...');
    start = performance.now();
    res = await fetch(`${BASE_URL}/venues?city=Mumbai&venueType=lawn&page=1&limit=12`);
    data = await res.json();
    end = performance.now();
    timings.venuesFilter = end - start;
    console.log(`- Time taken: ${timings.venuesFilter.toFixed(2)} ms (Items returned: ${data.venues?.length})`);
    if (!res.ok) throw new Error('Filter request failed');

    // 3. Measure latency of GET /api/venues/:id (Venue details)
    console.log('\nMeasuring GET /api/venues/:id (Venue Details)...');
    start = performance.now();
    res = await fetch(`${BASE_URL}/venues/${sampleVenueId}`);
    data = await res.json();
    end = performance.now();
    timings.venueDetails = end - start;
    console.log(`- Time taken: ${timings.venueDetails.toFixed(2)} ms (Venue name: ${data.venue?.name})`);
    if (!res.ok) throw new Error('Details request failed');

    // 4. Measure latency of GET /api/reviews/venue/:venueId (Review Pagination - Page 1 & 2)
    console.log('\nMeasuring GET /api/reviews/venue/:venueId (Reviews Page 1)...');
    start = performance.now();
    res = await fetch(`${BASE_URL}/reviews/venue/${sampleVenueId}?page=1&limit=10`);
    data = await res.json();
    end = performance.now();
    timings.reviewsPage1 = end - start;
    console.log(`- Time taken: ${timings.reviewsPage1.toFixed(2)} ms (Reviews: ${data.reviews?.length}, Total: ${data.total})`);
    if (!res.ok) throw new Error('Reviews page 1 request failed');

    console.log('\nMeasuring GET /api/reviews/venue/:venueId (Reviews Page 2)...');
    start = performance.now();
    res = await fetch(`${BASE_URL}/reviews/venue/${sampleVenueId}?page=2&limit=10`);
    data = await res.json();
    end = performance.now();
    timings.reviewsPage2 = end - start;
    console.log(`- Time taken: ${timings.reviewsPage2.toFixed(2)} ms (Reviews: ${data.reviews?.length})`);
    if (!res.ok) throw new Error('Reviews page 2 request failed');

    // 5. Measure latency of POST /api/inquiries (Creating an inquiry)
    console.log('\nMeasuring POST /api/inquiries (Create Inquiry)...');
    start = performance.now();
    res = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        venueId: sampleVenueId,
        eventDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], // 10 days out
        guestCount: 150,
        eventType: 'wedding',
        message: 'This is a performance test inquiry'
      })
    });
    data = await res.json();
    end = performance.now();
    timings.createInquiry = end - start;
    console.log(`- Time taken: ${timings.createInquiry.toFixed(2)} ms (Inquiry ID: ${data.inquiry?.id || data.inquiry?._id})`);
    if (!res.ok) throw new Error(`Create inquiry failed: ${data.message}`);

    // 6. Measure concurrent requests latency (10 concurrent listings)
    console.log('\nMeasuring concurrent requests (10 parallel requests to search venues)...');
    const startConcurrent = performance.now();
    const concurrentRequests = Array(10).fill(null).map(() => fetch(`${BASE_URL}/venues?page=1&limit=12`));
    const responses = await Promise.all(concurrentRequests);
    const endConcurrent = performance.now();
    timings.concurrentRequests = endConcurrent - startConcurrent;
    console.log(`- Total time for 10 concurrent requests: ${timings.concurrentRequests.toFixed(2)} ms`);
    if (responses.some(r => !r.ok)) throw new Error('Some concurrent requests failed');

    console.log('\n--- PERFORMANCE LATENCY SUMMARY ---');
    console.table(Object.entries(timings).map(([key, ms]) => ({ Metric: key, 'Latency (ms)': ms.toFixed(1) })));

    // Clean up all seeded test data
    console.log('\nCleaning up seeded performance test data...');
    // Delete inquiries
    const inquiries = await db.collection('inquiries').where('customer', '==', customer.id || customer._id).get();
    for (const doc of inquiries.docs) {
      await db.collection('inquiries').doc(doc.id).delete();
    }
    // Delete reviews
    const reviews = await db.collection('reviews').where('venue', '==', sampleVenueId).get();
    for (const doc of reviews.docs) {
      await db.collection('reviews').doc(doc.id).delete();
    }
    // Delete venues
    for (const venue of createdVenues) {
      await db.collection('venues').doc(venue.id || venue._id).delete();
    }
    // Delete users
    await db.collection('users').doc(organizer.id || organizer._id).delete();
    await db.collection('users').doc(customer.id || customer._id).delete();
    console.log('✓ Seeding database cleaned up.');

    console.log('\n==================================================');
    console.log('PERFORMANCE TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('==================================================\n');
    cleanup(0);
  } catch (error) {
    console.error('\n❌ PERFORMANCE TEST SUITE FAILED:', error.message);
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
