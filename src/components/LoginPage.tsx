import React, { useState } from 'react'
import { LogIn } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface LoginPageProps {
  onLoginSuccess: (token: string, username: string) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ username, password }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        onLoginSuccess(data.token, data.username)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-sm border border-primary/30 p-8 shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <div className="text-primary text-5xl mb-2">+46</div>
            <h2 className="text-foreground mb-2">Admin Login</h2>
            <p className="text-muted-foreground">Enter credentials to manage the clan website</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50"
            >
              <LogIn size={20} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-muted-foreground">
            <p>Default credentials:</p>
            <p className="mt-1">Username: <span className="text-foreground">admin</span></p>
            <p>Password: <span className="text-foreground">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
