import { connectDB } from '../src/lib/db'
import { Tourist } from '../src/models/Tourist'
import { TourPackage } from '../src/models/TourPackage'
import { Guide } from '../src/models/Guide'
import { Hotel } from '../src/models/Hotel'
import Destination from '../src/models/Destination'
import User from '../src/models/User'
import bcrypt from 'bcryptjs'

async function seedTourismData() {
  try {
    await connectDB()
    console.log('Connected to database')

    // Clear existing data
    await Tourist.deleteMany({})
    await TourPackage.deleteMany({})
    await Guide.deleteMany({})
    await Hotel.deleteMany({})
    await Destination.deleteMany({})
    await User.deleteMany({})
    console.log('Cleared existing data')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await User.create({
      email: 'admin@tourism.com',
      password: hashedPassword,
      name: 'Tourism Admin',
      role: 'admin',
      isActive: true
    })
    console.log('Created admin user')

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 12)
    await User.create({
      email: 'manager@tourism.com',
      password: managerPassword,
      name: 'Tourism Manager',
      role: 'manager',
      isActive: true
    })
    console.log('Created manager user')

    // Create destinations
    const destinations = [
      {
        name: 'Paris, France',
        country: 'France',
        description: 'The City of Light, famous for its art, fashion, and culture',
        popularAttractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe'],
        bestTimeToVisit: 'April to June, September to October',
        averageCost: 150
      },
      {
        name: 'Tokyo, Japan',
        country: 'Japan',
        description: 'A vibrant metropolis blending traditional and modern culture',
        popularAttractions: ['Tokyo Tower', 'Senso-ji Temple', 'Shibuya Crossing', 'Mount Fuji'],
        bestTimeToVisit: 'March to May, September to November',
        averageCost: 180
      },
      {
        name: 'New York, USA',
        country: 'United States',
        description: 'The Big Apple, famous for its skyline and cultural diversity',
        popularAttractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
        bestTimeToVisit: 'April to June, September to November',
        averageCost: 200
      },
      {
        name: 'Bali, Indonesia',
        country: 'Indonesia',
        description: 'Tropical paradise known for beaches, temples, and culture',
        popularAttractions: ['Tanah Lot Temple', 'Ubud Rice Terraces', 'Mount Batur', 'Seminyak Beach'],
        bestTimeToVisit: 'April to October',
        averageCost: 80
      },
      {
        name: 'Rome, Italy',
        country: 'Italy',
        description: 'The Eternal City with ancient history and magnificent architecture',
        popularAttractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'],
        bestTimeToVisit: 'April to June, September to October',
        averageCost: 120
      }
    ]

    for (const dest of destinations) {
      await Destination.create(dest)
    }
    console.log('Created destinations')

    // Create tour packages
    const tourPackages = [
      {
        packageId: 'PKG-001',
        name: 'Paris Romantic Getaway',
        description: 'A romantic 5-day tour of Paris with Seine cruise and Eiffel Tower dinner',
        destination: 'Paris, France',
        duration: 5,
        price: 1299,
        inclusions: ['Hotel accommodation', 'Daily breakfast', 'Seine river cruise', 'Eiffel Tower dinner', 'Airport transfers'],
        exclusions: ['International flights', 'Personal expenses', 'Travel insurance'],
        itinerary: [
          { day: 1, title: 'Arrival in Paris', description: 'Airport pickup and hotel check-in', activities: ['Airport transfer', 'Hotel check-in', 'Welcome dinner'] },
          { day: 2, title: 'City Tour', description: 'Explore major landmarks', activities: ['Eiffel Tower visit', 'Louvre Museum', 'Seine cruise'] },
          { day: 3, title: 'Montmartre & Sacré-Cœur', description: 'Art district exploration', activities: ['Montmartre tour', 'Sacré-Cœur visit', 'Artist quarter'] }
        ],
        maxGroupSize: 15,
        difficulty: 'easy',
        category: 'cultural',
        images: [],
        isActive: true
      },
      {
        packageId: 'PKG-002',
        name: 'Tokyo Cultural Experience',
        description: 'Immerse yourself in Japanese culture with temple visits and traditional experiences',
        destination: 'Tokyo, Japan',
        duration: 7,
        price: 1899,
        inclusions: ['Hotel accommodation', 'Daily breakfast', 'Tea ceremony', 'Temple visits', 'Cultural guide'],
        exclusions: ['International flights', 'Lunch and dinner', 'Personal shopping'],
        itinerary: [
          { day: 1, title: 'Arrival in Tokyo', description: 'Welcome to Japan', activities: ['Airport transfer', 'Hotel check-in', 'Orientation tour'] }
        ],
        maxGroupSize: 12,
        difficulty: 'moderate',
        category: 'cultural',
        images: [],
        isActive: true
      },
      {
        packageId: 'PKG-003',
        name: 'Bali Beach & Adventure',
        description: 'Perfect blend of relaxation and adventure in tropical paradise',
        destination: 'Bali, Indonesia',
        duration: 6,
        price: 899,
        inclusions: ['Beach resort stay', 'All meals', 'Water sports', 'Temple tours', 'Spa treatment'],
        exclusions: ['International flights', 'Personal expenses', 'Additional activities'],
        itinerary: [],
        maxGroupSize: 20,
        difficulty: 'easy',
        category: 'beach',
        images: [],
        isActive: true
      }
    ]

    for (const pkg of tourPackages) {
      await TourPackage.create(pkg)
    }
    console.log('Created tour packages')

    // Create guides
    const guides = [
      {
        guideId: 'GD-001',
        name: 'Marie Dubois',
        email: 'marie@tourism.com',
        phone: '+33-1-234-5678',
        specializations: ['Cultural Tours', 'Historical Sites', 'Art & Museums'],
        destinations: ['Paris, France'],
        languages: ['French', 'English', 'Spanish'],
        experience: 8,
        rating: 4.8,
        totalReviews: 156,
        pricePerDay: 150,
        bio: 'Passionate Parisian guide with extensive knowledge of French culture and history',
        isActive: true,
        emergencyContact: { name: 'Jean Dubois', phone: '+33-1-234-5679', relationship: 'Spouse' }
      },
      {
        guideId: 'GD-002',
        name: 'Takeshi Yamamoto',
        email: 'takeshi@tourism.com',
        phone: '+81-3-1234-5678',
        specializations: ['Cultural Tours', 'Temple Visits', 'Traditional Experiences'],
        destinations: ['Tokyo, Japan'],
        languages: ['Japanese', 'English', 'Mandarin'],
        experience: 12,
        rating: 4.9,
        totalReviews: 203,
        pricePerDay: 180,
        bio: 'Expert in Japanese culture and traditions with over a decade of guiding experience',
        isActive: true,
        emergencyContact: { name: 'Yuki Yamamoto', phone: '+81-3-1234-5679', relationship: 'Spouse' }
      }
    ]

    for (const guide of guides) {
      await Guide.create(guide)
    }
    console.log('Created guides')

    // Create sample tourists
    const tourists = [
      {
        touristId: 'TMS-0001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          zipCode: '10001'
        },
        destination: 'Paris, France',
        passportNumber: 'US123456789',
        tourPackage: 'Paris Romantic Getaway',
        packagePrice: 1299,
        status: 'active',
        bookingDate: new Date('2024-12-01'),
        travelDate: new Date('2025-02-14'),
        returnDate: new Date('2025-02-19'),
        numberOfTravelers: 2,
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1-555-0124',
          relationship: 'Spouse'
        },
        accommodationType: 'hotel',
        totalAmount: 2598, // 1299 * 2 travelers
        paidAmount: 1000,
        paymentStatus: 'partial',
        assignedGuide: 'Marie Dubois'
      },
      {
        touristId: 'TMS-0002',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1-555-0456',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'United States',
          zipCode: '90210'
        },
        destination: 'Tokyo, Japan',
        tourPackage: 'Tokyo Cultural Experience',
        packagePrice: 1899,
        status: 'pending',
        bookingDate: new Date('2024-12-15'),
        travelDate: new Date('2025-03-15'),
        returnDate: new Date('2025-03-22'),
        numberOfTravelers: 1,
        accommodationType: 'hotel',
        totalAmount: 1899,
        paidAmount: 0,
        paymentStatus: 'pending'
      },
      {
        touristId: 'TMS-0003',
        name: 'Michael Brown',
        email: 'mike.brown@email.com',
        phone: '+44-20-1234-5678',
        address: {
          street: '789 High Street',
          city: 'London',
          state: 'England',
          country: 'United Kingdom',
          zipCode: 'SW1A 1AA'
        },
        destination: 'Bali, Indonesia',
        tourPackage: 'Bali Beach & Adventure',
        packagePrice: 899,
        status: 'completed',
        bookingDate: new Date('2024-10-01'),
        travelDate: new Date('2024-11-15'),
        returnDate: new Date('2024-11-21'),
        numberOfTravelers: 2,
        accommodationType: 'resort',
        totalAmount: 1798,
        paidAmount: 1798,
        paymentStatus: 'paid'
      }
    ]

    for (const tourist of tourists) {
      await Tourist.create(tourist)
    }
    console.log('Created sample tourists')

    console.log('Tourism data seeded successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@tourism.com / admin123')
    console.log('Manager: manager@tourism.com / manager123')
    
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    process.exit(0)
  }
}

seedTourismData()
