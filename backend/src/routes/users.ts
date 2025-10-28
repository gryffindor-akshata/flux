import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/connection'
import { AuthenticatedRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Get user profile
router.get('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const userResult = await db.query(`
      SELECT id, email, stripe_customer_id, created_at
      FROM users
      WHERE id = $1
    `, [req.user.id])
    
    if (userResult.rows.length === 0) {
      throw createError('User not found', 404)
    }
    
    const user = userResult.rows[0]
    
    // Get user's guardrails
    const guardrailsResult = await db.query(`
      SELECT rule_type, rule_config, auto_approve, auto_approve_max_cents, is_active
      FROM guardrails
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id])
    
    // Get payment methods
    const paymentMethodsResult = await db.query(`
      SELECT id, type, last_four, brand, is_default, created_at
      FROM payment_methods
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `, [req.user.id])
    
    res.json({
      id: user.id,
      email: user.email,
      stripe_customer_id: user.stripe_customer_id,
      created_at: user.created_at,
      guardrails: guardrailsResult.rows,
      payment_methods: paymentMethodsResult.rows
    })
    
  } catch (error) {
    next(error)
  }
})

// Create guardrail
const createGuardrailSchema = z.object({
  rule_type: z.enum(['spending_limit', 'merchant_whitelist', 'merchant_blacklist', 'category_limit', 'transaction_count']),
  rule_config: z.record(z.any()),
  auto_approve: z.boolean().default(false),
  auto_approve_max_cents: z.number().int().min(0).default(0)
})

router.post('/guardrails', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const validatedData = createGuardrailSchema.parse(req.body)
    
    const guardrailResult = await db.query(`
      INSERT INTO guardrails (
        user_id, rule_type, rule_config, auto_approve, auto_approve_max_cents
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, rule_type, rule_config, auto_approve, auto_approve_max_cents, created_at
    `, [
      req.user.id,
      validatedData.rule_type,
      JSON.stringify(validatedData.rule_config),
      validatedData.auto_approve,
      validatedData.auto_approve_max_cents
    ])
    
    res.status(201).json(guardrailResult.rows[0])
    
  } catch (error) {
    next(error)
  }
})

// Get pending intents for user
router.get('/intents/pending', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const intentsResult = await db.query(`
      SELECT 
        ti.id,
        ti.intent_description,
        ti.merchant_name,
        ti.merchant_category,
        ti.amount_cents,
        ti.currency,
        ti.agent_reasoning,
        ti.alternatives_considered,
        ti.expires_at,
        ti.created_at,
        a.name as agent_name,
        a.trust_score
      FROM transaction_intents ti
      JOIN agents a ON ti.agent_id = a.id
      WHERE ti.user_id = $1 AND ti.status = 'pending'
      ORDER BY ti.created_at DESC
    `, [req.user.id])
    
    res.json({
      intents: intentsResult.rows
    })
    
  } catch (error) {
    next(error)
  }
})

export default router
