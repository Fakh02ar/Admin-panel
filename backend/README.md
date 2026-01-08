# Admin Panel Backend

Express.js backend API with MongoDB for the Admin Panel application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string and JWT secret:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-panel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Seed the Database

Run the seed script to create initial data:

```bash
node scripts/seed.js
```

This will create:
- Admin user (email: admin@example.com, password: admin123)
- Sample users
- Sample categories
- Sample products

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `GET /api/users` - Get all users (with search & pagination)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products (Admin only)
- `GET /api/products` - Get all products (with search & pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories (Admin only)
- `GET /api/categories` - Get all categories (with search & pagination)
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Authentication

All API endpoints (except login) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Technologies Used

- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
