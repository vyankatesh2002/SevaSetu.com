import dns from 'dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Fix Node.js DNS to use system DNS servers (required in some environments)
dns.setServers(['10.27.157.72', '8.8.8.8', '1.1.1.1']);

// Resolve .env path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

// Make io accessible globally
app.set('io', io);

// Socket connection logging
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
import complaintRoutes from './routes/complaints.js';
import authRoutes from './routes/auth.js';
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CIP Backend Running' });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

