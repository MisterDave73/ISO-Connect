
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { Inquiry, ConsultantProfile } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  X, 
  Edit, 
  Save,
  MessageSquare,
  Settings,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface InquiryWithCompany extends Inquiry {
  company: {
    id: string
    name: string
    email: string
  }
}

export default function ConsultantDashboard() {
  const { user, userRole, loading: authLoading } = useAuth()
  const [inquiries, setInquiries] = useState<InquiryWithCompany[]>([])
  const [profile, setProfile] = useState<ConsultantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    headline: '',
    bio: '',
    availability: ''
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'consultant') {
        router.push('/auth/login')
        return
      }
      fetchData()
    }
  }, [user, userRole, authLoading])

  const fetchData = async () => {
    try {
      const [inquiriesResponse, profileResponse] = await Promise.all([
        fetch('/api/inquiries'),
        fetch(`/api/consultants/${user?.id}`)
      ])

      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json()
        setInquiries(inquiriesData.inquiries || [])
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.consultant?.consultant_profiles)
        setProfileForm({
          headline: profileData.consultant?.consultant_profiles?.headline || '',
          bio: profileData.consultant?.consultant_profiles?.bio || '',
          availability: profileData.consultant?.consultant_profiles?.availability || ''
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInquiryResponse = async (inquiryId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Inquiry ${status} successfully`,
        })
        fetchData() // Refresh inquiries
      } else {
        throw new Error(`Failed to ${status} inquiry`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive"
      })
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`/api/consultants/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setEditingProfile(false)
        fetchData() // Refresh profile
      } else {
        throw new Error('Failed to update profile')
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
                View Directory
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultant Dashboard</h1>
          <p className="text-gray-600">Manage your profile and respond to client inquiries</p>
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
                  <p className="text-sm text-gray-600">Profile Status</p>
                  <p className="text-sm font-bold text-green-600">
                    {profile?.verified ? 'Verified' : 'Pending'}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {editingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="e.g., Senior ISO 9001 Implementation Specialist"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Describe your expertise and experience..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Textarea
                      id="availability"
                      value={profileForm.availability}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                      placeholder="When are you available for new projects?"
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleProfileUpdate} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile?.headline ? (
                    <div>
                      <Label>Professional Headline</Label>
                      <p className="text-sm text-gray-700 mt-1">{profile.headline}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No headline set</p>
                  )}

                  {profile?.bio ? (
                    <div>
                      <Label>Bio</Label>
                      <p className="text-sm text-gray-700 mt-1">{profile.bio}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No bio set</p>
                  )}

                  {profile?.availability ? (
                    <div>
                      <Label>Availability</Label>
                      <p className="text-sm text-gray-700 mt-1">{profile.availability}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No availability information</p>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    {profile?.verified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <User className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
              
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Update Contact Information
              </Button>

              <Button className="w-full" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Manage Certifications
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <Button variant="ghost" className="w-full justify-start p-0">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Incoming Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {inquiries.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600">Companies will reach out when they need your expertise</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(inquiry.company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{inquiry.company.name}</h4>
                          <p className="text-sm text-gray-500">
                            Received on {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Mode:</strong> {inquiry.mode.charAt(0).toUpperCase() + inquiry.mode.slice(1)}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(inquiry.status)}>
                        <span className="capitalize">{inquiry.status}</span>
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 mb-2">{inquiry.message}</p>
                      {inquiry.timing && (
                        <p className="text-xs text-gray-500">
                          <strong>Timeline:</strong> {inquiry.timing}
                        </p>
                      )}
                    </div>

                    {inquiry.status === 'sent' && (
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          onClick={() => handleInquiryResponse(inquiry.id, 'accepted')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInquiryResponse(inquiry.id, 'declined')}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {inquiry.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          You accepted this inquiry. You can now contact the client directly.
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Contact: 
                          <a href={`mailto:${inquiry.company.email}`} className="underline ml-1">
                            {inquiry.company.email}
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
