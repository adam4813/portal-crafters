import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { CraftingSystem } from '../game/CraftingSystem';
import type { CustomerSystem } from '../game/Customer';
import type { ElementSystem } from '../game/ElementSystem';
import type { UpgradeSystem } from '../game/UpgradeSystem';
import type { Portal } from '../game/Portal';
import type { GameState } from '../types';
import { CraftingUI } from './CraftingUI';
import { InventoryUI } from './InventoryUI';
import { CustomerUI } from './CustomerUI';
import { ShopUI } from './ShopUI';
import { ResearchUI } from './ResearchUI';
import { ManaConversionUI } from './ManaConversionUI';
import { TutorialUI } from './TutorialUI';
import { formatNumber } from '../utils/helpers';

export interface UIUpdateData {
  inventory: InventorySystem;
  crafting: CraftingSystem;
  customers: CustomerSystem;
  elements: ElementSystem;
  upgrades: UpgradeSystem;
  portal: Portal;
  gameState: GameState;
}

export class UIManager {
  private craftingUI: CraftingUI;
  private inventoryUI: InventoryUI;
  private customerUI: CustomerUI;
  private shopUI: ShopUI;
  private researchUI: ResearchUI;
  private manaConversionUI: ManaConversionUI;
  private tutorialUI: TutorialUI;

  // DOM elements
  private moneyDisplay: HTMLElement | null;
  private manaDisplay: HTMLElement | null;

  constructor(game: Game) {
    this.craftingUI = new CraftingUI(game);
    this.inventoryUI = new InventoryUI(game);
    this.customerUI = new CustomerUI(game);
    this.shopUI = new ShopUI(game);
    this.researchUI = new ResearchUI(game);
    this.manaConversionUI = new ManaConversionUI(game);
    this.tutorialUI = new TutorialUI(game);

    this.moneyDisplay = document.getElementById('money-display');
    this.manaDisplay = document.getElementById('mana-display');
  }

  public initialize(): void {
    this.craftingUI.initialize();
    this.inventoryUI.initialize();
    this.customerUI.initialize();
    this.shopUI.initialize();
    this.researchUI.initialize();
    this.manaConversionUI.initialize();
    this.tutorialUI.initialize();
  }

  public update(data: UIUpdateData): void {
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
    this.customerUI.update(data.customers, data.portal);
    this.shopUI.update(data.inventory, data.upgrades);
    this.researchUI.update(data.elements, data.inventory);
    this.manaConversionUI.update(data.inventory, data.elements);
    this.tutorialUI.update();
  }
}
