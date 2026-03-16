# Environment Setup Guide

## 🚨 Important: Environment Variables

This project uses environment variables that contain sensitive information. These files are **NOT** tracked by Git and must be created manually.

## Backend Environment Variables

Create `backend/.env` with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Stripe Configuration (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Razorpay Configuration (Test Keys)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# Server Configuration
PORT=4001

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Frontend Environment Variables

Create `frontend/.env` with the following variables:

```env
VITE_BACKEND_URL=http://localhost:4001
```

## How to Get Required Keys

### 1. MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string from "Connect" → "Connect your application"
4. Replace `your_username`, `your_password`, and `your_cluster` in the URI

### 2. Stripe Test Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy the "Publishable key" and "Secret key" from test mode
3. Add them to your `.env` file

### 3. Razorpay Test Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Copy the "Key ID" and "Key Secret" from test mode
3. Add them to your `.env` file

### 4. JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Notes

- ✅ `.env` files are included in `.gitignore`
- ✅ Never commit environment variables to Git
- ✅ Use test keys for development
- ✅ Use environment-specific keys for production
- ✅ Rotate keys regularly for security

## Setup Steps

1. Clone the repository
2. Create `backend/.env` with all backend variables
3. Create `frontend/.env` with frontend variables
4. Run `npm install` in both `backend/` and `frontend/` directories
5. Start the servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (new terminal)
   cd frontend && npm run dev
   ```

## Troubleshooting

If you get "MongoDB connection errors":
- Check your MongoDB URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your database user has correct permissions

If you get "Authentication errors":
- Verify JWT_SECRET is set and at least 32 characters
- Check that frontend can connect to backend URL
