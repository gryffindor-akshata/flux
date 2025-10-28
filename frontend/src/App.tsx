import { Routes, Route } from 'react-router-dom'
import { useUser, SignIn, SignUp } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

// Components
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ApprovalPage from './pages/ApprovalPage'
import TransactionHistory from './pages/TransactionHistory'
import TransactionReceipt from './pages/TransactionReceipt'
import AgentSimulator from './pages/AgentSimulator'
import DemoMode from './pages/DemoMode'
import LoadingSpinner from './components/LoadingSpinner'

// Services
import { socketService } from './services/socket'

function App() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (isSignedIn && user) {
      // Initialize socket connection for this user
      socketService.connect()
      socketService.joinUserRoom(user.id)
    } else {
      socketService.disconnect()
    }

    return () => {
      socketService.disconnect()
    }
  }, [isSignedIn, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Flux
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Payment rails for AI agents with transparent approval flows
            </p>
          </div>
          <div className="card">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'btn-primary w-full',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'btn-secondary w-full mb-2',
                  formFieldInput: 'input',
                  footerActionLink: 'text-primary-600 hover:text-primary-700'
                }
              }}
            />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setDemoMode(true)}
                className="w-full btn-secondary"
              >
                Try Demo Mode (No Auth Required)
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (demoMode) {
    return <DemoMode />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/approve/:intentId" element={<ApprovalPage />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transactions/:id" element={<TransactionReceipt />} />
          <Route path="/simulator" element={<AgentSimulator />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
