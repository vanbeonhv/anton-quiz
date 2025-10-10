import { Tag, TagWithStats, CreateTagData } from '@/types'
import { handleApiResponse, fetchWithNetworkHandling, createErrorContext } from '@/lib/utils/errorHandling'

// Request/Response Types
export interface UpdateTagData extends Partial<CreateTagData> {}

export interface BulkTagAssignmentData {
  questionIds: string[]
  tagIds: string[]
  action: 'add' | 'remove' | 'replace'
}

export interface BulkOperationResult {
  message: string
  affectedQuestions?: number
}

// Tag API functions
export const tagApi = {
  /**
   * Fetch all tags
   */
  getTags: async (): Promise<Tag[]> => {
    const context = createErrorContext('tagApi', 'getTags')
    const response = await fetchWithNetworkHandling('/api/tags', undefined, context)
    return handleApiResponse<Tag[]>(response, context)
  },

  /**
   * Fetch all tags with statistics (for admin)
   */
  getTagsWithStats: async (): Promise<TagWithStats[]> => {
    const context = createErrorContext('tagApi', 'getTagsWithStats')
    const response = await fetchWithNetworkHandling('/api/tags', undefined, context)
    return handleApiResponse<TagWithStats[]>(response, context)
  },

  /**
   * Create a new tag
   */
  createTag: async (data: CreateTagData): Promise<Tag> => {
    const context = createErrorContext('tagApi', 'createTag', { tagData: data })
    const response = await fetchWithNetworkHandling('/api/admin/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<Tag>(response, context)
  },

  /**
   * Update an existing tag
   */
  updateTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
    const context = createErrorContext('tagApi', 'updateTag', { tagId: id, updateData: data })
    const response = await fetchWithNetworkHandling(`/api/admin/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<Tag>(response, context)
  },

  /**
   * Delete a tag
   */
  deleteTag: async (id: string): Promise<{ message: string }> => {
    const context = createErrorContext('tagApi', 'deleteTag', { tagId: id })
    const response = await fetchWithNetworkHandling(`/api/admin/tags/${id}`, {
      method: 'DELETE'
    }, context)
    return handleApiResponse<{ message: string }>(response, context)
  },

  /**
   * Perform bulk tag assignment operations
   */
  bulkAssignTags: async (data: BulkTagAssignmentData): Promise<BulkOperationResult> => {
    const context = createErrorContext('tagApi', 'bulkAssignTags', { bulkData: data })
    const response = await fetchWithNetworkHandling('/api/admin/tags/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<BulkOperationResult>(response, context)
  }
}