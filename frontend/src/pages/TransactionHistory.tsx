import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowRight, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface Transaction {
  id: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  intent_description: string
  merchant_name: string
  merchant_category: string
  agent_name: string
}

export default function TransactionHistory() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/v1/transactions', {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      setTransactions(data.transactions)
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
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'processing':
        return 'Processing'
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600">View all your AI agent transactions</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Your AI agent transactions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(transaction.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatAmount(transaction.amount_cents, transaction.currency)}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{transaction.merchant_name}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-1">{transaction.intent_description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Agent: {transaction.agent_name}</span>
                      <span>•</span>
                      <span>Category: {transaction.merchant_category}</span>
                      <span>•</span>
                      <span>{new Date(transaction.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {getStatusText(transaction.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Link
                    to={`/transactions/${transaction.id}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-sm font-medium">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
