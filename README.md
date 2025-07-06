# LinkUp Customer Management System

A modern, mobile-first customer management system built specifically for LinkUp Communications. This system focuses solely on customer management with a responsive design optimized for mobile usage by staff members.

## Features

### 🎯 Core Features
- **Customer Management**: Add, edit, view, and manage customer information
- **Custom Fields**: Flexible custom fields for additional customer data
- **Image Support**: Profile pictures and NID (National ID) image uploads
- **Search & Filter**: Advanced search and filtering capabilities
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Authentication**: Secure login system with role-based access

### 📱 Mobile-Optimized
- Responsive design that works perfectly on mobile devices
- Touch-friendly buttons and interactions (44px minimum touch targets)
- Swipe gestures and mobile navigation patterns
- Optimized loading states and performance

### 🔐 Authentication & Security
- NextAuth.js integration
- Role-based access control (Admin/Staff)
- Secure password hashing
- Session management

### 📊 Dashboard Features
- Customer statistics overview
- Recent customer activity
- Quick search and filtering
- Status-based customer organization

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **State Management**: React Query (TanStack Query)
- **UI Components**: Custom mobile-first components
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkupcustomer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/linkupcustomer
   NEXTAUTH_SECRET=your_secure_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Seed the database with sample data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with demo credentials:
     - **Admin**: admin@linkup.com / admin123
     - **Staff**: staff@linkup.com / staff123

## Database Schema

### Users Collection
- Email, password, name, role (admin/staff)
- Authentication and authorization

### Customers Collection
- Basic info: name, email, phone, address
- Connection details: type, package, monthly fee
- Status management: active, inactive, suspended, pending
- Custom fields for flexible data storage
- Image uploads: profile, NID front/back
- Audit trail: created by, modified by, timestamps

## Mobile-First Design Principles

### Touch Targets
- All interactive elements are minimum 44px
- Proper spacing between clickable elements
- Large, easy-to-tap buttons

### Navigation
- Collapsible sidebar for mobile
- Bottom-aligned actions on mobile
- Swipe-friendly card interfaces

### Performance
- Optimized images and assets
- Lazy loading for better mobile performance
- Minimal JavaScript bundle size

### Responsive Layouts
- Mobile-first CSS approach
- Flexible grid systems
- Adaptive typography and spacing

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Customers
- `GET /api/customers` - Get customers with search/filter
- `POST /api/customers` - Create new customer
- `GET /api/customers/stats` - Get customer statistics

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

## Future Integration

This customer management system is designed to integrate with:
- **Payment Management System**: Separate web application for handling payments
- **Communication Tools**: SMS, email integration
- **Reporting System**: Advanced analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary to LinkUp Communications.

## Support

For technical support or questions, contact the development team.

---

**Built with ❤️ for LinkUp Communications**
