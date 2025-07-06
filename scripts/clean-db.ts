import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from '../src/lib/db'
import { Customer } from '../src/models/Customer'

// Load environment variables from the correct path
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function cleanDatabase() {
  try {
    await connectDB()
    
    console.log('🗑️  Dropping existing customer data...')
    await Customer.deleteMany({})
    
    console.log('✅ Database cleaned successfully!')
    console.log('📝 You can now add new customers with the updated schema')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    process.exit(1)
  }
}

cleanDatabase()
