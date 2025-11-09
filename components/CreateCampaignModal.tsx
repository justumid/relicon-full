/**
 * Create Campaign Modal Component
 *
 * A clean modal for creating new advertising campaigns with essential details.
 * Integrates with the campaigns API to create campaign entries in the database.
 *
 * Features:
 * - Campaign name and objective
 * - Target audience and platform selection
 * - Budget settings (total and daily)
 * - Campaign duration (start/end dates)
 * - Form validation
 * - Success/error handling with toast notifications
 *
 * Usage:
 *   <CreateCampaignModal
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     userId={user.id}
 *     onSuccess={() => fetchCampaigns()}
 *   />
 *
 * Author: Relicon Team
 * Last Updated: 2025-01-09
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface CampaignTemplate {
  name: string
  objective: string
  targetAudience: string
  budgetTotal: string
  budgetDaily: string
  platforms: string[]
}

interface CreateCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: () => void
}

export function CreateCampaignModal({ open, onOpenChange, userId, onSuccess }: CreateCampaignModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<Record<string, CampaignTemplate>>({})
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    objective: 'awareness',
    targetAudience: '',
    budgetTotal: '',
    budgetDaily: '',
    startDate: '',
    endDate: '',
    platforms: [] as string[]
  })

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('campaign_templates')
      if (stored) {
        setSavedTemplates(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }, [])

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const template: CampaignTemplate = {
      name: templateName,
      objective: formData.objective,
      targetAudience: formData.targetAudience,
      budgetTotal: formData.budgetTotal,
      budgetDaily: formData.budgetDaily,
      platforms: formData.platforms
    }

    const newTemplates = {
      ...savedTemplates,
      [templateName]: template
    }

    setSavedTemplates(newTemplates)
    localStorage.setItem('campaign_templates', JSON.stringify(newTemplates))

    toast.success(`Template "${templateName}" saved!`)
    setShowSaveTemplate(false)
    setTemplateName('')
  }

  const loadTemplate = (templateKey: string) => {
    const template = savedTemplates[templateKey]
    if (template) {
      setFormData(prev => ({
        ...prev,
        objective: template.objective,
        targetAudience: template.targetAudience,
        budgetTotal: template.budgetTotal,
        budgetDaily: template.budgetDaily,
        platforms: template.platforms
      }))
      toast.success(`Template "${template.name}" loaded!`)
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleCreate = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a campaign name')
      return
    }

    if (!formData.objective) {
      toast.error('Please select a campaign objective')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: formData.name,
          objective: formData.objective,
          targetAudience: {
            description: formData.targetAudience
          },
          budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : undefined,
          budgetDaily: formData.budgetDaily ? parseFloat(formData.budgetDaily) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          platforms: formData.platforms
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      toast.success('Campaign created successfully!')

      // Reset form
      setFormData({
        name: '',
        objective: 'awareness',
        targetAudience: '',
        budgetTotal: '',
        budgetDaily: '',
        startDate: '',
        endDate: '',
        platforms: []
      })

      // Close modal
      onOpenChange(false)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Campaign creation error:', error)
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#252525] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Campaign</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new advertising campaign to organize your video ads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Management */}
          {Object.keys(savedTemplates).length > 0 && (
            <div className="space-y-2 p-4 bg-[#0a0a0a] border border-[#252525] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Load from Template
                </Label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(savedTemplates).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate(key)}
                    className="border-[#404040] text-gray-300 hover:bg-[#1a1a1a]"
                  >
                    {savedTemplates[key].name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Product Launch 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0a0a0a] border-[#252525] text-white"
            />
          </div>

          {/* Campaign Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="text-white">Campaign Objective *</Label>
            <Select value={formData.objective} onValueChange={(value) => setFormData({ ...formData, objective: value })}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#252525] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#252525]">
                <SelectItem value="awareness">Brand Awareness</SelectItem>
                <SelectItem value="consideration">Consideration</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-white">Target Audience</Label>
            <Textarea
              id="targetAudience"
              placeholder="Describe your target audience (age, interests, location, etc.)"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="bg-[#0a0a0a] border-[#252525] text-white min-h-[80px]"
            />
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label className="text-white">Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.platforms.includes(platform)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-[#0a0a0a] border-[#252525] text-gray-400 hover:border-[#404040]'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetTotal" className="text-white">Total Budget ($)</Label>
              <Input
                id="budgetTotal"
                type="number"
                placeholder="1000"
                value={formData.budgetTotal}
                onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                className="bg-[#0a0a0a] border-[#252525] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetDaily" className="text-white">Daily Budget ($)</Label>
              <Input
                id="budgetDaily"
                type="number"
                placeholder="50"
                value={formData.budgetDaily}
                onChange={(e) => setFormData({ ...formData, budgetDaily: e.target.value })}
                className="bg-[#0a0a0a] border-[#252525] text-white"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-white">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-[#0a0a0a] border-[#252525] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-white">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-[#0a0a0a] border-[#252525] text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#252525]">
          {/* Save as Template */}
          {!showSaveTemplate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveTemplate(true)}
              className="text-gray-400 hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-9 w-48 bg-[#0a0a0a] border-[#252525] text-white text-sm"
                onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
              />
              <Button size="sm" onClick={saveTemplate} className="h-9">
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowSaveTemplate(false)
                  setTemplateName('')
                }}
                className="h-9"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="border-[#252525] text-white hover:bg-[#1a1a1a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
