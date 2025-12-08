import type { Game } from '../game/Game';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { InventorySystem } from '../game/Inventory';
import type { UIManager } from './UIManager';
import type { ElementType } from '../types';

export class CraftingUI {
  private game: Game;
  private uiManager: UIManager;
  private slotsContainer: HTMLElement | null;
  private craftButton: HTMLElement | null;
  private previewContainer: HTMLElement | null;
  private slotsInitialized: boolean = false;

  constructor(game: Game, uiManager: UIManager) {
    this.game = game;
    this.uiManager = uiManager;
    this.slotsContainer = document.getElementById('ingredient-slots');
    this.craftButton = document.getElementById('craft-button');
    this.previewContainer = document.getElementById('crafting-preview');
  }

  public initialize(): void {
    // Set up craft button - only once
    if (this.craftButton) {
      this.craftButton.addEventListener('click', () => {
        this.game.craftPortal();
      });
    }

    // Create initial slots - only once
    if (!this.slotsInitialized) {
      this.createSlots(4);
      this.slotsInitialized = true;
    }
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
      // Try to add the selected item from inventory
      const selectedItem = this.uiManager.getSelectedItem();
      if (selectedItem) {
        if (selectedItem.type === 'ingredient') {
          this.game.addIngredientToSlot(index, selectedItem.id);
        } else if (selectedItem.type === 'equipment') {
          this.game.addEquipmentToSlot(index, selectedItem.id);
        }
        this.uiManager.clearSelection();
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
        slotElement.title = `${slot.ingredient.name}\nClick to remove`;
      } else if (slot?.equipment) {
        slotElement.classList.add('filled');
        slotElement.innerHTML = `<span class="ingredient-icon">${slot.equipment.icon}</span>`;
        slotElement.title = `${slot.equipment.name}\nClick to remove`;
      } else {
        slotElement.classList.remove('filled');
        slotElement.innerHTML = '<span class="ingredient-icon">+</span>';
        slotElement.title = 'Select an item then click here to add';
      }
    });

    // Update craft button state - can craft if has items OR has elements in portal
    const hasItems = crafting.getFilledSlotCount() > 0;
    const portalData = this.game.getPortal().getData();
    const hasElements = Object.values(portalData.elements).some(v => v && v > 0);
    
    if (this.craftButton) {
      (this.craftButton as HTMLButtonElement).disabled = !hasItems && !hasElements;
    }

    // Update preview
    this.updatePreview(crafting, hasItems, portalData);
  }

  private updatePreview(crafting: CraftingSystem, hasItems: boolean, portalData: any): void {
    if (!this.previewContainer) return;

    const hasElements = Object.values(portalData.elements).some((v: any) => v && v > 0);

    if (!hasItems && !hasElements) {
      this.previewContainer.innerHTML = '<p class="preview-empty">Add elements (aspect) or items (contents) to craft a portal</p>';
      return;
    }

    // Get current portal elements (aspect)
    let aspectHtml = '';
    for (const [element, amount] of Object.entries(portalData.elements)) {
      if (amount && (amount as number) > 0) {
        aspectHtml += `
          <span class="aspect-element ${element}" data-element="${element}" title="Click to remove 1 ${element}">
            ${element}: ${amount}
            <span class="remove-x">×</span>
          </span>
        `;
      }
    }

    // Calculate item bonuses (contents)
    const slots = crafting.getSlots();
    let itemsHtml = '';
    let bonusLevel = 0;

    for (const slot of slots) {
      if (slot.ingredient) {
        itemsHtml += `<span class="content-item">${slot.ingredient.icon} ${slot.ingredient.name}</span>`;
        bonusLevel += Math.floor(slot.ingredient.baseValue / 10);
      }
      if (slot.equipment) {
        itemsHtml += `<span class="content-item">${slot.equipment.icon} ${slot.equipment.name}</span>`;
        bonusLevel += slot.equipment.portalBonus;
      }
    }

    const finalLevel = Math.max(1, portalData.level + bonusLevel);

    this.previewContainer.innerHTML = `
      <div class="portal-preview">
        <div class="preview-header">Portal Preview</div>
        <div class="preview-section">
          <div class="preview-label">Level: <strong>${finalLevel}</strong></div>
        </div>
        <div class="preview-section">
          <div class="preview-label">Aspect (elements):</div>
          <div class="preview-aspects">${aspectHtml || '<span class="none">None - click elements to add</span>'}</div>
        </div>
        <div class="preview-section">
          <div class="preview-label">Contents (items):</div>
          <div class="preview-contents">${itemsHtml || '<span class="none">None - add items to slots</span>'}</div>
        </div>
      </div>
    `;

    // Add click handlers for removing elements
    this.previewContainer.querySelectorAll('.aspect-element').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const element = (el as HTMLElement).dataset.element;
        if (element) {
          this.game.removeElementFromPortal(element as ElementType, 1);
        }
      });
    });
  }
}
