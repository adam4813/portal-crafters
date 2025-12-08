import type {
  Customer,
  CustomerTemplate,
  ContractRequirements,
  ElementType,
  EquipmentSlot,
} from '../types';
import {
  CUSTOMER_TEMPLATES,
  generateCustomerName,
  generateCustomerIcon,
  generatePayment,
  selectElementRequirements,
  generateContractModifiers,
  generateSpecialReward,
  determineRewardTier,
} from '../data/customers';
import { generateId } from '../utils/helpers';

export class CustomerSystem {
  private queue: Customer[] = [];
  private maxQueueSize: number = 5;
  private customerSpawnInterval: number = 30000; // 30 seconds
  private lastSpawnTime: number = 0;
  private unlockedElements: ElementType[] = ['fire', 'water'];
  private difficultyLevel: number = 1;
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;

  constructor() {
    this.lastSpawnTime = Date.now();
  }

  public initialize(unlockedElements: ElementType[]): void {
    this.unlockedElements = unlockedElements;
    // Spawn initial customers
    this.spawnCustomer();
    this.spawnCustomer();
  }

  public setPaused(paused: boolean): void {
    if (paused && !this.isPaused) {
      // Starting pause - record when we paused
      this.pauseStartTime = Date.now();
      this.isPaused = true;
    } else if (!paused && this.isPaused) {
      // Ending pause - adjust all arrival times by pause duration
      const pauseDuration = Date.now() - this.pauseStartTime;
      for (const customer of this.queue) {
        customer.arrivedAt += pauseDuration;
      }
      this.lastSpawnTime += pauseDuration;
      this.isPaused = false;
    }
  }

  public update(_deltaTime: number): void {
    if (this.isPaused) return;

    const now = Date.now();

    // Spawn new customers periodically
    if (
      now - this.lastSpawnTime >= this.customerSpawnInterval &&
      this.queue.length < this.maxQueueSize
    ) {
      this.spawnCustomer();
      this.lastSpawnTime = now;
    }

    // Check for impatient customers
    this.queue = this.queue.filter((customer) => {
      const waitTime = (now - customer.arrivedAt) / 1000;
      return waitTime < customer.patience;
    });
  }

  public spawnCustomer(): Customer | null {
    if (this.queue.length >= this.maxQueueSize) {
      return null;
    }

    // Select template based on difficulty level and tier
    // Allow special customers to appear occasionally (5% chance at higher difficulties)
    const template = this.selectTemplate();

    const requirements = this.generateRequirements(template);
    const modifiers = generateContractModifiers(template, this.difficultyLevel);
    const specialReward = generateSpecialReward(template, this.difficultyLevel);
    const rewardTier = determineRewardTier(template, modifiers);

    // Apply modifier effects to requirements
    this.applyModifierEffects(requirements, modifiers, template);

    const customer: Customer = {
      id: generateId(),
      name: generateCustomerName(template),
      icon: generateCustomerIcon(template),
      requirements,
      payment: generatePayment(template),
      patience: template.basePatience + Math.floor(Math.random() * 30),
      arrivedAt: Date.now(),
      specialReward,
      rewardTier,
      isSpecial: template.isSpecial,
    };

    this.queue.push(customer);
    return customer;
  }

  /**
   * Select a customer template based on difficulty and special customer probability
   */
  private selectTemplate(): CustomerTemplate {
    // Separate regular and special customers
    const regularTemplates = CUSTOMER_TEMPLATES.filter((t) => !t.isSpecial);
    const specialTemplates = CUSTOMER_TEMPLATES.filter((t) => t.isSpecial);

    // 5% base chance for special customers, increases with difficulty
    const specialChance = Math.min(0.05 + this.difficultyLevel * 0.02, 0.2);

    if (specialTemplates.length > 0 && Math.random() < specialChance) {
      // Select a special customer appropriate for current difficulty
      const appropriateSpecials = specialTemplates.filter(
        (t) => (t.tier || 1) <= this.difficultyLevel + 1
      );
      if (appropriateSpecials.length > 0) {
        return appropriateSpecials[Math.floor(Math.random() * appropriateSpecials.length)];
      }
    }

    // Select regular template based on difficulty
    const templateIndex = Math.min(
      Math.floor(Math.random() * this.difficultyLevel),
      regularTemplates.length - 1
    );
    return regularTemplates[templateIndex];
  }

  /**
   * Apply modifier effects to contract requirements
   */
  private applyModifierEffects(
    requirements: ContractRequirements,
    modifiers: import('../types').ContractModifier[],
    template: CustomerTemplate
  ): void {
    for (const modifier of modifiers) {
      switch (modifier) {
        case 'urgent':
          // Reduce patience significantly but increase payment
          // Payment adjustment will be handled in UI display
          break;
        case 'bonus':
          // Increase payment (handled in payment calculation)
          break;
        case 'perfectionist':
          // Increase minimum level and element amount
          requirements.minLevel = Math.floor(requirements.minLevel * 1.3);
          if (requirements.minElementAmount) {
            requirements.minElementAmount = Math.ceil(requirements.minElementAmount * 1.2);
          }
          break;
        case 'bulk_order':
          // Significantly increase element and mana requirements
          if (requirements.minElementAmount) {
            requirements.minElementAmount = Math.ceil(requirements.minElementAmount * 1.5);
          }
          if (requirements.minMana) {
            requirements.minMana = Math.floor(requirements.minMana * 1.5);
          }
          break;
        case 'experimental':
          // Add equipment requirements
          if (!requirements.requiredEquipmentSlots && Math.random() < 0.7) {
            const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
            const slotCount = Math.ceil(1 + template.difficultyMultiplier * 0.5);
            requirements.requiredEquipmentSlots = [];
            for (let i = 0; i < slotCount; i++) {
              requirements.requiredEquipmentSlots.push(
                slots[Math.floor(Math.random() * slots.length)]
              );
            }
          }
          break;
      }
    }
  }

  private generateRequirements(template: CustomerTemplate): ContractRequirements {
    // Randomly determine element requirement type
    const reqTypeRoll = Math.random();
    let requiredElements: ElementType[] | 'any' | 'none' | undefined;
    let minElementAmount: number | undefined;

    if (reqTypeRoll < 0.1) {
      // 10% chance: no elements required (raw mana only)
      requiredElements = 'none';
    } else if (reqTypeRoll < 0.2) {
      // 10% chance: any element(s) required
      requiredElements = 'any';
      minElementAmount = Math.ceil(template.difficultyMultiplier * 2);
    } else if (reqTypeRoll < 0.35) {
      // 15% chance: no restriction (undefined)
      requiredElements = undefined;
    } else {
      // 65% chance: specific elements required
      const elements = selectElementRequirements(
        this.unlockedElements,
        template.difficultyMultiplier
      );
      requiredElements = elements;
      minElementAmount = Math.ceil(template.difficultyMultiplier * 3);
    }

    // Randomly add mana requirement
    let minMana: number | undefined;
    if (Math.random() < 0.4) {
      // 40% chance to have a mana requirement
      minMana = Math.floor(template.difficultyMultiplier * 20 + Math.random() * 30);
    }

    return {
      minLevel: Math.max(1, Math.floor(template.difficultyMultiplier * 2)),
      requiredElements,
      minElementAmount,
      minMana,
    };
  }

  public getCurrentCustomer(): Customer | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  public getQueue(): Customer[] {
    return [...this.queue];
  }

  public completeContract(customerId: string): number {
    const index = this.queue.findIndex((c) => c.id === customerId);
    if (index === -1) return 0;

    const customer = this.queue[index];
    this.queue.splice(index, 1);
    return customer.payment;
  }

  public removeCustomer(customerId: string): void {
    this.queue = this.queue.filter((c) => c.id !== customerId);
  }

  public setUnlockedElements(elements: ElementType[]): void {
    this.unlockedElements = elements;
  }

  public setDifficultyLevel(level: number): void {
    this.difficultyLevel = level;
  }

  public setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
  }

  public setSpawnRate(multiplier: number): void {
    // Adjust customer spawn interval based on multiplier
    this.customerSpawnInterval = 30000 / multiplier;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public loadQueue(customers: Customer[]): void {
    this.queue = [...customers];
  }

  public saveQueue(): Customer[] {
    return [...this.queue];
  }

  /**
   * Add a progression mini-boss contract to the queue
   */
  public addMiniBossContract(
    tierNumber: number,
    name: string,
    requirements: ContractRequirements,
    payment: number
  ): void {
    // Check if mini-boss already exists in queue
    const existingMiniBoss = this.queue.find((c) => c.id.startsWith('miniboss-'));
    if (existingMiniBoss) {
      // Don't add duplicate mini-boss contracts
      return;
    }

    const miniBoss: Customer = {
      id: `miniboss-tier-${tierNumber}`,
      name: `🏆 ${name}`,
      icon: '👑',
      requirements,
      payment,
      patience: Infinity, // Unlimited time
      arrivedAt: Date.now(),
    };

    // Add mini-boss to the front of the queue
    this.queue.unshift(miniBoss);
  }

  /**
   * Remove the current mini-boss contract from queue (if it exists)
   */
  public removeMiniBossContract(): void {
    const miniBossIndex = this.queue.findIndex((c) => c.id.startsWith('miniboss-'));
    if (miniBossIndex !== -1) {
      this.queue.splice(miniBossIndex, 1);
    }
  }
}
