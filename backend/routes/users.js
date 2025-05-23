const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Ensure username first letter is capitalized
    if (user.username && user.username.length > 0) {
      user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if ID is valid
    if (!id || id === 'undefined') {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    // Check if ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Ensure username first letter is capitalized
    if (user.username && user.username.length > 0) {
      user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is authorized to update this profile
    if (user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this profile' });
    }
    
    const { username, email, bio, avatar } = req.body;
    
    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
    }
    
    // Update fields - ensure username first letter is capitalized
    if (username) {
      user.username = username.charAt(0).toUpperCase() + username.slice(1);
    }
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    
    // Save the updated user
    await user.save();
    
    // Return the updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 