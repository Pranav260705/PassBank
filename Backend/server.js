const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require('mongodb')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyparser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const multer = require('multer')
const multerS3 = require('multer-s3')
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const path = require('path')
const fs = require('fs')
const port = process.env.PORT || 3000
const axios = require('axios');



app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Load environment variables
dotenv.config()

// Basic middleware



app.use(bodyparser.json())
app.set('trust proxy', 1);

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private', // Make files private by default
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const userId = req.user ? req.user.googleId : 'anonymous';
      const filename = `${userId}/${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, filename);
    },
    metadata: function (req, file, cb) {
      cb(null, {
        originalName: file.originalname,
        userId: req.user ? req.user.googleId : 'anonymous',
        uploadDate: new Date().toISOString()
      });
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|rtf|odt|zip|rar|7z/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'passbank-session',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    maxAge: 12*24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    path: '/'
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
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Using default localhost');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Using default localhost');

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
app.get('/auth/google', (req, res, next) => {

  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    
    
    if (req.user) {
      // Create a simple token (in production, use JWT)
      const token = Buffer.from(req.user.googleId + ':' + Date.now()).toString('base64');
      
      // Store token in session for validation
      req.session.authToken = token;
      req.session.userId = req.user.googleId;
      
      
      // Redirect with token as URL parameter
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}?token=${token}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    }
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
  
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Validate token against session
    if (req.session.authToken === token && req.session.userId) {
      // Find user by userId
      const collection = db.collection('users');
      collection.findOne({ googleId: req.session.userId }).then(user => {
        if (user) {
          res.json({ 
            user: user,
            isAuthenticated: true 
          });
        } else {
          res.json({ 
            user: null,
            isAuthenticated: false 
          });
        }
      }).catch(err => {
        console.error('Error finding user:', err);
        res.json({ 
          user: null,
          isAuthenticated: false 
        });
      });
      return;
    }
  }
  
  // Fallback to session-based auth
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


async function generatePassword() {
  const url = `https://api.api-ninjas.com/v1/passwordgenerator?length=12`;
  const resp = await fetch(url, {
    headers: { "X-Api-Key": process.env.API_NINJAS_KEY }
  });

  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status}`);
  }

  const data = await resp.json();
  return data.random_password;
}
app.get('/generatePassword', async (req, res) => {
  try{
    const password = await generatePassword();
    res.json({ password });
  }catch(error){
    res.status(500).json({ error: 'Failed to generate password' });
  }
})

// Document upload endpoints
app.get('/api/documents', isAuthenticated, async (req, res) => {
  try {
    const collection = db.collection('documents');
    const documents = await collection.find({ userId: req.user.googleId }).toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents/upload', isAuthenticated, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentData = {
      userId: req.user.googleId,
      originalName: req.file.originalname,
      s3Key: req.file.key, // S3 object key
      s3Url: req.file.location, // S3 URL
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date(),
      description: req.body.description || '',
      bucket: req.file.bucket
    };

    const collection = db.collection('documents');
    const result = await collection.insertOne(documentData);
    
    res.json({ 
      success: true, 
      document: { 
        ...documentData, 
        _id: result.insertedId 
      } 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.get('/api/documents/download/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('documents');
    const document = await collection.findOne({ _id: new ObjectId(id), userId: req.user.googleId });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate a signed URL for S3 object download (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: document.bucket || process.env.S3_BUCKET_NAME,
      Key: document.s3Key,
      ResponseContentDisposition: `attachment; filename="${document.originalName}"`
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Return the signed URL as JSON instead of redirecting
    res.json({ 
      success: true, 
      downloadUrl: signedUrl,
      filename: document.originalName 
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

app.delete('/api/documents/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('documents');
    const document = await collection.findOne({ _id: new ObjectId(id), userId: req.user.googleId });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: document.bucket || process.env.S3_BUCKET_NAME,
      Key: document.s3Key
    });

    try {
      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

app.post('/api/passwords', async (req, res) => {
 
    const password = req.body;
    if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
    }
    try{
      const fastapiUrl = process.env.FASTAPI_URL;
      const response = await axios.post(fastapiUrl, password );
      const label = response.data.label;
      res.json({ success: true, strength: label });

    }catch(error){
      console.error('Error predicting password strength:', error.message);
    res.status(500).json({ success: false, message: "Failed to predict password strength" });
    }
})

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})