import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className='bg-slate-800 text-white'>
      <div className="mycontainer flex justify-between items-center px-4 py-5 h-14">
        <div className="logo font-bold text-white text-2xl">
          <span className='text-blue-500'> &lt;</span>
          <span>Pass</span><span className='text-blue-500'>Bank/&gt;</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <img 
                  src={user.picture}
                  referrerPolicy='no-referrer' 
                  className="w-8 h-8 rounded-full"
                />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
