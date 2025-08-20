
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ISO Connect</h1>
          </Link>
        </div>
      </header>

      {/* Auth Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
