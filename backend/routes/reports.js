import express from 'express';
import { query } from './config/database.js';
import { authenticate } from './middleware/auth.js';

const router = express.Router();

// POST create new report
router.post('/', authenticate, async (req, res) => {
  try {
    const { listingId, reason, details } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and reason are required'
      });
    }

    // Check if listing exists
    const listingResult = await query(
      'SELECT id FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user already reported this listing
    const existingReport = await query(
      'SELECT id FROM reports WHERE listing_id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this listing'
      });
    }

    // Create report
    const result = await query(`
      INSERT INTO reports (listing_id, user_id, reason, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [listingId, req.user.id, reason, details || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
});

// GET reports for user's listings (admin/seller view)
router.get('/my-listings', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.*,
        l.title as listing_title,
        u.name as reporter_name,
        u.email as reporter_email
      FROM reports r
      JOIN listings l ON r.listing_id = l.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE l.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    const reports = result.rows.map(report => ({
      id: report.id,
      listing_id: report.listing_id,
      listing_title: report.listing_title,
      user_id: report.user_id,
      reporter_name: report.reporter_name || 'Anonymous',
      reporter_email: report.reporter_email,
      reason: report.reason,
      details: report.details,
      created_at: report.created_at,
      status: report.status
    }));

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// GET all reports (admin only - for future use)
router.get('/', authenticate, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    const { status, page = 1, limit = 20 } = req.query;

    let whereClause = '';
    let params = [];

    if (status) {
      whereClause = 'WHERE r.status = $1';
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(`
      SELECT 
        r.*,
        l.title as listing_title,
        u.name as reporter_name,
        u.email as reporter_email,
        s.name as seller_name
      FROM reports r
      JOIN listings l ON r.listing_id = l.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN users s ON l.user_id = s.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);

    const reports = result.rows.map(report => ({
      id: report.id,
      listing_id: report.listing_id,
      listing_title: report.listing_title,
      user_id: report.user_id,
      reporter_name: report.reporter_name || 'Anonymous',
      reporter_email: report.reporter_email,
      seller_name: report.seller_name,
      reason: report.reason,
      details: report.details,
      created_at: report.created_at,
      status: report.status
    }));

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Update report status (admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewing', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, reviewing, resolved, rejected)'
      });
    }

    // TODO: Add admin check middleware

    const result = await query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Report status updated'
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
});

export default router;