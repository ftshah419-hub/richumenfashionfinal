# RICHU – Men's Fashion

Starter monorepo for a React + Vite frontend and Node.js + Express + MongoDB Atlas backend.

## Requirements
- Node.js 20+
- npm
- MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Set `MONGO_URI` and a long random `JWT_SECRET` in `backend/.env`.

### 2. Frontend
Open another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and API at http://localhost:5000.

## Important
- This is a starter scaffold, not a finished e-commerce implementation.
- Admin registration is deliberately not public. Create/promote admin accounts through a secure seed/admin process.
- JWT access tokens are returned by the starter login endpoint for development. For production, prefer secure, HttpOnly cookie-based refresh-session handling and add CSRF protections where applicable.
- Razorpay and Cloudinary credentials are placeholders. Never commit `.env` files.
- Payment verification, inventory transactions, email verification, password reset, shipping integrations and production hardening must be implemented and tested before launch.
