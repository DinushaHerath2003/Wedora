# 🎨 Frontend-Only Mode

## Overview

The Wedora frontend now runs **independently without requiring the backend**! This allows you to develop and test the UI without worrying about backend connection errors.

## How It Works

### Mock Authentication System

The authentication now uses **localStorage** to simulate a database:

- **Signup**: Creates user accounts and stores them in `localStorage.users`
- **Login**: Validates credentials against stored users
- **Sessions**: Uses mock tokens stored in `localStorage.token`

### What's Changed

✅ No backend API calls  
✅ All authentication is client-side  
✅ Data persists in browser localStorage  
✅ Same user experience as with real backend  

## Running Frontend Only

### Start Development Server

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

That's it! No backend needed.

## Features Available

### ✅ Fully Working:
- Landing page
- Signup with all 3 roles (User, Vendor, Admin)
- Login
- Role-based dashboard redirection
- Vendor category selection
- User sessions and logout

### 📝 Data Storage:
All data is stored in your browser's localStorage:
- `users` - Array of all registered users
- `token` - Current session token
- `user` - Current logged-in user data

## Testing the App

### 1. Create Test Accounts

**Create a User:**
1. Go to `/signup`
2. Select "User"
3. Fill: Name, Email, Password
4. Click "Sign Up"
5. Redirects to User Dashboard ✓

**Create a Vendor:**
1. Go to `/signup`
2. Select "Vendor"
3. Check vendor categories
4. Fill: Organization, Location, Email, Password
5. Click "Sign Up"
6. Redirects to Vendor Dashboard ✓

**Create an Admin:**
1. Go to `/signup`
2. Select "Admin"
3. Fill: Name, Email, Password
4. Click "Sign Up"
5. Redirects to Admin Dashboard ✓

### 2. Login with Created Accounts

1. Logout from dashboard
2. Go to `/login`
3. Enter email and password
4. Click "Sign In"
5. Redirects to correct dashboard based on role ✓

### 3. View Data in Browser

**Chrome DevTools:**
1. Press F12
2. Go to "Application" tab
3. Select "Local Storage" → `http://localhost:3000`
4. See `users`, `token`, and `user` data

## Clear All Data

If you want to start fresh:

**Option 1 - Browser Console:**
```javascript
localStorage.clear()
location.reload()
```

**Option 2 - DevTools:**
1. F12 → Application → Local Storage
2. Right-click → Clear
3. Refresh page

## Example Test Data

After creating some accounts, your localStorage might look like:

```json
{
  "users": [
    {
      "id": "1704806400000",
      "role": "user",
      "email": "john@test.com",
      "password": "test123",
      "name": "John Doe"
    },
    {
      "id": "1704806500000",
      "role": "vendor",
      "email": "vendor@test.com",
      "password": "vendor123",
      "organizationName": "Dream Weddings",
      "location": "New York, USA",
      "categories": ["venue-accommodation", "food-beverages"]
    },
    {
      "id": "1704806600000",
      "role": "admin",
      "email": "admin@test.com",
      "password": "admin123",
      "name": "Admin User"
    }
  ],
  "token": "MTcwNDgwNjQwMDAwMDoxNzA0ODA2NDAwMDAw",
  "user": {
    "id": "1704806400000",
    "role": "user",
    "email": "john@test.com",
    "name": "John Doe"
  }
}
```

## Validation Rules

All the same validation rules apply:

✅ Email must be valid format  
✅ Password minimum 6 characters  
✅ Duplicate emails rejected  
✅ Role-specific required fields validated  
✅ Vendors must select at least 1 category  

## Security Note

⚠️ **This is for development only!**

Passwords are stored in **plain text** in localStorage. This is fine for frontend development but should **never** be used in production.

When you're ready to connect the backend:
- Just uncomment the API calls
- Comment out the mock authentication
- Backend will handle real authentication with encrypted passwords

## Benefits of Frontend-Only Mode

### ✅ Advantages:
- No backend setup required
- No database needed
- Faster development iteration
- Test UI without backend running
- Perfect for UI/UX development
- Easy to demo and share

### ❌ Limitations:
- Data only in browser (not shared between devices)
- No real security
- Data lost if localStorage cleared
- No server-side validation

## When to Connect Backend

Connect the real backend when you need:
- Real database persistence
- Secure password storage
- Multi-device access
- Production deployment
- Server-side business logic
- Email notifications
- Payment processing

## Switching Back to Backend

When ready, the backend integration is already prepared. Just:

1. Start MySQL
2. Start backend: `cd backend && npm run start:dev`
3. The frontend will automatically work with the backend once it's running

All the backend code is already implemented and ready to use!

---

**Enjoy developing the frontend! 🎨✨**

You can now focus entirely on UI/UX without any backend concerns.
