/**
 * Script to check user data and XP calculation
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserData() {
  console.log('🔍 Checking user data...')
  
  try {
    // Get all users with their stats
    const users = await prisma.userStats.findMany({
      select: {
        userEmail: true,
        totalXp: true,
        currentLevel: true,
        currentTitle: true,
        totalQuestionsAnswered: true,
        totalCorrectAnswers: true,
        easyCorrectAnswers: true,
        mediumCorrectAnswers: true,
        hardCorrectAnswers: true
      }
    })
    
    console.log(`📊 Found ${users.length} users:\n`)
    
    users.forEach(user => {
      console.log(`👤 ${user.userEmail}:`)
      console.log(`   Total XP: ${user.totalXp}`)
      console.log(`   Level: ${user.currentLevel} (${user.currentTitle})`)
      console.log(`   Questions answered: ${user.totalQuestionsAnswered}`)
      console.log(`   Correct answers: ${user.totalCorrectAnswers}`)
      console.log(`   Easy correct: ${user.easyCorrectAnswers}`)
      console.log(`   Medium correct: ${user.mediumCorrectAnswers}`)
      console.log(`   Hard correct: ${user.hardCorrectAnswers}`)
      console.log('')
    })
    
    // Check if there are any question attempts
    const totalAttempts = await prisma.questionAttempt.count()
    console.log(`📝 Total question attempts in database: ${totalAttempts}`)
    
    if (totalAttempts > 0) {
      // Show some sample attempts
      const sampleAttempts = await prisma.questionAttempt.findMany({
        take: 5,
        select: {
          userEmail: true,
          isCorrect: true,
          answeredAt: true,
          question: {
            select: {
              difficulty: true
            }
          }
        },
        orderBy: {
          answeredAt: 'desc'
        }
      })
      
      console.log('\n📝 Recent question attempts:')
      sampleAttempts.forEach(attempt => {
        console.log(`   ${attempt.userEmail}: ${attempt.isCorrect ? '✅' : '❌'} ${attempt.question.difficulty} (${attempt.answeredAt.toISOString()})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserData()