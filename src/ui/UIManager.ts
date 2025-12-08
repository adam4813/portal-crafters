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

type ModalType = 'shop' | 'upgrades' | 'research' | 'mana-converter' | 'recipes' | 'guide' | null;

export class UIManager {
  private game: Game;
  private craftingUI: CraftingUI;
  private inventoryUI: InventoryUI;
  private customerUI: CustomerUI;
  private shopUI: ShopUI;
  private researchUI: ResearchUI;
  private manaConversionUI: ManaConversionUI;
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
  private currentGuideSection: string = 'getting-started';
  private currentShopTab: 'mana' | 'items' | 'equipment' = 'mana';

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
    this.portalInventoryUI.initialize();
    
    this.setupModalHandlers();
  }

  private setupModalHandlers(): void {
    // Header buttons
    document.getElementById('guide-btn')?.addEventListener('click', () => this.openModal('guide'));
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
      'guide': '📚 Game Guide',
      'shop': '🛒 Mana Shop',
      'upgrades': '⬆️ Upgrades',
      'research': '🔬 Research',
      'mana-converter': '✨ Mana Converter',
      'recipes': '📖 Recipe Book'
    };
    this.modalTitle.textContent = titles[type || ''] || '';
    
    // Apply modal size classes
    const modalContainer = this.modalOverlay.querySelector('.modal-container');
    if (modalContainer) {
      modalContainer.classList.remove('guide-modal');
      if (type === 'guide') {
        modalContainer.classList.add('guide-modal');
      }
    }
    
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
      case 'guide':
        this.renderGuideModal();
        break;
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

    const shopItems = [
      { id: 'health_potion', name: 'Health Potion', description: '+10% gold from portals', cost: 25, goldReward: 0 },
      { id: 'mana_crystal', name: 'Mana Crystal', description: '+15% mana from portals', cost: 40, goldReward: 0 },
      { id: 'lucky_charm', name: 'Lucky Charm', description: '+10% ingredient drop chance', cost: 50, goldReward: 0 },
      { id: 'treasure_map', name: 'Treasure Map', description: '+25% gold from portals', cost: 75, goldReward: 0 },
      { id: 'enchanted_lens', name: 'Enchanted Lens', description: '+10% equipment chance, +1 rarity', cost: 100, goldReward: 0 },
      { id: 'philosophers_stone', name: "Philosopher's Stone", description: '+20% gold/mana, +5% ingredients, +2 rarity', cost: 250, goldReward: 0 },
      { id: 'debug_gold_grant', name: '[DEBUG] Gold Grant', description: 'Gives 1000 gold for testing', cost: 0, goldReward: 1000 },
      { id: 'debug_gold_sink', name: '[DEBUG] Gold Sink', description: 'Burns 100 gold for testing', cost: 100, goldReward: 0 },
    ];

    const shopEquipment = [
      { id: 'rusty_sword', name: '🗡️ Rusty Sword', description: 'Common weapon, +5 portal bonus', cost: 50 },
      { id: 'leather_armor', name: '🥋 Leather Armor', description: 'Common armor, +3 portal bonus', cost: 40 },
      { id: 'copper_ring', name: '💍 Copper Ring', description: 'Common accessory, +2 portal bonus', cost: 30 },
      { id: 'iron_sword', name: '⚔️ Iron Sword', description: 'Uncommon weapon, +10 portal bonus, +2 earth', cost: 120 },
      { id: 'chainmail', name: '🛡️ Chainmail', description: 'Uncommon armor, +8 portal bonus', cost: 100 },
    ];

    // Build tabs
    let html = `
      <div class="shop-tabs">
        <button class="shop-tab ${this.currentShopTab === 'mana' ? 'active' : ''}" data-tab="mana">✨ Mana</button>
        <button class="shop-tab ${this.currentShopTab === 'items' ? 'active' : ''}" data-tab="items">🧪 Items</button>
        <button class="shop-tab ${this.currentShopTab === 'equipment' ? 'active' : ''}" data-tab="equipment">⚔️ Equipment</button>
      </div>
      <div class="shop-gold-display">Your Gold: <strong>${gold} 💰</strong></div>
      <div class="shop-tab-content">
    `;

    if (this.currentShopTab === 'mana') {
      html += '<div class="exchange-rate-info">';
      html += `<p class="info-text">Current rate: <strong>${exchangeRate.manaPerGold} mana per gold</strong></p>`;
      html += '</div>';

      for (const pack of manaPackages) {
        const manaAmount = pack.gold * exchangeRate.manaPerGold;
        const canAfford = gold >= pack.gold;
        html += `
          <div class="shop-item ${!canAfford ? 'cannot-afford' : ''}">
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
    } else if (this.currentShopTab === 'items') {
      for (const item of shopItems) {
        const canAfford = gold >= item.cost;
        html += `
          <div class="shop-item ${!canAfford ? 'cannot-afford' : ''}">
            <div class="shop-item-info">
              <div class="shop-item-name">${item.name}</div>
              <div class="shop-item-description">${item.description}</div>
            </div>
            <button class="btn-secondary buy-item-btn" data-id="${item.id}" data-cost="${item.cost}" data-reward="${item.goldReward}" ${!canAfford ? 'disabled' : ''}>
              ${item.cost === 0 ? 'FREE' : `${item.cost} 💰`}
            </button>
          </div>
        `;
      }
    } else if (this.currentShopTab === 'equipment') {
      for (const equip of shopEquipment) {
        const canAfford = gold >= equip.cost;
        html += `
          <div class="shop-item ${!canAfford ? 'cannot-afford' : ''}">
            <div class="shop-item-info">
              <div class="shop-item-name">${equip.name}</div>
              <div class="shop-item-description">${equip.description}</div>
            </div>
            <button class="btn-secondary buy-equip-btn" data-id="${equip.id}" data-cost="${equip.cost}" ${!canAfford ? 'disabled' : ''}>
              ${equip.cost} 💰
            </button>
          </div>
        `;
      }
    }

    html += '</div>';
    this.modalContent.innerHTML = html;

    // Add click handlers for tabs
    this.modalContent.querySelectorAll('.shop-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.currentShopTab = (tab as HTMLElement).dataset.tab as 'mana' | 'items' | 'equipment';
        this.renderShopModal();
      });
    });

    // Add click handlers for mana packs
    this.modalContent.querySelectorAll('.buy-mana-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const goldCost = parseInt((btn as HTMLElement).dataset.gold || '0', 10);
        this.game.purchaseMana(goldCost);
        this.renderShopModal();
      });
    });

    // Add click handlers for shop items
    this.modalContent.querySelectorAll('.buy-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id || '';
        const cost = parseInt((btn as HTMLElement).dataset.cost || '0', 10);
        const reward = parseInt((btn as HTMLElement).dataset.reward || '0', 10);
        const inv = this.game.getInventory();
        if (inv.canAfford(cost)) {
          inv.spendGold(cost);
          if (reward > 0) {
            inv.addGold(reward);
          }
          // Add non-debug items to inventory as ingredients
          if (!id.startsWith('debug_')) {
            inv.addIngredient(id, 1);
          }
          this.game.refreshUI();
        }
      });
    });

    // Add click handlers for equipment purchases
    this.modalContent.querySelectorAll('.buy-equip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id || '';
        const cost = parseInt((btn as HTMLElement).dataset.cost || '0', 10);
        const inv = this.game.getInventory();
        if (inv.canAfford(cost)) {
          inv.spendGold(cost);
          inv.addEquipment(id, 1);
          this.game.refreshUI();
        }
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

  private renderGuideModal(): void {
    if (!this.modalContent) return;

    const sections = [
      { id: 'getting-started', label: '🎮 Getting Started' },
      { id: 'mana-gold', label: '💰 Mana & Gold' },
      { id: 'shop', label: '🛒 Shop' },
      { id: 'upgrades', label: '⬆️ Upgrades' },
      { id: 'research', label: '🔬 Research' },
      { id: 'recipes', label: '📖 Recipes' },
      { id: 'crafting', label: '🔮 Crafting' },
      { id: 'elements', label: '✨ Elements' },
      { id: 'contracts', label: '📜 Contracts' },
      { id: 'mana-converter', label: '🔄 Mana Converter' },
    ];

    let navHtml = '<ul class="guide-nav">';
    for (const section of sections) {
      const activeClass = this.currentGuideSection === section.id ? 'active' : '';
      navHtml += `<li class="guide-nav-item ${activeClass}" data-section="${section.id}">${section.label}</li>`;
    }
    navHtml += '</ul>';

    const contentHtml = this.getGuideContent(this.currentGuideSection);

    this.modalContent.innerHTML = `
      <div class="guide-layout">
        <nav class="guide-sidebar">${navHtml}</nav>
        <div class="guide-content">${contentHtml}</div>
      </div>
    `;

    // Add click handlers for navigation
    this.modalContent.querySelectorAll('.guide-nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        this.currentGuideSection = (item as HTMLElement).dataset.section || 'getting-started';
        this.renderGuideModal();
      });
    });
  }

  private getGuideContent(sectionId: string): string {
    const content: Record<string, string> = {
      'getting-started': `
        <h4>Welcome to Portal Crafters!</h4>
        <p>Your goal is to craft magical portals and fulfill customer contracts to earn gold.</p>
        <div class="guide-steps">
          <div class="guide-step"><span class="step-num">1</span> <strong>Buy Mana</strong> - Use gold to purchase mana from the Shop</div>
          <div class="guide-step"><span class="step-num">2</span> <strong>Convert Mana</strong> - Transform mana into elemental energy using the Mana Converter</div>
          <div class="guide-step"><span class="step-num">3</span> <strong>Add Power</strong> - Add Raw Mana and Elements to your portal to increase its level</div>
          <div class="guide-step"><span class="step-num">4</span> <strong>Add Items</strong> - Place items in crafting slots for bonus effects (gold%, mana%, etc.)</div>
          <div class="guide-step"><span class="step-num">5</span> <strong>Craft Portal</strong> - Click "Craft Portal" to create and store your portal</div>
          <div class="guide-step"><span class="step-num">6</span> <strong>Fulfill Contracts</strong> - Match your portals to customer requirements</div>
        </div>
      `,
      'mana-gold': `
        <h4>Mana & Gold</h4>
        <p><strong>Gold 💰</strong> is earned by fulfilling customer contracts. Use it to:</p>
        <ul>
          <li>Purchase mana from the Shop</li>
          <li>Buy items with special portal effects</li>
          <li>Buy upgrades to improve your crafting</li>
          <li>Research new elements</li>
        </ul>
        <p><strong>Mana ✨</strong> is magical energy. It can be used two ways:</p>
        <ul>
          <li><strong>Raw Mana</strong> - Add directly to portals for power (use +/- buttons in crafting)</li>
          <li><strong>Convert to Elements</strong> - Transform into elemental energy using the Mana Converter</li>
        </ul>
      `,
      'shop': `
        <h4>Shop</h4>
        <p><strong>Mana Packs:</strong> Exchange gold for mana.</p>
        <ul>
          <li><strong>Small Pack</strong> - 10 gold</li>
          <li><strong>Medium Pack</strong> - 50 gold</li>
          <li><strong>Large Pack</strong> - 100 gold</li>
        </ul>
        <p><strong>Items:</strong> Purchase items with special portal effects:</p>
        <ul>
          <li><strong>Health Potion</strong> - +10% gold from portals</li>
          <li><strong>Mana Crystal</strong> - +15% mana from portals</li>
          <li><strong>Lucky Charm</strong> - +10% ingredient drop chance</li>
          <li><strong>Treasure Map</strong> - +25% gold from portals</li>
          <li><strong>Enchanted Lens</strong> - +10% equipment chance, +1 rarity</li>
          <li><strong>Philosopher's Stone</strong> - Multiple bonuses combined</li>
        </ul>
        <p>Items go to your inventory and can be placed in crafting slots.</p>
      `,
      'upgrades': `
        <h4>Upgrades</h4>
        <p>Upgrades permanently improve your crafting abilities:</p>
        <ul>
          <li><strong>Mana Conversion</strong> - Increases efficiency when converting mana to elements</li>
          <li><strong>Reward Chance</strong> - Increases chance of bonus rewards from contracts</li>
        </ul>
        <p>Each upgrade can be leveled up multiple times for stronger effects.</p>
      `,
      'research': `
        <h4>Research</h4>
        <p>Research unlocks new elements for your portals:</p>
        <ul>
          <li><strong>Fire 🔥</strong> and <strong>Water 💧</strong> - Available from start</li>
          <li><strong>Earth 🌿</strong> - Unlockable</li>
          <li><strong>Air 💨</strong> - Unlockable</li>
          <li><strong>Lightning ⚡</strong> - Unlockable</li>
        </ul>
        <p>Some elements require prerequisites before they can be researched.</p>
        <p>Each element has a <strong>potency multiplier</strong> that affects how much power it contributes.</p>
      `,
      'recipes': `
        <h4>Recipe Book</h4>
        <p>Recipes are discovered by combining ingredients in the crafting slots.</p>
        <ul>
          <li>Experiment with different ingredient combinations</li>
          <li>Discovered recipes are saved for future reference</li>
          <li>Click a recipe to auto-fill your crafting slots (if you have the ingredients)</li>
        </ul>
        <p>Bright icons mean you own the ingredient, faded icons mean you're missing it.</p>
      `,
      'crafting': `
        <h4>Portal Crafting</h4>
        <p><strong>Portal Level</strong> is determined by:</p>
        <ul>
          <li><strong>Raw Mana</strong> - Add mana directly using the +/- buttons</li>
          <li><strong>Elements</strong> - Each element contributes power based on its potency</li>
        </ul>
        <p><strong>Item Effects</strong> (shown below crafting slots):</p>
        <ul>
          <li>Place items in slots to add bonus effects to the portal</li>
          <li>Effects include: Gold%, Mana%, Ingredient Chance%, Equipment Chance%, Rarity</li>
          <li>Hover over a slot to highlight which effects that item provides</li>
        </ul>
        <p><strong>Element Affinity:</strong> Some ingredients add bonus elements when crafted (e.g., Fire Crystal adds +5 fire).</p>
      `,
      'elements': `
        <h4>Elements</h4>
        <p>Elements define the magical aspect of your portals:</p>
        <ul>
          <li>🔥 <strong>Fire</strong> - Passionate, energetic portals</li>
          <li>💧 <strong>Water</strong> - Calm, flowing portals</li>
          <li>🌿 <strong>Earth</strong> - Stable, grounded portals</li>
          <li>💨 <strong>Air</strong> - Light, swift portals</li>
          <li>⚡ <strong>Lightning</strong> - Powerful, electric portals</li>
        </ul>
        <p><strong>Element Potency:</strong> Each element has a power multiplier (shown as 1x, 1.2x, etc.) that affects how much it contributes to portal level.</p>
        <p>Use the +/- buttons next to each element in the crafting area to adjust amounts.</p>
      `,
      'contracts': `
        <h4>Contracts</h4>
        <p>Customers arrive with portal requests. Each contract shows:</p>
        <ul>
          <li><strong>Level Requirement</strong> - Minimum portal level needed</li>
          <li><strong>Element Requirements</strong> - Required elements and amounts</li>
          <li><strong>Payment</strong> - Gold reward for completion</li>
          <li><strong>Timer</strong> - Time before customer leaves</li>
        </ul>
        <p>Fulfill contracts by selecting a matching portal from your inventory.</p>
        <p><strong>Tip:</strong> Higher level portals and those with item effects may give bonus rewards!</p>
      `,
      'mana-converter': `
        <h4>Mana Converter</h4>
        <p>Transform mana into elemental energy:</p>
        <ol>
          <li>Select an element type to convert to</li>
          <li>Choose the amount to convert</li>
          <li>Click "Convert" to receive the elements</li>
        </ol>
        <p><strong>Conversion Rates:</strong> Different elements may require different amounts of mana. Upgrades can improve conversion efficiency.</p>
        <p><strong>Tip:</strong> You can also add Raw Mana directly to portals without converting it!</p>
      `,
    };

    return content[sectionId] || '<p>Section not found.</p>';
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
    this.portalInventoryUI.update(data.storedPortals);
    
    // Update modal content if open
    if (this.currentModal) {
      this.renderModalContent();
    }
  }
}
