
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Shield, Users, CheckCircle, Search, Globe, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ISO Connect</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/consultants">
                <Button variant="ghost">Find Consultants</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline">Join as Consultant</Button>
              </Link>
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with Expert <span className="text-blue-600">ISO Consultants</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find verified ISO consultants for your certification journey. Get expert guidance for ISO 9001, 14001, 45001, and more standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultants">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Find Consultants
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Users className="mr-2 h-5 w-5" />
                Join as Consultant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ISO Connect?</h2>
          <p className="text-lg text-gray-600">The trusted platform for ISO consulting services</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Verified Experts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All consultants are thoroughly vetted and verified for their expertise and credentials
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with consultants worldwide, offering remote, hybrid, and on-site services
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Multi-Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Expertise across all major ISO standards including 9001, 14001, 45001, 27001, and more
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Standards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular ISO Standards</h2>
          <p className="text-lg text-gray-600">Find experts in the standards that matter to your business</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {[
            'ISO 9001 (Quality Management)',
            'ISO 14001 (Environmental)',
            'ISO 45001 (Health & Safety)',
            'ISO 27001 (Information Security)',
            'ISO 13485 (Medical Devices)',
            'ISO 22000 (Food Safety)',
            'ISO 50001 (Energy Management)',
            'ISO 20000 (IT Service Management)'
          ].map((standard) => (
            <Badge key={standard} variant="secondary" className="text-sm py-2 px-4">
              {standard}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your ISO Journey?</h2>
          <p className="text-xl mb-8">Connect with the right consultant for your certification needs today</p>
          <Link href="/consultants">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="text-lg font-semibold">ISO Connect</span>
            </div>
            <p className="text-gray-400">© 2024 ISO Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
