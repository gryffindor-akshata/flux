import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, DollarSign, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface TransactionDetails {
  id: string
  amount_cents: number
  currency: string
  status: string
  stripe_payment_intent_id: string
  stripe_charge_id: string
  receipt_url: string
  failure_reason: string
  created_at: string
  updated_at: string
  intent: {
    description: string
    merchant_name: string
    merchant_category: string
    agent_reasoning: string
    alternatives_considered: any[]
  }
  agent: {
    name: string
    trust_score: number
  }
  audit_trail: Array<{
    action: string
    details: any
    created_at: string
  }>
}

export default function TransactionReceipt() {
  const { id } = useParams()
  const { user } = useUser()
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchTransactionDetails()
    }
  }, [id])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/v1/transactions/${id}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details')
      }
      
      const data = await response.json()
      setTransaction(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-500" />
      default:
        return <Clock className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful'
      case 'failed':
        return 'Payment Failed'
      case 'processing':
        return 'Processing Payment'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <p className="text-gray-600 mb-4">The requested transaction could not be found.</p>
          <Link to="/transactions" className="btn-primary">
            View All Transactions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/transactions"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Transaction Receipt</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Transaction Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(transaction.status)}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatAmount(transaction.amount_cents, transaction.currency)}
                </h2>
                <p className="text-gray-600">{transaction.intent.merchant_name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {getStatusText(transaction.status)}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(transaction.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Transaction ID:</span>
              <span className="ml-2 text-gray-600 font-mono">{transaction.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Agent:</span>
              <span className="ml-2 text-gray-600">{transaction.agent.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Category:</span>
              <span className="ml-2 text-gray-600">{transaction.intent.merchant_category}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Trust Score:</span>
              <span className="ml-2 text-gray-600">{(transaction.agent.trust_score * 100).toFixed(0)}%</span>
            </div>
          </div>

          {transaction.stripe_payment_intent_id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm">
                <span className="font-medium text-gray-900">Payment Intent ID:</span>
                <span className="ml-2 text-gray-600 font-mono">{transaction.stripe_payment_intent_id}</span>
              </div>
            </div>
          )}

          {transaction.receipt_url && (
            <div className="mt-4">
              <a
                href={transaction.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <FileText className="w-4 h-4" />
                <span>View Receipt</span>
              </a>
            </div>
          )}
        </div>

        {/* Intent Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Details</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{transaction.intent.description}</p>
            </div>

            {transaction.intent.agent_reasoning && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Agent Reasoning</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{transaction.intent.agent_reasoning}</p>
                </div>
              </div>
            )}

            {transaction.intent.alternatives_considered && transaction.intent.alternatives_considered.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alternatives Considered</h4>
                <ul className="space-y-2">
                  {transaction.intent.alternatives_considered.map((alternative: any, index: number) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {alternative.description || alternative}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail */}
        {transaction.audit_trail && transaction.audit_trail.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
            
            <div className="space-y-3">
              {transaction.audit_trail.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{entry.action}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.details && (
                      <div className="mt-1 text-sm text-gray-600">
                        {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failure Reason */}
        {transaction.status === 'failed' && transaction.failure_reason && (
          <div className="card bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Payment Failed</h3>
            <p className="text-red-800">{transaction.failure_reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
