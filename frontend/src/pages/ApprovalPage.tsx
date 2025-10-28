import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface IntentDetails {
  id: string
  description: string
  merchant_name: string
  merchant_category: string
  amount_cents: number
  currency: string
  agent_name: string
  agent_reasoning: string
  alternatives_considered: any[]
  status: string
  expires_at: string
  created_at: string
  approved_at?: string
  rejected_at?: string
}

export default function ApprovalPage() {
  const { intentId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [intent, setIntent] = useState<IntentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (intentId) {
      fetchIntentDetails()
    }
  }, [intentId])

  const fetchIntentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/v1/intents/${intentId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch intent details')
      }
      
      const data = await response.json()
      setIntent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
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
      
      navigate('/transactions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve intent')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setProcessing(true)
      const response = await fetch(`/v1/intents/${intentId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to reject intent')
      }
      
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject intent')
    } finally {
      setProcessing(false)
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

  const isExpired = intent && new Date() > new Date(intent.expires_at)
  const isProcessed = intent && ['approved', 'rejected', 'expired'].includes(intent.status)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!intent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Intent not found</h2>
          <p className="text-gray-600 mb-4">The requested intent could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Purchase Approval</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatAmount(intent.amount_cents, intent.currency)}
              </span>
              {isExpired && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  Expired
                </span>
              )}
              {isProcessed && !isExpired && (
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  intent.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {intent.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {intent.merchant_name}
            </h2>
            
            <p className="text-gray-600 mb-4">{intent.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Agent: {intent.agent_name}</span>
              <span>•</span>
              <span>Category: {intent.merchant_category}</span>
              <span>•</span>
              <span>Created: {new Date(intent.created_at).toLocaleString()}</span>
            </div>
          </div>
          
          {!isExpired && !isProcessed && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{getTimeRemaining(intent.expires_at)} remaining</span>
            </div>
          )}
        </div>

        {intent.agent_reasoning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Agent Reasoning</h3>
            <p className="text-blue-800">{intent.agent_reasoning}</p>
          </div>
        )}

        {intent.alternatives_considered && intent.alternatives_considered.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Alternatives Considered</h3>
            <ul className="space-y-2">
              {intent.alternatives_considered.map((alternative: any, index: number) => (
                <li key={index} className="text-sm text-gray-700">
                  • {alternative.description || alternative}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isExpired && !isProcessed && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              This request will expire in {getTimeRemaining(intent.expires_at)}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-danger disabled:opacity-50"
              >
                {processing ? <LoadingSpinner size="sm" /> : 'Reject'}
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="btn-primary disabled:opacity-50"
              >
                {processing ? <LoadingSpinner size="sm" /> : 'Approve'}
              </button>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="pt-6 border-t border-gray-200">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">This request has expired and can no longer be approved.</p>
            </div>
          </div>
        )}

        {isProcessed && !isExpired && (
          <div className="pt-6 border-t border-gray-200">
            <div className="text-center">
              {intent.status === 'approved' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">This request has been approved!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Approved at {new Date(intent.approved_at!).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">This request has been rejected.</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Rejected at {new Date(intent.rejected_at!).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
