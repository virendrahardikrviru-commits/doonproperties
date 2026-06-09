import express from 'express';
import { query } from './config/database.js';
import { authenticate } from './middleware/auth.js';

const router = express.Router();

// GET all chats for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = 'WHERE c.buyer_id = $1 OR c.seller_id = $1';
    let params = [req.user.id];

    if (search) {
      whereClause += ' AND (c.property_title ILIKE $2 OR u.name ILIKE $2)';
      params.push(`%${search}%`);
    }

    const result = await query(`
      SELECT 
        c.*,
        CASE 
          WHEN c.buyer_id = $1 THEN u.name 
          ELSE (SELECT name FROM users WHERE id = c.buyer_id)
        END as other_party_name,
        CASE 
          WHEN c.buyer_id = $1 THEN u.avatar_initial 
          ELSE (SELECT avatar_initial FROM users WHERE id = c.buyer_id)
        END as other_party_avatar,
        CASE 
          WHEN c.buyer_id = $1 THEN u.email 
          ELSE (SELECT email FROM users WHERE id = c.buyer_id)
        END as other_party_email
      FROM chats c
      LEFT JOIN users u ON c.seller_id = u.id
      ${whereClause}
      ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
    `, params);

    const chats = result.rows.map(chat => ({
      id: chat.id,
      listing_id: chat.listing_id,
      seller_id: chat.seller_id,
      buyer_id: chat.buyer_id,
      property_title: chat.property_title,
      property_image: chat.property_image,
      last_message: chat.last_message,
      last_message_time: chat.last_message_time,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      other_party: {
        name: chat.other_party_name,
        avatar: chat.other_party_avatar,
        email: chat.other_party_email
      },
      unread_count: chat.unread_count || 0
    }));

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats'
    });
  }
});

// POST create new chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { listingId, sellerId, propertyTitle, propertyImage } = req.body;

    if (!listingId || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and seller ID are required'
      });
    }

    // Check if chat already exists
    const existingChat = await query(`
      SELECT id FROM chats 
      WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3
    `, [listingId, req.user.id, sellerId]);

    if (existingChat.rows.length > 0) {
      return res.json({
        success: true,
        data: existingChat.rows[0],
        message: 'Chat already exists'
      });
    }

    // Get seller info
    const sellerResult = await query(
      'SELECT name, avatar_initial FROM users WHERE id = $1',
      [sellerId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const seller = sellerResult.rows[0];

    // Create chat
    const result = await query(`
      INSERT INTO chats (listing_id, buyer_id, seller_id, property_title, property_image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      listingId,
      req.user.id,
      sellerId,
      propertyTitle || 'Property Listing',
      propertyImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=150'
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Chat created successfully'
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
});

// GET messages for a chat
router.get('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of the chat
    const chatResult = await query(
      'SELECT * FROM chats WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [chatId, req.user.id]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(`
      SELECT 
        m.*,
        u.name as sender_name,
        u.avatar_initial as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.timestamp ASC
      LIMIT $2 OFFSET $3
    `, [chatId, parseInt(limit), offset]);

    const messages = result.rows.map(msg => ({
      id: msg.id,
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      sender_avatar: msg.sender_avatar,
      text: msg.text,
      timestamp: msg.timestamp,
      read_status: msg.read_status
    }));

    // Mark messages as read
    await query(`
      UPDATE messages 
      SET read_status = TRUE 
      WHERE chat_id = $1 AND sender_id != $2 AND read_status = FALSE
    `, [chatId, req.user.id]);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// POST send message in a chat
router.post('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Check if user is part of the chat
    const chatResult = await query(
      'SELECT * FROM chats WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [chatId, req.user.id]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Create message
    const result = await query(`
      INSERT INTO messages (chat_id, sender_id, text)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [chatId, req.user.id, text.trim()]);

    // Update chat's last message
    await query(`
      UPDATE chats 
      SET last_message = $1, last_message_time = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [text.trim(), chatId]);

    const message = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        read_status: false
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// GET chat details
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await query(`
      SELECT 
        c.*,
        CASE 
          WHEN c.buyer_id = $2 THEN u.name 
          ELSE (SELECT name FROM users WHERE id = c.buyer_id)
        END as other_party_name,
        CASE 
          WHEN c.buyer_id = $2 THEN u.avatar_initial 
          ELSE (SELECT avatar_initial FROM users WHERE id = c.buyer_id)
        END as other_party_avatar
      FROM chats c
      LEFT JOIN users u ON c.seller_id = u.id
      WHERE c.id = $1 AND (c.buyer_id = $2 OR c.seller_id = $2)
    `, [chatId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const chat = result.rows[0];

    res.json({
      success: true,
      data: {
        id: chat.id,
        listing_id: chat.listing_id,
        seller_id: chat.seller_id,
        buyer_id: chat.buyer_id,
        property_title: chat.property_title,
        property_image: chat.property_image,
        last_message: chat.last_message,
        last_message_time: chat.last_message_time,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        other_party: {
          name: chat.other_party_name,
          avatar: chat.other_party_avatar
        }
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat'
    });
  }
});

export default router;