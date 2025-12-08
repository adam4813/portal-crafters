import type { GameState } from '../types';
import { createInitialGameState } from '../utils/helpers';

const SAVE_KEY = 'portal-crafters-save';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export class SaveSystem {
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private onLoadCallbacks: ((state: GameState) => void)[] = [];
  private onSaveCallbacks: (() => GameState)[] = [];

  constructor() {}

  public initialize(): void {
    this.startAutoSave();
  }

  public onLoad(callback: (state: GameState) => void): void {
    this.onLoadCallbacks.push(callback);
  }

  public onSave(callback: () => GameState): void {
    this.onSaveCallbacks.push(callback);
  }

  public save(): boolean {
    try {
      // Collect state from all systems
      let state = createInitialGameState();

      if (this.onSaveCallbacks.length > 0) {
        state = this.onSaveCallbacks[0]();
      }

      state.lastSaveTime = Date.now();

      const saveData = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, saveData);

      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  public load(): GameState | null {
    try {
      const saveData = localStorage.getItem(SAVE_KEY);
      if (!saveData) {
        console.log('No save data found, creating new game');
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

      console.log('Game loaded successfully');
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

  public hasSaveData(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  public deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
    console.log('Save data deleted');
  }

  public exportSave(): string {
    const saveData = localStorage.getItem(SAVE_KEY);
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

      localStorage.setItem(SAVE_KEY, saveData);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.save();
    }, AUTO_SAVE_INTERVAL);
  }

  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  public getLastSaveTime(): number | null {
    try {
      const saveData = localStorage.getItem(SAVE_KEY);
      if (!saveData) return null;

      const state = JSON.parse(saveData) as GameState;
      return state.lastSaveTime || null;
    } catch {
      return null;
    }
  }

  public dispose(): void {
    this.stopAutoSave();
  }
}
