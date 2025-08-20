
export type UserRole = 'company' | 'consultant' | 'admin'

export type InquiryMode = 'remote' | 'hybrid' | 'onsite'

export type InquiryStatus = 'sent' | 'accepted' | 'declined' | 'closed'

export interface User {
  id: string
  role: UserRole
  name: string
  email: string
  password_hash: string
  created_at: string
}

export interface ConsultantProfile {
  id: string
  user_id: string
  headline?: string
  bio?: string
  standards: string[]
  industries: string[]
  certifications: string[]
  case_snippets?: any
  testimonials?: any
  availability?: string
  verified: boolean
  regions: string[]
  languages: string[]
  created_at: string
  updated_at: string
  profile_picture_url?: string
}

export interface Inquiry {
  id: string
  company_id: string
  consultant_id: string
  message: string
  timing?: string
  mode: InquiryMode
  status: InquiryStatus
  created_at: string
  updated_at: string
}

export interface ConsultantWithProfile extends User {
  consultant_profiles: ConsultantProfile
}
