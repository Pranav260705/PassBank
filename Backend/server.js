const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyparser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const port = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Load environment variables
dotenv.config()

// Basic middleware



app.use(bodyparser.json())

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}))

app.use(passport.initialize())
app.use(passport.session())



// MongoDB connection
const url = process.env.MONGO_URL
const client = new MongoClient(url);
let db;

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        db = client.db("PassBank");
        console.log('Database initialized');
        return 'done.';
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return null;
    }
}

// Initialize database
connectDB();

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!db) {
      return done(new Error('Database not initialized'), null);
    }
    const collection = db.collection('users');
    const user = await collection.findOne({ googleId: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
console.log('Setting up Google OAuth Strategy...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!db) {
        return done(new Error('Database not initialized'), null);
      }
      const collection = db.collection('users');
      let user = await collection.findOne({ googleId: profile.id });
      
      if (!user) {
        user = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value,
          createdAt: new Date()
        };
        await collection.insertOne(user);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      user: req.user,
      isAuthenticated: true 
    });
  } else {
    res.json({ 
      user: null,
      isAuthenticated: false 
    });
  }
});

// Protected route middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Protected routes - require authentication
app.get('/api/logins', isAuthenticated, async (req, res) => {
    const collection = db.collection('logins')
    const logins = await collection.find({ userId: req.user.googleId }).toArray();
    res.json(logins)
})

app.post('/api/logins', isAuthenticated, async (req, res) => {
  const login = req.body;

  if (!Array.isArray(login) || login.length === 0) {
    return res.status(400).send({ success: false, message: "No data to insert" });
  }

  // Add userId to each login entry
  const loginsWithUserId = login.map(loginItem => ({
    ...loginItem,
    userId: req.user.googleId
  }));

  const collection = db.collection('logins');
  const result = await collection.insertMany(loginsWithUserId);
  res.send({ success: true, result });
});

app.delete('/api/logins/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const collection = db.collection('logins');
  const result = await collection.deleteOne({ id, userId: req.user.googleId });
  res.send({ success: true, result });
});

app.put('/api/logins/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const collection = db.collection('logins');

  const result = await collection.updateOne(
    { id, userId: req.user.googleId },
    { $set: updatedData }
  );
  res.send({ success: true, result });
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})