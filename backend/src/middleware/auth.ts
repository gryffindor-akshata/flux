import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { db } from '../db/connection'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    clerkUserId: string
    email: string
  }
  agent?: {
    id: string
    name: string
    trustScore: number
  }
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Check if it's an agent API key
    if (token.startsWith('flux_live_')) {
      const agentResult = await db.query(
        'SELECT id, name, trust_score FROM agents WHERE api_key = $1 AND is_active = true',
        [token]
      )
      
      if (agentResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid agent API key' })
      }
      
      req.agent = {
        id: agentResult.rows[0].id,
        name: agentResult.rows[0].name,
        trustScore: parseFloat(agentResult.rows[0].trust_score)
      }
      
      return next()
    }
    
    // Check if it's a Clerk JWT token
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!
      })
      
      if (!payload.sub) {
        return res.status(401).json({ error: 'Invalid token payload' })
      }
      
      // Get or create user in our database
      const userResult = await db.query(
        'SELECT id, clerk_user_id, email FROM users WHERE clerk_user_id = $1',
        [payload.sub]
      )
      
      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await db.query(
          'INSERT INTO users (clerk_user_id, email) VALUES ($1, $2) RETURNING id, clerk_user_id, email',
          [payload.sub, payload.email || '']
        )
        
        req.user = {
          id: newUserResult.rows[0].id,
          clerkUserId: newUserResult.rows[0].clerk_user_id,
          email: newUserResult.rows[0].email
        }
      } else {
        req.user = {
          id: userResult.rows[0].id,
          clerkUserId: userResult.rows[0].clerk_user_id,
          email: userResult.rows[0].email
        }
      }
      
      return next()
      
    } catch (clerkError) {
      return res.status(401).json({ error: 'Invalid JWT token' })
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}
