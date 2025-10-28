import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface PendingIntent {
  id: string
  intent_description: string
  merchant_name: string
  merchant_category: string
  amount_cents: number
  currency: string
  agent_reasoning: string
  alternatives_considered: any[]
  expires_at: string
  created_at: string
  agent_name: string
  trust_score: number
}

export default function Home() {
  const { user } = useUser()
  const [pendingIntents, setPendingIntents] = useState<PendingIntent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingIntents()
  }, [])

  const fetchPendingIntents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/v1/users/intents/pending', {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending intents')
      }
      
      const data = await response.json()
      setPendingIntents(data.intents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (intentId: string) => {
    try {
      const response = await fetch(`/v1/intents/${intentId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          payment_method_id: 'pm_card_visa_4242' // Demo payment method
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve intent')
      }
      
      // Remove from pending list
      setPendingIntents(prev => prev.filter(intent => intent.id !== intentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve intent')
    }
  }

  const handleReject = async (intentId: string) => {
    try {
      const response = await fetch(`/v1/intents/${intentId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to reject intent')
      }
      
      // Remove from pending list
      setPendingIntents(prev => prev.filter(intent => intent.id !== intentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject intent')
    }
  }

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Review and approve AI agent purchase requests</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {pendingIntents.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending purchase requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
          
          {pendingIntents.map((intent) => (
            <div key={intent.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatAmount(intent.amount_cents, intent.currency)}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{intent.merchant_name}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{intent.intent_description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Agent: {intent.agent_name}</span>
                    <span>•</span>
                    <span>Trust Score: {(intent.trust_score * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>Category: {intent.merchant_category}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeRemaining(intent.expires_at)}</span>
                </div>
              </div>
              
              {intent.agent_reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Agent Reasoning:</h4>
                  <p className="text-blue-800 text-sm">{intent.agent_reasoning}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(intent.id)}
                    className="btn-primary"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(intent.id)}
                    className="btn-danger"
                  >
                    Reject
                  </button>
                </div>
                
                <Link
                  to={`/approve/${intent.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
