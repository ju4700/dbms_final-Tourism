import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'manager' | 'guide'
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  preferences: {
    touristViewSettings: {
      showTouristId: boolean
      showName: boolean
      showEmail: boolean
      showPhone: boolean
      showPassportNumber: boolean
      showDestination: boolean
      showTourPackage: boolean
      showPackagePrice: boolean
      showTotalAmount: boolean
      showPaidAmount: boolean
      showPaymentStatus: boolean
      showStatus: boolean
      showTravelDate: boolean
      showAssignedGuide: boolean
    }
    dashboard: {
      defaultTab: string
      showQuickActions: boolean
      compactMode: boolean
      refreshInterval: number
    }
  }
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'guide'],
    default: 'manager'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    type: {
      touristViewSettings: {
        type: {
          showTouristId: { type: Boolean, default: true },
          showName: { type: Boolean, default: true },
          showEmail: { type: Boolean, default: true },
          showPhone: { type: Boolean, default: true },
          showPassportNumber: { type: Boolean, default: true },
          showDestination: { type: Boolean, default: true },
          showTourPackage: { type: Boolean, default: true },
          showPackagePrice: { type: Boolean, default: true },
          showTotalAmount: { type: Boolean, default: true },
          showPaidAmount: { type: Boolean, default: true },
          showPaymentStatus: { type: Boolean, default: true },
          showStatus: { type: Boolean, default: true },
          showTravelDate: { type: Boolean, default: true },
          showAssignedGuide: { type: Boolean, default: false }
        },
        default: () => ({
          showTouristId: true,
          showName: true,
          showEmail: true,
          showPhone: true,
          showPassportNumber: true,
          showDestination: true,
          showTourPackage: true,
          showPackagePrice: true,
          showTotalAmount: true,
          showPaidAmount: true,
          showPaymentStatus: true,
          showStatus: true,
          showTravelDate: true,
          showAssignedGuide: false
        })
      },
      dashboard: {
        type: {
          defaultTab: { type: String, default: 'overview' },
          showQuickActions: { type: Boolean, default: true },
          compactMode: { type: Boolean, default: false },
          refreshInterval: { type: Number, default: 30000 }
        },
        default: () => ({
          defaultTab: 'overview',
          showQuickActions: true,
          compactMode: false,
          refreshInterval: 30000
        })
      }
    },
    default: () => ({
      touristViewSettings: {
        showTouristId: true,
        showName: true,
        showEmail: true,
        showPhone: true,
        showPassportNumber: true,
        showDestination: true,
        showTourPackage: true,
        showPackagePrice: true,
        showTotalAmount: true,
        showPaidAmount: true,
        showPaymentStatus: true,
        showStatus: true,
        showTravelDate: true,
        showAssignedGuide: false
      },
      dashboard: {
        defaultTab: 'overview',
        showQuickActions: true,
        compactMode: false,
        refreshInterval: 30000
      }
    })
  }
}, {
  timestamps: true
})

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
