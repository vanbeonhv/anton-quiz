import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tag } from '@/types'
import { QuestionForm } from '@/components/admin/QuestionForm'
import { QuestionFormData } from '@/lib/utils/question'

interface QuestionFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  formData: QuestionFormData
  setFormData: (data: QuestionFormData) => void
  tags: Tag[]
  onSubmit: () => void
  onCancel: () => void
  onTagToggle: (tagId: string, checked: boolean) => void
  isLoading?: boolean
}

export function QuestionFormDialog({
  isOpen,
  onOpenChange,
  title,
  formData,
  setFormData,
  tags,
  onSubmit,
  onCancel,
  onTagToggle,
  isLoading = false
}: QuestionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          tags={tags}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onTagToggle={onTagToggle}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
