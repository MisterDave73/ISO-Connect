"use client";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { ConsultantWithProfile, Inquiry } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  X,
  Award,
  Clock,
  UserCheck,
  TrendingUp,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface InquiryWithUsers extends Inquiry {
  company: {
    id: string
    name: string
    email: string
  }
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

export default function AdminDashboard() {
  const { user, userRole, loading: authLoading } = useAuth()
  const [consultants, setConsultants] = useState<ConsultantWithProfile[]>([])
  const [inquiries, setInquiries] = useState<InquiryWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'admin') {
        router.push('/auth/login')
        return
      }
      fetchData()
    }
  }, [user, userRole, authLoading])

  const fetchData = async () => {
    try {
      const [consultantsResponse, inquiriesResponse] = await Promise.all([
        fetch('/api/consultants'),
        fetch('/api/inquiries')
      ])

      if (consultantsResponse.ok) {
        const consultantsData = await consultantsResponse.json()
        setConsultants(consultantsData.consultants || [])
      }

      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json()
        setInquiries(inquiriesData.inquiries || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerification = async (consultantId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/consultants/${consultantId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !currentStatus }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Consultant ${!currentStatus ? 'verified' : 'unverified'} successfully`,
        })
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to update verification status')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive"
      })
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const verifiedConsultants = consultants.filter(c => c.consultant_profiles?.verified)
  const pendingConsultants = consultants.filter(c => !c.consultant_profiles?.verified)
  const acceptedInquiries = inquiries.filter(i => i.status === 'accepted')

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
              <span className="text-gray-600">Admin Panel</span>
              <Button variant="outline" onClick={() => window.location.href = '/consultants'}>
                <Eye className="h-4 w-4 mr-2" />
                View Directory
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage consultants and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Consultants</p>
                  <p className="text-2xl font-bold">{consultants.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold">{verifiedConsultants.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold">{pendingConsultants.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful Matches</p>
                  <p className="text-2xl font-bold">{acceptedInquiries.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consultant Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Consultant Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingConsultants.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No pending verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingConsultants.slice(0, 5).map((consultant) => (
                    <div key={consultant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={consultant.consultant_profiles?.profile_picture_url} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(consultant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{consultant.name}</p>
                          {consultant.consultant_profiles?.headline && (
                            <p className="text-xs text-gray-600">
                              {consultant.consultant_profiles.headline}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => toggleVerification(consultant.id, false)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingConsultants.length > 5 && (
                    <p className="text-center text-gray-600 text-sm">
                      +{pendingConsultants.length - 5} more pending
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Recent Inquiries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.slice(0, 5).map((inquiry) => (
                    <div key={inquiry.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{inquiry.company.name}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm">{inquiry.consultant.name}</span>
                        </div>
                        <Badge className={getStatusColor(inquiry.status)}>
                          <span className="capitalize text-xs">{inquiry.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {inquiry.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {inquiries.length > 5 && (
                    <p className="text-center text-gray-600 text-sm">
                      +{inquiries.length - 5} more inquiries
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verified Consultants */}
        {verifiedConsultants.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Verified Consultants</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedConsultants.slice(0, 6).map((consultant) => (
                  <div key={consultant.id} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={consultant.consultant_profiles?.profile_picture_url} />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {getInitials(consultant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{consultant.name}</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                    
                    {consultant.consultant_profiles?.headline && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {consultant.consultant_profiles.headline}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleVerification(consultant.id, true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Unverify
                      </Button>
                      <Link href={`/consultants/${consultant.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {verifiedConsultants.length > 6 && (
                <div className="text-center mt-4">
                  <Button variant="outline">
                    View All {verifiedConsultants.length} Verified Consultants
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
