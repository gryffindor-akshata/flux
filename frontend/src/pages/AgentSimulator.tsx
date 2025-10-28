import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Plane, ShoppingCart, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

interface DemoScenario {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  data: any
}

const AgentSimulator: React.FC = () => {
  const navigate = useNavigate()
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const scenarios: DemoScenario[] = [
    {
      id: 'travel',
      name: 'Travel Booking - Miami Flight',
      description: 'Book a round-trip flight to Miami under $800',
      icon: Plane,
      data: {
        user_id: '00000000-0000-0000-0000-000000000001',
        intent_description: 'Book round-trip flight to Miami departing Dec 15, returning Dec 22, under $800 budget',
        merchant_name: 'Delta Airlines',
        merchant_category: 'travel',
        amount_cents: 76400,
        agent_reasoning: 'Found 3 flight options for your Miami trip. Delta at $764 is the best choice because it\'s within your $800 budget, has convenient departure times (8:30 AM and 6:45 PM), and includes one checked bag. United was $812 (over budget) and Spirit was $623 but you historically avoid ultra-low-cost carriers based on past preferences.',
        alternatives_considered: [
          {
            merchant: 'United Airlines',
            amount_cents: 81200,
            rejected_reason: 'Exceeds $800 budget by $12'
          },
          {
            merchant: 'Spirit Airlines',
            amount_cents: 62300,
            rejected_reason: 'User historically avoids budget airlines. Previous negative feedback on Spirit.'
          }
        ],
        metadata: {
          flight_details: {
            departure: '2024-12-15T08:30:00Z',
            return: '2024-12-22T18:45:00Z',
            confirmation_code: 'DL8472',
            cabin_class: 'Economy',
            checked_bags: 1
          }
        }
      }
    },
    {
      id: 'grocery',
      name: 'Grocery Reorder - Whole Foods',
      description: 'Reorder weekly groceries including milk, eggs, bread, and produce',
      icon: ShoppingCart,
      data: {
        user_id: '00000000-0000-0000-0000-000000000001',
        intent_description: 'Reorder weekly groceries including milk, eggs, bread, and produce',
        merchant_name: 'Whole Foods Market',
        merchant_category: 'groceries',
        amount_cents: 12743,
        agent_reasoning: 'Detected that your milk inventory is low (expires tomorrow). Auto-ordering your usual weekly groceries from Whole Foods. Items include: organic whole milk, cage-free eggs, sourdough bread, mixed greens, bananas, and chicken breast. Total matches your average weekly spend.',
        alternatives_considered: [
          {
            merchant: 'Trader Joe\'s',
            amount_cents: 10950,
            rejected_reason: 'Slightly cheaper but several items out of stock based on their inventory API'
          }
        ],
        metadata: {
          items: [
            { name: 'Organic Whole Milk', quantity: 2, price_cents: 549 },
            { name: 'Cage-Free Eggs (dozen)', quantity: 1, price_cents: 649 },
            { name: 'Sourdough Bread', quantity: 1, price_cents: 499 },
            { name: 'Mixed Greens', quantity: 1, price_cents: 399 },
            { name: 'Bananas (lb)', quantity: 2, price_cents: 158 },
            { name: 'Chicken Breast (lb)', quantity: 2, price_cents: 1299 }
          ],
          delivery_window: 'Today 6-8 PM',
          recurring: true
        }
      }
    }
  ]

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setResult(null)
  }

  const handleSimulate = async () => {
    if (!selectedScenario) return

    setLoading(true)
    try {
      const scenario = scenarios.find(s => s.id === selectedScenario)
      if (!scenario) return

      const response = await api.post('/v1/intents', scenario.data, {
        headers: {
          'Authorization': 'Bearer flux_test_travelgpt_demo_key_123' 
        }
      })

      setResult(response.data)
    } catch (error) {
      console.error('Error simulating agent request:', error)
      setResult({
        error: 'Failed to create intent. Please check your connection and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenApproval = () => {
    if (result?.approval_url) {
      const intentId = result.approval_url.split('/').pop()
      navigate(`/approve/${intentId}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Bot className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Agent Simulator</h1>
        </div>
        <p className="text-lg text-gray-600">
          Simulate AI agent purchase requests to test the approval flow
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scenario Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Select Demo Scenario
          </h2>
          
          <div className="space-y-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon
              const isSelected = selectedScenario === scenario.id
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-6 h-6 mt-1 ${
                      isSelected ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {scenario.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedScenario && (
            <div className="mt-6">
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Simulate Agent Request</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Simulation Results
          </h2>

          {!result && !loading && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Select a scenario and click "Simulate Agent Request" to see results
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Creating intent...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.error ? (
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-danger-600" />
                    <p className="text-danger-800">{result.error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <span className="font-semibold text-success-800">
                        Intent Created Successfully
                      </span>
                    </div>
                    <p className="text-sm text-success-700">
                      Intent ID: {result.intent_id}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-900">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'pending_approval'
                          ? 'bg-warning-100 text-warning-800'
                          : result.status === 'approved'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {result.status.replace('_', ' ')}
                      </span>
                    </div>

                    {result.approval_url && (
                      <div>
                        <span className="font-medium text-gray-900">Approval URL:</span>
                        <p className="text-sm text-gray-600 mt-1 break-all">
                          {result.approval_url}
                        </p>
                      </div>
                    )}

                    {result.expires_at && (
                      <div>
                        <span className="font-medium text-gray-900">Expires:</span>
                        <p className="text-sm text-gray-600">
                          {new Date(result.expires_at).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {result.guardrails_check && (
                      <div>
                        <span className="font-medium text-gray-900">Guardrails:</span>
                        <div className="mt-2 space-y-1">
                          {result.guardrails_check.checks?.map((check: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              {check.passed ? (
                                <CheckCircle className="w-4 h-4 text-success-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-danger-600" />
                              )}
                              <span className="text-sm text-gray-600">
                                {check.details}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {result.approval_url && (
                    <div className="pt-4 border-t">
                      <button
                        onClick={handleOpenApproval}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <span>Open Approval Page</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentSimulator

