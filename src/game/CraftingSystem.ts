import type { Recipe, CraftingSlot, Ingredient, Equipment, ElementType } from '../types';
import { getIngredientById } from '../data/ingredients';
import { getEquipmentById } from '../data/equipment';

export class CraftingSystem {
  private slots: CraftingSlot[] = [];
  private maxSlots: number = 4;
  private discoveredRecipes: Map<string, Recipe> = new Map();
  private onCraftCallbacks: ((
    elements: Partial<Record<ElementType, number>>,
    bonus: number
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
    callback: (elements: Partial<Record<ElementType, number>>, bonus: number) => void
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

  public craft(): {
    elements: Partial<Record<ElementType, number>>;
    bonusLevel: number;
    isNewRecipe: boolean;
  } | null {
    const filledSlots = this.slots.filter((s) => s.ingredient || s.equipment);
    if (filledSlots.length === 0) return null;

    const elements: Partial<Record<ElementType, number>> = {};
    let bonusLevel = 0;

    // Process ingredients
    const ingredientIds: string[] = [];
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
        bonusLevel += slot.equipment.portalBonus;
        if (slot.equipment.elementBonus) {
          for (const [element, amount] of Object.entries(slot.equipment.elementBonus)) {
            elements[element as ElementType] = (elements[element as ElementType] || 0) + amount;
          }
        }
      }
    }

    // Check for recipe discovery
    const recipeId = this.generateRecipeId(ingredientIds);
    const isNewRecipe = !this.discoveredRecipes.has(recipeId);

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

    // Notify callbacks
    this.onCraftCallbacks.forEach((cb) => cb(elements, bonusLevel));

    return { elements, bonusLevel, isNewRecipe };
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

  public getSlotContents(): (Ingredient | Equipment | null)[] {
    return this.slots.map((s) => s.ingredient || s.equipment);
  }
}
