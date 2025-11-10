import { Button } from '@/components/ui/button'

interface PaginationData {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface QuestionPaginationProps {
  pagination: PaginationData
  onPageChange: (page: number) => void
}

export function QuestionPagination({ pagination, onPageChange }: QuestionPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-text-secondary">
        Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
        {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}{' '}
        questions
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
