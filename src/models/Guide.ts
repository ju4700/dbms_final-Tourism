import mongoose from 'mongoose'

const guideSchema = new mongoose.Schema({
  guideId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  specializations: [{
    type: String,
  }],
  destinations: [{
    type: String,
  }],
  languages: [{
    type: String,
  }],
  experience: {
    type: Number, // years of experience
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  availability: [{
    date: Date,
    isAvailable: Boolean,
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
  }],
  profilePicture: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
}, {
  timestamps: true,
})

// Indexes
guideSchema.index({ name: 1 })
guideSchema.index({ destinations: 1 })
guideSchema.index({ specializations: 1 })
guideSchema.index({ rating: 1 })
guideSchema.index({ isActive: 1 })
guideSchema.index({ destinations: 1, isActive: 1 })

export const Guide = mongoose.models.Guide || mongoose.model('Guide', guideSchema)
