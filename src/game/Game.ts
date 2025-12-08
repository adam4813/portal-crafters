import * as THREE from 'three';
import type { GameState, ElementType, Portal as PortalType, Customer } from '../types';
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
import { ProgressionSystem } from './ProgressionSystem';
import { ExpeditionSystem } from './ExpeditionSystem';
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
  private progressionSystem: ProgressionSystem;
  private expeditionSystem: ExpeditionSystem;
  private uiManager: UIManager;

  // Game state
  private gameState: GameState;
  private storedPortals: PortalType[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
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
    this.progressionSystem = new ProgressionSystem();
    this.expeditionSystem = new ExpeditionSystem();

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

    // Ensure mini-boss contract is added to queue
    this.updateMiniBossContract();

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
    this.progressionSystem.initialize(state.progression);
    this.expeditionSystem.initialize(state.activeExpeditions);

    // Load stored portals
    this.storedPortals = state.storedPortals ? [...state.storedPortals] : [];

    // Load crafting slots (items that were placed in slots before save)
    if (state.craftingSlots) {
      this.craftingSystem.loadSlotsState(
        state.craftingSlots,
        (id) => this.inventorySystem.getGeneratedEquipmentById(id)
      );
    }

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
      craftingSlots: this.craftingSystem.getSlotsState(),
      totalPortalsCreated: this.gameState.totalPortalsCreated,
      totalCustomersServed: this.gameState.totalCustomersServed,
      totalGoldEarned: this.gameState.totalGoldEarned,
      playTime: this.gameState.playTime,
      lastSaveTime: Date.now(),
      progression: this.progressionSystem.getState(),
      activeExpeditions: this.expeditionSystem.getState(),
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

    // Update customer system (handles patience/expiration) - only when not paused
    if (!this.isPaused) {
      this.customerSystem.update(deltaTime);
      
      // Ensure mini-boss contract is in queue if not completed
      this.updateMiniBossContract();
    }
  }

  /**
   * Ensure the current tier's mini-boss contract is always in the queue
   */
  private updateMiniBossContract(): void {
    const currentTier = this.progressionSystem.getCurrentTier();
    
    // Check if mini-boss for current tier is already completed
    if (this.progressionSystem.isMiniBossCompleted(currentTier.tier)) {
      // Remove mini-boss from queue if it's there
      this.customerSystem.removeMiniBossContract();
      return;
    }

    // Add mini-boss contract if not in queue
    const queue = this.customerSystem.getQueue();
    const hasMiniBoss = queue.some(c => c.id.startsWith('miniboss-'));
    
    if (!hasMiniBoss) {
      this.customerSystem.addMiniBossContract(
        currentTier.tier,
        currentTier.miniBossContract.name,
        currentTier.miniBossContract.description,
        {
          minLevel: currentTier.miniBossContract.minLevel,
          requiredElements: currentTier.miniBossContract.requiredElements,
          minElementAmount: currentTier.miniBossContract.minElementAmount,
          minMana: currentTier.miniBossContract.minMana,
        },
        currentTier.miniBossContract.payment
      );
    }
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
    const hasMana = portalData.manaInvested > 0;
    const result = this.craftingSystem.craft();
    
    // Need either items, elements, or mana to craft
    if (!result && !hasElements && !hasMana) {
      showToast('Add elements or items to craft a portal!', 'warning');
      return;
    }

    // Create a new portal - level is already calculated in portalData
    const newPortal: PortalType = {
      id: `portal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      level: portalData.level,
      manaInvested: portalData.manaInvested,
      elements: { ...portalData.elements },
      ingredients: result?.ingredientIds || [],
      equipment: result?.equipmentIds || [],
      visualColor: 0x6b46c1,
      visualIntensity: 0.5,
      createdAt: Date.now(),
      generatedEquipmentAttributes: result?.generatedEquipmentUsed || [],
    };

    this.storedPortals.push(newPortal);
    this.gameState.totalPortalsCreated++;

    // Reset the current portal for new crafting
    this.portal.reset();

    // Save after crafting
    this.saveSystem.save();

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
    if (!this.portalMeetsRequirements(portalData, customer)) {
      showToast('Portal does not meet requirements!', 'error');
      return;
    }

    // Remove portal from storage
    this.storedPortals.splice(portalIndex, 1);

    // Check if this is a mini-boss contract
    const isMiniBoss = customer.id.startsWith('miniboss-');
    
    // Complete the contract
    const payment = this.customerSystem.completeContract(customer.id);
    this.inventorySystem.addGold(payment);
    this.gameState.totalCustomersServed++;
    this.gameState.totalGoldEarned += payment;

    // Track progression
    if (isMiniBoss) {
      // Complete mini-boss for current tier
      const currentTier = this.progressionSystem.getCurrentTier();
      this.progressionSystem.completeMiniBoss(currentTier.tier);
      showToast(`🏆 Mini-boss contract complete! Tier ${currentTier.tier} mastered!`, 'success');
      
      // Check if we can advance to next tier
      if (this.progressionSystem.canAdvanceToNextTier(this.elementSystem.getUnlockedElements())) {
        this.progressionSystem.advanceToNextTier();
        const newTier = this.progressionSystem.getCurrentTier();
        showToast(`🎉 Advanced to ${newTier.name}!`, 'success');
      }
    } else {
      // Regular contract - increment counter
      this.progressionSystem.completeContract();
    }

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

    if (!isMiniBoss) {
      showToast(`Contract complete! Received ${payment} gold!`, 'success');
    }
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

  private portalMeetsRequirements(portal: PortalType, customer: Customer): boolean {
    // Check level requirement
    if (portal.level < customer.requirements.minLevel) {
      return false;
    }

    // Check mana requirement
    if (customer.requirements.minMana && portal.manaInvested < customer.requirements.minMana) {
      return false;
    }

    // Check element requirements
    const reqElements = customer.requirements.requiredElements;
    const portalElementTotal = Object.values(portal.elements).reduce((sum, val) => sum + (val || 0), 0);
    
    if (reqElements === 'any') {
      // Must have at least some elements
      if (portalElementTotal === 0) {
        return false;
      }
    } else if (reqElements === 'none') {
      // Must have no elements (raw mana only)
      if (portalElementTotal > 0) {
        return false;
      }
    } else if (Array.isArray(reqElements) && reqElements.length > 0) {
      // Must have specific elements
      for (const element of reqElements) {
        const amount = portal.elements[element] || 0;
        if (amount < (customer.requirements.minElementAmount || 1)) {
          return false;
        }
      }
    }
    // If reqElements is undefined, any combination is allowed

    return true;
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

  public removeManaFromPortal(amount: number): void {
    const portalData = this.portal.getData();
    const currentMana = portalData.manaInvested;
    
    if (currentMana < amount) {
      showToast('Not enough mana in portal!', 'error');
      return;
    }

    this.portal.removeMana(amount);
    this.inventorySystem.addMana(amount);
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
      progression: this.progressionSystem,
      expeditions: this.expeditionSystem,
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

  public pauseCustomerTimers(): void {
    this.isPaused = true;
    this.customerSystem.setPaused(true);
  }

  public resumeCustomerTimers(): void {
    this.isPaused = false;
    this.customerSystem.setPaused(false);
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

  public getProgression(): ProgressionSystem {
    return this.progressionSystem;
  }

  public getExpeditions(): ExpeditionSystem {
    return this.expeditionSystem;
  }

  public startExpedition(templateIndex: number): void {
    const templates = this.expeditionSystem.getAvailableExpeditions();
    if (templateIndex < 0 || templateIndex >= templates.length) {
      showToast('Invalid expedition!', 'error');
      return;
    }

    const template = templates[templateIndex];
    
    // Check if player can afford expedition
    if (template.requirements?.gold && !this.inventorySystem.canAfford(template.requirements.gold)) {
      showToast('Not enough gold!', 'error');
      return;
    }
    
    if (template.requirements?.mana && !this.inventorySystem.hasMana(template.requirements.mana)) {
      showToast('Not enough mana!', 'error');
      return;
    }

    // Deduct costs
    if (template.requirements?.gold) {
      const success = this.inventorySystem.spendGold(template.requirements.gold);
      if (!success) {
        showToast('Failed to deduct gold!', 'error');
        return;
      }
    }
    if (template.requirements?.mana) {
      const success = this.inventorySystem.spendMana(template.requirements.mana);
      if (!success) {
        showToast('Failed to deduct mana!', 'error');
        // Refund gold if mana deduction failed
        if (template.requirements?.gold) {
          this.inventorySystem.addGold(template.requirements.gold);
        }
        return;
      }
    }

    // Start expedition
    const expedition = this.expeditionSystem.startExpedition(templateIndex);
    if (expedition) {
      showToast(`Expedition started: ${expedition.name}`, 'success');
      this.updateUI();
    }
  }

  public completeExpedition(expeditionId: string): void {
    const rewards = this.expeditionSystem.completeExpedition(expeditionId);
    if (!rewards) {
      showToast('Expedition not ready yet!', 'warning');
      return;
    }

    // Apply rewards
    let rewardMessage = 'Expedition complete! Received: ';
    const rewardParts: string[] = [];

    for (const reward of rewards) {
      switch (reward.type) {
        case 'gold':
          this.inventorySystem.addGold(reward.amount);
          rewardParts.push(`${reward.amount} gold`);
          break;
        case 'mana':
          this.inventorySystem.addMana(reward.amount);
          rewardParts.push(`${reward.amount} mana`);
          break;
        case 'ingredient':
          if (reward.itemId) {
            this.inventorySystem.addIngredient(reward.itemId, reward.amount);
            rewardParts.push(`${reward.amount}x ${reward.itemId}`);
          }
          break;
        case 'equipment':
          if (reward.itemId) {
            this.inventorySystem.addEquipment(reward.itemId, reward.amount);
            rewardParts.push(`${reward.amount}x ${reward.itemId}`);
          }
          break;
      }
    }

    if (rewardParts.length > 0) {
      rewardMessage += rewardParts.join(', ');
    } else {
      rewardMessage = 'Expedition complete, but no rewards found.';
    }

    showToast(rewardMessage, 'success');
    this.updateUI();
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
