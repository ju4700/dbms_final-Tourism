import mongoose from 'mongoose'

const touristSchema = new mongoose.Schema({
  touristId: {
    type: String,
    required: true,
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
  dateOfBirth: {
    type: Date,
    required: false,
  },
  nationality: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false,
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
  passportNumber: {
    type: String,
    required: false,
  },
  passportExpiryDate: {
    type: Date,
    required: false,
  },
  nidNumber: {
    type: String,
    required: false,
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
})

// Indexes for faster queries
touristSchema.index({ name: 1 })
touristSchema.index({ phone: 1 })
touristSchema.index({ email: 1 }, { sparse: true })
touristSchema.index({ nationality: 1 })
touristSchema.index({ status: 1 })
touristSchema.index({ createdAt: -1 })
touristSchema.index({ touristId: 1 }, { unique: true })

// Compound indexes for common query patterns
touristSchema.index({ status: 1, createdAt: -1 })
touristSchema.index({ nationality: 1, status: 1 })

export const Tourist = mongoose.models.Tourist || mongoose.model('Tourist', touristSchema)
