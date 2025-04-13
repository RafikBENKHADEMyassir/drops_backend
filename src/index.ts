import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import authRoutes from './routes/auth';
import dropRoutes from "./routes/drops";
import friendsRoutes from './routes/friends';
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use("/api/drops", dropRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check
app.get('/', (req, res) => {
  res.send('SAW API is running!');
});

// ✅ Start server and export it for Jest to close
let server: any = null;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { app, server };
