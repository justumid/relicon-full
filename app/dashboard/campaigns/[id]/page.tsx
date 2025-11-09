/**
 * Campaign Detail/Dashboard Page
 *
 * Shows detailed view of a single campaign including:
 * - Campaign information and settings
 * - All videos/ads in the campaign
 * - Budget tracking and pacing
 * - Performance metrics (when analytics are available)
 * - Campaign management actions
 *
 * Route: /dashboard/campaigns/[id]
 *
 * Author: Relicon Team
 * Last Updated: 2025-01-09
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Play,
  Download,
  Share2,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface Campaign {
  id: number
  product_name: string
  product_description: string
  campaign_type: string
  status: string
  created_at: string
  metadata?: {
    budget_total?: number
    budget_daily?: number
    start_date?: string
    end_date?: string
    platforms?: string[]
    target_audience?: any
  }
}

interface Video {
  id: number
  product_name: string
  video_url: string
  thumbnail_url?: string
  status: string
  created_at: string
  progress: number
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user?.id && campaignId) {
      fetchCampaignDetails()
      fetchCampaignVideos()
    }
  }, [user?.id, loading, campaignId])

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const data = await response.json()

      if (data.success) {
        setCampaign(data.campaign)
      } else {
        setError('Campaign not found')
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      setError('Failed to load campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCampaignVideos = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/videos`)
      const data = await response.json()

      if (data.success) {
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaign videos:', error)
    }
  }

  const handleCreateAd = () => {
    // Navigate to Studio with pre-selected campaign
    router.push(`/dashboard/studio?campaign=${campaignId}`)
  }

  if (loading || isLoading) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen">
        <Card className="bg-[#111111] border-[#252525]">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-white mb-2">Campaign Not Found</h3>
            <p className="text-gray-400 mb-4">{error || 'This campaign does not exist'}</p>
            <Button onClick={() => router.push('/dashboard/campaigns')}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metadata = campaign.metadata || {}
  const totalBudget = metadata.budget_total || 0
  const dailyBudget = metadata.budget_daily || 0
  const platforms = metadata.platforms || []
  const startDate = metadata.start_date
  const endDate = metadata.end_date

  // Calculate budget usage (mock data - replace with actual tracking)
  const budgetSpent = videos.length * 2 // $2 per video generated
  const budgetRemaining = totalBudget - budgetSpent
  const budgetProgress = totalBudget > 0 ? (budgetSpent / totalBudget) * 100 : 0

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/campaigns')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-white">{campaign.product_name}</h1>
              <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-gray-400">{campaign.product_description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="capitalize">{campaign.campaign_type}</span>
              {platforms.length > 0 && (
                <>
                  <span>•</span>
                  <span>{platforms.join(', ')}</span>
                </>
              )}
            </div>
          </div>

          <Button onClick={handleCreateAd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Videos */}
        <Card className="bg-[#111111] border-[#252525]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Ads</p>
                <p className="text-2xl font-bold text-white mt-1">{videos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Spent */}
        {totalBudget > 0 && (
          <Card className="bg-[#111111] border-[#252525]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Budget Spent</p>
                  <p className="text-2xl font-bold text-white mt-1">${budgetSpent}</p>
                  <p className="text-xs text-gray-500 mt-1">of ${totalBudget}</p>
                </div>
                <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duration */}
        {startDate && endDate && (
          <Card className="bg-[#111111] border-[#252525]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="text-sm font-medium text-white mt-1">
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Placeholder */}
        <Card className="bg-[#111111] border-[#252525]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Performance</p>
                <p className="text-sm text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Grid */}
      <Card className="bg-[#111111] border-[#252525]">
        <CardHeader>
          <CardTitle className="text-white">Campaign Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No ads yet</h3>
              <p className="text-gray-400 mb-4">Create your first ad for this campaign</p>
              <Button onClick={handleCreateAd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Ad
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="bg-[#1a1a1a] border-[#252525] overflow-hidden group hover:border-[#404040] transition-colors">
                  <div className="aspect-[9/16] bg-[#0a0a0a] relative overflow-hidden">
                    {video.video_url ? (
                      <video
                        className="w-full h-full object-cover"
                        poster={video.thumbnail_url}
                        preload="metadata"
                      >
                        <source src={video.video_url} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm truncate flex-1">
                        {video.product_name}
                      </h3>
                      <Badge variant={video.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {video.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-400 hover:text-white">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-400 hover:text-white">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
