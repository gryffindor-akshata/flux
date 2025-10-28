import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
db.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database')
})

db.on('error', (err) => {
  console.error('❌ Database connection error:', err)
})
