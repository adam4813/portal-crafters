import type { InventoryState, ElementType, Ingredient, Equipment } from '../types';
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
    return {
      gold: this.state.gold,
      mana: this.state.mana,
      ingredients: { ...this.state.ingredients },
      equipment: { ...this.state.equipment },
      elements: { ...this.state.elements },
    };
  }

  public loadState(state: InventoryState): void {
    this.state = {
      gold: state.gold,
      mana: state.mana,
      ingredients: { ...state.ingredients },
      equipment: { ...state.equipment },
      elements: { ...state.elements },
    };
    this.notifyChange();
  }

  public reset(): void {
    this.state = this.createInitialState();
    this.notifyChange();
  }
}
