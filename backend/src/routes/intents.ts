import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/connection'
import { AuthenticatedRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { io } from '../index'

const router = Router()

// Validation schemas
const createIntentSchema = z.object({
  user_id: z.string().uuid(),
  intent_description: z.string().min(1).max(1000),
  merchant_name: z.string().min(1).max(255),
  merchant_category: z.string().min(1).max(100),
  amount_cents: z.number().int().positive(),
  agent_reasoning: z.string().optional(),
  alternatives_considered: z.array(z.any()).optional()
})

const approveIntentSchema = z.object({
  payment_method_id: z.string().min(1)
})

// Create transaction intent (Agent API)
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.agent) {
      throw createError('Agent authentication required', 401)
    }
    
    const validatedData = createIntentSchema.parse(req.body)
    
    // Check if user exists
    const userResult = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [validatedData.user_id]
    )
    
    if (userResult.rows.length === 0) {
      throw createError('User not found', 404)
    }
    
    // Create intent with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    const intentResult = await db.query(`
      INSERT INTO transaction_intents (
        user_id, agent_id, intent_description, merchant_name, 
        merchant_category, amount_cents, agent_reasoning, 
        alternatives_considered, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, status, expires_at, created_at
    `, [
      validatedData.user_id,
      req.agent.id,
      validatedData.intent_description,
      validatedData.merchant_name,
      validatedData.merchant_category,
      validatedData.amount_cents,
      validatedData.agent_reasoning,
      JSON.stringify(validatedData.alternatives_considered || []),
      expiresAt
    ])
    
    const intent = intentResult.rows[0]
    
    // Check guardrails
    const guardrailsResult = await db.query(`
      SELECT rule_type, rule_config, auto_approve, auto_approve_max_cents
      FROM guardrails 
      WHERE user_id = $1 AND is_active = true
    `, [validatedData.user_id])
    
    let shouldAutoApprove = false
    
    for (const rule of guardrailsResult.rows) {
      // Simple guardrail logic - in production, this would be more sophisticated
      if (rule.auto_approve && validatedData.amount_cents <= rule.auto_approve_max_cents) {
        shouldAutoApprove = true
        break
      }
    }
    
    if (shouldAutoApprove) {
      // Auto-approve the intent
      await db.query(
        'UPDATE transaction_intents SET status = $1, approved_at = NOW() WHERE id = $2',
        ['approved', intent.id]
      )
      
      // Notify user via socket
      io.to(`user-${validatedData.user_id}`).emit('intent-auto-approved', {
        intentId: intent.id,
        amount: validatedData.amount_cents,
        merchant: validatedData.merchant_name
      })
    } else {
      // Notify user for manual approval
      io.to(`user-${validatedData.user_id}`).emit('intent-created', {
        intentId: intent.id,
        amount: validatedData.amount_cents,
        merchant: validatedData.merchant_name,
        description: validatedData.intent_description,
        reasoning: validatedData.agent_reasoning
      })
    }
    
    res.status(201).json({
      intent_id: intent.id,
      status: intent.status,
      expires_at: intent.expires_at,
      created_at: intent.created_at,
      auto_approved: shouldAutoApprove
    })
    
  } catch (error) {
    next(error)
  }
})

// Get intent details
router.get('/:intentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { intentId } = req.params
    
    const intentResult = await db.query(`
      SELECT 
        ti.*,
        a.name as agent_name,
        u.email as user_email
      FROM transaction_intents ti
      JOIN agents a ON ti.agent_id = a.id
      JOIN users u ON ti.user_id = u.id
      WHERE ti.id = $1
    `, [intentId])
    
    if (intentResult.rows.length === 0) {
      throw createError('Intent not found', 404)
    }
    
    const intent = intentResult.rows[0]
    
    // Check if user has access to this intent
    if (req.user && intent.user_id !== req.user.id) {
      throw createError('Access denied', 403)
    }
    
    res.json({
      id: intent.id,
      description: intent.intent_description,
      merchant_name: intent.merchant_name,
      merchant_category: intent.merchant_category,
      amount_cents: intent.amount_cents,
      currency: intent.currency,
      agent_name: intent.agent_name,
      agent_reasoning: intent.agent_reasoning,
      alternatives_considered: intent.alternatives_considered,
      status: intent.status,
      expires_at: intent.expires_at,
      created_at: intent.created_at,
      approved_at: intent.approved_at,
      rejected_at: intent.rejected_at
    })
    
  } catch (error) {
    next(error)
  }
})

// Approve intent (User API)
router.post('/:intentId/approve', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const { intentId } = req.params
    const validatedData = approveIntentSchema.parse(req.body)
    
    // Get intent details
    const intentResult = await db.query(`
      SELECT * FROM transaction_intents 
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `, [intentId, req.user.id])
    
    if (intentResult.rows.length === 0) {
      throw createError('Intent not found or not pending', 404)
    }
    
    const intent = intentResult.rows[0]
    
    // Check if intent has expired
    if (new Date() > new Date(intent.expires_at)) {
      await db.query(
        'UPDATE transaction_intents SET status = $1, rejected_at = NOW() WHERE id = $2',
        ['expired', intentId]
      )
      throw createError('Intent has expired', 400)
    }
    
    // Update intent status
    await db.query(
      'UPDATE transaction_intents SET status = $1, approved_at = NOW() WHERE id = $2',
      ['approved', intentId]
    )
    
    // Create transaction record
    const transactionResult = await db.query(`
      INSERT INTO transactions (
        intent_id, user_id, agent_id, amount_cents, currency, status
      ) VALUES ($1, $2, $3, $4, $5, 'processing')
      RETURNING id
    `, [
      intentId,
      req.user.id,
      intent.agent_id,
      intent.amount_cents,
      intent.currency
    ])
    
    // Notify agent
    io.to(`agent-${intent.agent_id}`).emit('intent-approved', {
      intentId,
      transactionId: transactionResult.rows[0].id,
      amount: intent.amount_cents
    })
    
    res.json({
      intent_id: intentId,
      transaction_id: transactionResult.rows[0].id,
      status: 'approved',
      approved_at: new Date().toISOString()
    })
    
  } catch (error) {
    next(error)
  }
})

// Reject intent (User API)
router.post('/:intentId/reject', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const { intentId } = req.params
    
    const intentResult = await db.query(`
      SELECT * FROM transaction_intents 
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `, [intentId, req.user.id])
    
    if (intentResult.rows.length === 0) {
      throw createError('Intent not found or not pending', 404)
    }
    
    // Update intent status
    await db.query(
      'UPDATE transaction_intents SET status = $1, rejected_at = NOW() WHERE id = $2',
      ['rejected', intentId]
    )
    
    // Notify agent
    io.to(`agent-${intentResult.rows[0].agent_id}`).emit('intent-rejected', {
      intentId,
      reason: 'User rejected'
    })
    
    res.json({
      intent_id: intentId,
      status: 'rejected',
      rejected_at: new Date().toISOString()
    })
    
  } catch (error) {
    next(error)
  }
})

export default router
