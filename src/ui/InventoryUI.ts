import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { ElementSystem } from '../game/ElementSystem';

export class InventoryUI {
  private game: Game;
  private elementsContainer: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.elementsContainer = document.getElementById('inventory-elements');
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(inventory: InventorySystem, elements: ElementSystem): void {
    this.renderElements(inventory, elements);
  }

  public getSelectedItem(): { type: 'ingredient' | 'equipment'; id: string } | null {
    // Selection is now handled by the slot picker modal
    return null;
  }

  public clearSelection(): void {
    // No-op, selection is now handled by the slot picker modal
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
