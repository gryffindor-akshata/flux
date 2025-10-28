import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { db } from './db/connection'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import intentRoutes from './routes/intents'
import transactionRoutes from './routes/transactions'
import userRoutes from './routes/users'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001
const SOCKET_PORT = process.env.SOCKET_PORT || 3002

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(limiter)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/v1/intents', authMiddleware, intentRoutes)
app.use('/v1/transactions', authMiddleware, transactionRoutes)
app.use('/v1/users', authMiddleware, userRoutes)

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Error handling
app.use(errorHandler)

// Start servers
async function startServers() {
  try {
    // Test database connection
    await db.query('SELECT 1')
    console.log('✅ Database connected successfully')
    
    // Start main API server
    server.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT}`)
    })
    
    // Start Socket.io server on separate port
    const socketServer = createServer()
    const socketIO = new Server(socketServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    })
    
    socketServer.listen(SOCKET_PORT, () => {
      console.log(`🔌 Socket server running on port ${SOCKET_PORT}`)
    })
    
  } catch (error) {
    console.error('❌ Failed to start servers:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await db.end()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await db.end()
  process.exit(0)
})

startServers()

export { io }
