import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

console.log('🔥 auth.js is being loaded!');

const router = express.Router();

console.log('✅ Router created, defining routes...');

// Email transporter configuration for Hostinger/Titan
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ========== Email/Password Registration ==========
router.post('/register', async (req, res) => {
  console.log('📝 POST /register hit');
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      `INSERT INTO users (email, name, password_hash, phone, auth_provider, created_via, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name`,
      [email.toLowerCase(), name || email.split('@')[0], passwordHash, phone || null, 'email', 'email', true]
    );

    const user = result.rows[0];

    try {
      await transporter.sendMail({
        from: `"Dehradun Estates" <${process.env.SMTP_FROM || 'noreply@dehradunestates.com'}>`,
        to: email,
        subject: 'Welcome to Dehradun Estates!',
        html: `<h2>Welcome to Dehradun Estates, ${user.name}!</h2><p>Your account has been successfully created.</p>`
      });
    } catch (emailError) {
      console.log('Welcome email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      data: { id: user.id, email: user.email, name: user.name }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ========== Email/Password Login ==========
router.post('/login', async (req, res) => {
  console.log('📝 POST /login hit');
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const result = await query(
      `SELECT id, email, name, password_hash, email_verified, auth_provider, google_id, phone
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (user.auth_provider === 'google' && user.google_id) {
      return res.status(400).json({ success: false, message: 'This email is registered with Google. Please sign in with Google.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarInitial: user.name?.charAt(0).toUpperCase() || 'U',
        phone: user.phone
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ========== Google OAuth Login ==========
router.post('/google', async (req, res) => {
  console.log('📝 POST /google hit!', req.body);
  try {
    const { email, name, googleId, avatarInitial, picture } = req.body;

    if (!email || !name || !googleId) {
      console.log('❌ Missing required fields:', { email, name, googleId });
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let result = await query(
      `SELECT id, email, name, auth_provider, phone FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    let user;
    if (result.rows.length === 0) {
      console.log('📝 Creating new user for:', email);
      const insertResult = await query(
        `INSERT INTO users (email, name, google_id, avatar_initial, picture, auth_provider, created_via, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, name`,
        [email.toLowerCase(), name, googleId, avatarInitial, picture, 'google', 'google', true]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      if (!user.google_id) {
        console.log('📝 Updating existing user with google_id for:', email);
        await query(`UPDATE users SET google_id = $1, picture = $2 WHERE id = $3`, [googleId, picture, user.id]);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Google login successful for:', email);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarInitial: avatarInitial || user.name?.charAt(0).toUpperCase() || 'U',
        picture: picture,
        phone: user.phone || null
      },
      message: 'Google login successful'
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// ========== Update User Phone Number ==========
router.put('/update-phone', authenticate, async (req, res) => {
  console.log('📝 PUT /update-phone hit');
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    await query(`UPDATE users SET phone = $1 WHERE id = $2`, [phone, userId]);

    res.json({
      success: true,
      message: 'Phone number updated successfully'
    });
  } catch (error) {
    console.error('Update phone error:', error);
    res.status(500).json({ success: false, message: 'Failed to update phone number' });
  }
});

// ========== Email Verification Endpoint ==========
router.get('/verify-email', async (req, res) => {
  console.log('📝 GET /verify-email hit');
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token required' });
    }

    const result = await query(
      `SELECT id, email, email_verified, token_expires_at 
       FROM users WHERE verification_token = $1 AND auth_provider = 'email'`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.token_expires_at && new Date(user.token_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification token expired' });
    }

    await query(`UPDATE users SET email_verified = true, verification_token = NULL, token_expires_at = NULL WHERE id = $1`, [user.id]);

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

console.log('✅ auth.js routes defined, exporting router...');

export default router;

console.log('✅ auth.js export complete');