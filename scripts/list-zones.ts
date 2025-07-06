import { connectDB } from '../src/lib/db'
import Zone from '../src/models/Zone'

async function listZones() {
  await connectDB()
  const zones = await Zone.find({}).sort({ name: 1 })
  console.log('Zones in database:')
  zones.forEach(z => console.log(z.name))
  process.exit(0)
}

listZones().catch(e => { console.error(e); process.exit(1) })
