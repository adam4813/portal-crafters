import type { Game } from '../game/Game';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { InventorySystem } from '../game/Inventory';

export class CraftingUI {
  private game: Game;
  private slotsContainer: HTMLElement | null;
  private craftButton: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.slotsContainer = document.getElementById('ingredient-slots');
    this.craftButton = document.getElementById('craft-button');
  }

  public initialize(): void {
    // Set up craft button
    if (this.craftButton) {
      this.craftButton.addEventListener('click', () => {
        this.game.craftPortal();
      });
    }

    // Create initial slots
    this.createSlots(4);
  }

  private createSlots(count: number): void {
    if (!this.slotsContainer) return;

    this.slotsContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const slot = document.createElement('div');
      slot.className = 'ingredient-slot';
      slot.dataset.slotIndex = i.toString();
      slot.innerHTML = '<span class="ingredient-icon">+</span>';

      slot.addEventListener('click', () => {
        this.handleSlotClick(i);
      });

      this.slotsContainer.appendChild(slot);
    }
  }

  private handleSlotClick(index: number): void {
    const crafting = this.game.getCrafting();
    const slot = crafting.getSlot(index);

    if (slot?.ingredient || slot?.equipment) {
      // Clear the slot
      this.game.clearCraftingSlot(index);
    } else {
      // Show ingredient selection (simplified - use first available ingredient)
      const inventory = this.game.getInventory();
      const ingredients = inventory.getOwnedIngredients();
      if (ingredients.length > 0) {
        this.game.addIngredientToSlot(index, ingredients[0].id);
      }
    }
  }

  public update(crafting: CraftingSystem, _inventory: InventorySystem): void {
    if (!this.slotsContainer) return;

    const slots = crafting.getSlots();
    const slotElements = this.slotsContainer.querySelectorAll('.ingredient-slot');

    slotElements.forEach((element, index) => {
      const slot = slots[index];
      const slotElement = element as HTMLElement;

      if (slot?.ingredient) {
        slotElement.classList.add('filled');
        slotElement.innerHTML = `<span class="ingredient-icon">${slot.ingredient.icon}</span>`;
        slotElement.title = slot.ingredient.name;
      } else if (slot?.equipment) {
        slotElement.classList.add('filled');
        slotElement.innerHTML = `<span class="ingredient-icon">${slot.equipment.icon}</span>`;
        slotElement.title = slot.equipment.name;
      } else {
        slotElement.classList.remove('filled');
        slotElement.innerHTML = '<span class="ingredient-icon">+</span>';
        slotElement.title = 'Empty slot';
      }
    });

    // Update craft button state
    if (this.craftButton) {
      const hasItems = crafting.getFilledSlotCount() > 0;
      (this.craftButton as HTMLButtonElement).disabled = !hasItems;
    }
  }
}
