# PassBank

A secure password manager built with React, Vite, and Google OAuth authentication.

## Features
- **Google OAuth Authentication** - Secure login with Google accounts
- Add, edit, and delete login credentials (site, username, password)
- Copy site, username, or password to clipboard
- Passwords are stored securely with user-specific access
- Modern UI with Tailwind CSS and animated icons
- Session-based authentication with secure cookies

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, Passport.js
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Session Management**: Express Session

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- [Google Cloud Console](https://console.cloud.google.com/) account

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Pranav260705/PassBank.git
   cd PassBank
   ```

2. Install frontend dependencies:
   ```sh
   npm install
   ```

3. Install backend dependencies:
   ```sh
   cd Backend
   npm install
   cd ..
   ```

### Environment Setup

1. **Google OAuth Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000/auth/google/callback`

2. **Backend Environment Variables**:
   Create `Backend/config.env`:
   ```env
   MONGO_URL=your_mongodb_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_random_session_secret
   CLIENT_URL=http://localhost:5173
   ```

### Running the App

1. Start the backend server:
   ```sh
   cd Backend
   npm run dev
   ```

2. Start the frontend development server:
   ```sh
   npm run dev
   ```

The app will be available at [http://localhost:5173](http://localhost:5173).

## Authentication Flow

1. Users click "Sign in with Google" button
2. Redirected to Google OAuth consent screen
3. After authorization, redirected back to the app
4. User session is created and stored securely
5. All password operations are user-specific

## Security Features

- **OAuth 2.0 Authentication**: Secure Google login
- **Session Management**: Secure session cookies
- **User Isolation**: Each user can only access their own passwords
- **HTTPS Ready**: Configured for production HTTPS
- **CORS Protection**: Proper CORS configuration
- **Environment Variables**: Secure credential management

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Options

1. **Vercel** (Recommended):
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Heroku**:
   - Deploy backend to Heroku
   - Deploy frontend to Vercel/Netlify
   - Configure environment variables

3. **Railway**:
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/user` - Get current user info
- `GET /auth/logout` - Logout user

### Password Management (Protected)
- `GET /` - Get user's passwords
- `POST /` - Add new password(s)
- `PUT /:id` - Update password
- `DELETE /:id` - Delete password

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Google OAuth documentation
- Check MongoDB Atlas documentation
