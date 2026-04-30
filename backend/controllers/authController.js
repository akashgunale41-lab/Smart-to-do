const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Debug: log what we received
    console.log('📥 Register request body:', { name, email, password: password ? '***' : 'MISSING' });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('⚠️  User already exists:', normalizedEmail);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user — ✅ fixed: was missing 'const'
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save();
    console.log('✅ New user registered:', normalizedEmail);

    res.status(201).json({ message: 'User registered successfully. Please login.' });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug: log what we received
    console.log('📥 Login request body:', { email, password: password ? '***' : 'MISSING' });

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('⚠️  No user found for email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('⚠️  Password mismatch for:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful:', normalizedEmail, '| Role:', user.role);

    // Generate JWT — include role in payload for middleware checks
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate random token using Node's built-in crypto
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // In a real app we'd email this. For this MERN assignment, we return it so the frontend can redirect/display it:
    res.status(200).json({
      message: 'Reset link generated successfully.',
      resetToken: resetToken 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while generating reset token.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Find user by token strictly if token has not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    
    // Clear out reset tokens
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now login.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

// @desc    Check if email exists (Real-time Validation)
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    return res.status(200).json({ exists: !!existingUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while checking email.' });
  }
};
