"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Lock } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111111] border-[#252525]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#252525]">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-white text-2xl">Invite Only</CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Relicon is currently in private beta. Access is by invitation only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#0a0a0a] border border-[#252525] rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              If you've been invited to join Relicon, you should have received login credentials via email.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full bg-white hover:bg-gray-200 text-black">
                Sign In with Credentials
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-[#252525] text-gray-300 hover:bg-[#1a1a1a]">
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t border-[#252525]">
            <p className="text-xs text-gray-500">
              Interested in joining? Contact us at{" "}
              <a href="mailto:hello@relicon.co" className="text-blue-400 hover:text-blue-300">
                hello@relicon.co
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
