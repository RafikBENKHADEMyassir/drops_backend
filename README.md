# Drops Backend

Backend API for the Drops application built with Node.js, Express, and TypeScript.

## Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/drops_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

### File Upload Directories
The application requires these directories for file uploads:
```bash
mkdir -p uploads/profiles
chmod 755 uploads/profiles
```

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/complete-profile` - Complete user profile

### Drops
- POST `/api/drops` - Create new drop
- GET `/api/drops/mine` - Get user's drops
- GET `/api/drops/shared` - Get drops shared with user

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint