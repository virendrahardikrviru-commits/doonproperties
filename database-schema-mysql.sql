
-- ================================================================================
-- MySQL Database Schema for Dehradun Estates
-- ================================================================================
-- Instructions for Hostinger Deployment:
-- 1. Log in to your Hostinger hPanel.
-- 2. Navigate to Databases -> MySQL Databases.
-- 3. Create a new database and user.
-- 4. Access the database via phpMyAdmin.
-- 5. Go to the "SQL" tab and paste this entire script to generate the tables.
-- ================================================================================

-- --------------------------------------------------------------------------------
-- TABLE: users
-- Purpose: Stores registered user accounts, including Google OAuth details.
-- --------------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,                          -- Unique auto-incrementing identifier
    google_id VARCHAR(255) UNIQUE,                              -- Google OAuth unique identifier
    email VARCHAR(255) UNIQUE NOT NULL,                         -- User's email address (used for login and contact)
    name VARCHAR(255),                                          -- User's full display name
    avatar_initial VARCHAR(1),                                  -- Single character for UI avatar fallback
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,              -- Timestamp of account creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Auto-updates on modification
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- TABLE: listings
-- Purpose: Stores property advertisements posted by users.
-- --------------------------------------------------------------------------------
CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,                          -- Unique auto-incrementing identifier
    user_id INT NOT NULL,                                       -- Foreign key to users table
    title VARCHAR(255) NOT NULL,                                -- Display title of the property ad
    description TEXT,                                           -- Detailed description of the property
    category VARCHAR(50),                                       -- e.g., 'Buy', 'Rent', 'PG', 'Commercial'
    property_type VARCHAR(100),                                 -- e.g., '1 BHK', 'Villa', 'Shop', 'Single Room'
    location VARCHAR(100),                                      -- Locality in Dehradun (e.g., 'Rajpur Road')
    price DECIMAL(12,2),                                        -- Numeric price value
    built_up_area DECIMAL(10,2),                                -- Area in square feet
    facing_direction VARCHAR(50),                               -- e.g., 'North', 'East'
    status VARCHAR(100),                                        -- e.g., 'Ready to Move', 'Under Construction'
    amenities JSON,                                             -- JSON array of amenities (e.g., ["WiFi", "AC"])
    images JSON,                                                -- JSON array of image URLs
    seller_type VARCHAR(50),                                    -- 'Owner' or 'Agent/Broker'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,              -- Timestamp of listing creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto-updates on modification
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- TABLE: inquiries
-- Purpose: Stores contact requests made by buyers/renters on specific listings.
-- --------------------------------------------------------------------------------
CREATE TABLE inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,                          -- Unique auto-incrementing identifier
    listing_id INT NOT NULL,                                    -- Foreign key to listings table
    user_name VARCHAR(255) NOT NULL,                            -- Name of the person inquiring
    user_email VARCHAR(255) NOT NULL,                           -- Email of the person inquiring
    user_phone VARCHAR(10) NOT NULL,                            -- 10-digit contact number
    message TEXT,                                               -- Custom message sent to the seller
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,              -- Timestamp of inquiry submission
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- INDEXES
-- Purpose: Optimize query performance for common filtering and sorting operations.
-- --------------------------------------------------------------------------------
CREATE INDEX idx_listings_user_id ON listings(user_id);         -- Speeds up fetching a user's own listings
CREATE INDEX idx_listings_category ON listings(category);       -- Speeds up category filtering (e.g., Rent vs Buy)
CREATE INDEX idx_listings_location ON listings(location);       -- Speeds up location-based searches
CREATE INDEX idx_listings_price ON listings(price);             -- Speeds up price range filtering and sorting
CREATE INDEX idx_inquiries_listing_id ON inquiries(listing_id); -- Speeds up fetching inquiries for a specific listing
