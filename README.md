# Tourism Management System

A comprehensive tourism management system built with Next.js, React, TypeScript, and MongoDB for managing tourists, bookings, tour packages, and travel operations.

## Features

### 🎯 Core Features
- **Tourist Management**: Add, edit, view, and manage tourist information and bookings
- **Tour Packages**: Create and manage different tour packages with pricing and itineraries
- **Destination Management**: Manage travel destinations with detailed information
- **Guide Management**: Assign and manage tour guides with specializations
- **Booking System**: Complete booking management with payment tracking
- **Image Support**: Profile pictures, passport, and visa document uploads
- **Search & Filter**: Advanced search and filtering capabilities by destination, package, status, etc.
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Authentication**: Secure login system with role-based access (Admin/Manager/Guide)

### 📱 Mobile-Optimized
- Responsive design that works perfectly on mobile devices
- Touch-friendly buttons and interactions (44px minimum touch targets)
- Swipe gestures and mobile navigation patterns
- Optimized loading states and performance

### 🔐 Authentication & Security
- NextAuth.js integration
- Role-based access control (Admin/Manager/Guide)
- Secure password hashing
- Session management

### 📊 Dashboard Features
- Tourist statistics overview (bookings, revenue, payments)
- Recent tourist activity
- Payment status tracking
- Quick search and filtering
- Status-based tourist organization
- Revenue and financial reporting

### 🌍 Tourism-Specific Features
- **Multi-destination support**: Handle bookings for various travel destinations
- **Tour package management**: Create packages with inclusions, exclusions, and itineraries
- **Travel document management**: Store passport and visa information
- **Guide assignment**: Assign specialized guides to tourists
- **Payment tracking**: Track partial payments, pending amounts, and refunds
- **Travel date management**: Handle booking dates, travel dates, and return dates
- **Emergency contacts**: Store emergency contact information for tourists
- **Special requests**: Handle special accommodation and dietary requirements

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **State Management**: React Query (TanStack Query)
- **UI Components**: Custom mobile-first components
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## User Roles

### Admin
- Full system access
- Manage all tourists, packages, and destinations
- View comprehensive statistics and reports
- Manage user accounts and permissions
- System configuration and settings

### Manager
- Tourist management and booking operations
- View assigned tourists and bookings
- Limited access to statistics
- Cannot delete records or manage system settings

### Guide
- View assigned tourists and tour details
- Update tour status and progress
- Limited access to tourist information
- Cannot modify bookings or pricing

## Database Models

### Tourist
- Personal information (name, email, phone, address)
- Travel documents (passport, visa)
- Booking details (dates, package, destination)
- Payment information (total, paid, status)
- Emergency contacts and special requests

### Tour Package
- Package details (name, description, duration)
- Pricing and inclusions/exclusions
- Detailed itinerary with daily activities
- Group size limits and difficulty levels
- Seasonal pricing variations

### Destination
- Location information (name, country)
- Popular attractions and descriptions
- Best time to visit recommendations
- Average cost estimates

### Guide
- Personal and contact information
- Specializations and destinations covered
- Languages spoken and experience level
- Certifications and ratings
- Availability calendar

### Hotel
- Property information and amenities
- Room types and pricing
- Location and contact details
- Availability management

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tourism-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Account
- Email: admin@tourism.com
- Password: admin123

## API Endpoints

### Tourists
- `GET /api/tourists` - List all tourists with filtering
- `POST /api/tourists` - Create new tourist booking
- `GET /api/tourists/[id]` - Get specific tourist details
- `PUT /api/tourists/[id]` - Update tourist information
- `DELETE /api/tourists/[id]` - Delete tourist record

### Tour Packages
- `GET /api/packages` - List all tour packages
- `POST /api/packages` - Create new package
- `PUT /api/packages/[id]` - Update package details
- `DELETE /api/packages/[id]` - Remove package

### Destinations
- `GET /api/admin/destinations` - List destinations
- `POST /api/admin/destinations` - Add new destination
- `DELETE /api/admin/destinations` - Remove destination

### Statistics
- `GET /api/tourists/stats` - Get tourism statistics and analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tourism.com or create an issue in the repository.

## ✅ Project Completion Status

### Completed Features
- **✅ Tourist Management System**: Complete CRUD operations with detailed forms
- **✅ Dashboard**: Statistics overview with mobile-optimized cards
- **✅ Search & Filtering**: Advanced search across all entities
- **✅ Tour Package Management**: Full package creation with itineraries
- **✅ Guide Management**: Complete guide assignment system
- **✅ Hotel Management**: Room types and accommodation management
- **✅ Destination Management**: Travel destination catalog
- **✅ Authentication**: Role-based access control system
- **✅ API Architecture**: Complete REST API for all entities
- **✅ Type Safety**: Full TypeScript implementation
- **✅ Mobile Responsive**: Mobile-first design completed
- **✅ File Uploads**: Document and image upload system
- **✅ Error Handling**: Comprehensive error handling and validation

### Recent Updates (Latest Session)
- Fixed all TypeScript compilation errors
- Corrected Hotel and TourPackage type definitions
- Updated difficulty levels for tour packages
- Fixed address and contact info structure for hotels
- Resolved import issues in API routes
- Completed comprehensive testing and validation

### System Status
🟢 **PRODUCTION READY** - The Tourist Management System is fully functional and ready for use.

**Development Server**: http://localhost:3000
**Last Tested**: Successfully running with no compilation errors

### Final Architecture
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with MongoDB
- **Database**: MongoDB with Mongoose schemas
- **Authentication**: NextAuth.js with role-based access
- **Deployment Ready**: All configurations complete

This Tourist Management System successfully transforms the original ISP customer management system into a comprehensive tourism platform suitable for a DBMS final project.
