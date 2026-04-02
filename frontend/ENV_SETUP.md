# Frontend Setup Guide

## 🚨 Important: Environment Variables

Create `frontend/.env` with the following variables:

```env
VITE_BACKEND_URL=http://localhost:4001
```

## Setup Steps

1. Create `frontend/.env` with the variable above
2. Run `npm install` in the frontend directory
3. Start the server:
   ```bash
   npm run dev
   ```

## Security Notes

- ✅ `.env` files are included in `.gitignore`
- ✅ Never commit environment variables to Git
- ✅ Use test keys for development
- ✅ Use environment-specific keys for production
- ✅ Rotate keys regularly for security
