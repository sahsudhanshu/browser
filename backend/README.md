# Browser Backend - TypeScript API

A TypeScript-based backend API for the Browser application using Express, MongoDB, and JWT authentication.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js for API routes
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ CORS enabled
- ✅ Environment configuration
- ✅ Hot reload in development

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/browser-db
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5123
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server (requires build first)
- `npm run watch` - Watch mode for TypeScript compilation

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (Protected)
  - Requires: `Authorization: Bearer <token>` header

### Health Check

- `GET /health` - Server health check

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts           # Database connection
│   │   └── env.ts          # Environment configuration
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── models/
│   │   └── User.model.ts
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── server.ts           # App entry point
├── dist/                   # Compiled JavaScript (generated)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Building for Production

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## TypeScript Configuration

The project uses strict TypeScript settings for better type safety:
- Strict mode enabled
- No unused variables/parameters
- Source maps for debugging
- ES2022 target with ESNext modules

## License

ISC
