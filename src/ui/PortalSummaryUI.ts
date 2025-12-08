import type { Game } from '../game/Game';
import type { Portal } from '../game/Portal';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { ElementType } from '../types';

export class PortalSummaryUI {
  private game: Game;
  private statsContainer: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.statsContainer = document.getElementById('portal-stats');
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(portal: Portal, crafting: CraftingSystem): void {
    if (!this.statsContainer) return;

    const portalData = portal.getData();
    const slots = crafting.getSlots();

    // Calculate what crafting will add
    let pendingElements: Partial<Record<ElementType, number>> = {};
    let pendingBonusLevel = 0;

    for (const slot of slots) {
      if (slot.ingredient) {
        if (slot.ingredient.elementAffinity) {
          pendingElements[slot.ingredient.elementAffinity] =
            (pendingElements[slot.ingredient.elementAffinity] || 0) + 5;
        }
        pendingBonusLevel += Math.floor(slot.ingredient.baseValue / 10);
      }
      if (slot.equipment) {
        pendingBonusLevel += slot.equipment.portalBonus;
        if (slot.equipment.elementBonus) {
          for (const [element, amount] of Object.entries(slot.equipment.elementBonus)) {
            if (amount) {
              pendingElements[element as ElementType] =
                (pendingElements[element as ElementType] || 0) + amount;
            }
          }
        }
      }
    }

    const hasPendingItems = crafting.getFilledSlotCount() > 0;

    // Build element list
    const allElements = new Set<ElementType>([
      ...(Object.keys(portalData.elements) as ElementType[]),
      ...(Object.keys(pendingElements) as ElementType[]),
    ]);

    let elementsHtml = '';
    for (const element of allElements) {
      const current = portalData.elements[element] || 0;
      const pending = pendingElements[element] || 0;
      if (current > 0 || pending > 0) {
        const canRemove = current > 0;
        elementsHtml += `
          <div class="portal-element ${element} ${canRemove ? 'removable' : ''}" 
               ${canRemove ? `data-element="${element}" title="Click to remove 1 ${element}"` : ''}>
            <span class="element-name">${element}</span>
            <span class="element-amount">${current}${pending > 0 ? ` <span class="pending">+${pending}</span>` : ''}</span>
            ${canRemove ? '<span class="remove-icon">−</span>' : ''}
          </div>
        `;
      }
    }

    if (!elementsHtml) {
      elementsHtml = '<p class="empty-message">No elements added yet</p>';
    }

    this.statsContainer.innerHTML = `
      <div class="portal-level">
        <span class="label">Level:</span>
        <span class="value">${portalData.level}${pendingBonusLevel > 0 ? ` <span class="pending">+${pendingBonusLevel}</span>` : ''}</span>
      </div>
      <div class="portal-mana">
        <span class="label">Mana Invested:</span>
        <span class="value">${portalData.manaInvested}</span>
      </div>
      <div class="portal-elements-section">
        <span class="label">Elements (click to remove):</span>
        <div class="portal-elements-list">
          ${elementsHtml}
        </div>
      </div>
      ${hasPendingItems ? '<p class="craft-hint">Click "Craft Portal" to apply pending bonuses</p>' : ''}
      <button id="store-portal-btn" class="btn-secondary store-portal-btn">Store Portal</button>
    `;

    // Add click handlers for removing elements
    this.statsContainer.querySelectorAll('.portal-element.removable').forEach((el) => {
      el.addEventListener('click', () => {
        const element = (el as HTMLElement).dataset.element as ElementType;
        if (element) {
          this.game.removeElementFromPortal(element, 1);
        }
      });
    });

    // Add store portal button handler
    const storeBtn = document.getElementById('store-portal-btn');
    if (storeBtn) {
      storeBtn.addEventListener('click', () => {
        this.game.storeCurrentPortal();
      });
    }
  }
}
