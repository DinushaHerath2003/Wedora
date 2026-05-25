# 🚀 Wedora - Quick Start Guide

## Step-by-Step Setup

### Prerequisites ✓
- [x] Node.js installed
- [x] MySQL installed and running
- [x] Git installed

### 1️⃣ Database Setup (5 minutes)

Open MySQL and create the database:
```sql
CREATE DATABASE wedora;
```

Or use the existing script:
```bash
mysql -u root -p < create-database.sql
```

### 2️⃣ Backend Configuration (2 minutes)

Navigate to backend and create `.env`:
```bash
cd backend
```

Create a `.env` file with:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=wedora
NODE_ENV=development
PORT=3001
```

### 3️⃣ Install Dependencies (3 minutes)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4️⃣ Start the Application (1 minute)

**Option A - Quick Start (Recommended):**
```bash
.\start-dev.ps1
```

**Option B - Manual Start:**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5️⃣ Open Your Browser

Visit: `http://localhost:3000`

---

## Quick Test (2 minutes)

### Create Your First Vendor Account:

1. Go to `http://localhost:3000/signup`
2. Select Role: **Vendor**
3. Check at least one category (e.g., "Venue & Accommodation")
4. Fill in the form:
   - Organization: `Dream Weddings`
   - Location: `New York, USA`
   - Email: `vendor@test.com`
   - Password: `test123`
5. Click **Sign Up**
6. 🎉 You'll be redirected to the Vendor Dashboard!

---

## File Structure

```
wedora/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup page
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   └── dashboard/
│   │       ├── user/        # User dashboard
│   │       ├── vendor/      # Vendor dashboard
│   │       └── admin/       # Admin dashboard
│   └── lib/
│       └── constants.ts     # Roles & categories
│
├── backend/                  # NestJS application
│   └── src/
│       ├── auth/            # Authentication module
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   └── dto/
│       │       └── auth.dto.ts
│       ├── entities/
│       │   └── user.entity.ts
│       ├── common/
│       │   └── constants.ts
│       ├── app.module.ts
│       └── main.ts
│
└── Documentation
    ├── AUTH_SETUP.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── VISUAL_GUIDE.md
```

---

## API Reference

### Signup
```
POST http://localhost:3001/auth/signup
Content-Type: application/json

{
  "role": "vendor",
  "organizationName": "Dream Weddings",
  "location": "New York, USA",
  "email": "vendor@test.com",
  "password": "test123",
  "categories": ["venue-accommodation"]
}
```

### Login
```
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "vendor@test.com",
  "password": "test123"
}
```

---

## URLs Cheat Sheet

| Page | URL | Description |
|------|-----|-------------|
| Home | `http://localhost:3000` | Landing page |
| Signup | `http://localhost:3000/signup` | Create account |
| Login | `http://localhost:3000/login` | Sign in |
| User Dashboard | `http://localhost:3000/dashboard/user` | User features |
| Vendor Dashboard | `http://localhost:3000/dashboard/vendor` | Vendor tools |
| Admin Dashboard | `http://localhost:3000/dashboard/admin` | Admin panel |

---

## Troubleshooting

### Backend won't start?
- ✓ Check MySQL is running
- ✓ Verify `.env` credentials
- ✓ Run `npm install` in backend

### Frontend won't start?
- ✓ Run `npm install` in frontend
- ✓ Check port 3000 is available

### Can't login?
- ✓ Check backend is running on port 3001
- ✓ Check browser console for errors
- ✓ Verify database has the user

### Database errors?
- ✓ Create `wedora` database in MySQL
- ✓ Check MySQL credentials in `.env`
- ✓ Ensure MySQL is running

---

## Vendor Categories

When signing up as a vendor, choose from:

1. 🏨 Venue & Accommodation
2. 🍰 Food & Beverages
3. 📸 Photography & Videography
4. 💄 Fashion & Beauty
5. 🎨 Decoration & Ambience
6. 🎵 Entertainment
7. 🚗 Transportation
8. 🕉️ Ceremonial Services
9. 📋 Planning & Management
10. 🏨 Hospitality & Guest Services
11. 🎁 Gifting & Souvenirs

---

## Next Development Steps

Priority features to add next:

1. **JWT Authentication** - Secure token-based auth
2. **Vendor Services** - Add/manage service listings
3. **Search & Browse** - Find vendors by category
4. **Booking System** - Request and manage bookings
5. **Reviews** - Rate and review vendors
6. **Image Upload** - Gallery management
7. **Email Notifications** - Signup and booking emails
8. **Admin Approvals** - Approve new vendors

---

## Support

📧 Questions? Check the documentation:
- `AUTH_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `VISUAL_GUIDE.md` - UI/UX reference

---

## Test Accounts Template

| Role | Email | Password | Name/Org |
|------|-------|----------|----------|
| User | user@test.com | user123 | Test User |
| Vendor | vendor@test.com | vendor123 | Test Vendor |
| Admin | admin@test.com | admin123 | Test Admin |

---

**Ready to go! 🎊 Your Wedora application is set up and running!**
