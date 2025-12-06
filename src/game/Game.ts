import * as THREE from 'three';
import type { GameState, ElementType } from '../types';
import { Portal } from './Portal';
import { CustomerSystem } from './Customer';
import { InventorySystem } from './Inventory';
import { CraftingSystem } from './CraftingSystem';
import { ElementSystem } from './ElementSystem';
import { ManaSystem } from './ManaSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { RewardSystem } from './RewardSystem';
import { SaveSystem } from './SaveSystem';
import { UIManager } from '../ui/UIManager';
import { createInitialGameState, showToast } from '../utils/helpers';

export class Game {
  // Three.js components
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private canvasContainer: HTMLElement;

  // Game systems
  private portal: Portal;
  private customerSystem: CustomerSystem;
  private inventorySystem: InventorySystem;
  private craftingSystem: CraftingSystem;
  private elementSystem: ElementSystem;
  private manaSystem: ManaSystem;
  private upgradeSystem: UpgradeSystem;
  private rewardSystem: RewardSystem;
  private saveSystem: SaveSystem;
  private uiManager: UIManager;

  // Game state
  private gameState: GameState;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.canvasContainer = container;

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a202c);

    // Set up orthographic camera for 2D view
    const aspect = container.clientWidth / container.clientHeight;
    const viewSize = 5;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.1,
      1000
    );
    this.camera.position.z = 10;

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Initialize game systems
    this.portal = new Portal(this.scene);
    this.customerSystem = new CustomerSystem();
    this.inventorySystem = new InventorySystem();
    this.craftingSystem = new CraftingSystem();
    this.elementSystem = new ElementSystem();
    this.manaSystem = new ManaSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.rewardSystem = new RewardSystem();
    this.saveSystem = new SaveSystem();

    // Initialize UI
    this.uiManager = new UIManager(this);

    // Initialize game state
    this.gameState = createInitialGameState();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  public async initialize(): Promise<void> {
    // Try to load saved game
    const savedState = this.saveSystem.load();
    if (savedState) {
      this.loadState(savedState);
    } else {
      this.loadState(this.gameState);
    }

    // Initialize portal visualization
    this.portal.initialize();

    // Set up save callbacks
    this.saveSystem.onSave(() => this.getState());
    this.saveSystem.initialize();

    // Set up crafting callbacks
    this.craftingSystem.onCraft((elements, _bonus, generatedEquipmentUsed) => {
      // Add elements to portal
      for (const [element, amount] of Object.entries(elements)) {
        if (amount) {
          this.portal.addElement(element as ElementType, amount);
        }
      }
      // Add generated equipment attributes to portal for effect calculations
      if (generatedEquipmentUsed.length > 0) {
        this.portal.addGeneratedEquipmentAttributes(generatedEquipmentUsed);
      }
      this.updateUI();
    });

    // Initialize UI
    this.uiManager.initialize();

    // Update UI with initial state
    this.updateUI();

    console.log('Game initialized');
  }

  private loadState(state: GameState): void {
    this.gameState = { ...state };

    // Initialize all systems with saved state
    this.inventorySystem.loadState(state.inventory);
    this.elementSystem.initialize(state.unlockedElements);
    this.craftingSystem.initialize(state.discoveredRecipes);
    this.upgradeSystem.initialize(state.upgrades);
    this.customerSystem.initialize(state.unlockedElements);
    this.customerSystem.loadQueue(state.customerQueue);
    this.manaSystem.initialize(state.inventory.mana);

    if (state.currentPortal) {
      this.portal.setData(state.currentPortal);
    }
  }

  public getState(): GameState {
    return {
      inventory: this.inventorySystem.getState(),
      discoveredRecipes: this.craftingSystem.getDiscoveredRecipeIds(),
      unlockedElements: this.elementSystem.getUnlockedElements(),
      upgrades: this.upgradeSystem.getUpgradeLevels(),
      customerQueue: this.customerSystem.saveQueue(),
      currentPortal: this.portal.getData(),
      totalPortalsCreated: this.gameState.totalPortalsCreated,
      totalCustomersServed: this.gameState.totalCustomersServed,
      totalGoldEarned: this.gameState.totalGoldEarned,
      playTime: this.gameState.playTime,
      lastSaveTime: Date.now(),
    };
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // Update game time
    this.gameState.playTime += deltaTime;

    // Update portal animation
    this.portal.update(deltaTime);

    // Update customer system
    this.customerSystem.update(deltaTime);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const width = this.canvasContainer.clientWidth;
    const height = this.canvasContainer.clientHeight;

    const aspect = width / height;
    const viewSize = 5;

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  // Public API for UI interactions
  public craftPortal(): void {
    const result = this.craftingSystem.craft();
    if (result) {
      if (result.isNewRecipe) {
        showToast('New recipe discovered!', 'success');
      }
      this.updateUI();
    }
  }

  public completeContract(): void {
    const customer = this.customerSystem.getCurrentCustomer();
    if (!customer) {
      showToast('No customer waiting!', 'warning');
      return;
    }

    const portalData = this.portal.getData();
    const meetsRequirements = this.portal.meetsRequirements(
      customer.requirements.minLevel,
      customer.requirements.requiredElements,
      customer.requirements.minElementAmount
    );

    if (!meetsRequirements) {
      showToast('Portal does not meet requirements!', 'error');
      return;
    }

    // Complete the contract
    const payment = this.customerSystem.completeContract(customer.id);
    this.inventorySystem.addGold(payment);
    this.gameState.totalCustomersServed++;
    this.gameState.totalGoldEarned += payment;
    this.gameState.totalPortalsCreated++;

    // Generate reward
    const reward = this.rewardSystem.generateReward(portalData.level);
    if (reward) {
      const message = this.rewardSystem.applyReward(reward, {
        addGold: (amount) => this.inventorySystem.addGold(amount),
        addMana: (amount) => this.inventorySystem.addMana(amount),
        addIngredient: (id, amount) => this.inventorySystem.addIngredient(id, amount),
        addEquipment: (id, amount) => this.inventorySystem.addEquipment(id, amount),
        addGeneratedEquipment: (equipment) => this.inventorySystem.addGeneratedEquipment(equipment),
      });
      showToast(message, 'success');
    }

    showToast(`Received ${payment} gold!`, 'success');

    // Reset portal
    this.portal.reset();
    this.updateUI();
  }

  public purchaseMana(goldAmount: number): void {
    if (!this.inventorySystem.canAfford(goldAmount)) {
      showToast('Not enough gold!', 'error');
      return;
    }

    this.inventorySystem.spendGold(goldAmount);
    const manaGained = this.manaSystem.purchaseMana(goldAmount);
    this.inventorySystem.addMana(manaGained);
    showToast(`Purchased ${manaGained} mana!`, 'success');
    this.updateUI();
  }

  public convertManaToElement(element: ElementType, amount: number): void {
    if (!this.elementSystem.isElementUnlocked(element)) {
      showToast('Element not unlocked!', 'error');
      return;
    }

    const manaNeeded = this.elementSystem.getManaPerElement(element) * amount;
    if (!this.inventorySystem.hasMana(manaNeeded)) {
      showToast('Not enough mana!', 'error');
      return;
    }

    this.inventorySystem.spendMana(manaNeeded);
    this.inventorySystem.addElement(element, amount);
    showToast(`Converted to ${amount} ${element}!`, 'success');
    this.updateUI();
  }

  public researchElement(element: ElementType): void {
    const cost = this.elementSystem.getResearchCost(element);
    if (!this.inventorySystem.canAfford(cost)) {
      showToast('Not enough gold!', 'error');
      return;
    }

    if (!this.elementSystem.canResearch(element)) {
      showToast('Cannot research this element!', 'error');
      return;
    }

    this.inventorySystem.spendGold(cost);
    this.elementSystem.research(element);
    this.customerSystem.setUnlockedElements(this.elementSystem.getUnlockedElements());
    showToast(`Unlocked ${element} element!`, 'success');
    this.updateUI();
  }

  public purchaseUpgrade(upgradeId: string): void {
    const cost = this.upgradeSystem.getUpgradeCost(upgradeId);
    if (!this.inventorySystem.canAfford(cost)) {
      showToast('Not enough gold!', 'error');
      return;
    }

    if (!this.upgradeSystem.canUpgrade(upgradeId)) {
      showToast('Upgrade maxed out!', 'warning');
      return;
    }

    this.inventorySystem.spendGold(cost);
    this.upgradeSystem.purchase(upgradeId);

    // Apply upgrade effects
    const rewardChance = this.upgradeSystem.getTotalEffect('rewardChance');
    this.rewardSystem.setRewardChanceUpgrade(rewardChance * 20);

    showToast('Upgrade purchased!', 'success');
    this.updateUI();
  }

  public addIngredientToSlot(slotIndex: number, ingredientId: string): void {
    if (!this.inventorySystem.hasIngredient(ingredientId)) {
      showToast('No ingredient available!', 'error');
      return;
    }

    this.inventorySystem.removeIngredient(ingredientId);
    this.craftingSystem.addIngredientToSlot(slotIndex, ingredientId);
    this.updateUI();
  }

  public addEquipmentToSlot(slotIndex: number, equipmentId: string): void {
    if (!this.inventorySystem.hasEquipment(equipmentId)) {
      showToast('No equipment available!', 'error');
      return;
    }

    this.inventorySystem.removeEquipment(equipmentId);
    this.craftingSystem.addEquipmentToSlot(slotIndex, equipmentId);
    this.updateUI();
  }

  public clearCraftingSlot(slotIndex: number): void {
    const slot = this.craftingSystem.getSlot(slotIndex);
    if (slot?.ingredient) {
      this.inventorySystem.addIngredient(slot.ingredient.id);
    }
    if (slot?.equipment) {
      this.inventorySystem.addEquipment(slot.equipment.id);
    }
    this.craftingSystem.clearSlot(slotIndex);
    this.updateUI();
  }

  public addManaToPortal(amount: number): void {
    if (!this.inventorySystem.hasMana(amount)) {
      showToast('Not enough mana!', 'error');
      return;
    }

    this.inventorySystem.spendMana(amount);
    this.portal.addMana(amount);
    this.updateUI();
  }

  public addElementToPortal(element: ElementType, amount: number): void {
    if (!this.inventorySystem.hasElement(element, amount)) {
      showToast(`Not enough ${element}!`, 'error');
      return;
    }

    this.inventorySystem.spendElement(element, amount);
    this.portal.addElement(element, amount);
    this.updateUI();
  }

  public saveGame(): void {
    this.saveSystem.save();
    showToast('Game saved!', 'success');
  }

  public resetGame(): void {
    this.saveSystem.deleteSave();
    this.loadState(createInitialGameState());
    this.portal.reset();
    this.updateUI();
    showToast('Game reset!', 'warning');
  }

  private updateUI(): void {
    this.uiManager.update({
      inventory: this.inventorySystem,
      crafting: this.craftingSystem,
      customers: this.customerSystem,
      elements: this.elementSystem,
      upgrades: this.upgradeSystem,
      portal: this.portal,
      gameState: this.gameState,
    });
  }

  // Getters for UI
  public getInventory(): InventorySystem {
    return this.inventorySystem;
  }

  public getCrafting(): CraftingSystem {
    return this.craftingSystem;
  }

  public getCustomers(): CustomerSystem {
    return this.customerSystem;
  }

  public getElements(): ElementSystem {
    return this.elementSystem;
  }

  public getUpgrades(): UpgradeSystem {
    return this.upgradeSystem;
  }

  public getPortal(): Portal {
    return this.portal;
  }

  public dispose(): void {
    this.stop();
    this.saveSystem.dispose();
    this.portal.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}
