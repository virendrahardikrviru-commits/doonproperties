import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  // Create users table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_initial VARCHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Create listings table
  `CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    property_type VARCHAR(100),
    location VARCHAR(100),
    price DECIMAL(12,2),
    built_up_area DECIMAL(10,2),
    facing_direction VARCHAR(50),
    status VARCHAR(100),
    amenities JSONB,
    images JSONB,
    seller_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    coordinates JSONB,
    google_maps_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`,

  // Create inquiries table
  `CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(10) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE
  )`,

  // Create chats table
  `CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Create messages table
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE
  )`,

  // Create reports table
  `CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
  )`,

  // Create function for updated_at trigger
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql'`,

  // Create triggers for updated_at
  `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  `CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  `CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON inquiries(listing_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON chats(buyer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON chats(seller_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id)`,

  // Add unique constraint for chats (one chat per buyer-seller-listing combo)
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_chats_unique ON chats(listing_id, buyer_id, seller_id)`
];

export const runMigrations = async () => {
  console.log('🚀 Running database migrations...');
  
  for (let i = 0; i < migrations.length; i++) {
    try {
      await query(migrations[i]);
      console.log(`✅ Migration ${i + 1}/${migrations.length} completed`);
    } catch (error) {
      // Ignore errors for existing tables/indexes
      if (error.code === '42P07' || error.code === '42710') {
        console.log(`⚪ Migration ${i + 1}/${migrations.length} already exists`);
      } else {
        console.error(`❌ Migration ${i + 1}/${migrations.length} failed:`, error.message);
        throw error;
      }
    }
  }
  
  console.log('✅ All migrations completed successfully!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
