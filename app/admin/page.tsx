'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/utils/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TagManagement from '@/components/admin/TagManagement'
import QuestionManagement from '@/components/admin/QuestionManagement'
import { Tag } from '@/types'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        toast.error('Please log in to access the admin panel')
        router.push('/login')
        return
      }

      if (!isAdmin(user.email)) {
        toast.error('Access denied. Admin privileges required.')
        router.push('/')
        return
      }

      setUser({ email: user.email! })
      await fetchTags()
    } catch (error) {
      console.error('Auth check failed:', error)
      toast.error('Authentication failed')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Admin Panel
          </h1>
          <p className="text-text-secondary">
            Manage tags and questions for the quiz system
          </p>
        </div>

        <Tabs defaultValue="tags" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tags">Tag Management</TabsTrigger>
            <TabsTrigger value="questions">Question Management</TabsTrigger>
          </TabsList>

          <TabsContent value="tags" className="space-y-6">
            <TagManagement onTagsChange={fetchTags} />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <QuestionManagement tags={tags} onRefresh={fetchTags} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}