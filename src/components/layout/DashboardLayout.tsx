'use client'

import Header from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton, 
  backButtonText, 
  backButtonHref 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        backButtonText={backButtonText}
        backButtonHref={backButtonHref}
      />
      
      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
