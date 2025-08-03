# Render Deployment Guide

## Your URLs
- **Frontend**: https://passbank.onrender.com
- **Backend**: https://passbank-backend.onrender.com

## Backend Environment Variables

Set these environment variables in your **Backend** Render service:

```
MONGO_URL=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_key
CLIENT_URL=https://passbank.onrender.com
GOOGLE_CALLBACK_URL=https://passbank-backend.onrender.com/auth/google/callback
NODE_ENV=production
PORT=3000
```

## Frontend Environment Variables

Set this environment variable in your **Frontend** Render service:

```
VITE_API_URL=https://passbank-backend.onrender.com
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add these authorized redirect URIs:
   - `https://passbank-backend.onrender.com/auth/google/callback`
   - `http://localhost:3000/auth/google/callback` (for local development)

## Render Configuration

### Backend Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

### Frontend Service
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment**: Node

## Important Notes

1. **CORS**: Backend is configured to accept requests from `https://passbank.onrender.com`
2. **Sessions**: Configured for HTTPS with secure cookies
3. **OAuth Callback**: Points to your production backend URL
4. **API Calls**: Frontend will call `https://passbank-backend.onrender.com`

## Testing

After deployment:
1. Visit https://passbank.onrender.com
2. Click "Sign in with Google"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to your frontend
5. Check that password management works

## Troubleshooting

If sign-in still goes to localhost:
1. Check that `VITE_API_URL` is set correctly in frontend
2. Check that `GOOGLE_CALLBACK_URL` is set correctly in backend
3. Verify Google OAuth redirect URIs include your production backend URL
4. Clear browser cache and try again 