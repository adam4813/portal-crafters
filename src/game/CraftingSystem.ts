import type {
  Recipe,
  CraftingSlot,
  CraftingSlotState,
  Ingredient,
  ElementType,
  AnyEquipment,
  GeneratedEquipment,
} from '../types';
import { isGeneratedEquipment } from '../types';
import { getIngredientById } from '../data/ingredients';
import { getEquipmentById } from '../data/equipment';
import { calculatePortalEffects } from './PortalEffectSystem';

/**
 * Scaling factor for converting generated equipment total cost to bonus level.
 * A divisor of 3 means every 3 points of total cost = 1 bonus level.
 * This matches the same scaling used in Portal.ts for consistency.
 */
const GENERATED_EQUIPMENT_COST_TO_BONUS_DIVISOR = 3;

export class CraftingSystem {
  private slots: CraftingSlot[] = [];
  private maxSlots: number = 4;
  private discoveredRecipes: Map<string, Recipe> = new Map();
  private onCraftCallbacks: ((
    elements: Partial<Record<ElementType, number>>,
    bonus: number,
    equipmentAttributes: GeneratedEquipment[]
  ) => void)[] = [];

  constructor() {
    this.initializeSlots();
  }

  private initializeSlots(): void {
    this.slots = [];
    for (let i = 0; i < this.maxSlots; i++) {
      this.slots.push({
        index: i,
        ingredient: null,
        equipment: null,
      });
    }
  }

  public initialize(discoveredRecipeIds: string[]): void {
    this.initializeSlots();
    // Load discovered recipes
    for (const recipeId of discoveredRecipeIds) {
      // Recipes are generated dynamically, so we just track the IDs
      const recipe = this.parseRecipeId(recipeId);
      if (recipe) {
        this.discoveredRecipes.set(recipeId, recipe);
      }
    }
  }

  public onCraft(
    callback: (
      elements: Partial<Record<ElementType, number>>,
      bonus: number,
      equipmentAttributes: GeneratedEquipment[]
    ) => void
  ): void {
    this.onCraftCallbacks.push(callback);
  }

  public getSlots(): CraftingSlot[] {
    return [...this.slots];
  }

  public getSlot(index: number): CraftingSlot | null {
    return this.slots[index] || null;
  }

  public addIngredientToSlot(index: number, ingredientId: string): boolean {
    if (index < 0 || index >= this.maxSlots) return false;

    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return false;

    this.slots[index] = {
      index,
      ingredient,
      equipment: null,
    };
    return true;
  }

  public addEquipmentToSlot(index: number, equipmentId: string): boolean {
    if (index < 0 || index >= this.maxSlots) return false;

    const equipment = getEquipmentById(equipmentId);
    if (!equipment) return false;

    this.slots[index] = {
      index,
      ingredient: null,
      equipment,
    };
    return true;
  }

  /**
   * Add a generated equipment item directly to a crafting slot.
   * This preserves all the item's attributes for portal crafting.
   */
  public addGeneratedEquipmentToSlot(index: number, equipment: GeneratedEquipment): boolean {
    if (index < 0 || index >= this.maxSlots) return false;

    this.slots[index] = {
      index,
      ingredient: null,
      equipment,
    };
    return true;
  }

  public clearSlot(index: number): void {
    if (index >= 0 && index < this.maxSlots) {
      this.slots[index] = {
        index,
        ingredient: null,
        equipment: null,
      };
    }
  }

  public clearAllSlots(): void {
    this.initializeSlots();
  }

  /**
   * Craft a portal using the current slot contents.
   * Returns element bonuses, level bonus, and generated equipment attributes
   * that can be used by the portal system to calculate effects.
   */
  public craft(): {
    elements: Partial<Record<ElementType, number>>;
    bonusLevel: number;
    isNewRecipe: boolean;
    generatedEquipmentUsed: GeneratedEquipment[];
    ingredientIds: string[];
    equipmentIds: string[];
  } | null {
    const filledSlots = this.slots.filter((s) => s.ingredient || s.equipment);
    if (filledSlots.length === 0) return null;

    const elements: Partial<Record<ElementType, number>> = {};
    let bonusLevel = 0;
    const generatedEquipmentUsed: GeneratedEquipment[] = [];

    // Process ingredients
    const ingredientIds: string[] = [];
    const equipmentIds: string[] = [];
    for (const slot of filledSlots) {
      if (slot.ingredient) {
        ingredientIds.push(slot.ingredient.id);
        if (slot.ingredient.elementAffinity) {
          elements[slot.ingredient.elementAffinity] =
            (elements[slot.ingredient.elementAffinity] || 0) + 5;
        }
        bonusLevel += Math.floor(slot.ingredient.baseValue / 10);
      }

      if (slot.equipment) {
        equipmentIds.push(slot.equipment.id);
        bonusLevel += slot.equipment.portalBonus;
        if (slot.equipment.elementBonus) {
          for (const [element, amount] of Object.entries(slot.equipment.elementBonus)) {
            elements[element as ElementType] = (elements[element as ElementType] || 0) + amount;
          }
        }

        // Track generated equipment for portal attribute effects
        if (isGeneratedEquipment(slot.equipment)) {
          generatedEquipmentUsed.push(slot.equipment);
          // Generated equipment attributes contribute additional bonus
          bonusLevel += Math.floor(
            slot.equipment.totalCost / GENERATED_EQUIPMENT_COST_TO_BONUS_DIVISOR
          );
        }
      }
    }

    // Check for recipe discovery
    const recipeId = this.generateRecipeId(ingredientIds);
    let isNewRecipe = !this.discoveredRecipes.has(recipeId);

    // Apply recipe discovery bonus from attributes
    if (!isNewRecipe && generatedEquipmentUsed.length > 0) {
      const effects = calculatePortalEffects(generatedEquipmentUsed);
      if (effects.recipeDiscoveryBonus > 0) {
        // Give a chance to rediscover as a "variant" recipe if attributes provide discovery bonus
        // This encourages experimentation with different equipment
        const rediscoveryChance = effects.recipeDiscoveryBonus * 0.3; // Max 30% chance
        if (Math.random() < rediscoveryChance) {
          // Treat as a new discovery for bonus purposes
          isNewRecipe = true;
        }
      }
    }

    if (isNewRecipe && ingredientIds.length >= 2) {
      const recipe: Recipe = {
        id: recipeId,
        ingredientIds,
        resultingElements: elements,
        discovered: true,
        bonusLevel,
      };
      this.discoveredRecipes.set(recipeId, recipe);
    }

    // Clear slots after crafting
    this.clearAllSlots();

    // Notify callbacks with generated equipment attributes
    this.onCraftCallbacks.forEach((cb) => cb(elements, bonusLevel, generatedEquipmentUsed));

    return {
      elements,
      bonusLevel,
      isNewRecipe,
      generatedEquipmentUsed,
      ingredientIds,
      equipmentIds,
    };
  }

  private generateRecipeId(ingredientIds: string[]): string {
    return ingredientIds.sort().join('+');
  }

  private parseRecipeId(recipeId: string): Recipe | null {
    const ingredientIds = recipeId.split('+');
    if (ingredientIds.length === 0) return null;

    const elements: Partial<Record<ElementType, number>> = {};
    let bonusLevel = 0;

    for (const id of ingredientIds) {
      const ingredient = getIngredientById(id);
      if (ingredient) {
        if (ingredient.elementAffinity) {
          elements[ingredient.elementAffinity] = (elements[ingredient.elementAffinity] || 0) + 5;
        }
        bonusLevel += Math.floor(ingredient.baseValue / 10);
      }
    }

    return {
      id: recipeId,
      ingredientIds,
      resultingElements: elements,
      discovered: true,
      bonusLevel,
    };
  }

  public getDiscoveredRecipes(): Recipe[] {
    return Array.from(this.discoveredRecipes.values());
  }

  public getDiscoveredRecipeIds(): string[] {
    return Array.from(this.discoveredRecipes.keys());
  }

  public isRecipeDiscovered(ingredientIds: string[]): boolean {
    const recipeId = this.generateRecipeId(ingredientIds);
    return this.discoveredRecipes.has(recipeId);
  }

  public setMaxSlots(count: number): void {
    this.maxSlots = count;
    this.initializeSlots();
  }

  public getMaxSlots(): number {
    return this.maxSlots;
  }

  public getFilledSlotCount(): number {
    return this.slots.filter((s) => s.ingredient || s.equipment).length;
  }

  public getSlotContents(): (Ingredient | AnyEquipment | null)[] {
    return this.slots.map((s) => s.ingredient || s.equipment);
  }

  public getSlotsState(): CraftingSlotState[] {
    return this.slots.map((slot) => {
      let equipmentId: string | null = null;
      let isGenerated = false;

      if (slot.equipment) {
        equipmentId = slot.equipment.id;
        isGenerated = isGeneratedEquipment(slot.equipment);
      }

      return {
        index: slot.index,
        ingredientId: slot.ingredient?.id || null,
        equipmentId,
        isGenerated,
      };
    });
  }

  public loadSlotsState(
    slotsState: CraftingSlotState[],
    getGeneratedEquipment: (id: string) => GeneratedEquipment | undefined
  ): void {
    this.initializeSlots();

    for (const slotState of slotsState) {
      if (slotState.index < 0 || slotState.index >= this.maxSlots) continue;

      if (slotState.ingredientId) {
        const ingredient = getIngredientById(slotState.ingredientId);
        if (ingredient) {
          this.slots[slotState.index] = {
            index: slotState.index,
            ingredient,
            equipment: null,
          };
        }
      } else if (slotState.equipmentId) {
        if (slotState.isGenerated) {
          const genEquip = getGeneratedEquipment(slotState.equipmentId);
          if (genEquip) {
            this.slots[slotState.index] = {
              index: slotState.index,
              ingredient: null,
              equipment: genEquip,
            };
          }
        } else {
          const equipment = getEquipmentById(slotState.equipmentId);
          if (equipment) {
            this.slots[slotState.index] = {
              index: slotState.index,
              ingredient: null,
              equipment,
            };
          }
        }
      }
    }
  }
}
