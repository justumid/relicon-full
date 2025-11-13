"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          // Clear invalid session
          await supabase.auth.signOut()
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes (only for actual changes, not initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', session ? 'exists' : 'null')

        if (mounted) {
          // Clear user on sign out or token refresh errors
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            setUser(session?.user ?? null)
          } else if (event === 'SIGNED_IN') {
            setUser(session?.user ?? null)
          } else {
            setUser(session?.user ?? null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      return { error }
    } catch (e) {
      return { error: { message: 'Sign in failed' } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
