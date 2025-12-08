import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { ElementSystem } from '../game/ElementSystem';
import type { Ingredient } from '../types';

function buildIngredientTooltip(ingredient: Ingredient): string {
  const lines: string[] = [ingredient.name, ingredient.description];

  if (ingredient.elementAffinity) {
    lines.push(`+5 ${ingredient.elementAffinity}`);
  }
  if (ingredient.goldMultiplier && ingredient.goldMultiplier > 1) {
    lines.push(`+${Math.round((ingredient.goldMultiplier - 1) * 100)}% Gold`);
  }
  if (ingredient.manaMultiplier && ingredient.manaMultiplier > 1) {
    lines.push(`+${Math.round((ingredient.manaMultiplier - 1) * 100)}% Mana`);
  }
  if (ingredient.ingredientChance && ingredient.ingredientChance > 0) {
    lines.push(`+${Math.round(ingredient.ingredientChance * 100)}% Ingredient Chance`);
  }
  if (ingredient.equipmentChance && ingredient.equipmentChance > 0) {
    lines.push(`+${Math.round(ingredient.equipmentChance * 100)}% Equipment Chance`);
  }
  if (ingredient.rarityBonus && ingredient.rarityBonus > 0) {
    lines.push(`+${ingredient.rarityBonus} Rarity`);
  }

  return lines.join('\n');
}

export class InventoryUI {
  private game: Game;
  private itemsContainer: HTMLElement | null;
  private elementsContainer: HTMLElement | null;
  private selectedItem: { type: 'ingredient' | 'equipment'; id: string } | null = null;

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

  public getSelectedItem(): { type: 'ingredient' | 'equipment'; id: string } | null {
    return this.selectedItem;
  }

  public clearSelection(): void {
    this.selectedItem = null;
    // Force re-render to update selection visual
    this.renderItems(this.game.getInventory());
  }

  private renderItems(inventory: InventorySystem): void {
    if (!this.itemsContainer) return;

    const ingredients = inventory.getIngredients();
    const equipment = inventory.getEquipment();

    let html = '<div class="inventory-section"><h4>Ingredients (click to select)</h4>';

    // Render ingredients
    const ownedIngredients = inventory.getOwnedIngredients();
    if (ownedIngredients.length === 0) {
      html += '<p class="empty-message">No ingredients</p>';
    } else {
      for (const ingredient of ownedIngredients) {
        const count = ingredients[ingredient.id] || 0;
        const elementInfo = ingredient.elementAffinity ? `+5 ${ingredient.elementAffinity}` : '';
        const isSelected =
          this.selectedItem?.type === 'ingredient' && this.selectedItem?.id === ingredient.id;
        const tooltip = buildIngredientTooltip(ingredient);
        html += `
          <div class="inventory-item ${isSelected ? 'selected' : ''}" data-type="ingredient" data-id="${ingredient.id}" title="${tooltip}">
            <span class="item-icon">${ingredient.icon}</span>
            <span class="item-name">${ingredient.name}</span>
            ${elementInfo ? `<span class="element-bonus">${elementInfo}</span>` : ''}
            <span class="count">x${count}</span>
          </div>
        `;
      }
    }

    html += '</div><div class="inventory-section"><h4>Equipment (click to select)</h4>';

    // Render equipment
    const ownedEquipment = inventory.getOwnedEquipment();
    if (ownedEquipment.length === 0) {
      html += '<p class="empty-message">No equipment</p>';
    } else {
      for (const equip of ownedEquipment) {
        const count = equipment[equip.id] || 0;
        const isSelected =
          this.selectedItem?.type === 'equipment' && this.selectedItem?.id === equip.id;
        html += `
          <div class="inventory-item ${isSelected ? 'selected' : ''}" data-type="equipment" data-id="${equip.id}" title="${equip.description}">
            <span class="item-icon">${equip.icon}</span>
            <span class="item-name">${equip.name}</span>
            <span class="count">x${count}</span>
          </div>
        `;
      }
    }

    html += '</div>';

    this.itemsContainer.innerHTML = html;

    // Add click handlers
    this.itemsContainer.querySelectorAll('.inventory-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = (item as HTMLElement).dataset.type as 'ingredient' | 'equipment';
        const id = (item as HTMLElement).dataset.id;
        if (type && id) {
          this.handleItemClick(type, id);
        }
      });
    });
  }

  private handleItemClick(type: 'ingredient' | 'equipment', id: string): void {
    // Toggle selection
    if (this.selectedItem?.type === type && this.selectedItem?.id === id) {
      this.selectedItem = null;
    } else {
      this.selectedItem = { type, id };
    }
    // Re-render to show selection
    this.renderItems(this.game.getInventory());
  }

  private renderElements(inventory: InventorySystem, elementSystem: ElementSystem): void {
    if (!this.elementsContainer) return;

    const unlockedElements = elementSystem.getUnlockedElements();
    const elements = inventory.getElements();

    let html = '<h4>Elements (click to add to portal)</h4><div class="element-display">';

    for (const element of unlockedElements) {
      const amount = elements[element] || 0;
      const info = elementSystem.getElementInfo(element);
      if (info) {
        const canAdd = amount > 0;
        html += `
          <div class="element-badge ${element} ${canAdd ? 'clickable' : 'empty'}" 
               data-element="${element}" 
               title="${canAdd ? `Click to add 1 ${element} to portal` : `No ${element} available`}">
            ${info.icon} ${amount}
          </div>
        `;
      }
    }

    html += '</div>';
    html += '<p class="element-help">Elements shape the portal\'s aspect/theme</p>';

    this.elementsContainer.innerHTML = html;

    // Add click handlers for elements
    this.elementsContainer.querySelectorAll('.element-badge.clickable').forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const element = (badge as HTMLElement).dataset.element;
        if (element) {
          this.game.addElementToPortal(element as any, 1);
        }
      });
    });
  }
}
