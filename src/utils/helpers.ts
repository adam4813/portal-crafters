import type { ElementType, GameState } from '../types';

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
 * Calculate portal level based on mana and elements invested
 */
export function calculatePortalLevel(
  manaInvested: number,
  elements: Partial<Record<ElementType, number>>
): number {
  const elementTotal = Object.values(elements).reduce((sum, val) => sum + (val || 0), 0);
  const baseLevel = Math.floor(Math.sqrt(manaInvested / 10));
  const elementBonus = Math.floor(elementTotal / 5);
  return Math.max(1, baseLevel + elementBonus);
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
