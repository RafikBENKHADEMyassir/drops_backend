import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import authRoutes from './routes/auth';
import dropRoutes from "./routes/drops";
import friendsRoutes from './routes/friends';
import chatRoutes from './routes/chat';  // Import chat routes
import { setupSocketIO } from './socket/socketHandler';  // Import socket handler
import { rateLimit } from 'express-rate-limit';  // Added rate limiting for security
import postalDropRoutes from './routes/postal-drop.routes';
import qrCodeRoutes from './routes/qr-code.routes';
import orderRoutes from './routes/order.routes';
import mediaUploadRoutes from './routes/media-upload.routes';
import notificationRoutes from './routes/notification';  
import testRoutes from './routes/test';
dotenv.config();
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Added size limit for added security
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use("/api/drops", dropRoutes);
app.use("/api/chat", chatRoutes);  // Add chat routes
app.use('/api/postal-drops', postalDropRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/orders', orderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
// app.use('/uploads', express.static('uploads'));
app.use('/api/upload', mediaUploadRoutes);
app.use('/api/notifications',notificationRoutes);
// 
// Health Check
app.get('/', (_req, res) => {
  const currentDate = new Date('2025-04-16T17:37:38Z');  // Based on provided date
  res.send(`SAW API is running! Current server time: ${currentDate.toISOString()}`);
}); 
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok4' });
});
app.use('/api/test', testRoutes);
// Make io available to the app
app.set('io', io);

// ✅ Start server and export it for Jest to close
// let serverInstance: any = null;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`));
}

export { app, server };