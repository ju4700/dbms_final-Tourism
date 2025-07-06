import mongoose from 'mongoose'

const touristSchema = new mongoose.Schema({
  touristId: {
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
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    building: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: false,
    },
  },
  destination: {
    type: String,
    required: true,
  },
  passportNumber: {
    type: String,
    required: false,
  },
  passportImage: {
    type: String,
    required: false,
  },
  visaImage: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  tourPackage: {
    type: String,
    required: true,
  },
  packagePrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'pending'],
    default: 'pending',
  },
  bookingDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  travelDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  numberOfTravelers: {
    type: Number,
    required: true,
    default: 1,
  },
  emergencyContact: {
    name: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    relationship: {
      type: String,
      required: false,
    },
  },
  specialRequests: {
    type: String,
    required: false,
  },
  accommodationType: {
    type: String,
    enum: ['hotel', 'resort', 'hostel', 'vacation-rental', 'other'],
    default: 'hotel',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending',
  },
  assignedGuide: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
})

// Indexes for faster queries
touristSchema.index({ name: 1 })
touristSchema.index({ destination: 1 })
touristSchema.index({ status: 1 })
touristSchema.index({ createdAt: -1 })
touristSchema.index({ phone: 1 })
touristSchema.index({ email: 1 }, { sparse: true })
touristSchema.index({ travelDate: 1 })
touristSchema.index({ paymentStatus: 1 })

// Compound indexes for common query patterns
touristSchema.index({ status: 1, destination: 1 })
touristSchema.index({ status: 1, createdAt: -1 })
touristSchema.index({ destination: 1, createdAt: -1 })
touristSchema.index({ travelDate: 1, status: 1 })
touristSchema.index({ paymentStatus: 1, status: 1 })

export const Tourist = mongoose.models.Tourist || mongoose.model('Tourist', touristSchema)
