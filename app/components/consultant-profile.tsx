
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ConsultantWithProfile } from '@/lib/database.types'
import { 
  Shield, 
  Award, 
  MapPin, 
  Languages, 
  Calendar, 
  Mail, 
  ArrowLeft,
  Send,
  CheckCircle,
  Globe,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface ConsultantProfileProps {
  consultant: ConsultantWithProfile
}

export default function ConsultantProfile({ consultant }: ConsultantProfileProps) {
  const [loading, setLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [inquiry, setInquiry] = useState({
    message: '',
    timing: '',
    mode: 'remote' as 'remote' | 'hybrid' | 'onsite'
  })
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inquiry.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultant_id: consultant.id,
          message: inquiry.message,
          timing: inquiry.timing,
          mode: inquiry.mode
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your inquiry has been sent successfully!",
        })
        setShowContactForm(false)
        setInquiry({
          message: '',
          timing: '',
          mode: 'remote'
        })
      } else {
        throw new Error(data.error || 'Failed to send inquiry')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/consultants" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Directory</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ISO Connect</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={consultant.consultant_profiles?.profile_picture_url} 
                  alt={consultant.name} 
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-semibold">
                  {getInitials(consultant.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{consultant.name}</h1>
                    {consultant.consultant_profiles?.headline && (
                      <p className="text-xl text-blue-600 font-medium mb-3">
                        {consultant.consultant_profiles.headline}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {consultant.consultant_profiles?.verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Verified Expert</span>
                        </div>
                      )}
                      
                      {consultant.consultant_profiles?.regions && consultant.consultant_profiles.regions.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{consultant.consultant_profiles.regions.join(', ')}</span>
                        </div>
                      )}
                      
                      {consultant.consultant_profiles?.languages && consultant.consultant_profiles.languages.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Languages className="h-4 w-4" />
                          <span>{consultant.consultant_profiles.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setShowContactForm(true)}
                    className="whitespace-nowrap"
                    size="lg"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Consultant
                  </Button>
                </div>

                {consultant.consultant_profiles?.bio && (
                  <p className="text-gray-700 leading-relaxed">
                    {consultant.consultant_profiles.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Standards & Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>ISO Standards & Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultant.consultant_profiles?.standards && consultant.consultant_profiles.standards.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {consultant.consultant_profiles.standards.map((standard) => (
                    <Badge key={standard} variant="secondary" className="text-sm py-1 px-3">
                      {standard}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No standards specified</p>
              )}
            </CardContent>
          </Card>

          {/* Industries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Industries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultant.consultant_profiles?.industries && consultant.consultant_profiles.industries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {consultant.consultant_profiles.industries.map((industry) => (
                    <Badge key={industry} variant="outline" className="text-sm py-1 px-3">
                      {industry}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No industries specified</p>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {consultant.consultant_profiles?.certifications && consultant.consultant_profiles.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {consultant.consultant_profiles.certifications.map((cert) => (
                    <div key={cert} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{cert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          {consultant.consultant_profiles?.availability && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Availability</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{consultant.consultant_profiles.availability}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Contact {consultant.name}</CardTitle>
                <p className="text-sm text-gray-600">Send an inquiry about your ISO consulting needs</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div>
                    <Label htmlFor="message">Project Details *</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your ISO consulting needs, timeline, and any specific requirements..."
                      value={inquiry.message}
                      onChange={(e) => setInquiry(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="timing">Timeline</Label>
                    <Textarea
                      id="timing"
                      placeholder="When would you like to start? Any deadline constraints?"
                      value={inquiry.timing}
                      onChange={(e) => setInquiry(prev => ({ ...prev, timing: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mode">Preferred Mode</Label>
                    <Select value={inquiry.mode} onValueChange={(value: any) => setInquiry(prev => ({ ...prev, mode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Remote</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hybrid">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Hybrid (Remote + On-site)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="onsite">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>On-site</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
