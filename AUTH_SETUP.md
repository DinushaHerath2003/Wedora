# Wedora - Wedding Planning Platform

## Authentication & Role-Based Access System

This project now includes a complete authentication system with three user roles: **User**, **Vendor**, and **Admin**.

## Features Implemented

### 1. Signup Page (`/signup`)
- **Role Selection**: Choose between User, Vendor, or Admin
- **Dynamic Form Fields**:
  - **User/Admin**: Name, Email, Password
  - **Vendor**: Organization Name, Location, Email, Password
- **Vendor Categories**: When selecting Vendor role, choose from 11 service categories:
  - Venue & Accommodation
  - Food & Beverages
  - Photography & Videography
  - Fashion & Beauty
  - Decoration & Ambience
  - Entertainment
  - Transportation
  - Ceremonial Services
  - Planning & Management
  - Hospitality & Guest Services
  - Gifting & Souvenirs

### 2. Login Page (`/login`)
- Email and Password authentication
- Automatic role-based dashboard redirection

### 3. Role-Based Dashboards
- **User Dashboard** (`/dashboard/user`): Browse vendors, manage bookings, favorites
- **Vendor Dashboard** (`/dashboard/vendor`): Manage services, bookings, reviews, gallery
- **Admin Dashboard** (`/dashboard/admin`): Manage users, vendors, bookings, system settings

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Make sure you have a `.env` file with database configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=wedora
NODE_ENV=development
PORT=3001
```

3. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Testing the Application

### 1. Create a New User Account

1. Go to `http://localhost:3000/signup`
2. Select a role (User, Vendor, or Admin)
3. Fill in the required fields:
   - For **User/Admin**: Name, Email, Password
   - For **Vendor**: Organization Name, Location, Email, Password, and select at least one category
4. Click "Sign Up"
5. You'll be automatically redirected to your role-specific dashboard

### 2. Login with Existing Account

1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your dashboard based on your role

### 3. Dashboard Features

#### User Dashboard
- View welcome message with your name
- Access to Browse Vendors, My Bookings, and Favorites sections
- Start planning your wedding

#### Vendor Dashboard
- View your business information
- See your organization name, location, and selected categories
- Access to manage services, bookings, reviews, gallery, profile, and analytics
- Quick actions for adding services and managing bookings

#### Admin Dashboard
- Platform overview with user statistics
- Manage users, vendors, bookings, and reviews
- Access to analytics and system settings
- Monitor recent platform activity

## Database Schema

The User entity includes:
- `id`: UUID primary key
- `role`: Enum (user, vendor, admin)
- `email`: Unique email address
- `password`: Hashed password
- `name`: For users and admins
- `organizationName`: For vendors
- `location`: For vendors
- `categories`: Array of vendor category IDs
- `isActive`: Account status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Endpoints

### Authentication

**POST** `/auth/signup`
```json
{
  "role": "vendor",
  "email": "example@vendor.com",
  "password": "password123",
  "organizationName": "Dream Weddings",
  "location": "New York, USA",
  "categories": ["venue-accommodation", "food-beverages"]
}
```

**POST** `/auth/login`
```json
{
  "email": "example@vendor.com",
  "password": "password123"
}
```

## Next Steps

To extend this application, you can:

1. **Implement JWT Authentication**: Replace the simple token with proper JWT tokens
2. **Add Protected Routes**: Create middleware to protect routes based on user roles
3. **Vendor Services**: Allow vendors to create and manage their service listings
4. **Booking System**: Implement booking functionality for users
5. **Reviews & Ratings**: Add review and rating system
6. **Search & Filters**: Implement vendor search with filters
7. **Image Upload**: Add gallery management for vendors
8. **Email Notifications**: Send confirmation emails for signup and bookings
9. **Payment Integration**: Add payment processing for bookings
10. **Admin Controls**: Implement user and vendor approval/management features

## Technologies Used

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: Latest React features

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeORM**: ORM for TypeScript
- **MySQL**: Relational database
- **bcrypt**: Password hashing
- **class-validator**: Request validation

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
