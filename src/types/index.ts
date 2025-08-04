export interface Tourist {
  _id: string
  touristId: string
  name: string
  email?: string
  phone: string
  address: {
    building?: string
    street?: string
    city: string
    state: string
    country: string
    zipCode?: string
  }
  destination: string
  passportNumber?: string
  passportImage?: string
  visaImage?: string
  profilePicture?: string
  tourPackage: string
  packagePrice: number
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  bookingDate: Date
  travelDate: Date
  returnDate: Date
  numberOfTravelers: number
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  specialRequests?: string
  accommodationType: 'hotel' | 'resort' | 'hostel' | 'vacation-rental' | 'other'
  totalAmount: number
  paidAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  assignedGuide?: string
  createdAt: Date
  updatedAt: Date
}

export interface TourPackage {
  _id: string
  packageId: string
  name: string
  description: string
  destination: string
  duration: number
  price: number
  inclusions: string[]
  exclusions: string[]
  itinerary: {
    day: number
    title: string
    description: string
    activities: string[]
  }[]
  maxGroupSize: number
  difficulty: 'easy' | 'moderate' | 'difficult'
  category: 'adventure' | 'cultural' | 'wildlife' | 'beach' | 'mountain' | 'historical' | 'luxury' | 'budget'
  images: string[]
  isActive: boolean
  seasonalPricing: {
    season: string
    startDate: Date
    endDate: Date
    multiplier: number
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Hotel {
  _id: string
  hotelId: string
  name: string
  description?: string
  destination: string
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  starRating: number
  amenities: string[]
  roomTypes: {
    type: string
    description?: string
    capacity?: number
    pricePerNight?: number
    amenities?: string[]
    availability?: number
  }[]
  images: string[]
  contactInfo: {
    phone?: string
    email?: string
    website?: string
  }
  location: {
    latitude?: number
    longitude?: number
  }
  checkInTime: string
  checkOutTime: string
  cancellationPolicy?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Guide {
  _id: string
  guideId: string
  name: string
  email?: string
  phone: string
  specializations?: string[]
  destinations?: string[]
  languages?: string[]
  experience?: number
  rating?: number
  totalReviews?: number
  dailyRate?: number
  pricePerDay?: number // alias for dailyRate
  availability?: {
    date: Date
    isAvailable: boolean
  }[]
  certifications?: string[]
  profilePicture?: string
  bio?: string
  isActive?: boolean
  isAvailable?: boolean
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface Destination {
  _id: string
  name: string
  country: string
  description?: string
  popularAttractions?: string[]
  bestTimeToVisit?: string
  averageCost?: number
}

export interface TouristFormData {
  name: string
  email?: string
  phone: string
  address: {
    building?: string
    street?: string
    city: string
    state: string
    country: string
    zipCode?: string
  }
  destination: string
  passportNumber?: string
  tourPackage: string
  packagePrice: number
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  bookingDate?: string
  travelDate: string
  returnDate: string
  numberOfTravelers: number
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  specialRequests?: string
  accommodationType: 'hotel' | 'resort' | 'hostel' | 'vacation-rental' | 'other'
  totalAmount: number
  paidAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  assignedGuide?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TouristStats {
  total: number
  active: number
  completed: number
  cancelled: number
  pending: number
  recentCount: number
  totalRevenue: number
  pendingPayments: number
}

export interface FileUpload {
  file: File
  type: 'profile' | 'passport' | 'visa'
}

export interface SearchFilters {
  search?: string
  status?: string
  destination?: string
  tourPackage?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}
