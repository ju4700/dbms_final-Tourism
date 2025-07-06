import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from '../src/lib/db'
import User from '../src/models/User'
import { Customer } from '../src/models/Customer'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')
    
    await connectDB()
    console.log('✅ Connected to database')

    // Clear existing data
    await User.deleteMany({})
    await Customer.deleteMany({})
    console.log('🗑️ Cleared existing data')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = new User({
      email: 'admin@linkup.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    })
    
    await adminUser.save()
    console.log('👤 Created admin user')

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 12)
    
    const staffUser = new User({
      email: 'staff@linkup.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'staff'
    })
    
    await staffUser.save()
    console.log('👥 Created staff user')

    // Create sample customers with updated zone structure
    const sampleCustomers = [
      {
        customerId: 'LC-001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+8801712345678',
        address: {
          building: 'Green Plaza',
          flatNo: '4A',
          roadNo: '15',
          thana: 'Dhanmondi',
          district: 'Dhaka'
        },
        zone: 'Oxygen',
        nidNumber: '1234567890123',
        package: '20 Mbps',
        monthlyFee: 1800,
        status: 'active',
        joiningDate: new Date('2024-01-15'),
        ipAddress: '192.168.1.101',
        pppoePassword: 'john_pass_123'
      },
      {
        customerId: 'LC-002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+8801887654321',
        address: {
          building: 'Silver Tower',
          flatNo: '5B',
          roadNo: '12',
          thana: 'Gulshan',
          district: 'Dhaka'
        },
        zone: 'Shitol Zorna',
        nidNumber: '9876543210987',
        package: '30 Mbps',
        monthlyFee: 2500,
        status: 'active',
        joiningDate: new Date('2024-02-20'),
        ipAddress: '192.168.1.102',
        pppoePassword: 'jane_secure_456'
      },
      {
        customerId: 'LC-003',
        name: 'ABC Corporation',
        email: 'info@abccorp.com',
        phone: '+8801611223344',
        address: {
          building: 'Trade Center',
          flatNo: 'Office 301',
          roadNo: '',
          thana: 'Karwan Bazar',
          district: 'Dhaka'
        },
        zone: 'Oxygen',
        package: '25 Mbps',
        monthlyFee: 2200,
        status: 'active',
        joiningDate: new Date('2024-01-10'),
        ipAddress: '192.168.1.103'
      },
      {
        customerId: 'LC-004',
        name: 'Mohammad Rahman',
        email: 'rahman@gmail.com',
        phone: '+8801555666777',
        address: {
          building: '',
          flatNo: 'House 67',
          roadNo: 'Block C',
          thana: 'Bashundhara',
          district: 'Dhaka'
        },
        zone: 'Shitol Zorna',
        nidNumber: '5647382910847',
        package: '15 Mbps',
        monthlyFee: 1500,
        status: 'active',
        joiningDate: new Date('2024-06-25'),
        ipAddress: '192.168.1.104',
        pppoePassword: 'rahman_net_789'
      },
      {
        customerId: 'LC-005',
        name: 'Tech Solutions Ltd.',
        email: 'contact@techsolutions.com',
        phone: '+8801999888777',
        address: {
          building: 'IT Tower',
          flatNo: 'Suite 15A',
          roadNo: '',
          thana: 'Agargaon',
          district: 'Dhaka'
        },
        zone: 'Oxygen',
        package: '25 Mbps',
        monthlyFee: 2200,
        status: 'inactive',
        joiningDate: new Date('2024-03-01'),
        ipAddress: '192.168.1.105'
      },
      {
        customerId: 'LC-006',
        name: 'Fatima Khatun',
        email: 'fatima.k@email.com',
        phone: '+8801333444555',
        address: {
          building: 'Rose Apartment',
          flatNo: '2C',
          roadNo: '8',
          thana: 'Uttara',
          district: 'Dhaka'
        },
        zone: 'Shitol Zorna',
        nidNumber: '1122334455667',
        package: '10 Mbps',
        monthlyFee: 1200,
        status: 'active',
        joiningDate: new Date('2024-04-12'),
        ipAddress: '192.168.1.106',
        pppoePassword: 'fatima_wifi_321'
      },
      {
        customerId: 'LC-007',
        name: 'Digital Marketing Agency',
        email: 'hello@digitalmarket.com',
        phone: '+8801777888999',
        address: {
          building: 'Business Hub',
          flatNo: 'Floor 7',
          roadNo: '23',
          thana: 'Banani',
          district: 'Dhaka'
        },
        zone: 'Oxygen',
        package: '30 Mbps',
        monthlyFee: 2500,
        status: 'active',
        joiningDate: new Date('2024-05-08'),
        ipAddress: '192.168.1.107',
        pppoePassword: 'digital_fast_555'
      },
      {
        customerId: 'LC-008',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@gmail.com',
        phone: '+8801666777888',
        address: {
          building: '',
          flatNo: 'House 45',
          roadNo: '7A',
          thana: 'Mirpur',
          district: 'Dhaka'
        },
        zone: 'Shitol Zorna',
        nidNumber: '9988776655443',
        package: '20 Mbps',
        monthlyFee: 1800,
        status: 'active',
        joiningDate: new Date('2024-03-25'),
        ipAddress: '192.168.1.108'
      }
    ]

    for (const customerData of sampleCustomers) {
      const customer = new Customer(customerData)
      await customer.save()
    }

    console.log('👥 Created sample customers')
    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📝 Login Credentials:')
    console.log('Admin: admin@linkup.com / admin123')
    console.log('Staff: staff@linkup.com / staff123')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

seed()
