// Script to migrate zones and update customers from zones.json to MongoDB
import { connectDB } from '../src/lib/db'
import Zone from '../src/models/Zone'
import { Customer } from '../src/models/Customer'
import fs from 'fs'
import path from 'path'

async function migrateZones() {
  await connectDB()
  const zonesPath = path.join(process.cwd(), 'data', 'zones.json')
  if (!fs.existsSync(zonesPath)) {
    console.error('zones.json not found!')
    return
  }
  const zones: string[] = JSON.parse(fs.readFileSync(zonesPath, 'utf8'))
  for (const zoneName of zones) {
    const exists = await Zone.findOne({ name: zoneName })
    if (!exists) {
      await Zone.create({ name: zoneName })
    }
    // Update all customers with this zone if needed
    await Customer.updateMany({ zone: zoneName }, { zone: zoneName })
  }
  console.log('Zones migrated and customers updated.')
  process.exit(0)
}

migrateZones().catch(e => { console.error(e); process.exit(1) })
