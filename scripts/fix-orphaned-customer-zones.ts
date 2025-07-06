import { connectDB } from '../src/lib/db'
import Zone from '../src/models/Zone'
import { Customer } from '../src/models/Customer'

async function fixOrphanedCustomerZones() {
  await connectDB()
  const zones = await Zone.find({})
  const validZoneNames = zones.map(z => z.name)
  const result = await Customer.updateMany(
    { zone: { $nin: validZoneNames } },
    { zone: 'Not Available' }
  )
  console.log(`Updated ${result.modifiedCount} customers with invalid zones to 'Not Available'.`)
  process.exit(0)
}

fixOrphanedCustomerZones().catch(e => { console.error(e); process.exit(1) })
