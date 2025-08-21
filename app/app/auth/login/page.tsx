
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const { toast } = useToast()
  const router = useRouter()
  
  let supabase = null as ReturnType<typeof createSupabaseClient> | null
  try {
    supabase = createSupabaseClient()
  } catch (error) {
    console.warn((error as Error).message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Get user role from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          throw userError
        }

        toast({
          title: "Success",
          description: "Signed in successfully!",
        })

        // Redirect based on role
        const role = userData?.role
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else if (role === 'consultant') {
          router.push('/consultant/dashboard')
        } else {
          router.push('/company/dashboard')
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Sign in failed',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <LogIn className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your ISO Connect account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium">Demo Account:</p>
            <p>Email: john@doe.com</p>
            <p>Password: johndoe123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
