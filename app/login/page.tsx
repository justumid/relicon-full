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
    if (!loading && user) {
      router.replace(redirectPath)
    }
  }, [user, loading, router, redirectPath])

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
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
      } else {
        router.push(redirectPath)
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
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
