const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('Registration attempt:', { username, email });

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', existingUser.email, existingUser.username);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Capitalize the first letter of the username
        const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        // Create new user
        const user = new User({
            username: formattedUsername,
            email,
            password
        });

        try {
            await user.save();
            console.log('User saved successfully:', user._id);
        } catch (saveError) {
            console.error('Error saving user:', saveError);
            return res.status(500).json({ 
                message: 'Error saving user', 
                error: saveError.message 
            });
        }

        // Generate token
        try {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            });
            console.log('Token generated successfully for user:', user._id);

            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar || '',
                    reputation: user.reputation,
                    role: user.role
                }
            });
        } catch (tokenError) {
            console.error('Error generating token:', tokenError);
            return res.status(500).json({ 
                message: 'Error generating authentication token', 
                error: tokenError.message 
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Ensure username is capitalized
        if (user.username) {
            user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
            // Save the capitalized username
            await user.save();
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || '',
                reputation: user.reputation,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        // Ensure username is capitalized
        if (user && user.username) {
            user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
}; 