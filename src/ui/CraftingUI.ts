import type { Game } from '../game/Game';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { InventorySystem } from '../game/Inventory';
import type { UIManager } from './UIManager';
import type { ElementType, CraftingSlot } from '../types';
import { getLevelProgress } from '../utils/helpers';
import { getElementDefinition } from '../data/elements';

interface EffectTotals {
  goldMult: number;
  manaMult: number;
  ingredientChance: number;
  equipmentChance: number;
  rarityBonus: number;
}

function calculateTotalEffects(slots: CraftingSlot[]): EffectTotals {
  let goldMult = 1.0;
  let manaMult = 1.0;
  let ingredientChance = 0;
  let equipmentChance = 0;
  let rarityBonus = 0;

  for (const slot of slots) {
    if (slot.ingredient) {
      if (slot.ingredient.goldMultiplier) goldMult *= slot.ingredient.goldMultiplier;
      if (slot.ingredient.manaMultiplier) manaMult *= slot.ingredient.manaMultiplier;
      if (slot.ingredient.ingredientChance) ingredientChance += slot.ingredient.ingredientChance;
      if (slot.ingredient.equipmentChance) equipmentChance += slot.ingredient.equipmentChance;
      if (slot.ingredient.rarityBonus) rarityBonus += slot.ingredient.rarityBonus;
    }
  }

  return { goldMult, manaMult, ingredientChance, equipmentChance, rarityBonus };
}

export class CraftingUI {
  private game: Game;
  private uiManager: UIManager;
  private slotsContainer: HTMLElement | null;
  private craftButton: HTMLElement | null;
  private portalResourcesContainer: HTMLElement | null;
  private levelProgressContainer: HTMLElement | null;
  private itemEffectsContainer: HTMLElement | null;
  private slotsInitialized: boolean = false;
  private hoveredSlotIndex: number | null = null;

  constructor(game: Game, uiManager: UIManager) {
    this.game = game;
    this.uiManager = uiManager;
    this.slotsContainer = document.getElementById('ingredient-slots');
    this.craftButton = document.getElementById('craft-button');
    this.portalResourcesContainer = document.getElementById('portal-resources');
    this.levelProgressContainer = document.getElementById('level-progress-container');
    this.itemEffectsContainer = document.getElementById('item-effects');
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

      slot.addEventListener('mouseenter', () => {
        this.hoveredSlotIndex = i;
        this.updateItemEffects();
      });

      slot.addEventListener('mouseleave', () => {
        this.hoveredSlotIndex = null;
        this.updateItemEffects();
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

    // Update level progress bar (now at top)
    this.updateLevelProgress(crafting, portalData);
    
    // Update portal resources (mana and elements)
    this.updatePortalResources(crafting, portalData);
    
    // Update item effects display
    this.updateItemEffects();
  }

  private updateItemEffects(): void {
    if (!this.itemEffectsContainer) return;

    const crafting = this.game.getCrafting();
    const slots = crafting.getSlots();
    const totals = calculateTotalEffects(slots);
    const hoveredSlot = this.hoveredSlotIndex !== null ? slots[this.hoveredSlotIndex] : null;
    const hoveredIngredient = hoveredSlot?.ingredient || null;

    // Check if we have any effects to show
    const hasEffects = totals.goldMult > 1 || totals.manaMult > 1 || 
                       totals.ingredientChance > 0 || totals.equipmentChance > 0 || 
                       totals.rarityBonus > 0;

    if (!hasEffects) {
      this.itemEffectsContainer.innerHTML = '';
      return;
    }

    let html = '<div class="item-effects-list">';

    // Helper to render an effect line with highlighting
    const renderEffect = (
      icon: string, 
      label: string, 
      thisVal: number, 
      totalVal: number, 
      isPercent: boolean
    ): string => {
      if (totalVal === 0) return '';
      
      const suffix = isPercent ? '%' : '';
      const isHighlighted = hoveredIngredient && thisVal > 0;
      const isFullContribution = thisVal === totalVal;
      
      if (isHighlighted) {
        if (isFullContribution) {
          return `<div class="effect-line highlighted full"><span class="effect-icon">${icon}</span><strong>+${totalVal}${suffix} ${label}</strong></div>`;
        } else {
          return `<div class="effect-line highlighted"><span class="effect-icon">${icon}</span>+<strong>${thisVal}</strong>/${totalVal}${suffix} ${label}</div>`;
        }
      } else {
        return `<div class="effect-line"><span class="effect-icon">${icon}</span>+${totalVal}${suffix} ${label}</div>`;
      }
    };

    // Calculate hovered ingredient's contributions
    const hoveredGold = hoveredIngredient?.goldMultiplier ? Math.round((hoveredIngredient.goldMultiplier - 1) * 100) : 0;
    const hoveredMana = hoveredIngredient?.manaMultiplier ? Math.round((hoveredIngredient.manaMultiplier - 1) * 100) : 0;
    const hoveredIngr = hoveredIngredient?.ingredientChance ? Math.round(hoveredIngredient.ingredientChance * 100) : 0;
    const hoveredEquip = hoveredIngredient?.equipmentChance ? Math.round(hoveredIngredient.equipmentChance * 100) : 0;
    const hoveredRarity = hoveredIngredient?.rarityBonus || 0;

    html += renderEffect('💰', 'Gold', hoveredGold, Math.round((totals.goldMult - 1) * 100), true);
    html += renderEffect('✨', 'Mana', hoveredMana, Math.round((totals.manaMult - 1) * 100), true);
    html += renderEffect('🧪', 'Ingredients', hoveredIngr, Math.round(totals.ingredientChance * 100), true);
    html += renderEffect('⚔️', 'Equipment', hoveredEquip, Math.round(totals.equipmentChance * 100), true);
    html += renderEffect('⭐', 'Rarity', hoveredRarity, totals.rarityBonus, false);

    html += '</div>';
    this.itemEffectsContainer.innerHTML = html;
  }

  private updatePortalResources(crafting: CraftingSystem, portalData: any): void {
    if (!this.portalResourcesContainer) return;

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
        const elementDef = getElementDefinition(element as ElementType);
        const icon = elementDef?.icon || '?';
        const potency = elementDef?.properties.powerMultiplier || 1.0;
        const potencyDisplay = potency === 1.0 ? '1x' : `${potency}x`;
        const canAddMore = inventory.hasElement(element as ElementType, 1);
        
        elementsHtml += `
          <div class="element-control ${element}" data-element="${element}">
            <span class="element-control-icon">${icon}</span>
            <span class="element-control-name">${element}</span>
            <span class="element-control-potency" title="Power multiplier">${potencyDisplay}</span>
            <span class="element-control-amount">${elementAmount}</span>
            <div class="element-control-buttons">
              <button class="element-btn element-btn-sub" data-element="${element}" data-action="sub" title="Remove 1 ${element}">−</button>
              <button class="element-btn element-btn-add" data-element="${element}" data-action="add" title="Add 1 ${element}" ${canAddMore ? '' : 'disabled'}>+</button>
              <button class="element-btn element-btn-remove" data-element="${element}" data-action="remove" title="Remove all ${element}">×</button>
            </div>
          </div>
        `;
      }
    }
    
    if (elementsHtml) {
      html += `<div class="portal-elements">${elementsHtml}</div>`;
    }

    // Show element bonuses from ingredients (element affinity bonuses only, no level bonuses)
    const slots = crafting.getSlots();
    const elementBonuses: Partial<Record<ElementType, number>> = {};

    for (const slot of slots) {
      if (slot.ingredient) {
        if (slot.ingredient.elementAffinity) {
          elementBonuses[slot.ingredient.elementAffinity] = 
            (elementBonuses[slot.ingredient.elementAffinity] || 0) + 5;
        }
      }
    }
    
    // Show element bonuses only
    if (Object.keys(elementBonuses).length > 0) {
      html += '<div class="ingredient-bonuses">';
      
      for (const [element, amount] of Object.entries(elementBonuses)) {
        const elementDef = getElementDefinition(element as ElementType);
        const icon = elementDef?.icon || '?';
        html += `<span class="bonus-item">${icon} +${amount} ${element}</span>`;
      }
      
      html += '</div>';
    }

    this.portalResourcesContainer.innerHTML = html;

    // Add click handlers for mana control buttons
    this.portalResourcesContainer.querySelectorAll('[data-action^="mana-"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (btn as HTMLElement).dataset.action;
        if (action) {
          this.handleManaAction(action, portalMana);
        }
      });
    });

    // Add click handlers for element control buttons
    this.portalResourcesContainer.querySelectorAll('.element-btn[data-element]').forEach((btn) => {
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

  private updateLevelProgress(_crafting: CraftingSystem, portalData: any): void {
    if (!this.levelProgressContainer) return;

    // Get level progress from helper (uses curve-based thresholds)
    // Item bonuses removed - level is determined purely by mana and elements
    const progress = getLevelProgress(portalData.manaInvested, portalData.elements);
    const currentLevel = progress.currentLevel;
    const nextLevel = currentLevel + 1;
    
    // Calculate power needed for display
    const powerNeeded = progress.powerForNextLevel - progress.powerForCurrentLevel;
    const powerProgress = progress.currentPower - progress.powerForCurrentLevel;

    this.levelProgressContainer.innerHTML = `
      <div class="level-progress">
        <div class="level-progress-header">
          <span class="level-label">Portal Level</span>
          <span class="level-value">${currentLevel}</span>
        </div>
        <div class="level-progress-bar">
          <div class="level-progress-fill" style="width: ${progress.progressPercent}%"></div>
        </div>
        <div class="level-progress-footer">
          <span class="level-progress-text">${powerProgress}/${powerNeeded} power to level ${nextLevel}</span>
        </div>
      </div>
    `;
  }
}
