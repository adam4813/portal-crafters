import type { ElementType, ProgressionTier, ProgressionState } from '../types';

/**
 * Define the 5 progression tiers
 * Each tier has unlock requirements and a special mini-boss contract
 */
const PROGRESSION_TIERS: ProgressionTier[] = [
  {
    id: 'tier_1',
    name: 'Novice Crafter',
    tier: 1,
    unlockRequirements: {
      contractsCompleted: 0, // Starting tier
    },
    miniBossContract: {
      name: 'The First Trial',
      description: 'Create a balanced portal using both Fire and Water elements to prove your basic crafting skills.',
      minLevel: 3,
      requiredElements: ['fire', 'water'],
      minElementAmount: 5,
      payment: 150,
    },
  },
  {
    id: 'tier_2',
    name: 'Apprentice Portal Maker',
    tier: 2,
    unlockRequirements: {
      requiredElement: 'earth',
      contractsCompleted: 10,
    },
    miniBossContract: {
      name: 'Elemental Harmony',
      description: 'Craft a portal infused with the essence of earth and sky. Combine Earth and Air elements to create a stable dimensional gateway.',
      minLevel: 5,
      requiredElements: ['earth', 'air'],
      minElementAmount: 8,
      minMana: 50,
      payment: 350,
    },
  },
  {
    id: 'tier_3',
    name: 'Journeyman Artificer',
    tier: 3,
    unlockRequirements: {
      requiredElement: 'ice',
      contractsCompleted: 15,
    },
    miniBossContract: {
      name: 'The Frozen Storm',
      description: 'Channel the raw power of nature. Create a portal combining Ice, Lightning, and Nature elements to withstand extreme conditions.',
      minLevel: 8,
      requiredElements: ['ice', 'lightning', 'nature'],
      minElementAmount: 10,
      minMana: 100,
      payment: 800,
    },
  },
  {
    id: 'tier_4',
    name: 'Master Dimensionalist',
    tier: 4,
    unlockRequirements: {
      requiredElement: 'shadow',
      contractsCompleted: 20,
    },
    miniBossContract: {
      name: 'Balance of Extremes',
      description: 'Master the duality of existence. Forge a portal using Shadow and Light elements in perfect equilibrium, stabilized by Void energy.',
      minLevel: 12,
      requiredElements: ['shadow', 'light', 'void'],
      minElementAmount: 15,
      minMana: 200,
      payment: 1600,
    },
  },
  {
    id: 'tier_5',
    name: 'Grandmaster of the Veil',
    tier: 5,
    unlockRequirements: {
      requiredElement: 'time',
      contractsCompleted: 25,
    },
    miniBossContract: {
      name: 'The Eternal Gateway',
      description: 'Transcend mortal limitations. Create the ultimate portal infused with Time, Chaos, Life, and Death - the four pillars of cosmic reality.',
      minLevel: 15,
      requiredElements: ['time', 'chaos', 'life', 'death'],
      minElementAmount: 20,
      minMana: 300,
      payment: 3000,
    },
  },
];

export class ProgressionSystem {
  private state: ProgressionState;

  constructor() {
    this.state = {
      currentTier: 1,
      contractsCompletedThisTier: 0,
      tiersUnlocked: [1],
      miniBossCompleted: [],
    };
  }

  /**
   * Initialize with saved state
   */
  public initialize(savedState?: ProgressionState): void {
    if (savedState) {
      this.state = { ...savedState };
    }
  }

  /**
   * Get the current tier definition
   */
  public getCurrentTier(): ProgressionTier {
    return PROGRESSION_TIERS[this.state.currentTier - 1];
  }

  /**
   * Get the next tier definition, if available
   */
  public getNextTier(): ProgressionTier | null {
    if (this.state.currentTier >= PROGRESSION_TIERS.length) {
      return null;
    }
    return PROGRESSION_TIERS[this.state.currentTier];
  }

  /**
   * Get all tier definitions
   */
  public getAllTiers(): ProgressionTier[] {
    return [...PROGRESSION_TIERS];
  }

  /**
   * Check if the player can advance to the next tier
   */
  public canAdvanceToNextTier(unlockedElements: ElementType[]): boolean {
    const nextTier = this.getNextTier();
    if (!nextTier) return false;

    // Check if mini-boss for current tier is completed
    if (!this.state.miniBossCompleted.includes(this.state.currentTier)) {
      return false;
    }

    // Check contracts completed requirement
    if (this.state.contractsCompletedThisTier < nextTier.unlockRequirements.contractsCompleted) {
      return false;
    }

    // Check element requirement
    if (nextTier.unlockRequirements.requiredElement) {
      if (!unlockedElements.includes(nextTier.unlockRequirements.requiredElement)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Advance to the next tier
   */
  public advanceToNextTier(): boolean {
    const nextTier = this.getNextTier();
    if (!nextTier) return false;

    this.state.currentTier = nextTier.tier;
    this.state.contractsCompletedThisTier = 0;
    this.state.tiersUnlocked.push(nextTier.tier);
    return true;
  }

  /**
   * Mark a regular contract as completed
   */
  public completeContract(): void {
    this.state.contractsCompletedThisTier++;
  }

  /**
   * Mark the mini-boss contract for a tier as completed
   */
  public completeMiniBoss(tier: number): void {
    if (!this.state.miniBossCompleted.includes(tier)) {
      this.state.miniBossCompleted.push(tier);
    }
  }

  /**
   * Check if a tier's mini-boss is completed
   */
  public isMiniBossCompleted(tier: number): boolean {
    return this.state.miniBossCompleted.includes(tier);
  }

  /**
   * Get the current progression state
   */
  public getState(): ProgressionState {
    return { ...this.state };
  }

  /**
   * Get contracts completed in current tier
   */
  public getContractsCompletedThisTier(): number {
    return this.state.contractsCompletedThisTier;
  }

  /**
   * Get the unlock status for the next tier
   */
  public getNextTierUnlockStatus(unlockedElements: ElementType[]): {
    canUnlock: boolean;
    miniBossCompleted: boolean;
    contractsCompleted: boolean;
    elementUnlocked: boolean;
    contractsNeeded: number;
    elementNeeded: ElementType | null;
  } {
    const nextTier = this.getNextTier();
    if (!nextTier) {
      return {
        canUnlock: false,
        miniBossCompleted: true,
        contractsCompleted: true,
        elementUnlocked: true,
        contractsNeeded: 0,
        elementNeeded: null,
      };
    }

    const miniBossCompleted = this.state.miniBossCompleted.includes(this.state.currentTier);
    const contractsNeeded = nextTier.unlockRequirements.contractsCompleted;
    const contractsCompleted = this.state.contractsCompletedThisTier >= contractsNeeded;
    const elementNeeded = nextTier.unlockRequirements.requiredElement || null;
    const elementUnlocked = elementNeeded ? unlockedElements.includes(elementNeeded) : true;

    return {
      canUnlock: miniBossCompleted && contractsCompleted && elementUnlocked,
      miniBossCompleted,
      contractsCompleted,
      elementUnlocked,
      contractsNeeded,
      elementNeeded,
    };
  }
}
