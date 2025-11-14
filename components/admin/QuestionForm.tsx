import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { Tag, Difficulty, OptionKey } from '@/types'
import { QuestionFormData } from '@/lib/utils/question'


interface QuestionFormProps {
  formData: QuestionFormData
  setFormData: (data: QuestionFormData) => void
  tags: Tag[]
  onSubmit: () => void
  onCancel: () => void
  onTagToggle: (tagId: string, checked: boolean) => void
  isLoading?: boolean
}

export function QuestionForm({
  formData,
  setFormData,
  tags,
  onSubmit,
  onCancel,
  onTagToggle,
  isLoading = false
}: QuestionFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Question Text *</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, text: e.target.value })
          }
          placeholder="Enter the question text"
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['A', 'B', 'C', 'D'] as const).map((option) => {
          const fieldName = `option${option}` as keyof typeof formData
          return (
            <div key={option}>
              <Label htmlFor={fieldName}>Option {option} *</Label>
              <Textarea
                id={fieldName}
                value={formData[fieldName] as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, [fieldName]: e.target.value })
                }
                placeholder={`Option ${option}`}
                rows={1}
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.currentTarget
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Correct Answer *</Label>
          <RadioGroup
            value={formData.correctAnswer}
            onValueChange={(value) =>
              setFormData({ ...formData, correctAnswer: value as OptionKey })
            }
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="correct-a" />
              <Label htmlFor="correct-a">A</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="correct-b" />
              <Label htmlFor="correct-b">B</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="C" id="correct-c" />
              <Label htmlFor="correct-c">C</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="D" id="correct-d" />
              <Label htmlFor="correct-d">D</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) =>
              setFormData({ ...formData, difficulty: value as Difficulty })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <MarkdownEditor
          id="explanation"
          label="Explanation"
          value={formData.explanation}
          onChange={(value) =>
            setFormData({ ...formData, explanation: value })
          }
          placeholder="Explain why this is the correct answer (optional)"
          minHeight="150px"
        />
        <p className="text-sm text-muted-foreground">
          Supports markdown: <strong>**bold**</strong>, <em>*italic*</em>, <code>`code`</code>, lists (- or 1.), and line breaks
        </p>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={formData.tagIds.includes(tag.id)}
                onCheckedChange={(checked) => onTagToggle(tag.id, checked as boolean)}
              />
              <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                {tag.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  )
}
