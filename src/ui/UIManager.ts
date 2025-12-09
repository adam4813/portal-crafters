import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { CustomerSystem } from '../game/Customer';
import type { ElementSystem } from '../game/ElementSystem';
import type { UpgradeSystem } from '../game/UpgradeSystem';
import type { ProgressionSystem } from '../game/ProgressionSystem';
import type { ExpeditionSystem } from '../game/ExpeditionSystem';
import type { Portal } from '../game/Portal';
import type { GameState, Portal as PortalType, ElementType } from '../types';
import { CraftingUI } from './CraftingUI';
import { InventoryUI } from './InventoryUI';
import { CustomerUI } from './CustomerUI';
import { ShopUI } from './ShopUI';
import { ResearchUI } from './ResearchUI';
import { ManaConversionUI } from './ManaConversionUI';
import { PortalInventoryUI } from './PortalInventoryUI';
import { ExpeditionUI } from './ExpeditionUI';
import { formatNumber } from '../utils/helpers';
import { getIngredientById } from '../data/ingredients';
import { extractTagsFromGeneratedEquipment } from '../data/portalTypes';
import { getEquipmentById } from '../data/equipment';
import type { PortalTypeDefinition } from '../data/portalTypes';

export interface UIUpdateData {
  inventory: InventorySystem;
  crafting: CraftingSystem;
  customers: CustomerSystem;
  elements: ElementSystem;
  upgrades: UpgradeSystem;
  portal: Portal;
  gameState: GameState;
  storedPortals: PortalType[];
  progression: ProgressionSystem;
  expeditions: ExpeditionSystem;
}

type ModalType =
  | 'shop'
  | 'upgrades'
  | 'research'
  | 'mana-converter'
  | 'recipes'
  | 'guide'
  | 'pause'
  | 'expeditions'
  | 'inventory'
  | 'portals'
  | null;

export class UIManager {
  private game: Game;
  private craftingUI: CraftingUI;
  private inventoryUI: InventoryUI;
  private customerUI: CustomerUI;
  private shopUI: ShopUI;
  private researchUI: ResearchUI;
  private manaConversionUI: ManaConversionUI;
  private portalInventoryUI: PortalInventoryUI;
  private expeditionUI: ExpeditionUI;

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

  // Cache for discovered portal types (invalidated on portal craft)
  private discoveredPortalTypesCache: Set<string> | null = null;

  constructor(game: Game) {
    this.game = game;
    this.craftingUI = new CraftingUI(game, this);
    this.inventoryUI = new InventoryUI(game);
    this.customerUI = new CustomerUI(game);
    this.shopUI = new ShopUI(game);
    this.researchUI = new ResearchUI(game);
    this.manaConversionUI = new ManaConversionUI(game);
    this.portalInventoryUI = new PortalInventoryUI(game);
    this.expeditionUI = new ExpeditionUI(game);

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
    this.expeditionUI.initialize();
    this.setupModalHandlers();
    this.setupNavigation();
  }

  private setupNavigation(): void {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    // Create overlay for mobile menu
    const navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.id = 'nav-overlay';
    document.body.appendChild(navOverlay);

    menuToggle?.addEventListener('click', () => {
      mainNav?.classList.toggle('open');
      navOverlay.classList.toggle('open');
    });

    navOverlay.addEventListener('click', () => {
      mainNav?.classList.remove('open');
      navOverlay.classList.remove('open');
    });

    // Close nav when a button is clicked (mobile)
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        mainNav?.classList.remove('open');
        navOverlay.classList.remove('open');
      });
    });
  }

  private setupModalHandlers(): void {
    // Nav buttons
    document.getElementById('pause-btn')?.addEventListener('click', () => this.openModal('pause'));
    document.getElementById('guide-btn')?.addEventListener('click', () => this.openModal('guide'));
    document.getElementById('shop-btn')?.addEventListener('click', () => this.openModal('shop'));
    document
      .getElementById('upgrades-btn')
      ?.addEventListener('click', () => this.openModal('upgrades'));
    document
      .getElementById('research-btn')
      ?.addEventListener('click', () => this.openModal('research'));
    document
      .getElementById('recipes-btn')
      ?.addEventListener('click', () => this.openModal('recipes'));
    document
      .getElementById('inventory-btn')
      ?.addEventListener('click', () => this.openModal('inventory'));
    document
      .getElementById('portals-btn')
      ?.addEventListener('click', () => this.openModal('portals'));

    // Other buttons
    document
      .getElementById('start-expedition-btn')
      ?.addEventListener('click', () => this.openModal('expeditions'));

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
      pause: '⏸️ Game Paused',
      guide: '📚 Game Guide',
      expeditions: '🗺️ Expeditions',
      shop: '🛒 Mana Shop',
      upgrades: '⬆️ Upgrades',
      research: '🔬 Research',
      'mana-converter': '✨ Mana Converter',
      recipes: '📖 Recipe Book',
      inventory: '🎒 Inventory',
      portals: '🌀 Crafted Portals',
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
      case 'pause':
        this.renderPauseModal();
        break;
      case 'guide':
        this.renderGuideModal();
        break;
      case 'expeditions':
        this.renderExpeditionsModal();
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
      case 'inventory':
        this.renderInventoryModal();
        break;
      case 'portals':
        this.renderPortalsModal();
        break;
    }
  }

  private renderInventoryModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;

    // Use the CraftingUI's slot picker modal content rendering
    this.craftingUI.renderInventoryModalContent(this.modalContent);
  }

  private renderPortalsModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;

    // Render stored portals
    this.portalInventoryUI.renderToModal(this.modalContent, this.lastUpdateData.storedPortals);
  }

  private renderExpeditionsModal(): void {
    if (!this.modalContent || !this.lastUpdateData) return;

    const { expeditions, storedPortals } = this.lastUpdateData;

    this.modalContent.innerHTML = this.expeditionUI.render(expeditions, storedPortals);
    this.expeditionUI.attachEventListeners();
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
      {
        id: 'health_potion',
        name: 'Health Potion',
        description: '+10% gold from portals',
        cost: 25,
        goldReward: 0,
      },
      {
        id: 'mana_crystal',
        name: 'Mana Crystal',
        description: '+15% mana from portals',
        cost: 40,
        goldReward: 0,
      },
      {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        description: '+10% ingredient drop chance',
        cost: 50,
        goldReward: 0,
      },
      {
        id: 'treasure_map',
        name: 'Treasure Map',
        description: '+25% gold from portals',
        cost: 75,
        goldReward: 0,
      },
      {
        id: 'enchanted_lens',
        name: 'Enchanted Lens',
        description: '+10% equipment chance, +1 rarity',
        cost: 100,
        goldReward: 0,
      },
      {
        id: 'philosophers_stone',
        name: "Philosopher's Stone",
        description: '+20% gold/mana, +5% ingredients, +2 rarity',
        cost: 250,
        goldReward: 0,
      },
      {
        id: 'debug_gold_grant',
        name: '[DEBUG] Gold Grant',
        description: 'Gives 1000 gold for testing',
        cost: 0,
        goldReward: 1000,
      },
      {
        id: 'debug_gold_sink',
        name: '[DEBUG] Gold Sink',
        description: 'Burns 100 gold for testing',
        cost: 100,
        goldReward: 0,
      },
    ];

    const shopEquipment = [
      {
        id: 'rusty_sword',
        name: '🗡️ Rusty Sword',
        description: 'Common weapon, +5 portal bonus',
        cost: 50,
      },
      {
        id: 'leather_armor',
        name: '🥋 Leather Armor',
        description: 'Common armor, +3 portal bonus',
        cost: 40,
      },
      {
        id: 'copper_ring',
        name: '💍 Copper Ring',
        description: 'Common accessory, +2 portal bonus',
        cost: 30,
      },
      {
        id: 'iron_sword',
        name: '⚔️ Iron Sword',
        description: 'Uncommon weapon, +10 portal bonus, +2 earth',
        cost: 120,
      },
      {
        id: 'chainmail',
        name: '🛡️ Chainmail',
        description: 'Uncommon armor, +8 portal bonus',
        cost: 100,
      },
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

    this.manaConversionUI.renderToElement(
      this.modalContent,
      this.lastUpdateData.inventory,
      this.lastUpdateData.elements
    );
  }

  private async renderRecipesModal(): Promise<void> {
    if (!this.modalContent || !this.lastUpdateData) return;

    const { inventory } = this.lastUpdateData;
    const storedPortals = this.game.getStoredPortals();

    try {
      // Import portal type functions dynamically
      const { getDiscoveredPortalTypes, getAllPortalTypes } = await import('../data/portalTypes');

      // Use cached discovered types if available, otherwise calculate
      if (!this.discoveredPortalTypesCache) {
        this.discoveredPortalTypesCache = getDiscoveredPortalTypes(
          storedPortals.map((p) => ({
            elements: p.elements,
            ingredients: p.ingredients,
            equipment: p.equipment || [],
            generatedEquipmentAttributes: p.generatedEquipmentAttributes || [],
          }))
        );
      }
      const discovered = this.discoveredPortalTypesCache;
      const allTypes = getAllPortalTypes();

      let html = `
        <div class="recipes-tabs">
          <button class="recipe-tab active" data-tab="ingredient-recipes">🧪 Ingredient Recipes</button>
          <button class="recipe-tab" data-tab="portal-types">🌀 Portal Types</button>
        </div>
        <div class="recipes-content">
          <div id="ingredient-recipes-tab" class="recipe-tab-content active"></div>
          <div id="portal-types-tab" class="recipe-tab-content hidden"></div>
        </div>
      `;

      this.modalContent!.innerHTML = html;

      // Render ingredient recipes
      const ingredientTab = this.modalContent!.querySelector(
        '#ingredient-recipes-tab'
      ) as HTMLElement;
      if (ingredientTab) {
        this.researchUI.renderRecipesToElement(ingredientTab, inventory);
      }

      // Render portal types
      const portalTypesTab = this.modalContent!.querySelector('#portal-types-tab') as HTMLElement;
      if (portalTypesTab) {
        this.renderPortalTypesTab(portalTypesTab, allTypes, discovered, inventory);
      }

      // Setup tab switching
      this.modalContent!.querySelectorAll('.recipe-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          const tabName = (tab as HTMLElement).dataset.tab;
          this.modalContent!.querySelectorAll('.recipe-tab').forEach((t) =>
            t.classList.remove('active')
          );
          tab.classList.add('active');

          this.modalContent!.querySelectorAll('.recipe-tab-content').forEach((content) => {
            content.classList.add('hidden');
            content.classList.remove('active');
          });

          const targetTab = this.modalContent!.querySelector(`#${tabName}-tab`);
          if (targetTab) {
            targetTab.classList.remove('hidden');
            targetTab.classList.add('active');
          }
        });
      });
    } catch (error) {
      console.error('Failed to load portal types:', error);
      this.modalContent!.innerHTML =
        '<p class="error-message">Failed to load recipe book. Please try again.</p>';
    }
  }

  // Method to invalidate cache when a new portal is crafted
  public invalidatePortalTypesCache(): void {
    this.discoveredPortalTypesCache = null;
  }

  private renderPortalTypesTab(
    container: HTMLElement,
    allTypes: PortalTypeDefinition[],
    discovered: Set<string>,
    inventory: InventorySystem
  ): void {
    if (discovered.size === 0) {
      container.innerHTML = `
        <p class="empty-message">No portal types discovered yet.</p>
        <p class="info-text">Craft portals with different element, ingredient, and equipment combinations to discover portal types!</p>
      `;
      return;
    }

    // Group by tier
    const tiers: Array<'legendary' | 'epic' | 'rare' | 'uncommon' | 'common'> = [
      'legendary',
      'epic',
      'rare',
      'uncommon',
      'common',
    ];
    let html = '';

    for (const tier of tiers) {
      const tierTypes = allTypes.filter((t) => t.tier === tier && discovered.has(t.id));
      if (tierTypes.length === 0) continue;

      html += `<div class="portal-types-tier">`;
      html += `<h4 class="tier-header tier-${tier}">${tier.charAt(0).toUpperCase() + tier.slice(1)} Portals</h4>`;

      for (const portalType of tierTypes) {
        // Check if player has required elements
        const hasElements = this.checkHasElements(portalType.requiredElements, inventory);
        const hasTags = this.checkHasTags(portalType.requiredTags, inventory);
        const canCraft = hasElements && hasTags;

        // Build requirements display
        const elementReqs = Object.entries(portalType.requiredElements)
          .map(([element, amount]) => `${element}: ${amount}`)
          .join(', ');

        const tagReqs = portalType.requiredTags
          ? portalType.requiredTags.map((tag) => this.capitalizeFirst(tag)).join(' OR ')
          : 'None';

        const clickableClass = canCraft ? 'portal-type-clickable' : 'portal-type-locked';
        const tooltip = canCraft
          ? 'Click to pre-fill crafting slots'
          : 'Missing required resources';

        html += `
          <div class="portal-type-entry ${clickableClass}" data-portal-type-id="${portalType.id}" title="${tooltip}">
            <div class="portal-type-header">
              <span class="portal-type-icon">${portalType.icon}</span>
              <span class="portal-type-name">${portalType.name}</span>
              <span class="portal-type-affinity">${portalType.affinity}</span>
            </div>
            <div class="portal-type-description">${portalType.description}</div>
            <div class="portal-type-requirements">
              <strong>Elements:</strong> ${elementReqs || 'None'}
              ${portalType.requiredTags ? `<br><strong>Tags:</strong> ${tagReqs}` : ''}
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    container.innerHTML = html;

    // Add click handlers for clickable portal types
    container.querySelectorAll('.portal-type-clickable').forEach((typeEl) => {
      typeEl.addEventListener('click', () => {
        const typeId = (typeEl as HTMLElement).dataset.portalTypeId;
        if (typeId) {
          this.handlePortalTypeClick(typeId);
        }
      });
    });
  }

  private checkHasElements(
    requiredElements: Partial<Record<ElementType, number>>,
    inventory: InventorySystem
  ): boolean {
    for (const [element, amount] of Object.entries(requiredElements)) {
      if (!inventory.hasElement(element as ElementType, amount as number)) {
        return false;
      }
    }
    return true;
  }

  private checkHasTags(requiredTags: string[] | undefined, inventory: InventorySystem): boolean {
    if (!requiredTags || requiredTags.length === 0) return true;

    // Check if any ingredient or equipment in inventory has one of the required tags
    const inventoryState = inventory.getState();

    // Check ingredients
    for (const ingredientId of Object.keys(inventoryState.ingredients)) {
      if (inventoryState.ingredients[ingredientId] > 0) {
        const ingredient = getIngredientById(ingredientId);
        if (ingredient?.tags) {
          for (const tag of requiredTags) {
            if (ingredient.tags.includes(tag)) {
              return true;
            }
          }
        }
      }
    }

    // Check equipment (basic items)
    for (const equipmentId of Object.keys(inventoryState.equipment)) {
      if (inventoryState.equipment[equipmentId] > 0) {
        const equipment = getEquipmentById(equipmentId);
        if (equipment?.tags) {
          for (const tag of requiredTags) {
            if (equipment.tags.includes(tag)) {
              return true;
            }
          }
        }
      }
    }

    // Check generated equipment
    if (inventoryState.generatedEquipment) {
      for (const generatedId of Object.keys(inventoryState.generatedEquipment)) {
        const generated = inventoryState.generatedEquipment[generatedId];
        const tags = extractTagsFromGeneratedEquipment(generated);

        for (const tag of requiredTags) {
          if (tags.includes(tag)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async handlePortalTypeClick(typeId: string): Promise<void> {
    try {
      const { getPortalTypeById } = await import('../data/portalTypes');
      const { showToast } = await import('../utils/helpers');
      const portalType = getPortalTypeById(typeId);
      if (!portalType) return;

      const inventory = this.game.getInventory();

      // Validate resources before adding
      const hasElements = this.checkHasElements(portalType.requiredElements, inventory);
      const hasTags = this.checkHasTags(portalType.requiredTags, inventory);

      if (!hasElements || !hasTags) {
        showToast('Missing required resources to pre-fill this recipe!', 'error');
        return;
      }

      // Add required elements to portal
      for (const [element, amount] of Object.entries(portalType.requiredElements)) {
        this.game.addElementToPortal(element as ElementType, amount as number);
      }

      // Try to add an item with required tag to a crafting slot
      if (portalType.requiredTags && portalType.requiredTags.length > 0) {
        const crafting = this.game.getCrafting();
        const inventoryState = inventory.getState();

        // Find first available item (ingredient, equipment, or generated equipment) with required tag and empty slot
        let itemAdded = false;

        for (const tag of portalType.requiredTags) {
          if (itemAdded) break;

          // Try ingredients first
          for (const ingredientId of Object.keys(inventoryState.ingredients)) {
            if (inventoryState.ingredients[ingredientId] > 0) {
              const ingredient = getIngredientById(ingredientId);
              if (ingredient?.tags && ingredient.tags.includes(tag)) {
                const slots = crafting.getSlots();
                const emptySlot = slots.find((s) => !s.ingredient && !s.equipment);
                if (emptySlot) {
                  crafting.addIngredientToSlot(emptySlot.index, ingredientId);
                  inventory.removeIngredient(ingredientId, 1);
                  itemAdded = true;
                  break;
                }
              }
            }
          }
          if (itemAdded) break;

          // Try basic equipment next
          for (const equipmentId of Object.keys(inventoryState.equipment)) {
            if (inventoryState.equipment[equipmentId] > 0) {
              const equipment = getEquipmentById(equipmentId);
              if (equipment?.tags && equipment.tags.includes(tag)) {
                const slots = crafting.getSlots();
                const emptySlot = slots.find((s) => !s.ingredient && !s.equipment);
                if (emptySlot) {
                  crafting.addEquipmentToSlot(emptySlot.index, equipmentId);
                  inventory.removeEquipment(equipmentId, 1);
                  itemAdded = true;
                  break;
                }
              }
            }
          }
          if (itemAdded) break;

          // Try generated equipment last
          if (inventoryState.generatedEquipment) {
            for (const generatedId of Object.keys(inventoryState.generatedEquipment)) {
              const generated = inventoryState.generatedEquipment[generatedId];
              const tags = extractTagsFromGeneratedEquipment(generated);

              if (tags.includes(tag)) {
                const slots = crafting.getSlots();
                const emptySlot = slots.find((s) => !s.ingredient && !s.equipment);
                if (emptySlot) {
                  this.game.addGeneratedEquipmentToSlot(emptySlot.index, generatedId);
                  itemAdded = true;
                  break;
                }
              }
            }
          }
        }
      }

      this.closeModal();
      this.game.refreshUI();
      showToast(`Pre-filled crafting with ${portalType.name} recipe!`, 'success');
    } catch (error) {
      console.error('Failed to pre-fill portal type:', error);
      const { showToast } = await import('../utils/helpers');
      showToast('Failed to pre-fill recipe. Please try again.', 'error');
    }
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
      { id: 'expeditions', label: '🗺️ Expeditions' },
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
      shop: `
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
      upgrades: `
        <h4>Upgrades</h4>
        <p>Upgrades permanently improve your crafting abilities:</p>
        <ul>
          <li><strong>Mana Conversion</strong> - Increases efficiency when converting mana to elements</li>
          <li><strong>Reward Chance</strong> - Increases chance of bonus rewards from contracts</li>
        </ul>
        <p>Each upgrade can be leveled up multiple times for stronger effects.</p>
      `,
      research: `
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
      recipes: `
        <h4>Recipe Book</h4>
        <p>Recipes are discovered by combining ingredients in the crafting slots.</p>
        <ul>
          <li>Experiment with different ingredient combinations</li>
          <li>Discovered recipes are saved for future reference</li>
          <li>Click a recipe to auto-fill your crafting slots (if you have the ingredients)</li>
        </ul>
        <p>Bright icons mean you own the ingredient, faded icons mean you're missing it.</p>
      `,
      crafting: `
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
      elements: `
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
      contracts: `
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
      expeditions: `
        <h4>Expeditions</h4>
        <p>Send your crafted portals on expeditions to gather resources!</p>
        <ul>
          <li><strong>Portal Consumed</strong> - The portal is used up when sent on an expedition</li>
          <li><strong>Duration</strong> - Higher level portals take longer but yield better rewards</li>
          <li><strong>Elements Matter</strong> - The portal's elemental composition determines what resources you can find</li>
        </ul>
        <p><strong>Duration by Level:</strong></p>
        <ul>
          <li>Level 1: ~1 minute</li>
          <li>Level 2: ~2 minutes</li>
          <li>Level 3: ~3 minutes</li>
          <li>Level 4: ~5 minutes</li>
          <li>Level 5+: 7+ minutes</li>
        </ul>
        <p><strong>Tip:</strong> Hover over an active expedition to see potential rewards. High mana investment can slightly reduce expedition time!</p>
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

  private renderPauseModal(): void {
    if (!this.modalContent) return;

    const html = `
      <div class="pause-menu-content">
        <p class="pause-message">The game is paused. Customer timers and spawns are frozen.</p>
        
        <div class="pause-actions">
          <button id="resume-game-btn" class="btn-primary pause-action-btn">▶️ Resume Game</button>
          <button id="save-game-btn" class="btn-secondary pause-action-btn">💾 Save Game</button>
        </div>
        
        <div class="pause-info">
          <h4>Game Statistics</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Portals Crafted:</span>
              <span class="stat-value">${formatNumber(this.lastUpdateData?.gameState.totalPortalsCreated || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Customers Served:</span>
              <span class="stat-value">${formatNumber(this.lastUpdateData?.gameState.totalCustomersServed || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Gold Earned:</span>
              <span class="stat-value">${formatNumber(this.lastUpdateData?.gameState.totalGoldEarned || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Play Time:</span>
              <span class="stat-value">${this.formatPlayTime(this.lastUpdateData?.gameState.playTime || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalContent.innerHTML = html;

    // Add event listeners
    document.getElementById('resume-game-btn')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('save-game-btn')?.addEventListener('click', () => {
      this.game.saveGame();
    });
  }

  private formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
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
    this.customerUI.update(data.customers, data.storedPortals, data.progression, data.elements);
    this.researchUI.update(data.elements, data.inventory);
    this.portalInventoryUI.update(data.storedPortals);

    // Update active expeditions in sidebar
    const activeExpeditionsContainer = document.getElementById('active-expeditions');
    if (activeExpeditionsContainer) {
      activeExpeditionsContainer.innerHTML = this.expeditionUI.renderActiveExpeditions(
        data.expeditions
      );
      this.expeditionUI.attachEventListeners();
    }

    // Update modal content if open
    if (this.currentModal) {
      this.renderModalContent();
    }
  }

  public resetElementSlots(): void {
    this.craftingUI.resetElementSlots();
  }
}
