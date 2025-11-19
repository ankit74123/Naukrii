# Job Portal - MERN Stack

A full-featured job portal platform built with MongoDB, Express.js, React, and Node.js.

## 🚀 Project Status

**Day 2 Complete** - Database models and authentication system implemented!

## 📋 Features (Planned)

- User authentication (Job Seekers, Employers, Admin)
- Job posting and management
- Advanced job search and filtering
- Application tracking system
- In-app messaging
- Resume/CV management
- Email notifications
- Payment integration
- Admin dashboard
- Analytics and reporting

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Cloudinary for file uploads
- Socket.io for real-time features
- Nodemailer for emails

### Frontend
- React 18
- React Router v6
- TanStack Query (React Query)
- Zustand (State Management)
- Tailwind CSS
- Axios
- React Hook Form
- Lucide React (Icons)

## 🏃‍♂️ Running the Project

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

## 📁 Project Structure

```
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── store/      # State management
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utility functions
│   └── ...
│
└── 20-day-development-plan.md
```

## 🗓️ Development Timeline

Following a structured 20-day development plan:
- ✅ Day 1: Project Setup & Environment Configuration
- ✅ Day 2: Database Models & Authentication System
- 🔜 Day 3: User Profile & Role Management
- 🔜 Day 4-20: Feature development

See `20-day-development-plan.md` for complete timeline.

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/naukrii-job-portal
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📝 Current Status

**Backend:**
- ✅ Express server configured
- ✅ MongoDB connection established
- ✅ Middleware setup (CORS, Helmet, Morgan)
- ✅ Error handling middleware
- ✅ User, Job, and Application models created
- ✅ JWT authentication implemented
- ✅ Auth routes (register, login, logout, getMe, updateDetails, updatePassword)
- ✅ Protected route middleware with role authorization
- ✅ Password hashing with bcrypt
- ⏳ Job routes (next)

**Frontend:**
- ✅ Vite + React setup
- ✅ Tailwind CSS configured
- ✅ React Router with protected routes
- ✅ Zustand store for auth state
- ✅ Axios API service with interceptors
- ✅ Auth service for API calls
- ✅ Pages: Home, Login, Register, Dashboard, Jobs
- ✅ ProtectedRoute component
- ⏳ Profile management pages (next)

**API Endpoints Available:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)
- GET `/api/auth/logout` - Logout user (protected)
- PUT `/api/auth/updatedetails` - Update user details (protected)
- PUT `/api/auth/updatepassword` - Update password (protected)

## 🎯 Next Steps (Day 3)

1. Build user profile pages for job seekers
2. Build employer profile pages
3. Implement profile update functionality
4. Add avatar/logo upload capability
5. Create resume upload feature

## 📄 License

MIT
