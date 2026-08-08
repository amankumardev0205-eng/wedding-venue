import http from 'http';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load env
dotenv.config();

// Ensure emulator env is present
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

// Disable database seeder during integration test
process.env.SEED_VENUES = 'false';

// Set SMTP_URL so the email utility executes sendMail
process.env.SMTP_URL = 'smtp://localhost';

import User from './models/User.js';
import Venue from './models/Venue.js';
import Inquiry from './models/Inquiry.js';

const PORT = 5004;
const BASE_URL = `http://localhost:${PORT}/api`;

const CUST_EMAIL = `cust-email-${Date.now()}@example.com`;
const ORG_EMAIL = `org-email-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let server;
let customerToken = null;
let organizerToken = null;
let testVenueId = null;
let createdInquiryId = null;

const sentEmails = [];

// Hijack nodemailer.createTransport to log sent emails in memory
const originalCreateTransport = nodemailer.createTransport;
function setupMockTransporter(shouldFail = false) {
  nodemailer.createTransport = function () {
    return {
      sendMail: async function (mailOptions) {
        if (shouldFail) {
          throw new Error('SMTP Server Offline');
        }
        sentEmails.push(mailOptions);
        return { messageId: `mock-msg-${Date.now()}` };
      }
    };
  };
}

async function runTests() {
  console.log('\n==================================================');
  console.log('INQUIRY EMAIL NOTIFICATIONS INTEGRATION TEST');
  console.log('==================================================\n');

  try {
    const { default: app } = await import('./app.js');
    // Initialize standard mock transport
    setupMockTransporter(false);

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
      name: 'Email Notification Test Palace',
      description: 'Lawn for testing emails.',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Test Street 3, Jaipur',
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

    // 4. Test Creation Email Notification
    console.log('\n--- Testing Inquiry Creation Notification ---');
    sentEmails.length = 0; // Clear history

    const createRes = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        venueId: testVenueId,
        eventDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        guestCount: 200,
        eventType: 'wedding',
        message: 'Hello, please send details!'
      })
    });

    if (createRes.status !== 201) {
      throw new Error(`Failed to create inquiry: ${await createRes.text()}`);
    }
    const createData = await createRes.json();
    createdInquiryId = createData.inquiry.id || createData.inquiry._id;
    console.log('✓ Inquiry created successfully');

    // Verify email was sent to organizer
    if (sentEmails.length !== 1) {
      throw new Error(`Expected exactly 1 email to be sent, got ${sentEmails.length}`);
    }
    const creationEmail = sentEmails[0];
    console.log('Verifying creation email properties...');
    if (creationEmail.to !== ORG_EMAIL) {
      throw new Error(`Expected recipient to be organizer (${ORG_EMAIL}), got ${creationEmail.to}`);
    }
    if (!creationEmail.subject.includes('New Inquiry')) {
      throw new Error(`Expected subject to contain 'New Inquiry', got: "${creationEmail.subject}"`);
    }
    if (!creationEmail.text.includes('Email Notification Test Palace')) {
      throw new Error(`Expected body to mention venue name, got: "${creationEmail.text}"`);
    }
    console.log('✓ Creation email verified successfully');

    // 5. Test Acceptance Email Notification
    console.log('\n--- Testing Inquiry Acceptance Notification ---');
    sentEmails.length = 0; // Clear history

    const acceptRes = await fetch(`${BASE_URL}/inquiries/${createdInquiryId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    if (acceptRes.status !== 200) {
      throw new Error(`Failed to accept inquiry: ${await acceptRes.text()}`);
    }
    console.log('✓ Inquiry accepted successfully');

    // Verify email sent to customer (booking confirm + ICS)
    if (sentEmails.length !== 1) {
      throw new Error(`Expected exactly 1 email to be sent, got ${sentEmails.length}`);
    }
    const acceptEmail = sentEmails[0];
    console.log('Verifying acceptance email properties...');
    if (acceptEmail.to !== CUST_EMAIL) {
      throw new Error(`Expected recipient to be customer (${CUST_EMAIL}), got ${acceptEmail.to}`);
    }
    if (!acceptEmail.subject.includes('booking is confirmed')) {
      throw new Error(`Expected subject to contain 'booking is confirmed', got: "${acceptEmail.subject}"`);
    }
    if (!acceptEmail.text.includes('confirmed') || !acceptEmail.text.includes('calendar')) {
      throw new Error(`Expected body to contain confirmation text & calendar link, got: "${acceptEmail.text}"`);
    }
    console.log('✓ Acceptance email verified successfully');

    // 6. Test Rejection Email Notification
    console.log('\n--- Testing Inquiry Rejection Notification ---');
    
    // Create a 2nd temporary inquiry so we can reject it
    const createRes2 = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        venueId: testVenueId,
        eventDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
        guestCount: 200,
        eventType: 'wedding',
        message: 'Second inquiry'
      })
    });
    const createData2 = await createRes2.json();
    const createdInquiryId2 = createData2.inquiry.id || createData2.inquiry._id;

    sentEmails.length = 0; // Clear history

    const rejectRes = await fetch(`${BASE_URL}/inquiries/${createdInquiryId2}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    if (rejectRes.status !== 200) {
      throw new Error(`Failed to reject inquiry: ${await rejectRes.text()}`);
    }
    console.log('✓ Inquiry rejected successfully');

    // Verify email sent to customer notifying of declination
    if (sentEmails.length !== 1) {
      throw new Error(`Expected exactly 1 email to be sent, got ${sentEmails.length}`);
    }
    const rejectEmail = sentEmails[0];
    console.log('Verifying rejection email properties...');
    if (rejectEmail.to !== CUST_EMAIL) {
      throw new Error(`Expected recipient to be customer (${CUST_EMAIL}), got ${rejectEmail.to}`);
    }
    if (!rejectEmail.subject.includes('Update on your inquiry')) {
      throw new Error(`Expected subject to contain 'Update on your inquiry', got: "${rejectEmail.subject}"`);
    }
    if (!rejectEmail.text.includes('declined')) {
      throw new Error(`Expected body to contain declination text, got: "${rejectEmail.text}"`);
    }
    console.log('✓ Rejection email verified successfully');

    // Clean up second inquiry
    await Inquiry.findByIdAndDelete(createdInquiryId2);

    // 7. Test Email Send Failures Do Not Block Database Operations
    console.log('\n--- Testing Robustness Against Email Transport Failures ---');
    setupMockTransporter(true); // Force SMTP transport to crash/throw errors

    // Try creating an inquiry when mail fails
    const createResFail = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        venueId: testVenueId,
        eventDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
        guestCount: 200,
        eventType: 'wedding',
        message: 'Robustness test'
      })
    });
    if (createResFail.status !== 201) {
      throw new Error(`Creating inquiry failed under SMTP crash! Status: ${createResFail.status}`);
    }
    const createDataFail = await createResFail.json();
    const createdInquiryIdFail = createDataFail.inquiry.id || createDataFail.inquiry._id;
    console.log('✓ Inquiry creation succeeds even when email fails');

    // Try rejecting an inquiry when mail fails
    const rejectResFail = await fetch(`${BASE_URL}/inquiries/${createdInquiryIdFail}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    if (rejectResFail.status !== 200) {
      throw new Error(`Rejecting inquiry failed under SMTP crash! Status: ${rejectResFail.status}: ${await rejectResFail.text()}`);
    }
    console.log('✓ Inquiry status update succeeds even when email fails');

    // Clean up failure test inquiry
    await Inquiry.findByIdAndDelete(createdInquiryIdFail);

    console.log('\n==================================================');
    console.log('ALL INQUIRY EMAIL NOTIFICATION TESTS PASSED');
    console.log('==================================================\n');

    await cleanup();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    await cleanup();
    process.exit(1);
  } finally {
    // Restore original createTransport
    nodemailer.createTransport = originalCreateTransport;
  }
}

async function cleanup() {
  console.log('Cleaning up temporary resources...');
  try {
    if (createdInquiryId) {
      await Inquiry.findByIdAndDelete(createdInquiryId);
      console.log(`✓ Cleaned up test inquiry: ${createdInquiryId}`);
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
