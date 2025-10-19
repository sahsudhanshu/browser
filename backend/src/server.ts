import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import connectDB from './config/db.js';

// Import routes (will be created)
// import authRoutes from './routes/auth.routes.js';
// import userRoutes from './routes/user.routes.js';

const app: Application = express();
connectDB();

const allowedOrigins = ["http://localhost:3000", "app://.", "file://", "https://yourdomain.com"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("CORS policy violation"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        environment: env.NODE_ENV,
    });
});

// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

export default app;