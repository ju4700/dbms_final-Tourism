import mongoose from 'mongoose'
import { Tourist } from '../src/models/Tourist'
import { TourPackage } from '../src/models/TourPackage'
import { Guide } from '../src/models/Guide'
import { Hotel } from '../src/models/Hotel'
import Destination from '../src/models/Destination'
import Booking from '../src/models/Booking'
import GlobalSettings from '../src/models/GlobalSettings'

// Direct MongoDB URI
const MONGODB_URI = 'mongodb+srv://jalaldevdesign:dbmspro47@dbmscluster.d21tajo.mongodb.net/?retryWrites=true&w=majority&appName=dbmscluster'

async function seedBangladeshTourismData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('🇧🇩 Connected to database for Bangladesh Tourism Data')

    // Clear existing data
    await Tourist.deleteMany({})
    await TourPackage.deleteMany({})
    await Guide.deleteMany({})
    await Hotel.deleteMany({})
    await Destination.deleteMany({})
    await Booking.deleteMany({})
    await GlobalSettings.deleteMany({})
    console.log('🗑️ Cleared existing data')

    // Create Bangladesh destinations
    const destinations = [
      {
        name: 'Cox\'s Bazar',
        country: 'Bangladesh',
        description: 'World\'s longest natural sea beach with golden sandy shore stretching 120km',
        popularAttractions: ['Cox\'s Bazar Beach', 'Himchari National Park', 'Inani Beach', 'Maheshkhali Island', 'Buddhist Temple'],
        bestTimeToVisit: 'November to March',
        averageCost: 5000 // BDT
      },
      {
        name: 'Sundarbans',
        country: 'Bangladesh',
        description: 'World\'s largest mangrove forest and UNESCO World Heritage Site, home to Royal Bengal Tigers',
        popularAttractions: ['Royal Bengal Tiger', 'Mangrove Forest', 'Hiron Point', 'Katka Beach', 'Dublar Char Island'],
        bestTimeToVisit: 'November to February',
        averageCost: 8000 // BDT
      },
      {
        name: 'Sylhet',
        country: 'Bangladesh',
        description: 'Tea capital of Bangladesh with rolling hills, tea gardens, and natural beauty',
        popularAttractions: ['Ratargul Swamp Forest', 'Jaflong', 'Srimangal Tea Gardens', 'Lawachara National Park', 'Shah Jalal Mazar'],
        bestTimeToVisit: 'October to March',
        averageCost: 6000 // BDT
      },
      {
        name: 'Chittagong Hill Tracts',
        country: 'Bangladesh',
        description: 'Mountainous region with diverse indigenous cultures, hills, and valleys',
        popularAttractions: ['Rangamati Lake', 'Bandarban Hills', 'Kaptai Lake', 'Nafakhum Waterfall', 'Sajek Valley'],
        bestTimeToVisit: 'October to March',
        averageCost: 7000 // BDT
      },
      {
        name: 'Dhaka',
        country: 'Bangladesh',
        description: 'Capital city rich in Mughal architecture, vibrant culture, and historical landmarks',
        popularAttractions: ['Lalbagh Fort', 'Ahsan Manzil', 'Dhakeshwari Temple', 'National Museum', 'Old Dhaka'],
        bestTimeToVisit: 'November to February',
        averageCost: 4000 // BDT
      },
      {
        name: 'Paharpur',
        country: 'Bangladesh',
        description: 'Ancient Buddhist monastery ruins and UNESCO World Heritage Site',
        popularAttractions: ['Somapura Mahavihara', 'Buddhist Temple Ruins', 'Archaeological Museum', 'Ancient Stupas'],
        bestTimeToVisit: 'November to February',
        averageCost: 3500 // BDT
      },
      {
        name: 'Kuakata',
        country: 'Bangladesh',
        description: 'Daughter of the sea - rare beach where both sunrise and sunset can be seen',
        popularAttractions: ['Kuakata Beach', 'Sunrise & Sunset Point', 'Sima Temple', 'Keramat Shaheed Mosque', 'Fatrar Char'],
        bestTimeToVisit: 'November to March',
        averageCost: 4500 // BDT
      },
      {
        name: 'Bagerhat',
        country: 'Bangladesh',
        description: 'Historic mosque city with 15th-century architecture and UNESCO World Heritage Site',
        popularAttractions: ['Sixty Dome Mosque', 'Khan Jahan Ali Tomb', 'Nine Dome Mosque', 'Chunakhola Mosque'],
        bestTimeToVisit: 'November to February',
        averageCost: 3000 // BDT
      }
    ]

    for (const dest of destinations) {
      await Destination.create(dest)
    }
    console.log('🏝️ Created Bangladesh destinations')

    // Create tour guides
    const guides = [
      {
        guideId: 'GD-001',
        name: 'Md. Rashidul Islam',
        email: 'rashid.guide@gmail.com',
        phone: '+8801711223344',
        languages: ['Bengali', 'English', 'Hindi'],
        specializations: ['Historical Sites', 'Cultural Tours', 'Archaeological Sites'],
        destinations: ['Dhaka', 'Paharpur', 'Mahasthangarh'],
        experience: 8,
        rating: 4.8,
        totalReviews: 234,
        pricePerDay: 2500,
        availability: [
          { date: new Date('2025-08-05'), isAvailable: true },
          { date: new Date('2025-08-06'), isAvailable: true },
          { date: new Date('2025-08-07'), isAvailable: false }
        ],
        certifications: [
          { name: 'Bangladesh Tourism Board Certified', issuedBy: 'Bangladesh Tourism Board', validUntil: new Date('2026-12-31') },
          { name: 'First Aid Certified', issuedBy: 'Red Crescent Bangladesh', validUntil: new Date('2025-12-31') }
        ],
        bio: 'Expert in Bangladeshi history and culture with 8 years of experience guiding international tourists.',
        emergencyContact: {
          name: 'Rashida Islam',
          phone: '+8801711223355',
          relationship: 'Spouse'
        }
      },
      {
        guideId: 'GD-002',
        name: 'Fatima Begum',
        email: 'fatima.tours@gmail.com',
        phone: '+8801555667788',
        languages: ['Bengali', 'English', 'Arabic'],
        specializations: ['Nature Tours', 'Wildlife', 'Eco-tourism'],
        destinations: ['Sundarbans', 'Sylhet', 'Chittagong Hill Tracts'],
        experience: 6,
        rating: 4.9,
        totalReviews: 189,
        pricePerDay: 3000,
        availability: [
          { date: new Date('2025-08-05'), isAvailable: true },
          { date: new Date('2025-08-06'), isAvailable: true },
          { date: new Date('2025-08-07'), isAvailable: true }
        ],
        certifications: [
          { name: 'Wildlife Guide License', issuedBy: 'Bangladesh Forest Department', validUntil: new Date('2026-06-30') },
          { name: 'Eco-tourism Specialist', issuedBy: 'Wildlife Photography Society', validUntil: new Date('2025-12-31') }
        ],
        bio: 'Specialized in Sundarbans and wildlife tours with extensive knowledge of mangrove ecosystems.',
        emergencyContact: {
          name: 'Abdul Begum',
          phone: '+8801555667799',
          relationship: 'Father'
        }
      },
      {
        guideId: 'GD-003',
        name: 'Aminul Haque',
        email: 'aminul.adventure@gmail.com',
        phone: '+8801888999000',
        languages: ['Bengali', 'English', 'Chakma'],
        specializations: ['Hill Tracts', 'Adventure Tours', 'Tribal Culture'],
        destinations: ['Bandarban', 'Rangamati', 'Khagrachhari'],
        experience: 10,
        rating: 4.7,
        totalReviews: 156,
        pricePerDay: 3500,
        availability: [
          { date: new Date('2025-08-05'), isAvailable: false },
          { date: new Date('2025-08-06'), isAvailable: true },
          { date: new Date('2025-08-07'), isAvailable: true }
        ],
        certifications: [
          { name: 'Mountain Guide Certificate', issuedBy: 'Bangladesh Mountain Club', validUntil: new Date('2026-03-31') },
          { name: 'Cultural Heritage Guide', issuedBy: 'Tribal Cultural Institute', validUntil: new Date('2025-09-30') }
        ],
        bio: 'Adventure specialist for Chittagong Hill Tracts with deep knowledge of indigenous cultures.',
        emergencyContact: {
          name: 'Rahima Haque',
          phone: '+8801888999001',
          relationship: 'Sister'
        }
      },
      {
        guideId: 'GD-004',
        name: 'Nasir Ahmed',
        email: 'nasir.beach@gmail.com',
        phone: '+8801333444555',
        languages: ['Bengali', 'English', 'Urdu'],
        specializations: ['Beach Tours', 'Coastal Areas', 'Marine Life'],
        destinations: ['Cox\'s Bazar', 'Saint Martin\'s Island', 'Kuakata'],
        experience: 5,
        rating: 4.6,
        totalReviews: 98,
        pricePerDay: 2000,
        availability: [
          { date: new Date('2025-08-05'), isAvailable: true },
          { date: new Date('2025-08-06'), isAvailable: true },
          { date: new Date('2025-08-07'), isAvailable: false }
        ],
        certifications: [
          { name: 'Coastal Tourism Guide', issuedBy: 'Bangladesh Coast Guard', validUntil: new Date('2025-11-30') },
          { name: 'Marine Safety Certificate', issuedBy: 'Marine Research Institute', validUntil: new Date('2026-01-31') }
        ],
        bio: 'Beach and coastal tourism expert specializing in Cox\'s Bazar and Kuakata regions.',
        emergencyContact: {
          name: 'Salma Ahmed',
          phone: '+8801333444566',
          relationship: 'Mother'
        }
      }
    ]

    for (const guide of guides) {
      await Guide.create(guide)
    }
    console.log('👨‍🏫 Created tour guides')

    // Create hotels
    const hotels = [
      {
        hotelId: 'HTL-001',
        name: 'Sea Crown Hotel & Resort',
        description: 'Beachfront hotel with stunning sea views and modern amenities in Cox\'s Bazar.',
        destination: 'Cox\'s Bazar',
        address: {
          street: 'Marine Drive Road',
          city: 'Cox\'s Bazar',
          state: 'Chittagong Division',
          country: 'Bangladesh',
          zipCode: '4700'
        },
        starRating: 4,
        priceRange: 'mid-range',
        amenities: ['Free WiFi', 'Swimming Pool', 'Sea View', 'Restaurant', 'Room Service', 'Parking'],
        roomTypes: [
          { type: 'Standard Room', price: 3000, available: 10 },
          { type: 'Deluxe Room', price: 4500, available: 8 },
          { type: 'Sea View Suite', price: 6000, available: 5 },
          { type: 'Family Room', price: 5500, available: 2 }
        ],
        contactInfo: {
          phone: '+88032156789',
          email: 'info@seacrown.com.bd',
          website: 'www.seacrown.com.bd'
        },
        totalRooms: 80,
        availableRooms: 25,
        isActive: true
      },
      {
        hotelId: 'HTL-002',
        name: 'Hotel Tiger Garden International',
        description: 'Gateway hotel to Sundarbans with specialized wildlife tour arrangements.',
        destination: 'Sundarbans',
        address: {
          street: 'Mongla Port',
          city: 'Mongla',
          state: 'Khulna Division',
          country: 'Bangladesh',
          zipCode: '9351'
        },
        starRating: 4,
        priceRange: 'mid-range',
        amenities: ['Restaurant', 'Boat Service', 'Wildlife Tours', 'Conference Hall', 'Garden View'],
        roomTypes: [
          { type: 'Standard Room', price: 2500, available: 8 },
          { type: 'Deluxe Room', price: 3500, available: 3 },
          { type: 'Executive Suite', price: 5000, available: 1 }
        ],
        contactInfo: {
          phone: '+88046712345',
          email: 'info@tigergarden.com.bd',
          website: 'www.tigergarden.com.bd'
        },
        totalRooms: 45,
        availableRooms: 12,
        isActive: true
      },
      {
        hotelId: 'HTL-003',
        name: 'Grand Sylhet Hotel & Resort',
        description: 'Luxury hotel in the heart of tea country with panoramic hill views.',
        destination: 'Sylhet',
        address: {
          street: 'Zindabazar',
          city: 'Sylhet',
          state: 'Sylhet Division',
          country: 'Bangladesh',
          zipCode: '3100'
        },
        starRating: 5,
        priceRange: 'luxury',
        amenities: ['Spa', 'Fitness Center', 'Tea Garden Tours', 'Multi-cuisine Restaurant', 'Business Center'],
        roomTypes: [
          { type: 'Deluxe Room', price: 4000, available: 15 },
          { type: 'Executive Suite', price: 6500, available: 10 },
          { type: 'Presidential Suite', price: 12000, available: 2 },
          { type: 'Tea Garden View Room', price: 5000, available: 8 }
        ],
        contactInfo: {
          phone: '+880821123456',
          email: 'reservations@grandsylhet.com',
          website: 'www.grandsylhet.com'
        },
        totalRooms: 120,
        availableRooms: 35,
        isActive: true
      },
      {
        hotelId: 'HTL-004',
        name: 'Hill View Resort Bandarban',
        description: 'Mountain resort offering authentic hill tract experience with tribal cultural immersion.',
        destination: 'Chittagong Hill Tracts',
        address: {
          street: 'Chimbuk Hill',
          city: 'Bandarban',
          state: 'Chittagong Division',
          country: 'Bangladesh',
          zipCode: '4600'
        },
        starRating: 4,
        priceRange: 'mid-range',
        amenities: ['Mountain View', 'Trekking Arrangements', 'Tribal Cultural Shows', 'Bonfire', 'Hiking Guides'],
        roomTypes: [
          { type: 'Hill View Cottage', price: 3500, available: 5 },
          { type: 'Tribal Style Room', price: 2800, available: 2 },
          { type: 'Family Suite', price: 4500, available: 1 }
        ],
        contactInfo: {
          phone: '+88036156789',
          email: 'booking@hillviewbandarban.com',
          website: 'www.hillviewbandarban.com'
        },
        totalRooms: 30,
        availableRooms: 8,
        isActive: true
      },
      {
        hotelId: 'HTL-005',
        name: 'Hotel Dhaka Regency',
        description: 'Premium business hotel in Dhaka with easy access to cultural and historical sites.',
        destination: 'Dhaka',
        address: {
          street: 'Road 27, Gulshan 2',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          zipCode: '1212'
        },
        starRating: 5,
        priceRange: 'luxury',
        amenities: ['Rooftop Pool', 'Spa', 'Multi-cuisine Restaurant', 'Business Center', 'City Tours', 'Shopping Assistance'],
        roomTypes: [
          { type: 'Executive Room', price: 5000, available: 20 },
          { type: 'Junior Suite', price: 7500, available: 12 },
          { type: 'Presidential Suite', price: 15000, available: 2 },
          { type: 'Business Suite', price: 8500, available: 8 }
        ],
        contactInfo: {
          phone: '+8809612345678',
          email: 'info@dhakaregency.com',
          website: 'www.dhakaregency.com'
        },
        totalRooms: 150,
        availableRooms: 42,
        isActive: true
      }
    ]

    for (const hotel of hotels) {
      await Hotel.create(hotel)
    }
    console.log('🏨 Created hotels')

    // Create tour packages
    const tourPackages = [
      {
        packageId: 'BD-001',
        name: 'Cox\'s Bazar Beach Paradise',
        description: 'Experience the world\'s longest sea beach with sunset views, local seafood, and beach activities',
        destination: 'Cox\'s Bazar',
        duration: 4,
        price: 18000,
        inclusions: ['Hotel accommodation', 'All meals', 'Transportation', 'Beach activities', 'Local guide'],
        exclusions: ['Personal expenses', 'Travel insurance', 'Extra activities'],
        itinerary: [
          {
            day: 1,
            title: 'Arrival and Beach Exploration',
            description: 'Check-in at hotel, evening beach walk and sunset viewing',
            activities: ['Hotel check-in', 'Beach walk', 'Sunset photography', 'Local seafood dinner']
          },
          {
            day: 2,
            title: 'Himchari and Inani Beach',
            description: 'Visit Himchari National Park and pristine Inani Beach',
            activities: ['Himchari National Park', 'Inani Beach visit', 'Coral stone collection', 'Beach sports']
          },
          {
            day: 3,
            title: 'Maheshkhali Island Tour',
            description: 'Day trip to Maheshkhali Island and Buddhist temple visit',
            activities: ['Boat ride to Maheshkhali', 'Buddhist temple visit', 'Island exploration', 'Local lunch']
          },
          {
            day: 4,
            title: 'Departure',
            description: 'Morning beach time and departure',
            activities: ['Morning beach time', 'Souvenir shopping', 'Check-out and departure']
          }
        ],
        maxGroupSize: 15,
        difficulty: 'easy',
        category: 'beach',
        isActive: true
      },
      {
        packageId: 'BD-002',
        name: 'Sundarbans Tiger Safari',
        description: 'Adventure into the world\'s largest mangrove forest in search of Royal Bengal Tigers',
        destination: 'Sundarbans',
        duration: 3,
        price: 25000,
        inclusions: ['Boat accommodation', 'All meals', 'Forest permits', 'Professional guide', 'Binoculars'],
        exclusions: ['Personal gear', 'Insurance', 'Tips for crew'],
        itinerary: [
          {
            day: 1,
            title: 'Journey to Sundarbans',
            description: 'Travel to Mongla and board forest boat',
            activities: ['Travel to Mongla', 'Boat boarding', 'Forest entry briefing', 'Evening wildlife spotting']
          },
          {
            day: 2,
            title: 'Deep Forest Exploration',
            description: 'Full day forest safari and wildlife observation',
            activities: ['Early morning safari', 'Hiron Point visit', 'Tiger tracking', 'Bird watching', 'Night guard duty']
          },
          {
            day: 3,
            title: 'Katka Beach and Return',
            description: 'Visit Katka beach and return journey',
            activities: ['Katka beach visit', 'Deer spotting', 'Return journey', 'Experience sharing']
          }
        ],
        maxGroupSize: 12,
        difficulty: 'moderate',
        category: 'wildlife',
        isActive: true
      },
      {
        packageId: 'BD-003',
        name: 'Sylhet Tea Garden Experience',
        description: 'Immerse in the lush tea gardens of Sylhet with nature walks and tea tasting',
        destination: 'Sylhet',
        duration: 3,
        price: 20000,
        inclusions: ['Resort stay', 'Tea garden tours', 'All meals', 'Transportation', 'Tea tasting sessions'],
        exclusions: ['Personal shopping', 'Extra beverages', 'Spa treatments'],
        itinerary: [
          {
            day: 1,
            title: 'Arrival and Srimangal',
            description: 'Arrive in Sylhet and proceed to Srimangal tea capital',
            activities: ['Arrival in Sylhet', 'Drive to Srimangal', 'Tea garden walk', 'Tea museum visit']
          },
          {
            day: 2,
            title: 'Ratargul and Jaflong',
            description: 'Explore the swamp forest and stone quarries of Jaflong',
            activities: ['Ratargul Swamp Forest', 'Boat ride', 'Jaflong stone collection', 'Border area visit']
          },
          {
            day: 3,
            title: 'Lawachara and Departure',
            description: 'Visit Lawachara National Park and departure',
            activities: ['Lawachara National Park', 'Wildlife spotting', 'Nature trail', 'Return to Sylhet']
          }
        ],
        maxGroupSize: 20,
        difficulty: 'easy',
        category: 'wildlife',
        isActive: true
      },
      {
        packageId: 'BD-004',
        name: 'Hill Tracts Adventure',
        description: 'Explore the tribal culture and mountainous beauty of Chittagong Hill Tracts',
        destination: 'Chittagong Hill Tracts',
        duration: 5,
        price: 28000,
        inclusions: ['Hotel/resort stay', 'Tribal village visits', 'All meals', 'Local transport', 'Cultural guide'],
        exclusions: ['Personal expenses', 'Photography fees in villages', 'Insurance'],
        itinerary: [
          {
            day: 1,
            title: 'Rangamati Lake District',
            description: 'Explore the lake district and tribal museum',
            activities: ['Kaptai Lake boat ride', 'Tribal Cultural Museum', 'Hanging Bridge', 'Lake Resort check-in']
          },
          {
            day: 2,
            title: 'Bandarban Hills',
            description: 'Journey to Bandarban and hill exploration',
            activities: ['Travel to Bandarban', 'Chimbuk Hill visit', 'Tribal village interaction', 'Hill resort stay']
          },
          {
            day: 3,
            title: 'Sajek Valley',
            description: 'Visit the Queen of Hills - Sajek Valley',
            activities: ['Sajek Valley drive', 'Sunrise viewing', 'Tribal handicraft shopping', 'Nature photography']
          },
          {
            day: 4,
            title: 'Nafakhum Waterfall',
            description: 'Trek to the largest waterfall in Bangladesh',
            activities: ['Nafakhum waterfall trek', 'River bathing', 'Picnic lunch', 'Tribal dance performance']
          },
          {
            day: 5,
            title: 'Return Journey',
            description: 'Return to Chittagong with cultural memories',
            activities: ['Cultural souvenir shopping', 'Photo session', 'Return journey']
          }
        ],
        maxGroupSize: 15,
        difficulty: 'challenging',
        category: 'adventure',
        isActive: true
      },
      {
        packageId: 'BD-005',
        name: 'Historic Dhaka Heritage Tour',
        description: 'Discover the rich Mughal and colonial heritage of Old Dhaka',
        destination: 'Dhaka',
        duration: 2,
        price: 12000,
        inclusions: ['Hotel accommodation', 'Heritage site entries', 'Local guide', 'Traditional lunch', 'Transportation'],
        exclusions: ['Personal shopping', 'Extra meals', 'Tips'],
        itinerary: [
          {
            day: 1,
            title: 'Mughal Heritage',
            description: 'Explore Mughal architectural marvels in Old Dhaka',
            activities: ['Lalbagh Fort', 'Ahsan Manzil (Pink Palace)', 'Dhakeshwari Temple', 'Old Dhaka street food tour']
          },
          {
            day: 2,
            title: 'Cultural Dhaka',
            description: 'Modern Dhaka and cultural sites',
            activities: ['National Museum', 'Liberation War Museum', 'Sadarghat River Port', 'New Market shopping']
          }
        ],
        maxGroupSize: 25,
        difficulty: 'easy',
        category: 'cultural',
        isActive: true
      }
    ]

    for (const pkg of tourPackages) {
      await TourPackage.create(pkg)
    }
    console.log('📦 Created tour packages')

    // Create sample tourists
    const tourists = [
      {
        touristId: 'T-2025-001',
        name: 'Abdullah Rahman',
        email: 'abdullah.rahman@gmail.com',
        phone: '+8801711234567',
        nationality: 'Bangladeshi',
        age: 28,
        gender: 'male',
        destination: 'Cox\'s Bazar',
        address: {
          building: 'House 25',
          street: 'Road 12, Dhanmondi',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          zipCode: '1205'
        },
        tourPackage: 'BD-001',
        packagePrice: 18000,
        totalAmount: 36000,
        travelDate: new Date('2025-08-15'),
        returnDate: new Date('2025-08-19'),
        numberOfTravelers: 2
      },
      {
        touristId: 'T-2025-002',
        name: 'Ayesha Khatun',
        email: 'ayesha.k@yahoo.com',
        phone: '+8801555987654',
        nationality: 'Bangladeshi',
        age: 35,
        gender: 'female',
        destination: 'Sylhet',
        address: {
          building: 'Flat 3B',
          street: 'Elephant Road',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          zipCode: '1205'
        },
        tourPackage: 'BD-003',
        packagePrice: 20000,
        totalAmount: 20000,
        travelDate: new Date('2025-09-10'),
        returnDate: new Date('2025-09-15'),
        numberOfTravelers: 1
      },
      {
        touristId: 'T-2025-003',
        name: 'Rafiqul Islam',
        email: 'rafiq.adventure@gmail.com',
        phone: '+8801888123456',
        nationality: 'Bangladeshi',
        age: 42,
        gender: 'male',
        destination: 'Chittagong Hill Tracts',
        address: {
          building: 'House 45',
          street: 'CDA Avenue',
          city: 'Chittagong',
          state: 'Chittagong Division',
          country: 'Bangladesh',
          zipCode: '4000'
        },
        tourPackage: 'BD-004',
        packagePrice: 28000,
        totalAmount: 84000,
        travelDate: new Date('2025-08-20'),
        returnDate: new Date('2025-08-25'),
        numberOfTravelers: 3
      },
      {
        touristId: 'T-2025-004',
        name: 'Sarah Ahmed',
        email: 'sarah.explorer@hotmail.com',
        phone: '+8801666789012',
        nationality: 'Bangladeshi',
        age: 29,
        gender: 'female',
        destination: 'Sundarbans',
        address: {
          building: 'Apartment 5A',
          street: 'Gulshan Avenue',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          zipCode: '1212'
        },
        tourPackage: 'BD-002',
        packagePrice: 25000,
        totalAmount: 25000,
        travelDate: new Date('2025-10-05'),
        returnDate: new Date('2025-10-10'),
        numberOfTravelers: 1
      },
      {
        touristId: 'T-2025-005',
        name: 'Mohammad Hassan',
        email: 'hassan.explore@gmail.com',
        phone: '+8801777555333',
        nationality: 'Bangladeshi',
        age: 38,
        gender: 'male',
        destination: 'Dhaka',
        address: {
          building: 'House 12',
          street: 'Lalmatia Block A',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          zipCode: '1207'
        },
        tourPackage: 'BD-005',
        packagePrice: 15000,
        totalAmount: 60000,
        travelDate: new Date('2025-09-01'),
        returnDate: new Date('2025-09-05'),
        numberOfTravelers: 4
      }
    ]

    for (const tourist of tourists) {
      await Tourist.create(tourist)
    }
    console.log('👥 Created sample tourists')

    // Create global settings for tourism management
    const globalSettings = {
      touristTableColumns: {
        showName: true,
        showEmail: true,
        showPhone: true,
        showAge: true,
        showGender: true,
        showNationality: true,
        showDestination: true,
        showTourPackage: true,
        showTravelDate: true,
        showStatus: true,
        showTotalAmount: true
      },
      updatedAt: new Date(),
      updatedBy: 'System'
    }

    await GlobalSettings.create(globalSettings)
    console.log('⚙️ Created global settings')

    console.log('🎉 Bangladesh Tourism Data Seeding Completed!')
    console.log('📊 Summary:')
    console.log(`   • ${destinations.length} tourist destinations`)
    console.log(`   • ${guides.length} certified tour guides`)
    console.log(`   • ${hotels.length} hotels and resorts`)
    console.log(`   • ${tourPackages.length} tour packages`)
    console.log(`   • ${tourists.length} sample tourists`)
    console.log(`   • Global settings configured`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
    process.exit(0)
  }
}

// Run the seeding
seedBangladeshTourismData()
