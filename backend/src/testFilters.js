import connectDB from './config/database.js';
import Venue from './models/Venue.js';
import User from './models/User.js';
import { seedVenues } from './config/seedVenues.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runTests = async () => {
  await connectDB();

  console.log('\n--- Initializing Mock Database ---');
  let organizer = await User.findOne({ email: 'organizer@example.com' });
  if (!organizer) {
    organizer = new User({
      name: 'Sample Organizer',
      email: 'organizer@example.com',
      passwordHash: 'password123',
      role: 'organizer',
    });
    await organizer.save();
  }
  
  // Seed the standard venues
  await seedVenues(organizer.id || organizer._id);

  // Import query logic from the controller or write a wrapper
  const queryVenues = async (queryParams) => {
    const {
      state,
      city,
      search,
      venueType,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      minRating,
      amenities,
      indoor,
      outdoor,
      sort,
    } = queryParams;

    let filter = { isActive: true };
    const andConditions = [];

    if (state) {
      andConditions.push({ state: { $regex: state, $options: 'i' } });
    }

    if (city) {
      andConditions.push({ city: { $regex: city, $options: 'i' } });
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (venueType) {
      andConditions.push({
        $or: [
          { venueType: venueType },
          { type: { $regex: `^${venueType}$`, $options: 'i' } }
        ],
      });
    }

    if (minPrice || maxPrice) {
      const minP = minPrice ? parseInt(minPrice, 10) : 0;
      const maxP = maxPrice ? parseInt(maxPrice, 10) : Infinity;
      andConditions.push({
        $or: [
          {
            'pricing.perPlate': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.flatRate': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.base': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.buffet': {
              $gte: minP,
              $lte: maxP,
            },
          },
        ],
      });
    }

    if (minCapacity || maxCapacity) {
      const capConditions = [];
      if (minCapacity && maxCapacity) {
        const minCap = parseInt(minCapacity, 10);
        const maxCap = parseInt(maxCapacity, 10);
        capConditions.push({
          $or: [
            {
              $and: [
                { 'capacity.max': { $gte: minCap } },
                { 'capacity.min': { $lte: maxCap } },
              ],
            },
            {
              $and: [
                { capacity: { $gte: minCap } },
                { capacity: { $lte: maxCap } },
              ],
            },
          ],
        });
      } else if (minCapacity) {
        const minCap = parseInt(minCapacity, 10);
        capConditions.push({
          $or: [
            { 'capacity.max': { $gte: minCap } },
            { capacity: { $gte: minCap } },
          ],
        });
      } else if (maxCapacity) {
        const maxCap = parseInt(maxCapacity, 10);
        capConditions.push({
          $or: [
            { 'capacity.min': { $lte: maxCap } },
            { capacity: { $lte: maxCap } },
          ],
        });
      }
      andConditions.push(...capConditions);
    }

    if (minRating) {
      andConditions.push({ rating: { $gte: parseFloat(minRating) } });
    }

    if (indoor === 'true') {
      andConditions.push({ indoor: true });
    }
    if (outdoor === 'true') {
      andConditions.push({ outdoor: true });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const allowedSorts = {
      'rating-desc': { rating: -1, createdAt: -1 },
      'price-asc': { 'pricing.perPlate': 1, 'pricing.flatRate': 1 },
      'price-desc': { 'pricing.perPlate': -1, 'pricing.flatRate': -1 },
      'capacity-asc': { 'capacity.max': 1 },
      'capacity-desc': { 'capacity.max': -1 }
    };

    let sortObj = { rating: -1, createdAt: -1 };
    if (sort && allowedSorts[sort]) {
      sortObj = allowedSorts[sort];
    }

    let results = await Venue.find(filter).sort(sortObj).lean();

    if (amenities) {
      let amenList = Array.isArray(amenities) ? amenities : String(amenities).split(',').map((a) => a.trim().toLowerCase());
      amenList = amenList.map((a) => (a === 'sound' ? 'sound_system' : a));

      results = results.filter((v) => {
        const vAmenities = (v.amenities || []).map((a) => String(a).toLowerCase());
        return amenList.every((a) => {
          if (a === 'sound_system') {
            return vAmenities.includes('sound_system') || vAmenities.includes('sound');
          }
          return vAmenities.includes(a);
        });
      });
    }

    return results;
  };

  console.log('\n--- Running Test Suite ---');

  // Test A: Search + price
  console.log('\nTest A: Search + price');
  const resA = await queryVenues({ search: 'Palace', maxPrice: '4000' });
  console.log(`Query: search="Palace", maxPrice="4000"`);
  console.log(`Results (${resA.length}):`, resA.map(v => `${v.name} (Price perPlate: ${v.pricing?.perPlate}, flatRate: ${v.pricing?.flatRate})`));
  if (resA.some(v => !v.name.includes('Palace'))) throw new Error('Search failed to match "Palace"');
  if (resA.some(v => (v.pricing?.perPlate || v.pricing?.flatRate) > 4000)) throw new Error('Max price filter violated');

  // Test B: Search + capacity
  console.log('\nTest B: Search + capacity');
  const resB = await queryVenues({ search: 'Palace', minCapacity: '400', maxCapacity: '600' });
  console.log(`Query: search="Palace", minCapacity=400, maxCapacity=600`);
  console.log(`Results (${resB.length}):`, resB.map(v => `${v.name} (Capacity: ${v.capacity?.min}-${v.capacity?.max})`));

  // Test C: Price ranges
  console.log('\nTest C: Price ranges');
  const resC = await queryVenues({ minPrice: '3800', maxPrice: '4500' });
  console.log(`Query: minPrice=3800, maxPrice=4500`);
  console.log(`Results (${resC.length}):`, resC.map(v => `${v.name} (Price perPlate: ${v.pricing?.perPlate}, flatRate: ${v.pricing?.flatRate})`));

  // Test D: Capacity ranges
  console.log('\nTest D: Capacity ranges');
  const resD = await queryVenues({ minCapacity: '500', maxCapacity: '1000' });
  console.log(`Query: minCapacity=500, maxCapacity=1000`);
  console.log(`Results (${resD.length}):`, resD.map(v => `${v.name} (Capacity: ${v.capacity?.min}-${v.capacity?.max})`));

  // Test E: Venue type
  console.log('\nTest E: Venue type');
  const resE = await queryVenues({ venueType: 'resort' });
  console.log(`Query: venueType="resort"`);
  console.log(`Results (${resE.length}):`, resE.map(v => `${v.name} (Type: ${v.venueType || v.type})`));

  // Test F: Indoor/Outdoor
  console.log('\nTest F: Indoor/Outdoor');
  const resF1 = await queryVenues({ indoor: 'true' });
  console.log(`Query: indoor=true`);
  console.log(`Results (${resF1.length}):`, resF1.map(v => `${v.name} (Indoor: ${v.indoor}, Outdoor: ${v.outdoor})`));

  // Test G: Amenities
  console.log('\nTest G: Amenities');
  const resG1 = await queryVenues({ amenities: 'sound' });
  console.log(`Query: amenities="sound"`);
  console.log(`Results (${resG1.length}):`, resG1.map(v => `${v.name} (Amenities: ${v.amenities.join(', ')})`));

  const resG2 = await queryVenues({ amenities: 'parking,wifi' });
  console.log(`Query: amenities="parking,wifi"`);
  console.log(`Results (${resG2.length}):`, resG2.map(v => `${v.name} (Amenities: ${v.amenities.join(', ')})`));

  // Test H: Ratings
  console.log('\nTest H: Ratings');
  const resH = await queryVenues({ minRating: '4.7' });
  console.log(`Query: minRating=4.7`);
  console.log(`Results (${resH.length}):`, resH.map(v => `${v.name} (Rating: ${v.rating})`));

  // Test I: Multiple filters combined
  console.log('\nTest I: Multiple filters combined');
  const resI = await queryVenues({
    search: 'Palace',
    maxPrice: '4000',
    minCapacity: '400',
    amenities: 'parking,wifi'
  });
  console.log(`Query: search="Palace", maxPrice=4000, minCapacity=400, amenities="parking,wifi"`);
  console.log(`Results (${resI.length}):`, resI.map(v => `${v.name} (Price perPlate: ${v.pricing?.perPlate}, Capacity: ${v.capacity?.min}-${v.capacity?.max}, Amenities: ${v.amenities.join(', ')})`));

  // Test J: Organizer-created venue
  console.log('\nTest J: Organizer-created venue');
  const oldTest = await Venue.find({ name: 'Organizer Test Garden' }).exec();
  for (const o of oldTest) {
    await Venue.findByIdAndDelete(o.id || o._id);
  }

  const newVenue = new Venue({
    name: 'Organizer Test Garden',
    city: 'mumbai',
    venueType: 'lawn',
    type: 'Lawn',
    capacity: { min: 25, max: 100 },
    pricing: { perPlate: 0, flatRate: 5000 },
    amenities: ['parking', 'sound_system', 'catering'],
    indoor: false,
    outdoor: true,
    organizer: organizer.id || organizer._id,
    isActive: true,
    rating: 4.8
  });
  await newVenue.save();
  console.log('Created standardized organizer venue:', newVenue.name);

  const resJ1 = await queryVenues({ search: 'Test Garden' });
  console.log(`Search for "Test Garden": found ${resJ1.length} venues`);
  if (resJ1.length === 0) throw new Error('Failed to find organizer-created venue by search name');

  const resJ2 = await queryVenues({ minPrice: '4000', maxPrice: '6000' });
  console.log(`Filter by price 4000-6000: found ${resJ2.length} venues`);
  if (!resJ2.some(v => v.name === 'Organizer Test Garden')) throw new Error('Organizer-created venue flatRate pricing filter failed');

  const resJ3 = await queryVenues({ minCapacity: '80', maxCapacity: '120' });
  console.log(`Filter by capacity 80-120: found ${resJ3.length} venues`);
  if (!resJ3.some(v => v.name === 'Organizer Test Garden')) throw new Error('Organizer-created venue capacity filter failed');

  const resJ4 = await queryVenues({ venueType: 'lawn' });
  console.log(`Filter by venueType "lawn": found ${resJ4.length} venues`);
  if (!resJ4.some(v => v.name === 'Organizer Test Garden')) throw new Error('Organizer-created venue type filter failed');

  const resJ5 = await queryVenues({ amenities: 'sound' });
  console.log(`Filter by amenity "sound": found ${resJ5.length} venues`);
  if (!resJ5.some(v => v.name === 'Organizer Test Garden')) throw new Error('Organizer-created venue sound amenity filter failed');

  await Venue.findByIdAndDelete(newVenue.id || newVenue._id);
  console.log('Cleaned up organizer test venue.');

  // Test K: Sorting validation
  console.log('\nTest K: Sorting validation');

  // Test K1: Price asc
  const resK1 = await queryVenues({ sort: 'price-asc' });
  console.log('Price Ascending:');
  resK1.forEach(v => {
    const p = v.pricing?.perPlate || v.pricing?.flatRate || v.pricing?.base || v.pricing?.buffet || 0;
    console.log(`  - ${v.name}: ₹${p}`);
  });
  for (let i = 0; i < resK1.length - 1; i++) {
    const p1 = resK1[i].pricing?.perPlate || resK1[i].pricing?.flatRate || resK1[i].pricing?.base || resK1[i].pricing?.buffet || 0;
    const p2 = resK1[i+1].pricing?.perPlate || resK1[i+1].pricing?.flatRate || resK1[i+1].pricing?.base || resK1[i+1].pricing?.buffet || 0;
    if (p1 > p2) throw new Error('Price-asc sorting check failed!');
  }

  // Test K2: Price desc
  const resK2 = await queryVenues({ sort: 'price-desc' });
  console.log('Price Descending:');
  resK2.forEach(v => {
    const p = v.pricing?.perPlate || v.pricing?.flatRate || v.pricing?.base || v.pricing?.buffet || 0;
    console.log(`  - ${v.name}: ₹${p}`);
  });
  for (let i = 0; i < resK2.length - 1; i++) {
    const p1 = resK2[i].pricing?.perPlate || resK2[i].pricing?.flatRate || resK2[i].pricing?.base || resK2[i].pricing?.buffet || 0;
    const p2 = resK2[i+1].pricing?.perPlate || resK2[i+1].pricing?.flatRate || resK2[i+1].pricing?.base || resK2[i+1].pricing?.buffet || 0;
    if (p1 < p2) throw new Error('Price-desc sorting check failed!');
  }

  // Test K3: Capacity asc
  const resK3 = await queryVenues({ sort: 'capacity-asc' });
  console.log('Capacity Ascending:');
  resK3.forEach(v => {
    const c = typeof v.capacity === 'object' ? v.capacity.max : v.capacity;
    console.log(`  - ${v.name}: ${c} guests`);
  });
  for (let i = 0; i < resK3.length - 1; i++) {
    const c1 = typeof resK3[i].capacity === 'object' ? resK3[i].capacity.max : resK3[i].capacity;
    const c2 = typeof resK3[i+1].capacity === 'object' ? resK3[i+1].capacity.max : resK3[i+1].capacity;
    if (c1 > c2) throw new Error('Capacity-asc sorting check failed!');
  }

  // Test K4: Capacity desc
  const resK4 = await queryVenues({ sort: 'capacity-desc' });
  console.log('Capacity Descending:');
  resK4.forEach(v => {
    const c = typeof v.capacity === 'object' ? v.capacity.max : v.capacity;
    console.log(`  - ${v.name}: ${c} guests`);
  });
  for (let i = 0; i < resK4.length - 1; i++) {
    const c1 = typeof resK4[i].capacity === 'object' ? resK4[i].capacity.max : resK4[i].capacity;
    const c2 = typeof resK4[i+1].capacity === 'object' ? resK4[i+1].capacity.max : resK4[i+1].capacity;
    if (c1 < c2) throw new Error('Capacity-desc sorting check failed!');
  }

  // Test K5: Rating desc
  const resK5 = await queryVenues({ sort: 'rating-desc' });
  console.log('Rating Descending:');
  resK5.forEach(v => {
    console.log(`  - ${v.name}: ${v.rating} stars`);
  });
  for (let i = 0; i < resK5.length - 1; i++) {
    if (resK5[i].rating < resK5[i+1].rating) throw new Error('Rating-desc sorting check failed!');
  }

  console.log('\n--- ALL BEHAVIORAL TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
};

runTests().catch(err => {
  console.error('\n--- TEST FAILURE ---');
  console.error(err);
  process.exit(1);
});
