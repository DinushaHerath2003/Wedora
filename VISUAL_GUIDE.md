# 🎨 Wedora - Visual Guide

## Page Flows & Screenshots Guide

### 1. Landing Page (/)
**Route:** `http://localhost:3000/`

**What you'll see:**
- Wedora logo in header
- "Sign In" and "Sign Up" buttons (top right)
- Large hero section: "Plan Your Dream Wedding"
- Features section with 3 cards:
  - Find Vendors
  - Easy Booking
  - Trusted Reviews
- Vendor Categories grid (12 categories)
- Call-to-action section
- Footer

**Actions:**
- Click "Sign Up" → Goes to `/signup`
- Click "Sign In" → Goes to `/login`
- Click "Get Started" → Goes to `/signup`
- Click "Learn More" → Scrolls to features

---

### 2. Signup Page (/signup)
**Route:** `http://localhost:3000/signup`

**What you'll see:**
- White card with "Create your account" title
- Dropdown to select role: User, Vendor, or Admin

#### When "User" is selected:
**Form fields shown:**
- Name *
- Email *
- Password *
- "Sign Up" button
- "Already have an account? Sign in" link

#### When "Vendor" is selected:
**Form fields shown:**
- Vendor Categories (checkbox grid with 11 categories)
- Organization Name *
- Location *
- Email *
- Password *
- "Sign Up" button
- "Already have an account? Sign in" link

**Category options:**
1. ✓ Venue & Accommodation (Hotels, Banquet Halls...)
2. ✓ Food & Beverages (Caterers, Bakers...)
3. ✓ Photography & Videography (Photographers, Videographers...)
4. ✓ Fashion & Beauty (Bridal/Groom Wear, Jewelers...)
5. ✓ Decoration & Ambience (Decorators, Florists...)
6. ✓ Entertainment (DJs, Live Bands...)
7. ✓ Transportation (Bridal Car Rentals...)
8. ✓ Ceremonial Services (Astrologers, Priests...)
9. ✓ Planning & Management (Wedding Planners...)
10. ✓ Hospitality & Guest Services (Accommodation Management...)
11. ✓ Gifting & Souvenirs (Gift Shops...)

#### When "Admin" is selected:
**Form fields shown:**
- Name *
- Email *
- Password *
- "Sign Up" button
- "Already have an account? Sign in" link

**After successful signup:**
- Redirects to appropriate dashboard based on role

---

### 3. Login Page (/login)
**Route:** `http://localhost:3000/login`

**What you'll see:**
- White card with "Sign in to your account" title
- Email Address field *
- Password field *
- "Remember me" checkbox
- "Forgot your password?" link
- "Sign In" button
- "Don't have an account? Create one now" link

**After successful login:**
- User role → Redirects to `/dashboard/user`
- Vendor role → Redirects to `/dashboard/vendor`
- Admin role → Redirects to `/dashboard/admin`

---

### 4. User Dashboard (/dashboard/user)
**Route:** `http://localhost:3000/dashboard/user`

**Header:**
- "Welcome, [Name]!" (left)
- "User Dashboard" subtitle
- "Logout" button (right)

**Main Content:**
3 feature cards:
1. 🔍 Browse Vendors (pink icon)
2. 📋 My Bookings (purple icon)
3. ❤️ Favorites (red icon)

**Welcome Section:**
- "Plan Your Dream Wedding" heading
- Description text
- "Start Planning" button

---

### 5. Vendor Dashboard (/dashboard/vendor)
**Route:** `http://localhost:3000/dashboard/vendor`

**Header:**
- "[Organization Name]" (left)
- "Vendor Dashboard - [Location]" subtitle
- "Logout" button (right)

**Business Information Card:**
- Organization Name
- Location
- Email
- Service Categories (shown as pink badges)

**Dashboard Cards (6 cards):**
1. 💼 Manage Services (pink)
2. 📅 Bookings (purple)
3. ⭐ Reviews (yellow)
4. 🖼️ Gallery (green)
5. 👤 Profile (blue)
6. 📊 Analytics (indigo)

**Quick Actions:**
- "Add New Service" button
- "View Pending Bookings" button
- "Update Profile" button

---

### 6. Admin Dashboard (/dashboard/admin)
**Route:** `http://localhost:3000/dashboard/admin`

**Header:**
- "Welcome, [Name]!" (left)
- "Admin Dashboard" subtitle
- "Logout" button (right)

**Stats Overview (4 stats):**
1. Total Users: 0 (pink)
2. Total Vendors: 0 (purple)
3. Active Bookings: 0 (green)
4. Pending Reviews: 0 (yellow)

**Management Cards (6 cards):**
1. 👥 Manage Users (pink)
2. 🏢 Manage Vendors (purple)
3. 📋 All Bookings (blue)
4. ⭐ Reviews (yellow)
5. 📊 Analytics (indigo)
6. ⚙️ Settings (red)

**Recent Activity:**
- Description text
- "View Reports" button
- "Pending Approvals" button
- "System Settings" button

---

## Color Scheme

### Primary Colors:
- **Pink**: `#E91E63` (buttons, accents)
- **Purple**: `#9C27B0` (secondary elements)
- **Blue**: `#2196F3` (tertiary elements)

### Gradients:
- Landing page: Pink → Purple → Blue
- Auth pages: Pink → Purple

### Status Colors:
- Success: Green `#10B981`
- Warning: Yellow `#F59E0B`
- Error: Red `#EF4444`
- Info: Blue `#3B82F6`

### Neutral Colors:
- Background: `#F9FAFB` (gray-50)
- Cards: White `#FFFFFF`
- Text: `#111827` (gray-900)
- Subtext: `#6B7280` (gray-600)

---

## Icon Reference

All icons use SVG with 24x24 viewBox:
- 🔍 Search: Magnifying glass
- 📋 Bookings: Clipboard
- ❤️ Favorites: Heart
- 💼 Services: Briefcase
- 📅 Calendar: Calendar
- ⭐ Reviews: Star
- 🖼️ Gallery: Image/Photo
- 👤 Profile: User
- 📊 Analytics: Bar chart
- 👥 Users: Users group
- 🏢 Building: Building
- ⚙️ Settings: Cog/Gear
- ✓ Success: Check circle
- ⚠️ Warning: Exclamation

---

## Test User Examples

### Test User #1 - Regular User
```
Role: User
Name: John Doe
Email: john@example.com
Password: password123
```

### Test User #2 - Vendor
```
Role: Vendor
Organization: Dream Weddings LLC
Location: New York, USA
Email: contact@dreamweddings.com
Password: vendor123
Categories: 
  - Venue & Accommodation
  - Food & Beverages
```

### Test User #3 - Admin
```
Role: Admin
Name: Admin User
Email: admin@wedora.com
Password: admin123
```

---

## Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

All pages are fully responsive!

---

## Form Validation Rules

### Email:
- Must be valid email format
- Required field

### Password:
- Minimum 6 characters
- Required field

### Name:
- Required for User and Admin roles
- Text input

### Organization Name:
- Required for Vendor role
- Text input

### Location:
- Required for Vendor role
- Text input (e.g., "City, Country")

### Categories:
- Required for Vendor role
- At least 1 category must be selected
- Multiple selection allowed

---

## Error Messages

**Duplicate Email:**
"User with this email already exists"

**Invalid Credentials:**
"Invalid email or password"

**Missing Fields:**
"[Field name] is required"

**Validation Errors:**
"Please enter both email and password"
"Please select a role"
"Please select at least one vendor category"

---

## Success Flow

1. User fills signup form → Clicks "Sign Up"
2. Loading state shows "Creating account..."
3. Success → Auto-login → Redirect to dashboard
4. Dashboard loads with user data
5. User can now access features

---

This guide helps you understand the complete visual experience of the Wedora application!
