"use client";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConsultantWithProfile } from '@/lib/database.types'
import { Shield, Search, MapPin, Languages, Award, Star } from 'lucide-react'
import Link from 'next/link'

interface ConsultantsDirectoryProps {
  initialConsultants: ConsultantWithProfile[]
}

const ISO_STANDARDS = [
  'ISO 9001 (Quality)',
  'ISO 14001 (Environmental)',
  'ISO 45001 (Health & Safety)',
  'ISO 27001 (Information Security)',
  'ISO 13485 (Medical Devices)',
  'ISO 22000 (Food Safety)',
  'ISO 50001 (Energy Management)',
  'ISO 20000 (IT Service Management)'
]

const INDUSTRIES = [
  'Manufacturing',
  'Healthcare',
  'Technology',
  'Construction',
  'Automotive',
  'Aerospace',
  'Food & Beverage',
  'Financial Services',
  'Pharmaceuticals',
  'Energy'
]

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Middle East',
  'Africa',
  'South America'
]

export default function ConsultantsDirectory({ initialConsultants }: ConsultantsDirectoryProps) {
  const [consultants, setConsultants] = useState(initialConsultants)
  const [filteredConsultants, setFilteredConsultants] = useState(initialConsultants)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStandard, setSelectedStandard] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterConsultants()
  }, [searchQuery, selectedStandard, selectedIndustry, selectedRegion, consultants])

  const filterConsultants = () => {
    let filtered = consultants

    // Search by name, headline, or bio
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(consultant =>
        consultant.name.toLowerCase().includes(query) ||
        consultant.consultant_profiles?.headline?.toLowerCase().includes(query) ||
        consultant.consultant_profiles?.bio?.toLowerCase().includes(query)
      )
    }

    // Filter by standard
    if (selectedStandard !== 'all') {
      filtered = filtered.filter(consultant =>
        consultant.consultant_profiles?.standards?.some(standard =>
          standard.toLowerCase().includes(selectedStandard.toLowerCase())
        )
      )
    }

    // Filter by industry
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(consultant =>
        consultant.consultant_profiles?.industries?.includes(selectedIndustry)
      )
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(consultant =>
        consultant.consultant_profiles?.regions?.includes(selectedRegion)
      )
    }

    setFilteredConsultants(filtered)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ISO Connect</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Join as Consultant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find ISO Consultants</h1>
          <p className="text-gray-600 mb-6">Connect with verified experts for your certification needs</p>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Standard Filter */}
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger>
                  <SelectValue placeholder="ISO Standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Standards</SelectItem>
                  {ISO_STANDARDS.map(standard => (
                    <SelectItem key={standard} value={standard}>
                      {standard}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Region Filter */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} found
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStandard('all')
                  setSelectedIndustry('all')
                  setSelectedRegion('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Consultants Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <Card key={consultant.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={consultant.consultant_profiles?.profile_picture_url} 
                        alt={consultant.name} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                        {getInitials(consultant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{consultant.name}</CardTitle>
                      {consultant.consultant_profiles?.verified && (
                        <Badge variant="secondary" className="mt-1 text-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {consultant.consultant_profiles?.headline && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {consultant.consultant_profiles.headline}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {consultant.consultant_profiles?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {consultant.consultant_profiles.bio}
                    </p>
                  )}

                  {/* Standards */}
                  {consultant.consultant_profiles?.standards && consultant.consultant_profiles.standards.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {consultant.consultant_profiles.standards.slice(0, 3).map((standard) => (
                          <Badge key={standard} variant="outline" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                        {consultant.consultant_profiles.standards.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{consultant.consultant_profiles.standards.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location and Languages */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {consultant.consultant_profiles?.regions && consultant.consultant_profiles.regions.length > 0 && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{consultant.consultant_profiles.regions[0]}</span>
                      </div>
                    )}
                    {consultant.consultant_profiles?.languages && consultant.consultant_profiles.languages.length > 0 && (
                      <div className="flex items-center">
                        <Languages className="h-3 w-3 mr-1" />
                        <span>{consultant.consultant_profiles.languages.length} language{consultant.consultant_profiles.languages.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/consultants/${consultant.id}`}>
                    <Button className="w-full" size="sm">
                      View Profile & Contact
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
