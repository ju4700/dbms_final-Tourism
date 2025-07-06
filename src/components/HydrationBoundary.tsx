'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

/**
 * HydrationBoundary prevents hydration mismatches by ensuring client-only 
 * content is only rendered after hydration is complete.
 * 
 * Use this wrapper around components that access browser-only APIs
 * like localStorage, sessionStorage, or window object during initial render.
 */
export default function HydrationBoundary({ 
  children, 
  fallback,
  className 
}: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <div className={`animate-pulse ${className || ''}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return <>{children}</>
}
