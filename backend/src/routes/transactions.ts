import { Router } from 'express'
import { db } from '../db/connection'
import { AuthenticatedRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Get user transactions
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const { limit = 50, offset = 0 } = req.query
    
    const transactionsResult = await db.query(`
      SELECT 
        t.id,
        t.amount_cents,
        t.currency,
        t.status,
        t.created_at,
        ti.intent_description,
        ti.merchant_name,
        ti.merchant_category,
        a.name as agent_name
      FROM transactions t
      JOIN transaction_intents ti ON t.intent_id = ti.id
      JOIN agents a ON t.agent_id = a.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit as string), parseInt(offset as string)])
    
    res.json({
      transactions: transactionsResult.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: transactionsResult.rows.length
      }
    })
    
  } catch (error) {
    next(error)
  }
})

// Get transaction details
router.get('/:transactionId', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User authentication required', 401)
    }
    
    const { transactionId } = req.params
    
    const transactionResult = await db.query(`
      SELECT 
        t.*,
        ti.intent_description,
        ti.merchant_name,
        ti.merchant_category,
        ti.agent_reasoning,
        ti.alternatives_considered,
        a.name as agent_name,
        a.trust_score
      FROM transactions t
      JOIN transaction_intents ti ON t.intent_id = ti.id
      JOIN agents a ON t.agent_id = a.id
      WHERE t.id = $1 AND t.user_id = $2
    `, [transactionId, req.user.id])
    
    if (transactionResult.rows.length === 0) {
      throw createError('Transaction not found', 404)
    }
    
    const transaction = transactionResult.rows[0]
    
    // Get audit trail
    const auditResult = await db.query(`
      SELECT action, details, created_at
      FROM audit_logs
      WHERE transaction_id = $1
      ORDER BY created_at ASC
    `, [transactionId])
    
    res.json({
      id: transaction.id,
      amount_cents: transaction.amount_cents,
      currency: transaction.currency,
      status: transaction.status,
      stripe_payment_intent_id: transaction.stripe_payment_intent_id,
      stripe_charge_id: transaction.stripe_charge_id,
      receipt_url: transaction.receipt_url,
      failure_reason: transaction.failure_reason,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      intent: {
        description: transaction.intent_description,
        merchant_name: transaction.merchant_name,
        merchant_category: transaction.merchant_category,
        agent_reasoning: transaction.agent_reasoning,
        alternatives_considered: transaction.alternatives_considered
      },
      agent: {
        name: transaction.agent_name,
        trust_score: transaction.trust_score
      },
      audit_trail: auditResult.rows
    })
    
  } catch (error) {
    next(error)
  }
})

export default router
