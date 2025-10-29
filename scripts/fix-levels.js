/**
 * Quick migration script to fix user levels based on existing XP
 * Run with: node scripts/fix-levels.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Level data copied from the levels.ts file
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

async function fixUserLevels() {
  console.log('🚀 Fixing user levels based on existing XP...')
  
  try {
    // Get all users
    const users = await prisma.userStats.findMany()
    console.log(`📊 Found ${users.length} users`)
    
    let updated = 0
    
    for (const user of users) {
      const correctLevel = calculateLevel(user.totalXp)
      
      if (user.currentLevel !== correctLevel.level || user.currentTitle !== correctLevel.title) {
        console.log(`📈 ${user.userEmail}: ${user.totalXp} XP → Level ${correctLevel.level} (${correctLevel.title})`)
        
        await prisma.userStats.update({
          where: { id: user.id },
          data: {
            currentLevel: correctLevel.level,
            currentTitle: correctLevel.title
          }
        })
        
        updated++
      }
    }
    
    console.log(`✅ Updated ${updated} users`)
    
    // Show final distribution
    const distribution = await prisma.userStats.groupBy({
      by: ['currentLevel'],
      _count: { userId: true },
      orderBy: { currentLevel: 'asc' }
    })
    
    console.log('\n📊 Level distribution:')
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

fixUserLevels()