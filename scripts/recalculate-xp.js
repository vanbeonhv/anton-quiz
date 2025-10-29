/**
 * Script to recalculate XP based on question attempts history
 * XP system: Easy = 5 XP, Medium = 10 XP, Hard = 15 XP (only for correct answers)
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// XP values for each difficulty
const XP_VALUES = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
}

// Level data
const LEVEL_DATA = [
  { level: 1, title: "Newbie", cumulativeXpNeeded: 0 },
  { level: 2, title: "Intern", cumulativeXpNeeded: 50 },
  { level: 3, title: "Senior Intern", cumulativeXpNeeded: 150 },
  { level: 4, title: "Fresher", cumulativeXpNeeded: 300 },
  { level: 5, title: "Junior Dev I", cumulativeXpNeeded: 500 },
  { level: 6, title: "Junior Dev II", cumulativeXpNeeded: 750 },
  { level: 7, title: "Junior Dev III", cumulativeXpNeeded: 1050 },
  { level: 8, title: "Junior Dev IV", cumulativeXpNeeded: 1400 },
  { level: 9, title: "Junior Dev V", cumulativeXpNeeded: 1800 },
  { level: 10, title: "Mid-Level Dev I", cumulativeXpNeeded: 2500 },
  { level: 11, title: "Mid-Level Dev II", cumulativeXpNeeded: 3300 },
  { level: 12, title: "Mid-Level Dev III", cumulativeXpNeeded: 4200 },
  { level: 13, title: "Mid-Level Dev IV", cumulativeXpNeeded: 5200 },
  { level: 14, title: "Mid-Level Dev V", cumulativeXpNeeded: 6300 },
  { level: 15, title: "Senior Dev I", cumulativeXpNeeded: 8000 },
  { level: 16, title: "Senior Dev II", cumulativeXpNeeded: 9800 },
  { level: 17, title: "Senior Dev III", cumulativeXpNeeded: 11700 },
  { level: 18, title: "Senior Dev IV", cumulativeXpNeeded: 13700 },
  { level: 19, title: "Senior Dev V", cumulativeXpNeeded: 15800 },
  { level: 20, title: "Architect", cumulativeXpNeeded: 20000 }
]

function calculateLevel(totalXp) {
  const safeXp = Math.max(0, totalXp)

  let currentLevel = 1
  let currentTitle = "Newbie"

  for (const levelConfig of LEVEL_DATA) {
    if (safeXp >= levelConfig.cumulativeXpNeeded) {
      currentLevel = levelConfig.level
      currentTitle = levelConfig.title
    } else {
      break
    }
  }

  return { level: currentLevel, title: currentTitle }
}

async function recalculateXP() {
  console.log('🚀 Recalculating XP based on question attempts...')

  try {
    // Get all users
    const users = await prisma.userStats.findMany({
      select: {
        id: true,
        userId: true,
        userEmail: true,
        totalXp: true,
        currentLevel: true,
        currentTitle: true
      }
    })

    console.log(`📊 Processing ${users.length} users...\n`)

    for (const user of users) {
      console.log(`👤 Processing ${user.userEmail}...`)

      // Get all correct answers for this user
      const correctAttempts = await prisma.questionAttempt.findMany({
        where: {
          userId: user.userId,
          isCorrect: true
        },
        include: {
          question: {
            select: {
              difficulty: true
            }
          }
        }
      })

      // Calculate total XP
      let totalXp = 0
      let easyXp = 0
      let mediumXp = 0
      let hardXp = 0

      correctAttempts.forEach(attempt => {
        const xp = XP_VALUES[attempt.question.difficulty]
        totalXp += xp

        if (attempt.question.difficulty === 'EASY') easyXp += xp
        else if (attempt.question.difficulty === 'MEDIUM') mediumXp += xp
        else if (attempt.question.difficulty === 'HARD') hardXp += xp
      })

      // Calculate new level
      const levelInfo = calculateLevel(totalXp)

      console.log(`   Correct answers: ${correctAttempts.length}`)
      console.log(`   Old XP: ${user.totalXp} → New XP: ${totalXp}`)
      console.log(`   XP breakdown: Easy=${easyXp}, Medium=${mediumXp}, Hard=${hardXp}`)
      console.log(`   Old Level: ${user.currentLevel} (${user.currentTitle})`)
      console.log(`   New Level: ${levelInfo.level} (${levelInfo.title})`)

      // Update user stats
      await prisma.userStats.update({
        where: { id: user.id },
        data: {
          totalXp: totalXp,
          currentLevel: levelInfo.level,
          currentTitle: levelInfo.title
        }
      })

      console.log(`   ✅ Updated!\n`)
    }

    // Show final statistics
    console.log('🎉 Recalculation completed!')

    const updatedUsers = await prisma.userStats.findMany({
      select: {
        userEmail: true,
        totalXp: true,
        currentLevel: true,
        currentTitle: true
      },
      orderBy: {
        totalXp: 'desc'
      }
    })

    console.log('\n📊 Final user rankings:')
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.userEmail}: ${user.totalXp} XP - Level ${user.currentLevel} (${user.currentTitle})`)
    })

    // Show level distribution
    const distribution = await prisma.userStats.groupBy({
      by: ['currentLevel'],
      _count: { userId: true },
      orderBy: { currentLevel: 'asc' }
    })

    console.log('\n📈 Level distribution:')
    for (const { currentLevel, _count } of distribution) {
      const levelConfig = LEVEL_DATA.find(l => l.level === currentLevel)
      console.log(`Level ${currentLevel} (${levelConfig?.title}): ${_count.userId} users`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recalculateXP()