#!/usr/bin/env tsx

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function migrateGlobalSettings() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const collection = db.collection('globalsettings');

    // Find all documents with customerTableColumns
    const documentsToMigrate = await collection.find({
      customerTableColumns: { $exists: true }
    }).toArray();

    console.log(`Found ${documentsToMigrate.length} documents to migrate`);

    for (const doc of documentsToMigrate) {
      // Rename customerTableColumns to touristTableColumns
      await collection.updateOne(
        { _id: doc._id },
        {
          $rename: { customerTableColumns: 'touristTableColumns' }
        }
      );
      console.log(`Migrated document ${doc._id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the migration
migrateGlobalSettings();
