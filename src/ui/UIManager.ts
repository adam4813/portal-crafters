import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { CustomerSystem } from '../game/Customer';
import type { ElementSystem } from '../game/ElementSystem';
import type { UpgradeSystem } from '../game/UpgradeSystem';
import type { Portal } from '../game/Portal';
import type { GameState, Portal as PortalType } from '../types';
import { CraftingUI } from './CraftingUI';
import { InventoryUI } from './InventoryUI';
import { CustomerUI } from './CustomerUI';
import { ShopUI } from './ShopUI';
import { ResearchUI } from './ResearchUI';
import { ManaConversionUI } from './ManaConversionUI';
import { TutorialUI } from './TutorialUI';
import { PortalInventoryUI } from './PortalInventoryUI';
import { formatNumber } from '../utils/helpers';

export interface UIUpdateData {
  inventory: InventorySystem;
  crafting: CraftingSystem;
  customers: CustomerSystem;
  elements: ElementSystem;
  upgrades: UpgradeSystem;
  portal: Portal;
  gameState: GameState;
  storedPortals: PortalType[];
}

type ModalType = 'shop' | 'upgrades' | 'research' | 'mana-converter' | 'recipes' | null;

export class UIManager {
  private game: Game;
  private craftingUI: CraftingUI;
  private inventoryUI: InventoryUI;
  private customerUI: CustomerUI;
  private shopUI: ShopUI;
  private researchUI: ResearchUI;
  private manaConversionUI: ManaConversionUI;
  private tutorialUI: TutorialUI;
  private portalInventoryUI: PortalInventoryUI;

  // DOM elements
  private moneyDisplay: HTMLElement | null;
  private manaDisplay: HTMLElement | null;
  
  // Modal elements
  private modalOverlay: HTMLElement | null;
  private modalTitle: HTMLElement | null;
  private modalContent: HTMLElement | null;
  private modalClose: HTMLElement | null;
  private currentModal: ModalType = null;

  // Last update data for modal re-renders
  private lastUpdateData: UIUpdateData | null = null;

  constructor(game: Game) {
    this.game = game;
    this.craftingUI = new CraftingUI(game, this);
    this.inventoryUI = new InventoryUI(game);
    this.customerUI = new CustomerUI(game);
    this.shopUI = new ShopUI(game);
    this.researchUI = new ResearchUI(game);
    this.manaConversionUI = new ManaConversionUI(game);
    this.tutorialUI = new TutorialUI();
    this.portalInventoryUI = new PortalInventoryUI(game);

    this.moneyDisplay = document.getElementById('money-display');
    this.manaDisplay = document.getElementById('mana-display');
    
    // Modal elements
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-content');
    this.modalClose = document.getElementById('modal-close');
  }

  public initialize(): void {
    this.craftingUI.initialize();
    this.inventoryUI.initialize();
    this.customerUI.initialize();
    this.shopUI.initialize();
    this.researchUI.initialize();
    this.manaConversionUI.initialize();
    this.tutorialUI.initialize();
    this.portalInventoryUI.initialize();
    
    this.setupModalHandlers();
  }

  private setupModalHandlers(): void {
    // Header buttons
    document.getElementById('shop-btn')?.addEventListener('click', () => this.openModal('shop'));
    document.getElementById('upgrades-btn')?.addEventListener('click', () => this.openModal('upgrades'));
    document.getElementById('research-btn')?.addEventListener('click', () => this.openModal('research'));
    document.getElementById('mana-converter-btn')?.addEventListener('click', () => this.openModal('mana-converter'));
    document.getElementById('recipes-btn')?.addEventListener('click', () => this.openModal('recipes'));
    
    // Close button
    this.modalClose?.addEventListener('click', () => this.closeModal());
    
    // Click outside to close
    this.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal();
      }
    });
  }

  private openModal(type: ModalType): void {
    if (!this.modalOverlay || !this.modalTitle || !this.modalContent) return;
    
    this.currentModal = type;
    this.game.pauseCustomerTimers();
    this.customerUI.setPaused(true);
    
    // Set modal title
    const titles: Record<string, string> = {
      'shop': '🛒 Mana Shop',
      'upgrades': '⬆️ Upgrades',
      'research': '🔬 Research',
      'mana-converter': '✨ Mana Converter',
      'recipes': '📖 Recipe Book'
    };
    this.modalTitle.textContent = titles[type || ''] || '';
    
    // Render modal content
    this.renderModalContent();
    
    // Show modal
    this.modalOverlay.classList.remove('hidden');
  }

  private closeModal(): void {
    if (!this.modalOverlay) return;
    
    this.currentModal = null;
    this.game.resumeCustomerTimers();
    this.customerUI.setPaused(false);
    this.modalOverlay.classList.add('hidden');
    
    // Force UI refresh to update customer cards with adjusted arrivedAt times
    this.game.refreshUI();
  }

  private renderModalContent(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    switch (this.currentModal) {
      case 'shop':
        this.renderShopModal();
        break;
      case 'upgrades':
        this.renderUpgradesModal();
        break;
      case 'research':
        this.renderResearchModal();
        break;
      case 'mana-converter':
        this.renderManaConverterModal();
        break;
      case 'recipes':
        this.renderRecipesModal();
        break;
    }
  }

  private renderShopModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    const { inventory } = this.lastUpdateData;
    const manaSystem = this.game.getManaSystem();
    const exchangeRate = manaSystem.getExchangeRate();
    const gold = inventory.getGold();

    const manaPackages = [
      { gold: 10, label: 'Small Mana Pack' },
      { gold: 50, label: 'Medium Mana Pack' },
      { gold: 100, label: 'Large Mana Pack' },
    ];

    let html = '<div class="exchange-rate-info">';
    html += `<p class="info-text">Current rate: <strong>${exchangeRate.manaPerGold} mana per gold</strong></p>`;
    html += '</div>';

    for (const pack of manaPackages) {
      const manaAmount = pack.gold * exchangeRate.manaPerGold;
      const canAfford = gold >= pack.gold;
      html += `
        <div class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">${pack.label}</div>
            <div class="shop-item-description">+${manaAmount} mana</div>
          </div>
          <button class="btn-secondary buy-mana-btn" data-gold="${pack.gold}" ${!canAfford ? 'disabled' : ''}>
            ${pack.gold} 💰
          </button>
        </div>
      `;
    }

    this.modalContent.innerHTML = html;

    // Add click handlers
    this.modalContent.querySelectorAll('.buy-mana-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const goldCost = parseInt((btn as HTMLElement).dataset.gold || '0', 10);
        this.game.purchaseMana(goldCost);
        this.renderShopModal();
      });
    });
  }

  private renderUpgradesModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    const { inventory, upgrades } = this.lastUpdateData;
    const allUpgrades = upgrades.getAllUpgrades();
    const gold = inventory.getGold();

    let html = '';

    for (const upgrade of allUpgrades) {
      const cost = upgrades.getUpgradeCost(upgrade.id);
      const canAfford = gold >= cost;
      const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;

      let effectInfo = '';
      if (upgrade.type === 'manaConversion' && upgrade.currentLevel > 0) {
        const effectValue = upgrades.getEffect(upgrade.id);
        const percentage = Math.round(effectValue * 100);
        effectInfo = `<div class="upgrade-effect">+${percentage}% efficiency</div>`;
      }

      html += `
        <div class="shop-item ${isMaxed ? 'maxed' : ''}">
          <div class="shop-item-info">
            <div class="shop-item-name">${upgrade.name}</div>
            <div class="shop-item-description">${upgrade.description}</div>
            ${effectInfo}
            <div class="shop-item-level">
              Level: ${upgrade.currentLevel}/${upgrade.maxLevel}
            </div>
          </div>
          <button 
            class="btn-secondary buy-upgrade-btn" 
            data-id="${upgrade.id}"
            ${!canAfford || isMaxed ? 'disabled' : ''}
          >
            ${isMaxed ? 'MAX' : `${formatNumber(cost)} 💰`}
          </button>
        </div>
      `;
    }

    this.modalContent.innerHTML = html;

    // Add click handlers
    this.modalContent.querySelectorAll('.buy-upgrade-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          this.game.purchaseUpgrade(id);
          this.renderUpgradesModal();
        }
      });
    });
  }

  private renderResearchModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    const { elements, inventory } = this.lastUpdateData;
    const allNodes = elements.getAllResearchNodes();
    const gold = inventory.getGold();

    let html = '';

    for (const node of allNodes) {
      const info = elements.getElementInfo(node.element);
      if (!info) continue;

      const canResearch = elements.canResearch(node.element);
      const canAfford = gold >= node.cost;

      html += `
        <div class="research-node ${node.unlocked ? 'unlocked' : 'locked'}">
          <div class="research-info">
            <span class="element-icon">${info.icon}</span>
            <span class="element-name">${info.name}</span>
            ${node.unlocked ? '<span class="unlocked-badge">✓</span>' : ''}
          </div>
          ${
            !node.unlocked
              ? `
            <button 
              class="btn-secondary research-btn" 
              data-element="${node.element}"
              ${!canResearch || !canAfford ? 'disabled' : ''}
            >
              ${formatNumber(node.cost)} 💰
            </button>
          `
              : ''
          }
        </div>
      `;
    }

    this.modalContent.innerHTML = html;

    // Add click handlers
    this.modalContent.querySelectorAll('.research-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const element = (btn as HTMLElement).dataset.element;
        if (element) {
          this.game.researchElement(element as any);
          this.renderResearchModal();
        }
      });
    });
  }

  private renderManaConverterModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    this.manaConversionUI.renderToElement(this.modalContent, this.lastUpdateData.inventory, this.lastUpdateData.elements);
  }

  private renderRecipesModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;
    
    this.researchUI.renderRecipesToElement(this.modalContent, this.lastUpdateData.inventory);
  }

  public getSelectedItem(): { type: 'ingredient' | 'equipment'; id: string } | null {
    return this.inventoryUI.getSelectedItem();
  }

  public clearSelection(): void {
    this.inventoryUI.clearSelection();
  }

  public update(data: UIUpdateData): void {
    this.lastUpdateData = data;
    
    // Update resource displays
    if (this.moneyDisplay) {
      this.moneyDisplay.textContent = `Gold: ${formatNumber(data.inventory.getGold())}`;
    }
    if (this.manaDisplay) {
      this.manaDisplay.textContent = `Mana: ${formatNumber(data.inventory.getMana())}`;
    }

    // Update all UI components
    this.craftingUI.update(data.crafting, data.inventory);
    this.inventoryUI.update(data.inventory, data.elements);
    this.customerUI.update(data.customers, data.storedPortals);
    this.researchUI.update(data.elements, data.inventory);
    this.tutorialUI.update();
    this.portalInventoryUI.update(data.storedPortals);
    
    // Update modal content if open
    if (this.currentModal) {
      this.renderModalContent();
    }
  }
}
