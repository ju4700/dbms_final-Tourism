import mongoose from 'mongoose'

const hotelSchema = new mongoose.Schema({
  hotelId: {
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
    required: false,
  },
  destination: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  amenities: [{
    type: String,
  }],
  roomTypes: [{
    type: {
      type: String,
      required: true,
    },
    description: String,
    capacity: Number,
    pricePerNight: Number,
    amenities: [String],
    availability: {
      type: Number,
      default: 0,
    },
  }],
  images: [{
    type: String,
  }],
  contactInfo: {
    phone: String,
    email: String,
    website: String,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  checkInTime: {
    type: String,
    default: '15:00',
  },
  checkOutTime: {
    type: String,
    default: '11:00',
  },
  cancellationPolicy: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
hotelSchema.index({ name: 1 })
hotelSchema.index({ destination: 1 })
hotelSchema.index({ starRating: 1 })
hotelSchema.index({ isActive: 1 })
hotelSchema.index({ destination: 1, starRating: 1 })

export const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema)
