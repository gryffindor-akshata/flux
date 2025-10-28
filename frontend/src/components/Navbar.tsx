import { Link, useNavigate } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { LogOut, Home, History, Settings } from 'lucide-react'

export default function Navbar() {
  const { user } = useUser()
  const navigate = useNavigate()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Flux</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/transactions" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
            
            <Link 
              to="/simulator" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Simulator</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
