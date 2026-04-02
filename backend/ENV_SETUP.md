# Backend Setup Guide

## 🚨 Important: Environment Variables

Create `backend/.env` with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

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

## How to Get Required Keys

### 1. MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string from "Connect" → "Connect your application"
4. Replace `your_username`, `your_password`, and `your_cluster` in the URI

### 2. Stripe Test Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy the "Publishable key" and "Secret key" from test mode

### 3. Razorpay Test Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Copy the "Key ID" and "Key Secret" from test mode

### 4. JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Setup Steps

1. Create `backend/.env` with the variables above
2. Run `npm install` in the backend directory
3. Start the server:
   ```bash
   npm run dev
   ```
