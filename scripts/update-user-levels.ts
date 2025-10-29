/**
 * Script to update existing user stats with calculated level information
 * This should be run after implementing the level system to populate
 * level data for existing users based on their current XP
 */

import { PrismaClient } from '@prisma/client'
import { LevelCalculatorService } from '../lib/utils/levels'

const prisma = new PrismaClient()

async function updateUserLevels() {
    try {
        console.log('Starting user level update...')

        // Get all user stats
        const allUserStats = await prisma.userStats.findMany()

        console.log(`Found ${allUserStats.length} user records to update`)

        let updatedCount = 0

        for (const userStat of allUserStats) {
            // Calculate level based on current XP
            const levelInfo = LevelCalculatorService.calculateLevel(userStat.totalXp)

            // Update the user stats with calculated level information
            await prisma.userStats.update({
                where: { id: userStat.id },
                data: {
                    currentLevel: levelInfo.level,
                    currentTitle: levelInfo.title
                }
            })

            updatedCount++
            console.log(`Updated user ${userStat.userEmail}: Level ${levelInfo.level} - ${levelInfo.title} (${userStat.totalXp} XP)`)
        }

        console.log(`Successfully updated ${updatedCount} user records`)

    } catch (error) {
        console.error('Error updating user levels:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the script
updateUserLevels()