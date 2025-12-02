import React, { useState, useEffect } from 'react'
import { Navigation } from './components/Navigation'
import { LoginPage } from './components/LoginPage'
import { WipesPage } from './components/WipesPage'
import { ClanPage } from './components/ClanPage'
import { VideosPage } from './components/VideosPage'
import { projectId, publicAnonKey } from './utils/supabase/info'

export default function App() {
  const [currentPage, setCurrentPage] = useState('wipes')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has stored login token
    const storedToken = localStorage.getItem('adminToken')
    const storedUsername = localStorage.getItem('adminUsername')
    
    if (storedToken && storedUsername) {
      verifyToken(storedToken, storedUsername)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string, storedUsername: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/verify-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ token: tokenToVerify }),
        }
      )

      const data = await response.json()

      if (data.valid) {
        setIsLoggedIn(true)
        setToken(tokenToVerify)
        setUsername(storedUsername)
      } else {
        // Invalid token, clear storage
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUsername')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUsername')
    }
  }

  const handleLoginSuccess = (newToken: string, newUsername: string) => {
    setIsLoggedIn(true)
    setToken(newToken)
    setUsername(newUsername)
    localStorage.setItem('adminToken', newToken)
    localStorage.setItem('adminUsername', newUsername)
    setCurrentPage('wipes')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken(null)
    setUsername(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    setCurrentPage('wipes')
  }

  const renderPage = () => {
    if (currentPage === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />
    }

    switch (currentPage) {
      case 'wipes':
        return <WipesPage isLoggedIn={isLoggedIn} token={token} />
      case 'clan':
        return <ClanPage isLoggedIn={isLoggedIn} token={token} />
      case 'videos':
        return <VideosPage isLoggedIn={isLoggedIn} token={token} />
      default:
        return <WipesPage isLoggedIn={isLoggedIn} token={token} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  )
}
