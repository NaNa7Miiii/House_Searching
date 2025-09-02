require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const authMiddleware = require('./middleware/auth');
const searchRouter = require('./routes/searchRouter');

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI not found in environment variables. Skipping MongoDB connection.');
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected!');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', searchRouter);

app.get('/', (req, res) => {
  res.send('hello world')
})

// register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10); // 10是加密强度
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    // password decryption
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    // generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // expiration time - changed from 2h to 7d
    );
    res.json({ message: 'Login successful.', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure we return the complete user object with username
    res.json({
      userId: user._id,
      username: user.username,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
});

// Token refresh endpoint
app.post('/api/refresh-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully.',
      token: newToken,
      username: user.username
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error while refreshing token.' });
  }
});

// launch server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
