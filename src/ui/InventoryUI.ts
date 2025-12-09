import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { ElementSystem } from '../game/ElementSystem';

export class InventoryUI {
  constructor(_game: Game) {
    // No-op - inventory display is now handled by CraftingUI modal
  }

  public initialize(): void {
    // No-op - inventory display is now handled by CraftingUI modal
  }

  public update(_inventory: InventorySystem, _elements: ElementSystem): void {
    // No-op - inventory display is now handled by CraftingUI modal
  }

  public getSelectedItem(): { type: 'ingredient' | 'equipment'; id: string } | null {
    // Selection is now handled by the slot picker modal
    return null;
  }

  public clearSelection(): void {
    // No-op, selection is now handled by the slot picker modal
  }
}
