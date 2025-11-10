'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Trash2, Edit, Plus, Tag as TagIcon } from 'lucide-react'
import { TagWithStats, CreateTagData } from '@/types'
import { useTagsWithStats, useCreateTag, useUpdateTag, useDeleteTag } from '@/lib/queries'
import { toast } from 'sonner'
import { LoadingState } from '@/components/shared/LoadingState'

interface TagManagementProps {
  onTagsChange?: () => void
}

export default function TagManagement({ onTagsChange }: TagManagementProps) {
  const { data: tags = [], isLoading: loading } = useTagsWithStats()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagWithStats | null>(null)
  const [formData, setFormData] = useState<CreateTagData>({
    name: '',
    description: ''
  })

  // React Query mutation hooks
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()



  const handleCreateTag = () => {
    if (!formData.name.trim()) {
      toast.error('Tag name is required')
      return
    }

    createTagMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Tag created successfully')
        setIsCreateDialogOpen(false)
        setFormData({ name: '', description: '' })
        onTagsChange?.()
      },
      onError: (error) => {
        console.error('Error creating tag:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create tag')
      }
    })
  }

  const handleEditTag = () => {
    if (!editingTag || !formData.name.trim()) {
      toast.error('Tag name is required')
      return
    }

    updateTagMutation.mutate(
      { id: editingTag.id, data: formData },
      {
        onSuccess: () => {
          toast.success('Tag updated successfully')
          setIsEditDialogOpen(false)
          setEditingTag(null)
          setFormData({ name: '', description: '' })
          onTagsChange?.()
        },
        onError: (error) => {
          console.error('Error updating tag:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to update tag')
        }
      }
    )
  }

  const handleDeleteTag = (tag: TagWithStats) => {
    if (tag.questionCount > 0) {
      toast.error(`Cannot delete tag "${tag.name}". It is assigned to ${tag.questionCount} question(s).`)
      return
    }

    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return
    }

    deleteTagMutation.mutate(tag.id, {
      onSuccess: () => {
        toast.success('Tag deleted successfully')
        onTagsChange?.()
      },
      onError: (error) => {
        console.error('Error deleting tag:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to delete tag')
      }
    })
  }

  const openEditDialog = (tag: TagWithStats) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingTag(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Tag Management
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tag name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter tag description (optional)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={createTagMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag} disabled={createTagMutation.isPending}>
                    {createTagMutation.isPending ? 'Creating...' : 'Create Tag'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState message="Loading tags..." />
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No tags found. Create your first tag to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{tag.name}</Badge>
                    <span className="text-sm text-text-secondary">
                      {tag.questionCount} question{tag.questionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {tag.description && (
                    <p className="text-sm text-text-secondary">{tag.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(tag)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
                    disabled={tag.questionCount > 0 || deleteTagMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter tag description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateTagMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditTag}
                  disabled={updateTagMutation.isPending}
                >
                  {updateTagMutation.isPending ? 'Updating...' : 'Update Tag'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}