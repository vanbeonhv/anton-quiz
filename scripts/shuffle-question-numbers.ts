import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function shuffleQuestionNumbers() {
  try {
    console.log('🔄 Bắt đầu trộn lại số thứ tự câu hỏi...')

    // Lấy tất cả câu hỏi và sắp xếp theo number hiện tại
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        number: true,
        text: true
      },
      orderBy: {
        number: 'asc'
      }
    })

    if (questions.length === 0) {
      console.log('❌ Không có câu hỏi nào trong database')
      return
    }

    console.log(`📊 Tìm thấy ${questions.length} câu hỏi`)

    // Tìm số number lớn nhất
    const maxNumber = Math.max(...questions.map(q => q.number))
    console.log(`🔢 Số number lớn nhất hiện tại: ${maxNumber}`)

    // Tạo mảng số từ 1 đến maxNumber
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1)
    
    // Trộn ngẫu nhiên mảng số
    const shuffledNumbers = shuffleArray(numbers)
    console.log('🎲 Đã trộn ngẫu nhiên các số thứ tự')

    // Cập nhật từng câu hỏi với số mới
    console.log('💾 Đang cập nhật database...')
    
    const updates = questions.map((question, index) => {
      const newNumber = shuffledNumbers[index]
      return prisma.question.update({
        where: { id: question.id },
        data: { number: newNumber }
      })
    })

    // Thực hiện tất cả updates trong một transaction
    await prisma.$transaction(updates)

    console.log('✅ Hoàn thành! Đã trộn lại số thứ tự cho tất cả câu hỏi')
    console.log(`📈 Số number lớn nhất vẫn là: ${maxNumber}`)

    // Hiển thị một vài ví dụ thay đổi
    const updatedQuestions = await prisma.question.findMany({
      select: {
        id: true,
        number: true,
        text: true
      },
      orderBy: {
        number: 'asc'
      },
      take: 5
    })

    console.log('\n📋 Một vài câu hỏi sau khi trộn:')
    updatedQuestions.forEach(q => {
      console.log(`  ${q.number}: ${q.text.substring(0, 50)}...`)
    })

  } catch (error) {
    console.error('❌ Lỗi khi trộn số thứ tự câu hỏi:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Chạy script
shuffleQuestionNumbers()