// backend/controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    
    let user = await User.findOne({ email });

    if (!user) {
        // If user doesn't exist, create a new one
        const password = email + process.env.JWT_SECRET; // Create a dummy password
        user = await User.create({ name, email, password });
    }

    // If user exists or was just created, send back our app's token
    res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token: generateToken(user._id)
    });
});

module.exports = { registerUser, loginUser, googleLogin };