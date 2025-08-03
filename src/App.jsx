import reactLogo from './assets/react.svg'
import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import Login from './components/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <>
      <Navbar />
      <div className='min-h-[88vh]'>
        <Manager />
      </div>
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
