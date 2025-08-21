"use client";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { Inquiry } from '@/lib/database.types'
import { Shield, Send, Clock, CheckCircle, X, Eye, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface InquiryWithConsultant extends Inquiry {
  consultant: {
    id: string
    name: string
    email: string
    consultant_profiles: {
      headline: string
      verified: boolean
    }
  }
}

export default function CompanyDashboard() {
  const { user, userRole, loading: authLoading } = useAuth()
  const [inquiries, setInquiries] = useState<InquiryWithConsultant[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'company') {
        router.push('/auth/login')
        return
      }
      fetchInquiries()
    }
  }, [user, userRole, authLoading])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries')
      const data = await response.json()

      if (response.ok) {
        setInquiries(data.inquiries || [])
      } else {
        console.error('Failed to fetch inquiries:', data.error)
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />
      case 'declined':
        return <X className="h-4 w-4" />
      case 'closed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ISO Connect</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={() => window.location.href = '/consultants'}>
                Find Consultants
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
          <p className="text-gray-600">Manage your ISO consulting inquiries and connections</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold">{inquiries.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{inquiries.filter(i => i.status === 'sent').length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{inquiries.filter(i => i.status === 'accepted').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">
                    {inquiries.length > 0 
                      ? Math.round(((inquiries.filter(i => i.status !== 'sent').length) / inquiries.length) * 100)
                      : 0}%
                  </p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Inquiries</CardTitle>
              <Link href="/consultants">
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send New Inquiry
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {inquiries.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600 mb-6">Start by browsing our directory of verified consultants</p>
                <Link href="/consultants">
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    Browse Consultants
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(inquiry.consultant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{inquiry.consultant.name}</h4>
                            {inquiry.consultant.consultant_profiles.verified && (
                              <Badge variant="secondary" className="text-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                          {inquiry.consultant.consultant_profiles.headline && (
                            <p className="text-sm text-gray-600 mb-2">
                              {inquiry.consultant.consultant_profiles.headline}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Sent on {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(inquiry.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(inquiry.status)}
                          <span className="capitalize">{inquiry.status}</span>
                        </div>
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{inquiry.message}</p>
                      {inquiry.timing && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Timeline:</strong> {inquiry.timing}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Mode:</strong> {inquiry.mode.charAt(0).toUpperCase() + inquiry.mode.slice(1)}
                      </p>
                    </div>

                    {inquiry.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          Great news! This consultant has accepted your inquiry.
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          You can now contact them directly at: 
                          <a href={`mailto:${inquiry.consultant.email}`} className="underline ml-1">
                            {inquiry.consultant.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
