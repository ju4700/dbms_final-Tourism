import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  customerId: {
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
    required: false, // Optional as some customers may not have email
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
    flatNo: {
      type: String,
      required: false,
    },
    roadNo: {
      type: String,
      required: false,
    },
    thana: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
  },
  zone: {
    type: String,
    required: true,
  },
  nidNumber: {
    type: String,
    required: false, // Optional as it may be added later
  },
  nidFrontImage: {
    type: String, // URL/path to the uploaded image
    required: false, // Optional as images may be uploaded later
  },
  nidBackImage: {
    type: String, // URL/path to the uploaded image
    required: false, // Optional as images may be uploaded later
  },
  profilePicture: {
    type: String, // URL/path to the uploaded image
    required: false, // Optional as images may be uploaded later
  },
  package: {
    type: String,
    required: true,
  },
  monthlyFee: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: false, // Optional as it may be assigned later
  },
  pppoePassword: {
    type: String,
    required: false, // Optional field as it's manually entered
  },
  connectionDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Indexes for faster queries
customerSchema.index({ name: 1 })
customerSchema.index({ area: 1 })
customerSchema.index({ status: 1 })
customerSchema.index({ createdAt: -1 }) // Essential for sorting by creation date
// customerId already has unique index from schema definition
customerSchema.index({ phone: 1 }) // For search functionality
customerSchema.index({ email: 1 }, { sparse: true }) // Sparse index for optional field

// Compound indexes for common query patterns
customerSchema.index({ status: 1, area: 1 }) // Filter by status and area
customerSchema.index({ status: 1, createdAt: -1 }) // Status with sort
customerSchema.index({ area: 1, createdAt: -1 }) // Area with sort

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)
