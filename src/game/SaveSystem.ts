import type { GameState } from '../types';
import { createInitialGameState } from '../utils/helpers';

const SAVE_KEY_PREFIX = 'portal-crafters-save-slot-';
const NUM_SAVE_SLOTS = 3;

export interface SaveSlotInfo {
  slot: number;
  isEmpty: boolean;
  lastSaveTime: number | null;
  playTime: number;
  gold: number;
  tier: number;
}

export class SaveSystem {
  private onLoadCallbacks: ((state: GameState) => void)[] = [];
  private onSaveCallbacks: (() => GameState)[] = [];
  private currentSlot: number = 0;

  constructor() {}

  public initialize(): void {
    // No auto-save - saves are event-driven (on craft, purchase, etc.) and on page unload
  }

  public setCurrentSlot(slot: number): void {
    this.currentSlot = slot;
  }

  public getCurrentSlot(): number {
    return this.currentSlot;
  }

  private getSlotKey(slot: number): string {
    return `${SAVE_KEY_PREFIX}${slot}`;
  }

  public onLoad(callback: (state: GameState) => void): void {
    this.onLoadCallbacks.push(callback);
  }

  public onSave(callback: () => GameState): void {
    this.onSaveCallbacks.push(callback);
  }

  public save(): boolean {
    return this.saveToSlot(this.currentSlot);
  }

  public saveToSlot(slot: number): boolean {
    try {
      // Collect state from all systems
      let state = createInitialGameState();

      if (this.onSaveCallbacks.length > 0) {
        state = this.onSaveCallbacks[0]();
      }

      state.lastSaveTime = Date.now();

      const saveData = JSON.stringify(state);
      localStorage.setItem(this.getSlotKey(slot), saveData);

      console.log(`Game saved successfully to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  public load(): GameState | null {
    return this.loadFromSlot(this.currentSlot);
  }

  public loadFromSlot(slot: number): GameState | null {
    try {
      const saveData = localStorage.getItem(this.getSlotKey(slot));
      if (!saveData) {
        console.log(`No save data found in slot ${slot}, creating new game`);
        return null;
      }

      const state = JSON.parse(saveData) as GameState;

      // Validate state has required properties
      if (!this.validateState(state)) {
        console.warn('Invalid save data, creating new game');
        return null;
      }

      // Notify load callbacks
      this.onLoadCallbacks.forEach((cb) => cb(state));

      console.log(`Game loaded successfully from slot ${slot}`);
      return state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  private validateState(state: GameState): boolean {
    // Check for required properties
    if (!state.inventory) return false;
    if (typeof state.inventory.gold !== 'number') return false;
    if (typeof state.inventory.mana !== 'number') return false;
    if (!state.unlockedElements) return false;
    if (!Array.isArray(state.unlockedElements)) return false;

    return true;
  }

  public getAllSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 0; i < NUM_SAVE_SLOTS; i++) {
      const saveData = localStorage.getItem(this.getSlotKey(i));

      if (!saveData) {
        slots.push({
          slot: i,
          isEmpty: true,
          lastSaveTime: null,
          playTime: 0,
          gold: 0,
          tier: 1,
        });
      } else {
        try {
          const state = JSON.parse(saveData) as GameState;
          slots.push({
            slot: i,
            isEmpty: false,
            lastSaveTime: state.lastSaveTime || null,
            playTime: state.playTime || 0,
            gold: state.inventory?.gold || 0,
            tier: state.progression?.currentTier || 1,
          });
        } catch {
          slots.push({
            slot: i,
            isEmpty: true,
            lastSaveTime: null,
            playTime: 0,
            gold: 0,
            tier: 1,
          });
        }
      }
    }

    return slots;
  }

  public hasSaveData(): boolean {
    return localStorage.getItem(this.getSlotKey(this.currentSlot)) !== null;
  }

  public hasAnySaveData(): boolean {
    for (let i = 0; i < NUM_SAVE_SLOTS; i++) {
      if (localStorage.getItem(this.getSlotKey(i))) {
        return true;
      }
    }
    return false;
  }

  public deleteSave(): void {
    this.deleteSlot(this.currentSlot);
  }

  public deleteSlot(slot: number): void {
    localStorage.removeItem(this.getSlotKey(slot));
    console.log(`Save data deleted from slot ${slot}`);
  }

  public exportSave(): string {
    const saveData = localStorage.getItem(this.getSlotKey(this.currentSlot));
    if (!saveData) return '';

    // Encode to base64 for sharing
    return btoa(saveData);
  }

  public importSave(encodedData: string): boolean {
    try {
      const saveData = atob(encodedData);
      const state = JSON.parse(saveData) as GameState;

      if (!this.validateState(state)) {
        return false;
      }

      localStorage.setItem(this.getSlotKey(this.currentSlot), saveData);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  public getLastSaveTime(): number | null {
    try {
      const saveData = localStorage.getItem(this.getSlotKey(this.currentSlot));
      if (!saveData) return null;

      const state = JSON.parse(saveData) as GameState;
      return state.lastSaveTime || null;
    } catch {
      return null;
    }
  }

  public dispose(): void {
    // No cleanup needed - auto-save removed
  }
}
