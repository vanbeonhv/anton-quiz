/**
 * Script to recalculate user levels based on their current totalXp
 * Run this after changing the LEVEL_DATA configuration
 */

import { PrismaClient } from '@prisma/client';
import { LevelCalculatorService } from '../lib/utils/levels';

const prisma = new PrismaClient();

async function recalculateUserLevels() {
  console.log('🔄 Starting user level recalculation...\n');

  try {
    // Get all user stats
    const allUserStats = await prisma.userStats.findMany();

    console.log(`📊 Found ${allUserStats.length} users to process\n`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const userStats of allUserStats) {
      const currentLevel = userStats.currentLevel;
      const currentTitle = userStats.currentTitle;
      const totalXp = userStats.totalXp;

      // Calculate new level based on current XP
      const newLevelInfo = LevelCalculatorService.calculateLevel(totalXp);

      if (currentLevel !== newLevelInfo.level || currentTitle !== newLevelInfo.title) {
        // Update user level and title
        await prisma.userStats.update({
          where: { userId: userStats.userId },
          data: {
            currentLevel: newLevelInfo.level,
            currentTitle: newLevelInfo.title
          }
        });

        console.log(
          `✅ Updated ${userStats.userEmail}: Level ${currentLevel} (${currentTitle}) → ${newLevelInfo.level} (${newLevelInfo.title}) [${totalXp} XP]`
        );
        updatedCount++;
      } else {
        console.log(
          `➡️  ${userStats.userEmail}: Level ${currentLevel} (${currentTitle}) unchanged [${totalXp} XP]`
        );
        unchangedCount++;
      }
    }

    console.log('\n📈 Recalculation complete!');
    console.log(`   Updated: ${updatedCount} users`);
    console.log(`   Unchanged: ${unchangedCount} users`);
    console.log(`   Total: ${allUserStats.length} users`);
  } catch (error) {
    console.error('❌ Error recalculating user levels:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
recalculateUserLevels()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
