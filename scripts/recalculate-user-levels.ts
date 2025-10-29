#!/usr/bin/env tsx

/**
 * Migration script to recalculate user levels based on existing XP
 * This script updates all users' currentLevel and currentTitle based on their totalXp
 */

import { PrismaClient } from '@prisma/client'
import { LevelCalculatorService } from '../lib/utils/levels'

const prisma = new PrismaClient()

async function recalculateUserLevels() {
  console.log('🚀 Starting user level recalculation...')
  
  try {
    // Get all users with their current stats
    const userStats = await prisma.userStats.findMany({
      select: {
        id: true,
        userId: true,
        userEmail: true,
        totalXp: true,
        currentLevel: true,
        currentTitle: true
      }
    })
    
    console.log(`📊 Found ${userStats.length} users to process`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    // Process each user
    for (const user of userStats) {
      // Calculate correct level based on totalXp
      const levelInfo = LevelCalculatorService.calculateLevel(user.totalXp)
      
      // Check if level needs updating
      if (user.currentLevel !== levelInfo.level || user.currentTitle !== levelInfo.title) {
        console.log(`📈 Updating user ${user.userEmail}:`)
        console.log(`   XP: ${user.totalXp}`)
        console.log(`   Old: Level ${user.currentLevel} - ${user.currentTitle}`)
        console.log(`   New: Level ${levelInfo.level} - ${levelInfo.title}`)
        
        // Update the user's level and title
        await prisma.userStats.update({
          where: { id: user.id },
          data: {
            currentLevel: levelInfo.level,
            currentTitle: levelInfo.title
          }
        })
        
        updatedCount++
      } else {
        console.log(`✅ User ${user.userEmail} already has correct level (${user.currentLevel})`)
        skippedCount++
      }
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Total users processed: ${userStats.length}`)
    console.log(`   - Users updated: ${updatedCount}`)
    console.log(`   - Users skipped (already correct): ${skippedCount}`)
    
    // Show level distribution after migration
    const levelDistribution = await prisma.userStats.groupBy({
      by: ['currentLevel', 'currentTitle'],
      _count: {
        userId: true
      },
      orderBy: {
        currentLevel: 'asc'
      }
    })
    
    console.log('\n📈 Level distribution after migration:')
    levelDistribution.forEach(({ currentLevel, currentTitle, _count }) => {
      console.log(`   Level ${currentLevel} (${currentTitle}): ${_count.userId} users`)
    })
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  recalculateUserLevels()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { recalculateUserLevels }