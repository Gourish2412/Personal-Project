const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// Email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to generate JWT token
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id || user._id,
            role: user.role || 'student'
        }
    };
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user & get token
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ msg: 'Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ msg: 'Email is required' });
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ msg: 'Please provide a valid email address' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Create new user instance
        user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: role && ['student', 'mentor', 'admin'].includes(role) ? role : 'student'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Initialize progress record
        try {
            await Progress.create({ userId: user._id });
        } catch (progErr) {
            console.warn('Initial progress creation warning:', progErr.message);
        }

        const token = generateToken(user);
        res.status(201).json({
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ msg: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.status(200).json({
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Get /me error:', err);
        res.status(500).json({ msg: 'Server error fetching user profile' });
    }
});

// @route   GET /api/auth/profile
// @desc    Alias to /me for backwards compatibility
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Get /profile error:', err);
        res.status(500).json({ msg: 'Server error fetching user profile' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / invalidate session
// @access  Public
router.post('/logout', (req, res) => {
    res.status(200).json({ msg: 'Logged out successfully' });
});

// @route   PUT /api/auth/onboarding
// @desc    Update user onboarding and profile information
// @access  Private
router.put('/onboarding', auth, async (req, res) => {
    try {
        const allowedUpdates = [
            'skillLevel',
            'careerGoal',
            'availableHours',
            'preferredLanguage',
            'targetCompany',
            'deadline'
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        updates.onboardingCompleted = true;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Onboarding update error:', err);
        res.status(500).json({ msg: 'Server error updating profile' });
    }
});

module.exports = router;
