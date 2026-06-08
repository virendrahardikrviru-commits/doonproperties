# Dehradun Estates Backend API

A Node.js/Express backend API for the Dehradun Estates property classifieds website.

## Features

- **PostgreSQL Database** with full schema including users, listings, inquiries, chats, messages, and reports
- **JWT Authentication** with Google OAuth support
- **RESTful API** for all CRUD operations
- **Image Upload** using Multer
- **Email Notifications** using Nodemailer with Hostinger SMTP
- **CORS Support** for frontend integration

## Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ (or MySQL 8+)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dehradun_estates

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (optional, for production)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Email (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-email-password
EMAIL_FROM=Dehradun Estates <noreply@your-domain.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up PostgreSQL Database

1. Create a PostgreSQL database:

```sql
CREATE DATABASE dehradun_estates;
```

2. Create a user (if needed):

```sql
CREATE USER dehradun_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dehradun_estates TO dehradun_user;
```

3. Update your `.env` file with the database credentials.

### 4. Run Migrations

The database tables will be created automatically when the server starts. You can also run migrations manually:

```bash
npm run migrate
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google OAuth login/register |
| GET | `/api/auth/verify` | Verify JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all listings (with filters) |
| GET | `/api/listings/:id` | Get single listing |
| POST | `/api/listings` | Create new listing (auth required) |
| PUT | `/api/listings/:id` | Update listing (auth + ownership) |
| DELETE | `/api/listings/:id` | Delete listing (auth + ownership) |
| GET | `/api/listings/user/my-listings` | Get user's listings (auth required) |

### Inquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inquiries` | Submit inquiry (no auth required) |
| GET | `/api/inquiries/my-listings` | Get inquiries for user's listings |
| GET | `/api/inquiries/:id` | Get single inquiry |
| DELETE | `/api/inquiries/:id` | Delete inquiry |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | Get all chats for current user |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/:chatId` | Get chat details |
| GET | `/api/chats/:chatId/messages` | Get messages for a chat |
| POST | `/api/chats/:chatId/messages` | Send message in chat |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Create new report |
| GET | `/api/reports/my-listings` | Get reports for user's listings |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload multiple images |
| POST | `/api/upload/single` | Upload single image |
| DELETE | `/api/upload/:filename` | Delete uploaded file |

## API Usage Examples

### Create Listing

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "2 BHK Apartment",
    "description": "Beautiful apartment with city view",
    "category": "Rent",
    "propertyType": "2 BHK",
    "location": "Rajpur Road, Dehradun",
    "price": 25000,
    "builtUpArea": 1200,
    "facingDirection": "North",
    "status": "Ready to Move",
    "amenities": ["WiFi", "Parking", "AC"],
    "images": ["https://example.com/image1.jpg"],
    "sellerType": "Owner",
    "coordinates": [30.3265, 78.1322],
    "googleMapsLink": "https://maps.google.com/..."
  }'
```

### Get Listings with Filters

```bash
curl "http://localhost:5000/api/listings?category=Rent&location=Rajpur&minPrice=15000&maxPrice=50000&sort=Price: Low to High"
```

### Submit Inquiry

```bash
curl -X POST http://localhost:5000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 1,
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "buyerPhone": "9876543210",
    "message": "I am interested in this property."
  }'
```

## Database Schema

### Tables

- **users**: User accounts (Google OAuth)
- **listings**: Property listings
- **inquiries**: Contact inquiries from buyers
- **chats**: Chat conversations
- **messages**: Chat messages
- **reports**: Listing reports

All tables use PostgreSQL's JSONB for flexible data storage (amenities, images, coordinates).

## Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Test with Postman/Insomnia

Import the API endpoints and test with sample data. Use the `/api/auth/google` endpoint first to get a JWT token, then include it in the `Authorization` header as `Bearer <token>`.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check connection string in `.env`

3. Verify database exists and user has permissions

### Port Already in Use

Change the port in `.env`:
```env
PORT=5001
```

### CORS Issues

Ensure `FRONTEND_URL` in `.env` matches your frontend's URL exactly.

## Deployment

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database URL
- Set up SSL for database connection

### Hostinger Deployment

1. Deploy to Hostinger VPS or Cloud hosting
2. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name dehradun-api
   pm2 save
   pm2 startup
   ```

3. Set up Nginx as reverse proxy

## License

MIT License