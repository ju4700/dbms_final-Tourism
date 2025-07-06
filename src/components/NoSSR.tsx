'use client'

import { useState, useEffect, ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * NoSSR component ensures its children are only rendered on the client side,
 * completely skipping SSR. Use this for components that have complex
 * localStorage interactions or other browser-only APIs.
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
