import express from 'express';
import { query } from './config/database.js';
import { authenticate, optionalAuth } from './middleware/auth.js';
import { sendInquiryNotification } from './config/email.js';

const router = express.Router();

// POST create new inquiry (no auth required for basic inquiries)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { listingId, buyerName, buyerEmail, buyerPhone, message } = req.body;

    if (!listingId || !buyerName || !buyerEmail || !buyerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, name, email, and phone are required'
      });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(buyerPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if listing exists and get seller info
    const listingResult = await query(`
      SELECT l.id, l.title, l.location, l.user_id, u.email as seller_email, u.name as seller_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [listingId]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const listing = listingResult.rows[0];

    // Create inquiry
    const result = await query(`
      INSERT INTO inquiries (listing_id, user_name, user_email, user_phone, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [listingId, buyerName, buyerEmail, buyerPhone, message || null]);

    const inquiry = result.rows[0];

    // Send email notification to seller (if seller has email)
    if (listing.seller_email) {
      await sendInquiryNotification(
        listing.seller_email,
        listing.seller_name || 'Seller',
        { title: listing.title, location: listing.location },
        { buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone, message }
      );
    }

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry sent successfully!'
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry'
    });
  }
});

// GET inquiries for user's listings (requires auth)
router.get('/my-listings', authenticate, async (req, res) => {
  try {
    const { readStatus } = req.query;

    let whereClause = 'WHERE l.user_id = $1';
    let params = [req.user.id];
    let paramIndex = 2;

    if (readStatus !== undefined) {
      whereClause += ` AND i.read_status = $${paramIndex}`;
      params.push(readStatus === 'true');
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        i.*,
        l.title as listing_title,
        l.location as listing_location
      FROM inquiries i
      JOIN listings l ON i.listing_id = l.id
      ${whereClause}
      ORDER BY i.created_at DESC
    `, params);

    const inquiries = result.rows.map(inquiry => ({
      id: inquiry.id,
      listing_id: inquiry.listing_id,
      listing_title: inquiry.listing_title,
      listing_location: inquiry.listing_location,
      buyer_name: inquiry.user_name,
      buyer_email: inquiry.user_email,
      buyer_phone: inquiry.user_phone,
      message: inquiry.message,
      created_at: inquiry.created_at,
      read_status: inquiry.read_status
    }));

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
});

// GET single inquiry details (requires auth)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        i.*,
        l.title as listing_title,
        l.location as listing_location,
        l.user_id
      FROM inquiries i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const inquiry = result.rows[0];

    // Check if user owns the listing
    if (inquiry.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read
    await query('UPDATE inquiries SET read_status = TRUE WHERE id = $1', [id]);

    res.json({
      success: true,
      data: {
        id: inquiry.id,
        listing_id: inquiry.listing_id,
        listing_title: inquiry.listing_title,
        listing_location: inquiry.listing_location,
        buyer_name: inquiry.user_name,
        buyer_email: inquiry.user_email,
        buyer_phone: inquiry.user_phone,
        message: inquiry.message,
        created_at: inquiry.created_at,
        read_status: true
      }
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry'
    });
  }
});

// DELETE inquiry (requires auth)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const result = await query(`
      SELECT l.user_id FROM inquiries i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await query('DELETE FROM inquiries WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry'
    });
  }
});

export default router;