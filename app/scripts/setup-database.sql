
-- ISO Connect Database Schema
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('company', 'consultant', 'admin');
CREATE TYPE inquiry_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE inquiry_status AS ENUM ('sent', 'accepted', 'declined', 'closed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultant profiles table
CREATE TABLE IF NOT EXISTS consultant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  standards TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  case_snippets JSONB,
  testimonials JSONB,
  availability TEXT,
  verified BOOLEAN DEFAULT FALSE,
  regions TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  timing TEXT,
  mode inquiry_mode NOT NULL,
  status inquiry_status DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_consultant_profiles_user_id ON consultant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_consultant_profiles_verified ON consultant_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_inquiries_company_id ON inquiries(company_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_consultant_id ON inquiries(consultant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Consultant profiles policies
CREATE POLICY "Anyone can view verified consultant profiles" ON consultant_profiles
  FOR SELECT USING (verified = true);

CREATE POLICY "Consultants can view their own profile" ON consultant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Consultants can update their own profile" ON consultant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Consultants can insert their own profile" ON consultant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inquiries policies
CREATE POLICY "Companies can view their sent inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Consultants can view inquiries sent to them" ON inquiries
  FOR SELECT USING (auth.uid() = consultant_id);

CREATE POLICY "Companies can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Consultants can update inquiries sent to them" ON inquiries
  FOR UPDATE USING (auth.uid() = consultant_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_consultant_profiles_updated_at
  BEFORE UPDATE ON consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
-- Demo admin user
INSERT INTO users (id, role, name, email, password_hash, created_at) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'admin@isoconnect.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPiVW5/UiLjqe', NOW()),
('00000000-0000-0000-0000-000000000002', 'company', 'John Doe', 'john@doe.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPiVW5/UiLjqe', NOW()),
('00000000-0000-0000-0000-000000000003', 'consultant', 'Sarah Johnson', 'sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPiVW5/UiLjqe', NOW()),
('00000000-0000-0000-0000-000000000004', 'consultant', 'Michael Chen', 'michael@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPiVW5/UiLjqe', NOW());

-- Demo consultant profiles
INSERT INTO consultant_profiles (user_id, headline, bio, standards, industries, certifications, verified, regions, languages, availability) VALUES 
('00000000-0000-0000-0000-000000000003', 'Senior ISO 9001 & 14001 Implementation Specialist', 'With over 15 years of experience in quality and environmental management systems, I help organizations achieve ISO certification efficiently. Specialized in manufacturing and automotive industries.', 
ARRAY['ISO 9001 (Quality)', 'ISO 14001 (Environmental)', 'ISO 45001 (Health & Safety)'], 
ARRAY['Manufacturing', 'Automotive', 'Aerospace'], 
ARRAY['Lead Auditor ISO 9001:2015', 'Environmental Management Systems Expert', 'OHSAS 18001 Implementation'], 
true, 
ARRAY['North America', 'Europe'], 
ARRAY['English', 'Spanish'], 
'Available for new projects starting Q2 2024'),

('00000000-0000-0000-0000-000000000004', 'Information Security & IT Service Management Consultant', 'Cybersecurity expert with 12+ years helping organizations implement robust information security and IT service management frameworks. Proven track record in financial services and healthcare.', 
ARRAY['ISO 27001 (Information Security)', 'ISO 20000 (IT Service Management)'], 
ARRAY['Financial Services', 'Healthcare', 'Technology'], 
ARRAY['CISSP', 'ISO 27001 Lead Implementer', 'ITIL Expert'], 
true, 
ARRAY['Asia Pacific', 'North America'], 
ARRAY['English', 'Mandarin'], 
'Currently booking for Q3-Q4 2024');

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
