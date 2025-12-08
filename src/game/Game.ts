import * as THREE from 'three';
import type { GameState, ElementType, Portal as PortalType } from '../types';
import { isGeneratedEquipment } from '../types';
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
import { calculatePortalEffects } from './PortalEffectSystem';

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
  private storedPortals: PortalType[] = [];
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

    // Save before page unload
    window.addEventListener('beforeunload', () => {
      this.saveSystem.save();
    });

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

    // Load stored portals
    this.storedPortals = state.storedPortals ? [...state.storedPortals] : [];

    // Apply conversion rate upgrades based on saved upgrade levels
    const fireConversionLevel = this.upgradeSystem.getLevel('mana_conversion_fire');
    if (fireConversionLevel > 0) {
      const effect = fireConversionLevel * 0.1; // 0.1 per level
      this.elementSystem.setConversionRateMultiplier('fire', 1 + effect);
    }
    const waterConversionLevel = this.upgradeSystem.getLevel('mana_conversion_water');
    if (waterConversionLevel > 0) {
      const effect = waterConversionLevel * 0.1; // 0.1 per level
      this.elementSystem.setConversionRateMultiplier('water', 1 + effect);
    }

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
      storedPortals: [...this.storedPortals],
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

    // Update customer system (handles patience/expiration)
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
    const portalData = this.portal.getData();
    const hasElements = Object.values(portalData.elements).some(v => v && v > 0);
    const result = this.craftingSystem.craft();
    
    // Need either items or elements to craft
    if (!result && !hasElements) {
      showToast('Add elements or items to craft a portal!', 'warning');
      return;
    }

    // Create a new portal combining current portal elements with crafting results
    const newPortal: PortalType = {
      id: `portal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      level: portalData.level + (result?.bonusLevel || 0),
      manaInvested: portalData.manaInvested,
      elements: { ...portalData.elements },
      ingredients: result ? [] : [],
      equipment: [],
      visualColor: 0x6b46c1,
      visualIntensity: 0.5,
      createdAt: Date.now(),
      generatedEquipmentAttributes: result?.generatedEquipmentUsed || [],
    };

    // Recalculate level based on elements
    const elementTotal = Object.values(newPortal.elements).reduce((sum, val) => sum + (val || 0), 0);
    newPortal.level = Math.max(1, newPortal.level + Math.floor(elementTotal / 5));

    this.storedPortals.push(newPortal);
    this.gameState.totalPortalsCreated++;

    // Reset the current portal for new crafting
    this.portal.reset();

    if (result?.isNewRecipe) {
      showToast('New recipe discovered! Portal crafted and stored.', 'success');
    } else {
      showToast('Portal crafted and stored!', 'success');
    }
    
    this.updateUI();
  }

  public fulfillCustomerWithPortal(customerId: string, portalId: string): void {
    const queue = this.customerSystem.getQueue();
    const customer = queue.find(c => c.id === customerId);
    if (!customer) {
      showToast('Customer not found!', 'error');
      return;
    }

    const portalIndex = this.storedPortals.findIndex(p => p.id === portalId);
    if (portalIndex === -1) {
      showToast('Portal not found!', 'error');
      return;
    }

    const portalData = this.storedPortals[portalIndex];
    
    // Check requirements
    const meetsLevel = portalData.level >= customer.requirements.minLevel;
    let meetsElements = true;
    if (customer.requirements.requiredElements) {
      for (const element of customer.requirements.requiredElements) {
        const amount = portalData.elements[element] || 0;
        if (amount < (customer.requirements.minElementAmount || 1)) {
          meetsElements = false;
          break;
        }
      }
    }

    if (!meetsLevel || !meetsElements) {
      showToast('Portal does not meet requirements!', 'error');
      return;
    }

    // Remove portal from storage
    this.storedPortals.splice(portalIndex, 1);

    // Complete the contract
    const payment = this.customerSystem.completeContract(customer.id);
    this.inventorySystem.addGold(payment);
    this.gameState.totalCustomersServed++;
    this.gameState.totalGoldEarned += payment;

    // Calculate portal effects from equipment attributes
    const generatedEquipmentAttributes = portalData.generatedEquipmentAttributes || [];
    const portalEffects = calculatePortalEffects(generatedEquipmentAttributes);

    // Generate reward with attribute-based modifiers
    const reward = this.rewardSystem.generateReward(portalData.level, portalEffects);
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

    showToast(`Contract complete! Received ${payment} gold!`, 'success');
    this.updateUI();
  }

  // Legacy method - kept for backwards compatibility
  public completeContractWithPortal(portalId: string): void {
    const customer = this.customerSystem.getCurrentCustomer();
    if (!customer) {
      showToast('No customer waiting!', 'warning');
      return;
    }
    this.fulfillCustomerWithPortal(customer.id, portalId);
  }

  // Legacy method - kept for backwards compatibility
  public completeContract(): void {
    if (this.storedPortals.length === 1) {
      const customer = this.customerSystem.getCurrentCustomer();
      if (customer) {
        this.fulfillCustomerWithPortal(customer.id, this.storedPortals[0].id);
      }
      return;
    }
    showToast('Select a portal to fulfill a customer request!', 'warning');
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

    // Apply mana conversion rate upgrades
    if (upgradeId === 'mana_conversion_fire') {
      const totalEffect = this.upgradeSystem.getEffect(upgradeId);
      this.elementSystem.setConversionRateMultiplier('fire', 1 + totalEffect);
    } else if (upgradeId === 'mana_conversion_water') {
      const totalEffect = this.upgradeSystem.getEffect(upgradeId);
      this.elementSystem.setConversionRateMultiplier('water', 1 + totalEffect);
    }

    showToast('Upgrade purchased!', 'success');
    this.updateUI();
  }

  public addIngredientToSlot(slotIndex: number, ingredientId: string): boolean {
    if (!this.inventorySystem.hasIngredient(ingredientId)) {
      showToast('No ingredient available!', 'error');
      return false;
    }

    this.inventorySystem.removeIngredient(ingredientId);
    const success = this.craftingSystem.addIngredientToSlot(slotIndex, ingredientId);
    if (!success) {
      // Rollback: return ingredient to inventory if slot addition failed
      this.inventorySystem.addIngredient(ingredientId);
    }
    this.updateUI();
    return success;
  }

  public addEquipmentToSlot(slotIndex: number, equipmentId: string): boolean {
    if (!this.inventorySystem.hasEquipment(equipmentId)) {
      showToast('No equipment available!', 'error');
      return false;
    }

    this.inventorySystem.removeEquipment(equipmentId);
    const success = this.craftingSystem.addEquipmentToSlot(slotIndex, equipmentId);
    if (!success) {
      // Rollback: return equipment to inventory if slot addition failed
      this.inventorySystem.addEquipment(equipmentId);
    }
    this.updateUI();
    return success;
  }

  public addGeneratedEquipmentToSlot(slotIndex: number, equipmentId: string): boolean {
    if (!this.inventorySystem.hasGeneratedEquipment(equipmentId)) {
      showToast('No equipment available!', 'error');
      return false;
    }

    const equipment = this.inventorySystem.getGeneratedEquipmentById(equipmentId);
    if (!equipment) return false;

    this.inventorySystem.removeGeneratedEquipment(equipmentId);
    const success = this.craftingSystem.addGeneratedEquipmentToSlot(slotIndex, equipment);
    if (!success) {
      // Rollback: return generated equipment to inventory if slot addition failed
      this.inventorySystem.addGeneratedEquipment(equipment);
    }
    this.updateUI();
    return success;
  }

  public clearCraftingSlot(slotIndex: number): void {
    const slot = this.craftingSystem.getSlot(slotIndex);
    if (slot?.ingredient) {
      this.inventorySystem.addIngredient(slot.ingredient.id);
    }
    if (slot?.equipment) {
      // Check if equipment is generated and return to appropriate inventory
      if (isGeneratedEquipment(slot.equipment)) {
        this.inventorySystem.addGeneratedEquipment(slot.equipment);
      } else {
        this.inventorySystem.addEquipment(slot.equipment.id);
      }
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

  public removeElementFromPortal(element: ElementType, amount: number): void {
    const portalData = this.portal.getData();
    const currentAmount = portalData.elements[element] || 0;
    
    if (currentAmount < amount) {
      showToast(`Not enough ${element} in portal!`, 'error');
      return;
    }

    this.portal.removeElement(element, amount);
    this.inventorySystem.addElement(element, amount);
    showToast(`Removed ${amount} ${element} from portal`, 'success');
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

  // Public method for UI components to trigger a refresh
  public refreshUI(): void {
    this.updateUI();
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
      storedPortals: this.storedPortals,
    });
  }

  // Stored Portal operations
  public storeCurrentPortal(): void {
    const portalData = this.portal.getData();
    if (portalData.level <= 1 && portalData.manaInvested === 0 && Object.keys(portalData.elements).length === 0) {
      showToast('Nothing to store - portal is empty!', 'warning');
      return;
    }
    
    this.storedPortals.push({ ...portalData });
    this.portal.reset();
    showToast('Portal stored for later use!', 'success');
    this.updateUI();
  }

  public useStoredPortal(portalId: string): void {
    const index = this.storedPortals.findIndex(p => p.id === portalId);
    if (index === -1) {
      showToast('Portal not found!', 'error');
      return;
    }

    // Check if current portal has content
    const currentData = this.portal.getData();
    if (currentData.level > 1 || currentData.manaInvested > 0 || Object.keys(currentData.elements).length > 0) {
      showToast('Store or complete current portal first!', 'warning');
      return;
    }

    const storedPortal = this.storedPortals.splice(index, 1)[0];
    this.portal.setData(storedPortal);
    showToast('Portal loaded!', 'success');
    this.updateUI();
  }

  public reclaimStoredPortal(portalId: string): void {
    const index = this.storedPortals.findIndex(p => p.id === portalId);
    if (index === -1) {
      showToast('Portal not found!', 'error');
      return;
    }

    const portal = this.storedPortals.splice(index, 1)[0];
    // Refund 50% of mana invested
    const manaRefund = Math.floor(portal.manaInvested * 0.5);
    if (manaRefund > 0) {
      this.inventorySystem.addMana(manaRefund);
      showToast(`Reclaimed ${manaRefund} mana from portal!`, 'success');
    } else {
      showToast('Portal reclaimed!', 'success');
    }
    this.updateUI();
  }

  public getStoredPortals(): PortalType[] {
    return [...this.storedPortals];
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
  
  public getManaSystem(): ManaSystem {
    return this.manaSystem;
  }

  /**
   * Get portal effects for the current portal's equipment attributes.
   * Useful for displaying effect descriptions in the UI.
   */
  public getCurrentPortalEffects() {
    const generatedEquipmentAttributes = this.portal.getGeneratedEquipmentAttributes();
    return calculatePortalEffects(generatedEquipmentAttributes);
  }

  public dispose(): void {
    this.stop();
    this.saveSystem.dispose();
    this.portal.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}
