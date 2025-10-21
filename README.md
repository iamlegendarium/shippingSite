## Parcel Tracking System

A comprehensive parcel tracking platform with multi-language support, real-time tracking, and user authentication.

## Features

- **Tracking**: Track parcels 
- **Multi-Language Support**: Automatic translation to 20+ languages
- **User Authentication**: Secure registration and login with email verification
- **Dashboard**: Manage and track all your shipments in one place
- **Real-time Updates**: Get live status updates for your parcels
- **Contact Support**: File upload support for customer inquiries

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL or MySQL database
- SendGrid API key
- RapidAPI key (Google Translator API)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd shippingsite
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file in the root directory**
```env
# SERVER
PORT=3000
SECRET=your_secret_key_here
NODE_ENV=development

# DATABASE
DATABASE_NAME=shipment_db
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=3306

# AUTHENTICATION
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# NODEMAILER (Email Notifications)
EMAIL=your_email@gmail.com
PASSWORD=your_email_password

# SENDGRID
FROM_EMAIL=your_email@example.com
SENDGRID_API_KEY=your_api_key
SUPPORT_EMAIL=your_email@example.com
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. **Navigate to client folder**
```bash
cd client
```

2. **Update API URL in `translator.js`**
```javascript
// For development
const API_BASE_URL = 'http://localhost:3000';

// For production
const API_BASE_URL = 'https://your-backend-url.com';
```

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Registration successful, and Verification link sent",
  "user": {...},
  "verificationLink": "https://..."
}
```

#### Verify Email
```http
GET /api/verify?token=<verification_token>
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User signin success",
  "token": "jwt_token_here"
}
```

#### Resend Verification Email
```http
POST /api/resend
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Parcel Endpoints

#### Create Parcel (Authenticated)
```http
POST /api/parcels/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "origin": "New York, USA",
  "destination": "London, UK",
  "senderName": "John Doe",
  "senderPhone": "+1234567890",
  "receiverName": "Jane Smith",
  "receiverPhone": "+9876543210",
  "receiverAddress": "123 Main St, London"
}
```

**Response:**
```json
{
  "message": "Parcel created",
  "trackingNumber": "TRKXXXXXXX",
  "parcel": {...}
}
```

#### Track Parcel (Public)
```http
GET /api/parcels/tracking?trackingNumber=TRKXXXXXXX
```

**Response:**
```json
{
  "parcel": {
    "trackingNumber": "TRKXXXXXXX",
    "origin": "New York, USA",
    "destination": "London, UK",
    "status": "In Transit",
    "statusUpdates": [...]
  }
}
```

#### Update Parcel Status (Authenticated)
```http
PUT /api/parcels/:trackingNumber
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Transit",
  "location": "Paris, France"
}
```

#### Get User Shipments (Authenticated)
```http
GET /api/parcels/shipments?page=1&query=TRK
Authorization: Bearer <token>
```

### Translation Endpoints

#### Get Languages
```http
GET /api/languages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "languages": [
      { "language": "en", "name": "English" },
      { "language": "es", "name": "Spanish" },
      ...
    ]
  }
}
```

#### Translate Site
```http
POST /api/translate-site
Content-Type: application/json

{
  "pageContent": [
    {
      "text": "Track your parcel",
      "type": "text"
    }
  ],
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "translations": {
    "Track your parcel": "Rastrea tu paquete"
  },
  "translatedCount": 1,
  "totalElements": 1
}
```

### Contact Endpoints

#### Submit Contact Form
```http
POST /api/contact
Content-Type: multipart/form-data

{
  "email": "user@example.com",
  "subject": "Support Request",
  "message": "I need help with...",
  "attachment": <file> (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Support request submitted successfully!",
  "data": {...}
}
```

#### Get File
```http
GET /api/files/:filename
```

## Deployment

### Backend Deployment (Render)

1. **Push code to GitHub**

2. **Create new web service on Render**
   - Connect your repository
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Add environment variables** in Render dashboard

4. **Deploy**

### Frontend Deployment (Vercel)

1. **Update `translator.js`** with production backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

2. **Deploy to Vercel**
```bash
cd client
vercel
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **SendGrid** - Email provider
- **Multer** - File upload handling
- **Axios** - HTTP client

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Client-side logic
- **Bootstrap 4** - CSS framework
- **Font Awesome** - Icons

### APIs
- **Google Translator API** - Multi-language support
- **SendGrid API** - Email delivery


## Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Email Verification**: Mandatory email verification
- **Input Validation**: Server-side validation
- **File Upload Limits**: 5MB max file size
- **CORS Configuration**: Restricted origins in production
- **Environment Variables**: Sensitive data protection

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database credentials

**2. Email Not Sending**
- Verify SENDGRID_API_KEY is correct
- Check SendGrid dashboard for errors
- Ensure FROM_EMAIL is verified in SendGrid

**3. Translation Not Working**
- Check RAPIDAPI_KEY is valid
- Verify API quota hasn't been exceeded
- Check network connection

**4. CORS Errors**
- Update CORS configuration in server.js
- Add frontend URL to allowed origins
- Check if credentials are being sent

## Support

For support, email iamlegendarium@gmail.com or create an issue in the repository.

## Acknowledgments

- Google Translator API via RapidAPI
- SendGrid for email services
- Bootstrap team for the framework
- All contributors and testers

---
