# 🚀 Deployment Guide: Clothify (MERN)

Follow these steps to deploy your application to **Render (Backend)** and **Vercel (Frontend)**.

---

## 1. Backend Deployment (Render)

1.  **Create a New Web Service**: Link your GitHub repository.
2.  **Environment**: Node.js
3.  **Build Command**: `cd backend && npm install`
4.  **Start Command**: `cd backend && node server.js`
5.  **Environment Variables (CRITICAL)**:
    Add the following in the Render Dashboard (**Environment** tab):
    
    | Key | Value (Example) |
    | :--- | :--- |
    | `MONGODB_URI` | `mongodb+srv://...` |
    | `JWT_SECRET` | `your_secret_key` |
    | `ADMIN_EMAIL` | `admin@clothify.com` |
    | `ADMIN_PASSWORD` | `admin123` |
    | `CLOUDINARY_NAME` | `your_cloud_name` |
    | `CLOUDINARY_API_KEY` | `your_api_key` |
    | `CLOUDINARY_SECRET_KEY` | `your_secret_key` |
    | `STRIPE_SECRET_KEY` | `sk_test_...` |
    | `RAZORPAY_KEY_ID` | `rzp_test_...` |
    | `RAZORPAY_KEY_SECRET` | `your_razor_secret` |
    | `PORT` | `4001` |
    | `FRONTEND_URL` | `https://your-app.vercel.app` (Add after Vercel is ready) |

---

## 2. Frontend Deployment (Vercel)

1.  **Import Project**: Select the `frontend` folder as the root.
2.  **Framework Preset**: Vite
3.  **Build Command**: `vite build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    Add the following in the Vercel Dashboard (**Settings > Environment Variables**):
    
    | Key | Value |
    | :--- | :--- |
    | `VITE_BACKEND_URL` | `https://your-backend-url.onrender.com` |

---

## 3. Common Troubleshooting

### ❌ Login Fails (Invalid Credentials)
-   **Cause**: You forgot to add `ADMIN_EMAIL` or `ADMIN_PASSWORD` to Render's environment variables.
-   **Fix**: Add them in Render and restart the service.

### ❌ Login Fails (Network Error)
-   **Cause**: `VITE_BACKEND_URL` is wrong or missing `https://`.
-   **Fix**: Check the Vercel variables and re-deploy.

### ❌ CORS Error
-   **Cause**: The backend is rejecting requests from the frontend domain.
-   **Fix**: Ensure `app.use(cors())` is present in `server.js` (We've already ensured this).

---

## 4. Final Steps
Once both are deployed:
1.  Copy your **Vercel URL**.
2.  Go to **Render**, add it as `FRONTEND_URL`.
3.  Copy your **Render URL**.
4.  Go to **Vercel**, add it as `VITE_BACKEND_URL`.
5.  Re-deploy both for the changes to take effect.
