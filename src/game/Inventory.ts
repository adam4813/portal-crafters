import type {
  InventoryState,
  ElementType,
  Ingredient,
  Equipment,
  GeneratedEquipment,
  AnyEquipment,
} from '../types';
import { getIngredientById } from '../data/ingredients';
import { getEquipmentById } from '../data/equipment';

export class InventorySystem {
  private state: InventoryState;
  private onChangeCallbacks: (() => void)[] = [];

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): InventoryState {
    return {
      gold: 100,
      mana: 0,
      ingredients: {
        fire_crystal: 3,
        water_essence: 3,
      },
      equipment: {},
      generatedEquipment: {},
      elements: {
        fire: 10,
        water: 10,
      },
    };
  }

  public initialize(state?: InventoryState): void {
    if (state) {
      this.state = { ...state };
    }
    this.notifyChange();
  }

  public onChange(callback: () => void): void {
    this.onChangeCallbacks.push(callback);
  }

  private notifyChange(): void {
    this.onChangeCallbacks.forEach((cb) => cb());
  }

  // Gold operations
  public getGold(): number {
    return this.state.gold;
  }

  public addGold(amount: number): void {
    this.state.gold += amount;
    this.notifyChange();
  }

  public spendGold(amount: number): boolean {
    if (this.state.gold >= amount) {
      this.state.gold -= amount;
      this.notifyChange();
      return true;
    }
    return false;
  }

  public canAfford(amount: number): boolean {
    return this.state.gold >= amount;
  }

  // Mana operations
  public getMana(): number {
    return this.state.mana;
  }

  public addMana(amount: number): void {
    this.state.mana += amount;
    this.notifyChange();
  }

  public spendMana(amount: number): boolean {
    if (this.state.mana >= amount) {
      this.state.mana -= amount;
      this.notifyChange();
      return true;
    }
    return false;
  }

  public hasMana(amount: number): boolean {
    return this.state.mana >= amount;
  }

  // Ingredient operations
  public getIngredients(): Record<string, number> {
    return { ...this.state.ingredients };
  }

  public getIngredientCount(ingredientId: string): number {
    return this.state.ingredients[ingredientId] || 0;
  }

  public addIngredient(ingredientId: string, amount: number = 1): void {
    this.state.ingredients[ingredientId] = (this.state.ingredients[ingredientId] || 0) + amount;
    this.notifyChange();
  }

  public removeIngredient(ingredientId: string, amount: number = 1): boolean {
    const current = this.state.ingredients[ingredientId] || 0;
    if (current >= amount) {
      this.state.ingredients[ingredientId] = current - amount;
      if (this.state.ingredients[ingredientId] === 0) {
        delete this.state.ingredients[ingredientId];
      }
      this.notifyChange();
      return true;
    }
    return false;
  }

  public hasIngredient(ingredientId: string, amount: number = 1): boolean {
    return (this.state.ingredients[ingredientId] || 0) >= amount;
  }

  public getOwnedIngredients(): Ingredient[] {
    const owned: Ingredient[] = [];
    for (const id of Object.keys(this.state.ingredients)) {
      if (this.state.ingredients[id] > 0) {
        const ingredient = getIngredientById(id);
        if (ingredient) {
          owned.push(ingredient);
        }
      }
    }
    return owned;
  }

  // Equipment operations
  public getEquipment(): Record<string, number> {
    return { ...this.state.equipment };
  }

  public getEquipmentCount(equipmentId: string): number {
    return this.state.equipment[equipmentId] || 0;
  }

  public addEquipment(equipmentId: string, amount: number = 1): void {
    this.state.equipment[equipmentId] = (this.state.equipment[equipmentId] || 0) + amount;
    this.notifyChange();
  }

  public removeEquipment(equipmentId: string, amount: number = 1): boolean {
    const current = this.state.equipment[equipmentId] || 0;
    if (current >= amount) {
      this.state.equipment[equipmentId] = current - amount;
      if (this.state.equipment[equipmentId] === 0) {
        delete this.state.equipment[equipmentId];
      }
      this.notifyChange();
      return true;
    }
    return false;
  }

  public hasEquipment(equipmentId: string, amount: number = 1): boolean {
    return (this.state.equipment[equipmentId] || 0) >= amount;
  }

  public getOwnedEquipment(): Equipment[] {
    const owned: Equipment[] = [];
    for (const id of Object.keys(this.state.equipment)) {
      if (this.state.equipment[id] > 0) {
        const equipment = getEquipmentById(id);
        if (equipment) {
          owned.push(equipment);
        }
      }
    }
    return owned;
  }

  // Generated Equipment operations
  /**
   * Get all generated equipment items stored in inventory.
   */
  public getGeneratedEquipment(): Record<string, GeneratedEquipment> {
    return { ...(this.state.generatedEquipment || {}) };
  }

  /**
   * Add a generated equipment item to inventory.
   * Stores the full equipment object with all attributes.
   * Uses deep clone to prevent mutations of the original object.
   */
  public addGeneratedEquipment(equipment: GeneratedEquipment): void {
    if (!this.state.generatedEquipment) {
      this.state.generatedEquipment = {};
    }
    this.state.generatedEquipment[equipment.id] = structuredClone(equipment);
    this.notifyChange();
  }

  /**
   * Remove a generated equipment item from inventory by ID.
   */
  public removeGeneratedEquipment(equipmentId: string): boolean {
    if (this.state.generatedEquipment && this.state.generatedEquipment[equipmentId]) {
      delete this.state.generatedEquipment[equipmentId];
      this.notifyChange();
      return true;
    }
    return false;
  }

  /**
   * Check if a generated equipment item exists in inventory.
   */
  public hasGeneratedEquipment(equipmentId: string): boolean {
    return !!(this.state.generatedEquipment && this.state.generatedEquipment[equipmentId]);
  }

  /**
   * Get a specific generated equipment item by ID.
   */
  public getGeneratedEquipmentById(equipmentId: string): GeneratedEquipment | undefined {
    return this.state.generatedEquipment?.[equipmentId];
  }

  /**
   * Get all owned equipment (both static and generated) as an array.
   * Returns AnyEquipment[] which includes both Equipment and GeneratedEquipment.
   */
  public getAllOwnedEquipment(): AnyEquipment[] {
    const owned: AnyEquipment[] = [];

    // Add static equipment
    for (const id of Object.keys(this.state.equipment)) {
      if (this.state.equipment[id] > 0) {
        const equipment = getEquipmentById(id);
        if (equipment) {
          owned.push(equipment);
        }
      }
    }

    // Add generated equipment
    if (this.state.generatedEquipment) {
      for (const equipment of Object.values(this.state.generatedEquipment)) {
        owned.push(equipment);
      }
    }

    return owned;
  }

  // Element operations
  public getElements(): Partial<Record<ElementType, number>> {
    return { ...this.state.elements };
  }

  public getElementAmount(element: ElementType): number {
    return this.state.elements[element] || 0;
  }

  public addElement(element: ElementType, amount: number): void {
    this.state.elements[element] = (this.state.elements[element] || 0) + amount;
    this.notifyChange();
  }

  public spendElement(element: ElementType, amount: number): boolean {
    const current = this.state.elements[element] || 0;
    if (current >= amount) {
      this.state.elements[element] = current - amount;
      this.notifyChange();
      return true;
    }
    return false;
  }

  public hasElement(element: ElementType, amount: number): boolean {
    return (this.state.elements[element] || 0) >= amount;
  }

  // State operations
  public getState(): InventoryState {
    // Deep clone generated equipment to prevent mutations affecting stored state
    const generatedEquipmentCopy: Record<string, GeneratedEquipment> = {};
    if (this.state.generatedEquipment) {
      for (const [id, eq] of Object.entries(this.state.generatedEquipment)) {
        generatedEquipmentCopy[id] = structuredClone(eq);
      }
    }

    return {
      gold: this.state.gold,
      mana: this.state.mana,
      ingredients: { ...this.state.ingredients },
      equipment: { ...this.state.equipment },
      elements: { ...this.state.elements },
      generatedEquipment: generatedEquipmentCopy,
    };
  }

  public loadState(state: InventoryState): void {
    // Deep clone generated equipment to prevent mutations affecting stored state
    const generatedEquipmentCopy: Record<string, GeneratedEquipment> = {};
    if (state.generatedEquipment) {
      for (const [id, eq] of Object.entries(state.generatedEquipment)) {
        generatedEquipmentCopy[id] = structuredClone(eq);
      }
    }

    this.state = {
      gold: state.gold,
      mana: state.mana,
      ingredients: { ...state.ingredients },
      equipment: { ...state.equipment },
      elements: { ...state.elements },
      generatedEquipment: generatedEquipmentCopy,
    };
    this.notifyChange();
  }

  public reset(): void {
    this.state = this.createInitialState();
    this.notifyChange();
  }
}
