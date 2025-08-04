import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: 'Tourism Management System',
  description: 'Simple tourism management system for managing tourists, destinations, and bookings',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
