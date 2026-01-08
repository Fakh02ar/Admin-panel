# Admin Panel Application

A full-featured admin panel built with Next.js 14, Express.js, and MongoDB.

## Features

### Frontend
- Next.js 14 with App Router
- Responsive dashboard with collapsible sidebar
- Dark mode support
- JWT-based authentication
- Protected routes
- Toast notifications
- Search, filter, and pagination
- CRUD operations for Users, Products, and Categories
- Form validation (client-side)
- Loading states and empty states

### Backend
- Express.js REST API
- MongoDB with Mongoose ODM
- JWT authentication
- Password hashing with bcrypt
- Role-based access control (Admin only)
- Comprehensive API endpoints
- Error handling middleware

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or cloud)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-panel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

5. Seed the database with sample data:
```bash
node scripts/seed.js
```

This creates:
- Admin user (email: admin@example.com, password: admin123)
- Sample users
- Sample categories
- Sample products

6. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. In the root directory, create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

2. Update with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. The frontend will use the default Next.js setup. Click "Publish" to deploy to Vercel or download the project.

## Default Login Credentials

After seeding the database:
- **Email**: admin@example.com
- **Password**: admin123

## Project Structure

```
.
├── app/
│   ├── dashboard/
│   │   ├── users/          # Users management page
│   │   ├── products/       # Products management page
│   │   ├── categories/     # Categories management page
│   │   ├── page.jsx        # Dashboard home with stats
│   │   └── layout.jsx      # Dashboard layout with auth guard
│   ├── login/
│   │   └── page.jsx        # Login page
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Home page (redirects)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── users/              # User-specific components
│   ├── products/           # Product-specific components
│   ├── categories/         # Category-specific components
│   ├── sidebar.jsx         # Sidebar navigation
│   ├── navbar.jsx          # Top navbar with user menu
│   ├── theme-provider.jsx  # Theme provider for dark mode
│   └── delete-dialog.jsx   # Reusable delete confirmation
├── middleware/
│   └── auth-guard.jsx      # Client-side auth protection
├── lib/
│   ├── api.js              # API client utility
│   └── utils.ts            # Utility functions
└── backend/
    ├── models/             # MongoDB schemas
    ├── routes/             # API routes
    ├── middleware/         # Auth middleware
    ├── scripts/            # Database seed script
    └── server.js           # Express server
```

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
- `GET /api/products` - Get all products (with search, filter & pagination)
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

## Technologies Used

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- shadcn/ui
- next-themes (dark mode)
- Lucide Icons

### Backend
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

## Development

### Running Frontend (Next.js)
```bash
npm run dev
```

### Running Backend (Express)
```bash
cd backend
npm run dev
```

## Deployment

### Frontend
Deploy to Vercel:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend
Deploy to any Node.js hosting platform:
- Railway
- Render
- Heroku
- DigitalOcean

Make sure to:
1. Set environment variables
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Update CORS settings for production frontend URL

## License

MIT
