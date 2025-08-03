# PassBank - Deployment Guide

This guide will help you deploy your PassBank application with Google OAuth authentication.

## Prerequisites

1. **Google Cloud Console Account**
2. **MongoDB Atlas Account** (or local MongoDB)
3. **Deployment Platform** (Heroku, Vercel, Railway, etc.)

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "PassBank"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`
5. Add test users (your email)

### 1.3 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://your-domain.com/auth/google/callback`
5. Copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Backend Environment Variables
Create a `.env` file in the `Backend` folder:

```env
MONGO_URL=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2.2 Production Environment Variables
For production, update the variables:

```env
MONGO_URL=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## Step 3: MongoDB Setup

### 3.1 MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Get connection string
5. Add your IP to whitelist

### 3.2 Local MongoDB
If using local MongoDB, ensure it's running on default port 27017.

## Step 4: Local Development

### 4.1 Start Backend
```bash
cd Backend
npm install
npm run dev
```

### 4.2 Start Frontend
```bash
npm install
npm run dev
```

## Step 5: Deployment Options

### Option A: Heroku Deployment

#### Backend Deployment
1. Create Heroku account
2. Install Heroku CLI
3. Create new app
4. Add MongoDB addon
5. Set environment variables in Heroku dashboard
6. Deploy:

```bash
cd Backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

#### Frontend Deployment
1. Build the project:
```bash
npm run build
```

2. Deploy to Vercel/Netlify:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Option B: Railway Deployment

1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Option C: Vercel Full-Stack

1. Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "Backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

## Step 6: Post-Deployment

### 6.1 Update Google OAuth Redirect URIs
After deployment, update your Google OAuth redirect URIs to include your production domain.

### 6.2 Update Frontend API URLs
Update all API calls in the frontend to use your production backend URL.

### 6.3 Test Authentication
1. Visit your deployed application
2. Test Google OAuth login
3. Verify password management functionality

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **Session Security**: Use strong session secrets
4. **CORS**: Configure CORS properly for production
5. **Rate Limiting**: Consider adding rate limiting
6. **Input Validation**: Validate all user inputs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS configuration in backend
2. **Authentication Failures**: Verify Google OAuth credentials
3. **Database Connection**: Check MongoDB connection string
4. **Session Issues**: Ensure session configuration is correct

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Support

For issues related to:
- Google OAuth: Check Google Cloud Console documentation
- MongoDB: Check MongoDB Atlas documentation
- Deployment: Check your deployment platform's documentation 