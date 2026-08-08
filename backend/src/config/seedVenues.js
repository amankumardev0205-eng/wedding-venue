import Venue from '../models/Venue.js';

// Indian wedding venues sample data for seeding
const sampleVenues = [
  {
    name: 'Rambagh Palace Jaipur',
    description: 'The legendary "Jewel of Jaipur", this historic palace offers majestic gardens, high ceilings, and royal marble halls. Perfect for destination heritage weddings.',
    state: 'rajasthan',
    city: 'jaipur',
    address: 'Bhawani Singh Rd, Jaipur, Rajasthan 302005',
    coordinates: { lat: 26.8979, lng: 75.8080 },
    venueType: 'resort',
    capacity: { min: 100, max: 800 },
    pricing: { perPlate: 3500, currency: 'INR' },
    amenities: ['parking', 'ac', 'wifi', 'catering', 'sound_system', 'lighting', 'decoration'],
    indoor: true,
    outdoor: true,
    images: [{ url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.9,
    isActive: true,
  },
  {
    name: 'Taj Lake Palace Udaipur',
    description: 'A floating marble palace on Lake Pichola, offering breathtaking lake views, royal courtyards, and signature Mewari hospitality.',
    state: 'rajasthan',
    city: 'udaipur',
    address: 'Lake Pichola, Udaipur, Rajasthan 313001',
    coordinates: { lat: 24.5756, lng: 73.6800 },
    venueType: 'resort',
    capacity: { min: 50, max: 400 },
    pricing: { perPlate: 4500, currency: 'INR' },
    amenities: ['parking', 'ac', 'wifi', 'catering', 'sound_system', 'lighting'],
    indoor: true,
    outdoor: true,
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.8,
    isActive: true,
  },
  {
    name: 'The Taj Mahal Palace Mumbai',
    description: 'Iconic luxury hotel overlooking the Gateway of India. Features the legendary Crystal Room ballroom and premium banquet spaces.',
    state: 'maharashtra',
    city: 'mumbai',
    address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    coordinates: { lat: 18.9220, lng: 72.8333 },
    venueType: 'hotel',
    capacity: { min: 150, max: 600 },
    pricing: { perPlate: 4000, currency: 'INR' },
    amenities: ['parking', 'ac', 'wifi', 'catering', 'sound_system', 'lighting', 'decoration'],
    indoor: true,
    outdoor: false,
    images: [{ url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.7,
    isActive: true,
  },
  {
    name: 'Royal Cavelossim Beach Lawn',
    description: 'Sprawling sandy beachfront lawn in South Goa, perfect for sunset nuptials and tropical resort theme wedding celebrations.',
    state: 'goa',
    city: 'south goa',
    address: 'Mobor Beach, Cavelossim, Goa 403731',
    coordinates: { lat: 15.1748, lng: 73.9317 },
    venueType: 'lawn',
    capacity: { min: 200, max: 1000 },
    pricing: { flatRate: 350000, currency: 'INR' },
    amenities: ['parking', 'catering', 'sound_system', 'lighting', 'decoration'],
    indoor: false,
    outdoor: true,
    images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.6,
    isActive: true,
  },
  {
    name: 'The Leela Palace New Delhi',
    description: 'Ultra-luxury palatial hotel located in Chanakyapuri. Offers spectacular hand-carved stone structures and magnificent ballroom setups.',
    state: 'delhi ncr',
    city: 'new delhi',
    address: 'Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110021',
    coordinates: { lat: 28.5790, lng: 77.1950 },
    venueType: 'hotel',
    capacity: { min: 150, max: 500 },
    pricing: { perPlate: 3800, currency: 'INR' },
    amenities: ['parking', 'ac', 'wifi', 'catering', 'sound_system', 'lighting', 'decoration'],
    indoor: true,
    outdoor: true,
    images: [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.8,
    isActive: true,
  },
  {
    name: 'Bengaluru Palace Grounds Mandap',
    description: 'A grand royal open-air setting and enormous decorated wedding halls located within the historic Palace Grounds.',
    state: 'karnataka',
    city: 'bengaluru',
    address: 'Jayachamara Road, Bengaluru, Karnataka 560006',
    coordinates: { lat: 13.0035, lng: 77.5891 },
    venueType: 'banquet',
    capacity: { min: 300, max: 2500 },
    pricing: { flatRate: 500000, currency: 'INR' },
    amenities: ['parking', 'catering', 'sound_system', 'lighting', 'decoration'],
    indoor: true,
    outdoor: true,
    images: [{ url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' }],
    rating: 4.5,
    isActive: true,
  }
];

// Seed venues with a default organizer, removing any existing ones first to refresh
export const seedVenues = async (organizerId) => {
  try {
    // Delete any old venues to trigger fresh Indian seed data
    const existing = await Venue.find().exec();
    if (existing.length > 0) {
      console.log('Clearing old venues database collection to refresh seed data...');
      for (const v of existing) {
        await Venue.findByIdAndDelete(v.id || v._id);
      }
    }

    const venuesToSeed = sampleVenues.map((venue) => ({
      ...venue,
      organizer: organizerId,
    }));

    const createdVenues = await Venue.insertMany(venuesToSeed);
    console.log(`Successfully seeded ${createdVenues.length} Indian wedding venues`);
    return createdVenues;
  } catch (error) {
    console.error('Error seeding Indian venues:', error.message);
  }
};

export default sampleVenues;
