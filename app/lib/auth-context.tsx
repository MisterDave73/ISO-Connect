
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if Supabase is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'
  
  const supabase = isConfigured ? createSupabaseClient() : null

  const fetchUserRole = async (userId: string) => {
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      return data?.role as UserRole
    } catch (error) {
      console.error('Error fetching user role:', error)
      return null
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase is not configured. Auth functionality will be limited.')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setUserRole(role)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch(error => {
      console.error('Auth session error:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const role = await fetchUserRole(session.user.id)
          setUserRole(role)
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe?.()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
