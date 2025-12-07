import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { ElementSystem } from '../game/ElementSystem';
import type { ElementType } from '../types';
import { formatNumber } from '../utils/helpers';

export class ManaConversionUI {
  private game: Game;
  private container: HTMLElement | null;
  private selectedElement: ElementType | null = null;
  private conversionAmount: number = 1;

  constructor(game: Game) {
    this.game = game;
    this.container = document.getElementById('mana-conversion');
  }

  public initialize(): void {
    this.render();
  }

  private render(): void {
    if (!this.container) return;

    let html = '<h4>Convert Mana to Elements</h4>';
    html += '<div class="mana-conversion-info">';
    html +=
      '<p class="info-text">Transform your mana into elemental energy for crafting portals.</p>';
    html += '</div>';
    html += '<div id="element-selector"></div>';
    html += '<div id="conversion-controls"></div>';

    this.container.innerHTML = html;
  }

  public update(inventory: InventorySystem, elements: ElementSystem): void {
    if (!this.container) return;

    const elementSelector = this.container.querySelector('#element-selector');
    const conversionControls = this.container.querySelector('#conversion-controls');

    if (elementSelector) {
      this.renderElementSelector(elementSelector as HTMLElement, elements, inventory);
    }

    if (conversionControls) {
      this.renderConversionControls(conversionControls as HTMLElement, inventory, elements);
    }
  }

  private renderElementSelector(
    container: HTMLElement,
    elements: ElementSystem,
    inventory: InventorySystem
  ): void {
    const unlockedElements = elements.getUnlockedElements();
    const currentMana = inventory.getMana();

    let html = '<div class="element-selector-grid">';

    for (const element of unlockedElements) {
      const elementInfo = elements.getElementInfo(element);
      if (!elementInfo) continue;

      const manaPerElement = elements.getManaPerElement(element);
      const canAfford = currentMana >= manaPerElement;
      const isSelected = this.selectedElement === element;

      html += `
        <div class="element-option ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}" 
             data-element="${element}"${!canAfford ? ' aria-disabled="true"' : ''}>
          <div class="element-icon">${elementInfo.icon}</div>
          <div class="element-name">${elementInfo.name}</div>
          <div class="element-cost">${manaPerElement} mana</div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.element-option').forEach((option) => {
      option.addEventListener('click', () => {
        const element = (option as HTMLElement).dataset.element as ElementType;
        if (!option.classList.contains('disabled')) {
          this.selectedElement = element;
          this.update(inventory, elements);
        }
      });
    });
  }

  private renderConversionControls(
    container: HTMLElement,
    inventory: InventorySystem,
    elements: ElementSystem
  ): void {
    if (!this.selectedElement) {
      container.innerHTML =
        '<p class="conversion-prompt">Select an element above to begin conversion</p>';
      return;
    }

    const elementInfo = elements.getElementInfo(this.selectedElement);
    const manaPerElement = elements.getManaPerElement(this.selectedElement);
    const currentMana = inventory.getMana();
    const maxConversion = Math.floor(currentMana / manaPerElement);

    // Ensure conversionAmount is within valid range
    if (maxConversion < 1) {
      this.conversionAmount = 0;
    } else {
      this.conversionAmount = Math.max(1, Math.min(this.conversionAmount, maxConversion));
    }

    const totalCost = manaPerElement * this.conversionAmount;
    const canAfford = currentMana >= totalCost;

    let html = '<div class="conversion-details">';
    html += `<h5>Converting to ${elementInfo?.icon} ${elementInfo?.name}</h5>`;
    html += '<div class="conversion-rate-display">';
    html += `<div class="rate-info">`;
    html += `<span class="rate-label">Cost per unit:</span>`;
    html += `<span class="rate-value">${manaPerElement} mana</span>`;
    html += `</div>`;
    html += `<div class="rate-info">`;
    html += `<span class="rate-label">Available mana:</span>`;
    html += `<span class="rate-value ${!canAfford ? 'insufficient' : ''}">${formatNumber(currentMana)}</span>`;
    html += `</div>`;
    html += `<div class="rate-info">`;
    html += `<span class="rate-label">Max conversion:</span>`;
    html += `<span class="rate-value">${formatNumber(maxConversion)}</span>`;
    html += `</div>`;
    html += '</div>';

    html += '<div class="conversion-amount-selector">';
    html += '<label for="conversion-amount">Amount to convert:</label>';
    html += '<div class="amount-controls">';
    html += `<button class="btn-amount" data-action="min" aria-label="Set to minimum amount (1)" ${maxConversion < 1 ? 'disabled' : ''}>Min</button>`;
    html += `<button class="btn-amount" data-action="dec" aria-label="Decrease amount by 1" ${this.conversionAmount <= 1 ? 'disabled' : ''}>-</button>`;
    html += `<input type="number" id="conversion-amount" min="1" max="${maxConversion}" value="${this.conversionAmount}" ${maxConversion < 1 ? 'disabled' : ''}>`;
    html += `<button class="btn-amount" data-action="inc" aria-label="Increase amount by 1" ${this.conversionAmount >= maxConversion ? 'disabled' : ''}>+</button>`;
    html += `<button class="btn-amount" data-action="max" aria-label="Set to maximum available amount" ${maxConversion < 1 ? 'disabled' : ''}>Max</button>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="conversion-summary">';
    html += `<div class="summary-row">`;
    html += `<span>Total cost:</span>`;
    html += `<span class="summary-value ${!canAfford ? 'insufficient' : ''}">${formatNumber(totalCost)} mana</span>`;
    html += `</div>`;
    html += `<div class="summary-row">`;
    html += `<span>You will receive:</span>`;
    html += `<span class="summary-value highlight">${this.conversionAmount} ${elementInfo?.icon} ${elementInfo?.name}</span>`;
    html += `</div>`;
    html += '</div>';

    html += `<button class="btn-primary btn-convert" ${!canAfford || maxConversion < 1 ? 'disabled' : ''}>
      Convert ${this.conversionAmount} ${elementInfo?.icon}
    </button>`;

    html += '</div>';
    container.innerHTML = html;

    // Add event handlers
    const amountInput = container.querySelector('#conversion-amount') as HTMLInputElement;
    if (amountInput) {
      amountInput.addEventListener('change', () => {
        const value = parseInt(amountInput.value, 10);
        if (!isNaN(value) && value >= 1 && value <= maxConversion) {
          this.conversionAmount = value;
          this.update(inventory, elements);
        }
      });
    }

    container.querySelectorAll('.btn-amount').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset.action;
        switch (action) {
          case 'min':
            this.conversionAmount = 1;
            break;
          case 'dec':
            this.conversionAmount = Math.max(1, this.conversionAmount - 1);
            break;
          case 'inc':
            this.conversionAmount = Math.min(maxConversion, this.conversionAmount + 1);
            break;
          case 'max':
            this.conversionAmount = maxConversion;
            break;
        }
        this.update(inventory, elements);
      });
    });

    const convertBtn = container.querySelector('.btn-convert');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        if (this.selectedElement && canAfford) {
          this.game.convertManaToElement(this.selectedElement, this.conversionAmount);
          // Reset amount after conversion
          this.conversionAmount = 1;
        }
      });
    }
  }
}
