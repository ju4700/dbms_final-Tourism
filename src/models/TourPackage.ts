import mongoose from 'mongoose'

const tourPackageSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in days
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  inclusions: [{
    type: String,
  }],
  exclusions: [{
    type: String,
  }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String],
  }],
  maxGroupSize: {
    type: Number,
    default: 20,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'extreme'],
    default: 'easy',
  },
  category: {
    type: String,
    enum: ['adventure', 'cultural', 'wildlife', 'beach', 'mountain', 'historical', 'luxury', 'budget'],
    required: true,
  },
  images: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  seasonalPricing: [{
    season: String,
    startDate: Date,
    endDate: Date,
    multiplier: Number, // 1.0 = base price, 1.2 = 20% increase
  }],
}, {
  timestamps: true,
})

// Indexes
tourPackageSchema.index({ name: 1 })
tourPackageSchema.index({ destination: 1 })
tourPackageSchema.index({ category: 1 })
tourPackageSchema.index({ price: 1 })
tourPackageSchema.index({ isActive: 1 })
tourPackageSchema.index({ destination: 1, category: 1 })

export const TourPackage = mongoose.models.TourPackage || mongoose.model('TourPackage', tourPackageSchema)
