import type { ElementType, GameState } from '../types';
import { getElementDefinition } from '../data/elements';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Format a number with commas for display
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Level thresholds - cumulative "power" needed to reach each level
 * Power = elements + (mana / 10)
 * Level 1: 0 power (starting)
 * Level 2: 5 power
 * Level 3: 10 power (5 more)
 * Level 4: 15 power (5 more)
 * Level 5: 22 power (7 more)
 * Level 6: 29 power (7 more)
 * Level 7: 39 power (10 more)
 * Level 8: 49 power (10 more)
 * Level 9: 64 power (15 more)
 * Level 10: 84 power (20 more)
 */
const LEVEL_THRESHOLDS = [0, 0, 5, 10, 15, 22, 29, 39, 49, 64, 84];

/**
 * Calculate total power from elements with their multipliers
 * 10 mana = 1 base power
 * Elements contribute their amount * powerMultiplier
 */
export function calculateTotalPower(
  manaInvested: number,
  elements: Partial<Record<ElementType, number>>
): number {
  let elementPower = 0;
  for (const [element, amount] of Object.entries(elements)) {
    if (amount && amount > 0) {
      const elementDef = getElementDefinition(element as ElementType);
      const multiplier = elementDef?.properties.powerMultiplier || 1.0;
      elementPower += amount * multiplier;
    }
  }
  // 10 mana = 1 base power
  const manaPower = Math.floor(manaInvested / 10);
  return Math.floor(elementPower + manaPower);
}

/**
 * Calculate portal level based on mana and elements invested
 * 10 mana = 1 element in terms of power
 * Elements use their powerMultiplier for bonus power
 */
export function calculatePortalLevel(
  manaInvested: number,
  elements: Partial<Record<ElementType, number>>
): number {
  const totalPower = calculateTotalPower(manaInvested, elements);
  
  // Find the highest level we've reached
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalPower >= LEVEL_THRESHOLDS[i]) {
      level = i;
    } else {
      break;
    }
  }
  
  // Cap at level 10, but allow exceeding with extra power
  if (level >= 10 && totalPower > LEVEL_THRESHOLDS[10]) {
    // Each additional 25 power beyond level 10 = 1 more level
    level = 10 + Math.floor((totalPower - LEVEL_THRESHOLDS[10]) / 25);
  }
  
  return level;
}

/**
 * Get the power threshold for a given level
 */
export function getLevelThreshold(level: number): number {
  if (level <= 0) return 0;
  if (level < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level];
  }
  // Beyond level 10: each level needs 25 more power
  return LEVEL_THRESHOLDS[10] + (level - 10) * 25;
}

/**
 * Get progress info toward the next level
 */
export function getLevelProgress(manaInvested: number, elements: Partial<Record<ElementType, number>>): {
  currentLevel: number;
  currentPower: number;
  powerForCurrentLevel: number;
  powerForNextLevel: number;
  progressPercent: number;
} {
  const currentPower = calculateTotalPower(manaInvested, elements);
  const currentLevel = calculatePortalLevel(manaInvested, elements);
  
  const powerForCurrentLevel = getLevelThreshold(currentLevel);
  const powerForNextLevel = getLevelThreshold(currentLevel + 1);
  
  const powerIntoCurrentLevel = currentPower - powerForCurrentLevel;
  const powerNeededForNext = powerForNextLevel - powerForCurrentLevel;
  const progressPercent = powerNeededForNext > 0 
    ? (powerIntoCurrentLevel / powerNeededForNext) * 100 
    : 0;
  
  return {
    currentLevel,
    currentPower,
    powerForCurrentLevel,
    powerForNextLevel,
    progressPercent,
  };
}

/**
 * Calculate color based on element composition
 */
export function calculatePortalColor(elements: Partial<Record<ElementType, number>>): number {
  const colors: Partial<Record<ElementType, number>> = {
    fire: 0xf56565,
    water: 0x4299e1,
    earth: 0x68d391,
    air: 0xe2e8f0,
    ice: 0x81e6d9,
    lightning: 0xfaf089,
    metal: 0x718096,
    nature: 0x48bb78,
    shadow: 0x2d3748,
    light: 0xffffff,
    void: 0x553c9a,
    crystal: 0xb794f4,
    arcane: 0x9f7aea,
    time: 0xd69e2e,
    chaos: 0xe53e3e,
    life: 0x38a169,
    death: 0x1a202c,
  };

  let r = 0,
    g = 0,
    b = 0;
  let total = 0;

  for (const [element, amount] of Object.entries(elements)) {
    if (amount && amount > 0) {
      const color = colors[element as ElementType] ?? 0x6b46c1;
      const weight = amount;
      r += ((color >> 16) & 0xff) * weight;
      g += ((color >> 8) & 0xff) * weight;
      b += (color & 0xff) * weight;
      total += weight;
    }
  }

  if (total === 0) {
    return 0x6b46c1; // Default purple
  }

  r = Math.floor(r / total);
  g = Math.floor(g / total);
  b = Math.floor(b / total);

  return (r << 16) | (g << 8) | b;
}

/**
 * Calculate reward chance based on portal level and upgrades
 */
export function calculateRewardChance(portalLevel: number, rewardChanceUpgrade: number): number {
  const baseChance = 0.1; // 10% base chance
  const levelBonus = portalLevel * 0.02; // 2% per level
  const upgradeBonus = rewardChanceUpgrade * 0.05; // 5% per upgrade level
  return clamp(baseChance + levelBonus + upgradeBonus, 0, 0.8); // Max 80%
}

/**
 * Create initial game state
 */
export function createInitialGameState(): GameState {
  return {
    inventory: {
      gold: 100,
      mana: 0,
      ingredients: {
        fire_crystal: 3,
        water_essence: 3,
      },
      equipment: {},
      elements: {
        fire: 10,
        water: 10,
      },
    },
    discoveredRecipes: [],
    unlockedElements: ['fire', 'water'],
    upgrades: {},
    customerQueue: [],
    currentPortal: null,
    storedPortals: [],
    craftingSlots: [],
    totalPortalsCreated: 0,
    totalCustomersServed: 0,
    totalGoldEarned: 0,
    playTime: 0,
    lastSaveTime: Date.now(),
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Show a toast notification
 */
export function showToast(
  message: string,
  type: 'success' | 'warning' | 'error' = 'success'
): void {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
