import mongoose from 'mongoose'

export interface IBooking {
  _id?: string
  tourist: mongoose.Types.ObjectId | string
  package: mongoose.Types.ObjectId | string
  guide?: mongoose.Types.ObjectId | string
  bookingDate: Date
  startDate: Date
  endDate: Date
  numberOfPeople: number
  totalAmount: number
  paidAmount: number
  paymentStatus: 'pending' | 'partial' | 'completed'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  specialRequests?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  createdAt?: Date
  updatedAt?: Date
}

const BookingSchema = new mongoose.Schema<IBooking>({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage',
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: false
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    }
  }
}, {
  timestamps: true
})

// Index for better query performance
BookingSchema.index({ tourist: 1, bookingDate: -1 })
BookingSchema.index({ startDate: 1, endDate: 1 })
BookingSchema.index({ status: 1 })
BookingSchema.index({ paymentStatus: 1 })

// Virtual to calculate remaining amount
BookingSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.paidAmount
})

// Virtual to calculate duration in days
BookingSchema.virtual('durationDays').get(function() {
  const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to update payment status
BookingSchema.pre('save', function(next) {
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'completed'
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial'
  } else {
    this.paymentStatus = 'pending'
  }
  next()
})

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)

export default Booking
