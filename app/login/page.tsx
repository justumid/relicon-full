'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get redirect path from URL params
  const [redirectPath, setRedirectPath] = useState('/dashboard')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      setRedirectPath(redirect)
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login page - loading:', loading, 'user:', user ? 'exists' : 'null', 'redirectPath:', redirectPath)

    if (!loading && user) {
      console.log('Redirecting to:', redirectPath)
      // Use window.location for hard navigation to ensure cookies are sent
      window.location.href = redirectPath
    }
  }, [user, loading, redirectPath])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Don't show login form if user is authenticated (will redirect via useEffect)
  if (user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4">
        <div className="text-white">Redirecting...</div>
        <button
          onClick={async () => {
            console.log('Manually clearing session...')
            try {
              await fetch('/api/auth/clear-session', { method: 'POST' })
              window.location.href = '/login'
            } catch (err) {
              console.error('Failed to clear session:', err)
            }
          }}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Stuck? Click here to clear session
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        setIsLoading(false)
      } else {
        // Don't set loading to false - let the redirect happen
        // Give a tiny delay to ensure session is fully established
        console.log('Login successful, redirecting to:', redirectPath)
        setTimeout(() => {
          window.location.href = redirectPath
        }, 100)
      }
    } catch (err) {
      setError('An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111111] border-[#252525]">
        <CardHeader className="text-center">
          <CardTitle className="text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Access is by invitation only. Use your provided credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0a0a0a] border-[#252525] text-white"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0a0a0a] border-[#252525] text-white"
              required
            />
            
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
