'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Users, 
  Home, 
  Settings, 
  LogOut, 
  User,
  UserCog
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { signOut } from 'next-auth/react'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
}

export default function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backButtonText = "← Back",
  backButtonHref = "/dashboard"
}: HeaderProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    ...(session?.user?.role === 'admin' ? [
      { name: 'Staff Management', href: '/dashboard/staff', icon: UserCog },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ] : [])
  ]

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' })
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname.startsWith('/dashboard/customers')
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/dashboard" className="flex items-center flex-shrink-0">
              <div className="w-16 h-16 mr-3 flex-shrink-0">
                <Image
                  src="/logo1.png"
                  alt="LinkUp Communications"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            
            <div className="min-w-0 flex-1 ml-4">
              {showBackButton && (
                <Link
                  href={backButtonHref}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-1 inline-block"
                >
                  {backButtonText}
                </Link>
              )}
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 hidden sm:block truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 mr-2 ${active ? 'text-gray-900' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Side - User Info and Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Desktop user menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {/* Mobile Navigation */}
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${active
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 mr-3 ${active ? 'text-gray-900' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile Sign Out */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
