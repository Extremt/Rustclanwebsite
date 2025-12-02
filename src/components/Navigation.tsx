import React from 'react'
import { Menu, LogOut, LogIn } from 'lucide-react'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
  isLoggedIn: boolean
  onLogout: () => void
}

export function Navigation({ currentPage, onNavigate, isLoggedIn, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navItems = [
    { id: 'wipes', label: 'Server Wipes' },
    { id: 'clan', label: 'Clan' },
    { id: 'videos', label: 'Videos' },
  ]

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-primary/30 relative z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-primary uppercase tracking-wider">
              <span className="text-3xl">+46</span>
              <span className="ml-2 text-foreground/60">Rust Clan</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200 shadow-md"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 shadow-md shadow-primary/30"
              >
                <LogIn size={18} />
                Admin Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  onLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground shadow-md"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/30"
              >
                <LogIn size={18} />
                Admin Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
