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
  private levelProgressContainer: HTMLElement | null;
  private slotsInitialized: boolean = false;

  constructor(game: Game, uiManager: UIManager) {
    this.game = game;
    this.uiManager = uiManager;
    this.slotsContainer = document.getElementById('ingredient-slots');
    this.craftButton = document.getElementById('craft-button');
    this.previewContainer = document.getElementById('crafting-preview');
    this.levelProgressContainer = document.getElementById('level-progress-container');
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

    // Update craft button state - can craft if has items OR has elements OR has mana in portal
    const hasItems = crafting.getFilledSlotCount() > 0;
    const portalData = this.game.getPortal().getData();
    const hasElements = Object.values(portalData.elements).some(v => v && v > 0);
    const hasMana = portalData.manaInvested > 0;
    
    if (this.craftButton) {
      (this.craftButton as HTMLButtonElement).disabled = !hasItems && !hasElements && !hasMana;
    }

    // Update preview
    this.updatePreview(crafting, hasItems, portalData);
    
    // Update level progress bar
    this.updateLevelProgress(crafting, portalData);
  }

  private updatePreview(crafting: CraftingSystem, _hasItems: boolean, portalData: any): void {
    if (!this.previewContainer) return;

    let html = '';

    // Mana control (raw power) - always show
    const inventory = this.game.getInventory();
    const availableMana = inventory.getMana();
    const portalMana = portalData.manaInvested;
    
    html += `
      <div class="mana-control">
        <span class="mana-control-icon">✨</span>
        <span class="mana-control-label">Raw Mana</span>
        <span class="mana-control-amount">${portalMana}</span>
        <div class="mana-control-buttons">
          <button class="element-btn element-btn-sub" data-action="mana-sub" title="Remove 10 mana" ${portalMana < 10 ? 'disabled' : ''}>−</button>
          <button class="element-btn element-btn-add" data-action="mana-add" title="Add 10 mana" ${availableMana < 10 ? 'disabled' : ''}>+</button>
          <button class="element-btn element-btn-remove" data-action="mana-remove" title="Remove all mana" ${portalMana === 0 ? 'disabled' : ''}>×</button>
        </div>
      </div>
    `;

    // Get current portal elements with interactive controls
    let elementsHtml = '';
    for (const [element, amount] of Object.entries(portalData.elements)) {
      if (amount && (amount as number) > 0) {
        const elementAmount = amount as number;
        // Each element contributes 20% toward a level (5 elements = 1 level)
        const percentPerElement = 20;
        elementsHtml += `
          <div class="element-control" data-element="${element}">
            <span class="element-control-name ${element}">${element}</span>
            <span class="element-control-percent">${percentPerElement}%</span>
            <span class="element-control-amount">${elementAmount}</span>
            <div class="element-control-buttons">
              <button class="element-btn element-btn-sub" data-element="${element}" data-action="sub" title="Remove 1 ${element}">−</button>
              <button class="element-btn element-btn-add" data-element="${element}" data-action="add" title="Add 1 ${element}">+</button>
              <button class="element-btn element-btn-remove" data-element="${element}" data-action="remove" title="Remove all ${element}">×</button>
            </div>
          </div>
        `;
      }
    }
    
    if (elementsHtml) {
      html += `<div class="preview-elements">${elementsHtml}</div>`;
    }

    // Calculate item display (contents)
    const slots = crafting.getSlots();
    let itemsHtml = '';

    for (const slot of slots) {
      if (slot.ingredient) {
        itemsHtml += `<span class="content-item">${slot.ingredient.icon} ${slot.ingredient.name}</span>`;
      }
      if (slot.equipment) {
        itemsHtml += `<span class="content-item">${slot.equipment.icon} ${slot.equipment.name}</span>`;
      }
    }
    
    if (itemsHtml) {
      html += `<div class="preview-items-section"><div class="preview-label">Items:</div><div class="preview-contents">${itemsHtml}</div></div>`;
    }

    this.previewContainer.innerHTML = html;

    // Add click handlers for mana control buttons
    this.previewContainer.querySelectorAll('[data-action^="mana-"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (btn as HTMLElement).dataset.action;
        if (action) {
          this.handleManaAction(action, portalMana);
        }
      });
    });

    // Add click handlers for element control buttons
    this.previewContainer.querySelectorAll('.element-btn[data-element]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const element = (btn as HTMLElement).dataset.element as ElementType;
        const action = (btn as HTMLElement).dataset.action;
        if (element && action) {
          this.handleElementAction(element, action, portalData.elements[element] || 0);
        }
      });
    });
  }

  private handleManaAction(action: string, currentMana: number): void {
    switch (action) {
      case 'mana-sub':
        if (currentMana >= 10) {
          this.game.removeManaFromPortal(10);
        }
        break;
      case 'mana-add':
        if (this.game.getInventory().hasMana(10)) {
          this.game.addManaToPortal(10);
        }
        break;
      case 'mana-remove':
        if (currentMana > 0) {
          this.game.removeManaFromPortal(currentMana);
        }
        break;
    }
  }

  private handleElementAction(element: ElementType, action: string, currentAmount: number): void {
    const inventory = this.game.getInventory();
    
    switch (action) {
      case 'sub':
        if (currentAmount > 0) {
          this.game.removeElementFromPortal(element, 1);
        }
        break;
      case 'add':
        if (inventory.hasElement(element, 1)) {
          this.game.addElementToPortal(element, 1);
        }
        break;
      case 'remove':
        if (currentAmount > 0) {
          this.game.removeElementFromPortal(element, currentAmount);
        }
        break;
    }
  }

  private updateLevelProgress(crafting: CraftingSystem, portalData: any): void {
    if (!this.levelProgressContainer) return;

    // Calculate total elements
    const elementTotal = Object.values(portalData.elements).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    
    // Calculate item bonuses
    const slots = crafting.getSlots();
    let itemBonus = 0;
    for (const slot of slots) {
      if (slot.ingredient) {
        itemBonus += Math.floor(slot.ingredient.baseValue / 10);
      }
      if (slot.equipment) {
        itemBonus += slot.equipment.portalBonus;
      }
    }

    // Level calculation: base from mana + element bonus (5 elements = 1 level) + item bonus
    // Add 1 to make it 1-based (start at level 1, not 0)
    const baseLevel = Math.floor(Math.sqrt(portalData.manaInvested / 10)) + 1;
    const elementBonus = Math.floor(elementTotal / 5);
    const currentLevel = baseLevel + elementBonus + itemBonus;
    
    // Progress toward next level (from elements)
    // At 0 elements, you're at level 1 with 0% progress toward level 2
    // At 5 elements, you hit level 2 with 0% progress toward level 3
    const elementsTowardNextLevel = elementTotal % 5;
    const progressPercent = (elementsTowardNextLevel / 5) * 100;
    const nextLevel = currentLevel + 1;

    this.levelProgressContainer.innerHTML = `
      <div class="level-progress">
        <div class="level-progress-header">
          <span class="level-label">Portal Level</span>
          <span class="level-value">${currentLevel}</span>
        </div>
        <div class="level-progress-bar">
          <div class="level-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="level-progress-footer">
          <span class="level-progress-text">${elementsTowardNextLevel}/5 elements to level ${nextLevel}</span>
        </div>
      </div>
    `;
  }
}
