import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Plane, ShoppingCart, ArrowRight } from 'lucide-react'

const DemoMode: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('')

  const demos = [
    {
      id: 'travel',
      title: 'Travel Booking Demo',
      description: 'See how an AI agent books a flight with transparent reasoning',
      icon: Plane,
      steps: [
        'Agent searches for Miami flights under $800',
        'Finds 3 options: Delta ($764), United ($812), Spirit ($623)',
        'Explains why Delta is the best choice',
        'Creates approval request with full context',
        'User reviews and approves in 15 seconds'
      ]
    },
    {
      id: 'grocery',
      title: 'Grocery Auto-Order Demo',
      description: 'Watch pre-authorized grocery reordering in action',
      icon: ShoppingCart,
      steps: [
        'Agent detects low milk inventory',
        'Auto-orders from approved Whole Foods',
        'Within $200 weekly limit - auto-approved',
        'Payment processes automatically',
        'User gets notification after completion'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Bot className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Flux Demo Mode</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Experience AI agent payment flows without authentication
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800">
              <strong>Demo Mode:</strong> This is a simplified version for demonstration. 
              In production, users would sign in with Clerk authentication.
            </p>
          </div>
        </div>

        {/* Demo Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {demos.map((demo) => {
            const Icon = demo.icon
            const isSelected = selectedDemo === demo.id
            
            return (
              <div
                key={demo.id}
                className={`card cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedDemo(isSelected ? '' : demo.id)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {demo.title}
                    </h3>
                    <p className="text-gray-600">
                      {demo.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Demo Flow:</h4>
                    <ol className="space-y-2">
                      {demo.steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="pt-4 border-t">
                      <Link
                        to={`/simulator?demo=${demo.id}`}
                        className="btn-primary w-full flex items-center justify-center space-x-2"
                      >
                        <span>Start Demo</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Features Overview */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You'll Experience
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Agent request to payment completion in under 15 seconds
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-success-600 font-bold text-lg">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Transparency</h3>
              <p className="text-gray-600 text-sm">
                See exactly why the agent chose this option over alternatives
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-warning-600 font-bold text-lg">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Built-in Safety</h3>
              <p className="text-gray-600 text-sm">
                Guardrails prevent overspending and protect against fraud
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoMode

