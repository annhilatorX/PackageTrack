# Cloud Track Backend

A Node.js/Express backend API for the Cloud Track package tracking system with MySQL database integration.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Package Management**: Full CRUD operations for package tracking
- **Real-time Tracking**: Track packages by tracking number
- **User Management**: User registration, login, and profile management
- **Statistics**: Delivery statistics and analytics
- **Security**: Rate limiting, CORS, helmet security headers
- **Database**: MySQL with connection pooling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=track_swiftly
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=8080
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up MySQL database**
   ```sql
   CREATE DATABASE track_swiftly;
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Packages
- `GET /api/packages` - Get all packages (with filters)
- `GET /api/packages/:id` - Get package by ID
- `GET /api/packages/track/:trackingNumber` - Track package by tracking number
- `POST /api/packages` - Create new package
- `PATCH /api/packages/:id/status` - Update package status
- `DELETE /api/packages/:id` - Delete package
- `GET /api/packages/:id/history` - Get package history

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Statistics
- `GET /api/stats/delivery` - Get delivery statistics
- `GET /api/stats/customer/:customerId` - Get customer statistics

## Sample Data

The database is seeded with sample data including:

- **Admin User**: admin@cloudtrack.com / admin123
- **Customer User**: customer@example.com / password123
- **Delivery Staff**: delivery@cloudtrack.com / password123
- **Sample Packages**: 3 packages with different statuses and tracking numbers (CT prefix)

## Database Schema

### Users Table
- `id` (VARCHAR) - Primary key
- `email` (VARCHAR) - Unique email
- `password` (VARCHAR) - Hashed password
- `name` (VARCHAR) - User's full name
- `role` (ENUM) - User role (customer, delivery_staff, admin)
- `phone` (VARCHAR) - Phone number (optional)
- `created_at` (TIMESTAMP) - Creation timestamp

### Packages Table
- `id` (VARCHAR) - Primary key
- `tracking_number` (VARCHAR) - Unique tracking number
- `sender_name` (VARCHAR) - Sender's name
- `sender_address` (TEXT) - Sender's address
- `receiver_name` (VARCHAR) - Receiver's name
- `receiver_address` (TEXT) - Receiver's address
- `receiver_phone` (VARCHAR) - Receiver's phone
- `status` (ENUM) - Package status
- `current_location` (VARCHAR) - Current location
- `estimated_delivery` (TIMESTAMP) - Estimated delivery date
- `weight` (DECIMAL) - Package weight
- `description` (TEXT) - Package description
- `customer_id` (VARCHAR) - Foreign key to users
- `delivery_staff_id` (VARCHAR) - Foreign key to users
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Package History Table
- `id` (VARCHAR) - Primary key
- `package_id` (VARCHAR) - Foreign key to packages
- `status` (ENUM) - Status at this point
- `location` (VARCHAR) - Location at this point
- `notes` (TEXT) - Additional notes
- `timestamp` (TIMESTAMP) - When this status occurred
- `updated_by` (VARCHAR) - Foreign key to users

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents abuse with request rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **Input Validation**: Request validation using express-validator
- **Role-based Access**: Different access levels for different user roles

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return JSON responses with appropriate status codes and error messages.
