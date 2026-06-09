import express from 'express';
import { query } from './config/database.js';
import { authenticate } from './middleware/auth.js';

const router = express.Router();

// Helper function to safely parse JSON
const safeJsonParse = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
      console.log('JSON parse error:', e.message);
      return defaultValue;
    }
  }
  return defaultValue;
};

// Helper function to safely stringify JSON
const safeJsonStringify = (value) => {
  if (!value) return '[]';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    console.log('JSON stringify error:', e.message);
    return '[]';
  }
};

// Helper function to map frontend category to backend category
const mapCategory = (category) => {
  const categoryMap = {
    'Buy': 'residential_sale',
    'Rent': 'residential_rent',
    'Land': 'land_plot',
    'PG': 'pg_rent',
    'Commercial Rent': 'commercial_rent',
    'Commercial Buy': 'commercial_sale'
  };
  return categoryMap[category] || category;
};

// Helper function to convert empty string to null for numeric fields
const toNull = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

// Helper function to create slug from title
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')     // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
};

// GET all listings with filters
router.get('/', async (req, res) => {
  try {
    let { category, location, minPrice, maxPrice, keyword, sort, subcategory, sellerType } = req.query;
    
    if (category && category !== 'All' && category !== 'All Categories') {
      category = mapCategory(category);
    } else if (category === 'All' || category === 'All Categories') {
      category = null;
    }
    
    let sql = `
      SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        u.phone as seller_phone
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
      AND COALESCE(l.is_active, TRUE) = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND l.category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (location && location !== 'All Locations') {
      sql += ` AND l.location ILIKE $${paramIndex++}`;
      params.push(`%${location}%`);
    }
    
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      sql += ` AND l.price >= $${paramIndex++}`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      sql += ` AND l.price <= $${paramIndex++}`;
      params.push(parseFloat(maxPrice));
    }
    
    if (keyword && keyword.trim()) {
      sql += ` AND (l.title ILIKE $${paramIndex++} OR l.description ILIKE $${paramIndex++} OR l.location ILIKE $${paramIndex++})`;
      const searchTerm = `%${keyword.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (subcategory && subcategory !== 'All') {
      sql += ` AND l.property_type = $${paramIndex++}`;
      params.push(subcategory);
    }
    
    if (sellerType && sellerType !== '') {
      sql += ` AND l.seller_type = $${paramIndex++}`;
      params.push(sellerType);
    }

    if (sort === 'price_asc') {
      sql += ` ORDER BY l.price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY l.price DESC`;
    } else {
      sql += ` ORDER BY l.created_at DESC`;
    }

    const result = await query(sql, params);
    
    const listings = result.rows.map(listing => ({
      ...listing,
      amenities: safeJsonParse(listing.amenities),
      images: safeJsonParse(listing.images)
    }));
    
    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single listing by slug (SEO-friendly URL)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const sql = `
      SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        u.phone as seller_phone
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.slug = $1
    `;
    const result = await query(sql, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    const listing = result.rows[0];
    listing.amenities = safeJsonParse(listing.amenities);
    listing.images = safeJsonParse(listing.images);
    
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing by slug:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single listing by ID (with seller phone)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        u.phone as seller_phone
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `;
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    const listing = result.rows[0];
    listing.amenities = safeJsonParse(listing.amenities);
    listing.images = safeJsonParse(listing.images);
    
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user's own listings (for dashboard)
router.get('/user/my-listings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching listings for user:', userId);
    
    const result = await query(
      `SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    const listings = result.rows.map(listing => ({
      ...listing,
      amenities: safeJsonParse(listing.amenities),
      images: safeJsonParse(listing.images)
    }));
    
    console.log(`Found ${listings.length} listings for user ${userId}`);
    
    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET unique locations for autocomplete
router.get('/locations/all', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT location FROM listings WHERE location IS NOT NULL AND location != ''
      ORDER BY location ASC
    `);
    const locations = result.rows.map(row => row.location);
    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create new listing (requires authentication)
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('📦 Received listing data:', JSON.stringify(req.body, null, 2));
    
    const {
      title, description, price, location, category, sellerType,
      propertyType, bhk, bathrooms, furnishing, superBuiltupArea, carpetArea,
      facing, status, projectName, totalFloors, floorNo, carParking, maintenance,
      roomType, mealsIncluded, washrooms, spaceType, amenities, images,
      landType, approvedBy, isActive = true, contactPhone
    } = req.body;

    const userId = req.user.id;

    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, description, price, location, category' 
      });
    }

    const amenitiesJson = safeJsonStringify(amenities);
    const imagesJson = safeJsonStringify(images);

    let finalPropertyType = propertyType;
    if (category === 'land_plot' && landType) {
      finalPropertyType = landType;
    }
    if (category === 'pg_rent' && roomType) {
      finalPropertyType = roomType;
    }
    if ((category === 'commercial_sale' || category === 'commercial_rent') && spaceType) {
      finalPropertyType = spaceType;
    }

    // ✅ Generate unique slug from title with counter
    let baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;
    
    while (slugExists) {
      const existing = await query('SELECT id FROM listings WHERE slug = $1', [slug]);
      if (existing.rows.length === 0) {
        slugExists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    console.log('📝 Inserting listing with:', { userId, title, category, price, location, propertyType: finalPropertyType, contactPhone, slug });

    const sql = `
      INSERT INTO listings (
        user_id, title, description, price, location, category, seller_type,
        property_type, bhk, bathrooms, furnishing, super_builtup_area, carpet_area,
        facing_direction, status, project_name, total_floors, floor_no, car_parking,
        maintenance, room_type, meals_included, washrooms, space_type, amenities, images,
        contact_phone, slug, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, NOW(), NOW()
      ) RETURNING *
    `;

    const params = [
      userId, title, description, price, location, category, sellerType || 'Owner',
      finalPropertyType, bhk, bathrooms, furnishing, 
      toNull(superBuiltupArea), toNull(carpetArea),
      facing, status, projectName, totalFloors, floorNo, carParking,
      toNull(maintenance),
      roomType, mealsIncluded || false, washrooms, spaceType,
      amenitiesJson, imagesJson,
      contactPhone || null,
      slug,
      isActive !== false
    ];

    const result = await query(sql, params);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('No data returned from insert');
    }
    
    const newListing = result.rows[0];
    newListing.amenities = safeJsonParse(newListing.amenities);
    newListing.images = safeJsonParse(newListing.images);
    
    console.log('✅ Listing created successfully, ID:', newListing.id, 'Slug:', newListing.slug);
    
    res.status(201).json({
      success: true,
      data: newListing,
      message: 'Listing created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create listing',
      error: error.message 
    });
  }
});

// PUT update listing (requires authentication and ownership)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('📦 PUT request for ID:', id);
    
    const checkSql = `SELECT user_id, title, slug FROM listings WHERE id = $1`;
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const oldTitle = checkResult.rows[0].title;
    let currentSlug = checkResult.rows[0].slug;
    
    const {
      title, description, price, location, category, sellerType,
      propertyType, bhk, bathrooms, furnishing, superBuiltupArea, carpetArea,
      facing, status, projectName, totalFloors, floorNo, carParking, maintenance,
      roomType, mealsIncluded, washrooms, spaceType, amenities, images,
      landType, approvedBy, isActive = true, contactPhone
    } = req.body;
    
    const amenitiesJson = safeJsonStringify(amenities);
    const imagesJson = safeJsonStringify(images);
    
    let finalPropertyType = propertyType;
    if (category === 'land_plot' && landType) {
      finalPropertyType = landType;
    }
    if (category === 'pg_rent' && roomType) {
      finalPropertyType = roomType;
    }
    if ((category === 'commercial_sale' || category === 'commercial_rent') && spaceType) {
      finalPropertyType = spaceType;
    }
    
    // ✅ Update slug only if title changed
    let slug = currentSlug;
    if (title !== oldTitle) {
      let baseSlug = createSlug(title);
      slug = baseSlug;
      let counter = 1;
      let slugExists = true;
      
      while (slugExists) {
        const existing = await query('SELECT id FROM listings WHERE slug = $1 AND id != $2', [slug, id]);
        if (existing.rows.length === 0) {
          slugExists = false;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }
    
    const sql = `
      UPDATE listings SET
        title = $1, description = $2, price = $3, location = $4, 
        category = $5, seller_type = $6, property_type = $7,
        bhk = $8, bathrooms = $9, furnishing = $10, super_builtup_area = $11,
        carpet_area = $12, facing_direction = $13, status = $14,
        project_name = $15, total_floors = $16, floor_no = $17,
        car_parking = $18, maintenance = $19, room_type = $20,
        meals_included = $21, washrooms = $22, space_type = $23,
        amenities = $24, images = $25, contact_phone = $26, slug = $27, is_active = $28, updated_at = NOW()
      WHERE id = $29
      RETURNING *
    `;
    
    const params = [
      title, description, price, location, category, sellerType, finalPropertyType,
      bhk, bathrooms, furnishing, 
      toNull(superBuiltupArea), toNull(carpetArea),
      facing, status, projectName, totalFloors, floorNo, carParking,
      toNull(maintenance),
      roomType, mealsIncluded || false, washrooms, spaceType,
      amenitiesJson, imagesJson,
      contactPhone || null,
      slug,
      isActive !== false, id
    ];
    
    const result = await query(sql, params);
    
    const updatedListing = result.rows[0];
    updatedListing.amenities = safeJsonParse(updatedListing.amenities);
    updatedListing.images = safeJsonParse(updatedListing.images);
    
    console.log('✅ Listing updated successfully, ID:', id, 'Slug:', slug);
    
    res.json({
      success: true,
      data: updatedListing,
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
});

// DELETE listing (requires authentication and ownership)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const checkSql = `SELECT user_id FROM listings WHERE id = $1`;
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await query(`DELETE FROM listings WHERE id = $1`, [id]);
    
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
});

export default router;