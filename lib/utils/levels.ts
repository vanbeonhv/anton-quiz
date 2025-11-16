/**
 * Level configuration system for the user progression feature
 * Defines level thresholds, titles, and XP requirements
 */

export interface LevelConfig {
  level: number;
  title: string;
  cumulativeXpNeeded: number;
}

/**
 * Complete level configuration data
 * Converted from docs/Level-exp.json for better type safety and performance
 */
export const LEVEL_DATA: readonly LevelConfig[] = [
  {
    level: 1,
    title: "Newbie",
    cumulativeXpNeeded: 0
  },
  {
    level: 2,
    title: "Intern",
    cumulativeXpNeeded: 20
  },
  {
    level: 3,
    title: "Senior Intern",
    cumulativeXpNeeded: 150
  },
  {
    level: 4,
    title: "Fresher",
    cumulativeXpNeeded: 300
  },
  {
    level: 5,
    title: "Junior Dev I",
    cumulativeXpNeeded: 500
  },
  {
    level: 6,
    title: "Junior Dev II",
    cumulativeXpNeeded: 750
  },
  {
    level: 7,
    title: "Junior Dev III",
    cumulativeXpNeeded: 1050
  },
  {
    level: 8,
    title: "Junior Dev IV",
    cumulativeXpNeeded: 1400
  },
  {
    level: 9,
    title: "Junior Dev V",
    cumulativeXpNeeded: 1800
  },
  {
    level: 10,
    title: "Mid-Level Dev I",
    cumulativeXpNeeded: 2500
  },
  {
    level: 11,
    title: "Mid-Level Dev II",
    cumulativeXpNeeded: 3300
  },
  {
    level: 12,
    title: "Mid-Level Dev III",
    cumulativeXpNeeded: 4200
  },
  {
    level: 13,
    title: "Mid-Level Dev IV",
    cumulativeXpNeeded: 5200
  },
  {
    level: 14,
    title: "Mid-Level Dev V",
    cumulativeXpNeeded: 6300
  },
  {
    level: 15,
    title: "Senior Dev I",
    cumulativeXpNeeded: 8000
  },
  {
    level: 16,
    title: "Senior Dev II",
    cumulativeXpNeeded: 9800
  },
  {
    level: 17,
    title: "Senior Dev III",
    cumulativeXpNeeded: 11700
  },
  {
    level: 18,
    title: "Senior Dev IV",
    cumulativeXpNeeded: 13700
  },
  {
    level: 19,
    title: "Senior Dev V",
    cumulativeXpNeeded: 15800
  },
  {
    level: 20,
    title: "Solution Architect",
    cumulativeXpNeeded: 20000
  }
] as const;

/**
 * Constants for level system configuration
 */
export const LEVEL_CONSTANTS = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 20,
  DEFAULT_LEVEL: 1,
  DEFAULT_TITLE: "Newbie"
} as const;
/**
 * 
Information about a user's level
 */
export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
}

/**
 * Level Calculator Service
 * Provides utilities for calculating user levels, XP requirements, and level progression
 */
export class LevelCalculatorService {
  /**
   * Calculate the current level based on total XP
   * @param totalXp - The user's total accumulated XP
   * @returns LevelInfo object with level, title, and XP required for that level
   */
  static calculateLevel(totalXp: number): LevelInfo {
    // Ensure totalXp is non-negative
    const safeXp = Math.max(0, totalXp);
    
    // Find the highest level the user has reached
    let currentLevel: number = LEVEL_CONSTANTS.DEFAULT_LEVEL;
    let currentTitle: string = LEVEL_CONSTANTS.DEFAULT_TITLE;
    let xpRequired = 0;
    
    for (const levelConfig of LEVEL_DATA) {
      if (safeXp >= levelConfig.cumulativeXpNeeded) {
        currentLevel = levelConfig.level;
        currentTitle = levelConfig.title;
        xpRequired = levelConfig.cumulativeXpNeeded;
      } else {
        break;
      }
    }
    
    return {
      level: currentLevel,
      title: currentTitle,
      xpRequired
    };
  }
  
  /**
   * Calculate XP needed to reach the next level
   * @param currentLevel - The user's current level
   * @param totalXp - The user's total accumulated XP
   * @returns Number of XP needed for next level, or 0 if at max level
   */
  static calculateXpToNextLevel(currentLevel: number, totalXp: number): number {
    // If at max level, no more XP needed
    if (currentLevel >= LEVEL_CONSTANTS.MAX_LEVEL) {
      return 0;
    }
    
    // Find the next level's XP requirement
    const nextLevelConfig = LEVEL_DATA.find(config => config.level === currentLevel + 1);
    
    if (!nextLevelConfig) {
      return 0;
    }
    
    const xpNeeded = nextLevelConfig.cumulativeXpNeeded - totalXp;
    return Math.max(0, xpNeeded);
  }
  
  /**
   * Check if a user has leveled up based on XP change
   * @param previousXp - The user's XP before the change
   * @param newXp - The user's XP after the change
   * @returns true if the user leveled up, false otherwise
   */
  static checkLevelUp(previousXp: number, newXp: number): boolean {
    const previousLevel = this.calculateLevel(previousXp).level;
    const newLevel = this.calculateLevel(newXp).level;
    
    return newLevel > previousLevel;
  }
  
  /**
   * Get level configuration by level number
   * @param level - The level number to look up
   * @returns LevelConfig object or null if not found
   */
  static getLevelConfig(level: number): LevelConfig | null {
    return LEVEL_DATA.find(config => config.level === level) || null;
  }
  
  /**
   * Get all available levels
   * @returns Array of all level configurations
   */
  static getAllLevels(): readonly LevelConfig[] {
    return LEVEL_DATA;
  }
  
  /**
   * Calculate progress percentage to next level
   * @param currentLevel - The user's current level
   * @param totalXp - The user's total accumulated XP
   * @returns Progress percentage (0-100) to next level
   */
  static calculateProgressToNextLevel(currentLevel: number, totalXp: number): number {
    if (currentLevel >= LEVEL_CONSTANTS.MAX_LEVEL) {
      return 100;
    }
    
    const currentLevelConfig = this.getLevelConfig(currentLevel);
    const nextLevelConfig = this.getLevelConfig(currentLevel + 1);
    
    if (!currentLevelConfig || !nextLevelConfig) {
      return 0;
    }
    
    const currentLevelXp = currentLevelConfig.cumulativeXpNeeded;
    const nextLevelXp = nextLevelConfig.cumulativeXpNeeded;
    const xpInCurrentLevel = totalXp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    
    if (xpNeededForNextLevel === 0) {
      return 100;
    }
    
    const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}