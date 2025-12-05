import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { ElementSystem } from '../game/ElementSystem';
import type { ElementType } from '../types';

export class InventoryUI {
  private game: Game;
  private itemsContainer: HTMLElement | null;
  private elementsContainer: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.itemsContainer = document.getElementById('inventory-items');
    this.elementsContainer = document.getElementById('inventory-elements');
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(inventory: InventorySystem, elements: ElementSystem): void {
    this.renderItems(inventory);
    this.renderElements(inventory, elements);
  }

  private renderItems(inventory: InventorySystem): void {
    if (!this.itemsContainer) return;

    const ingredients = inventory.getIngredients();
    const equipment = inventory.getEquipment();

    let html = '<div class="inventory-section"><h4>Ingredients</h4>';

    // Render ingredients
    const ownedIngredients = inventory.getOwnedIngredients();
    if (ownedIngredients.length === 0) {
      html += '<p class="empty-message">No ingredients</p>';
    } else {
      for (const ingredient of ownedIngredients) {
        const count = ingredients[ingredient.id] || 0;
        html += `
          <div class="inventory-item" data-type="ingredient" data-id="${ingredient.id}" title="${ingredient.description}">
            <span>${ingredient.icon}</span>
            <span>${ingredient.name}</span>
            <span class="count">x${count}</span>
          </div>
        `;
      }
    }

    html += '</div><div class="inventory-section"><h4>Equipment</h4>';

    // Render equipment
    const ownedEquipment = inventory.getOwnedEquipment();
    if (ownedEquipment.length === 0) {
      html += '<p class="empty-message">No equipment</p>';
    } else {
      for (const equip of ownedEquipment) {
        const count = equipment[equip.id] || 0;
        html += `
          <div class="inventory-item" data-type="equipment" data-id="${equip.id}" title="${equip.description}">
            <span>${equip.icon}</span>
            <span>${equip.name}</span>
            <span class="count">x${count}</span>
          </div>
        `;
      }
    }

    html += '</div>';

    this.itemsContainer.innerHTML = html;

    // Add click handlers
    this.itemsContainer.querySelectorAll('.inventory-item').forEach((item) => {
      item.addEventListener('click', () => {
        const type = (item as HTMLElement).dataset.type;
        const id = (item as HTMLElement).dataset.id;
        if (type && id) {
          this.handleItemClick(type, id);
        }
      });
    });
  }

  private handleItemClick(type: string, id: string): void {
    const crafting = this.game.getCrafting();
    const slots = crafting.getSlots();

    // Find first empty slot
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].ingredient && !slots[i].equipment) {
        if (type === 'ingredient') {
          this.game.addIngredientToSlot(i, id);
        } else if (type === 'equipment') {
          this.game.addEquipmentToSlot(i, id);
        }
        break;
      }
    }
  }

  private renderElements(inventory: InventorySystem, elementSystem: ElementSystem): void {
    if (!this.elementsContainer) return;

    const unlockedElements = elementSystem.getUnlockedElements();
    const elements = inventory.getElements();

    let html = '<div class="element-display">';

    for (const element of unlockedElements) {
      const amount = elements[element] || 0;
      const info = elementSystem.getElementInfo(element);
      if (info) {
        html += `
          <div class="element-badge ${element}" title="Click to add to portal">
            ${info.icon} ${amount}
          </div>
        `;
      }
    }

    html += '</div>';

    this.elementsContainer.innerHTML = html;

    // Add click handlers for adding elements to portal
    this.elementsContainer.querySelectorAll('.element-badge').forEach((badge) => {
      badge.addEventListener('click', () => {
        const elementClass = Array.from(badge.classList).find((c) => c !== 'element-badge') as
          | ElementType
          | undefined;
        if (elementClass) {
          this.game.addElementToPortal(elementClass, 1);
        }
      });
    });
  }
}
