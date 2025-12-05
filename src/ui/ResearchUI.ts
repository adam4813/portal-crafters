import type { Game } from '../game/Game';
import type { ElementSystem } from '../game/ElementSystem';
import type { InventorySystem } from '../game/Inventory';
import type { ElementType } from '../types';
import { formatNumber } from '../utils/helpers';

export class ResearchUI {
  private game: Game;
  private researchContainer: HTMLElement | null;
  private recipesContainer: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.researchContainer = document.getElementById('research-tree');
    this.recipesContainer = document.getElementById('discovered-recipes');
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(elements: ElementSystem, inventory: InventorySystem): void {
    this.renderResearchTree(elements, inventory);
    this.renderRecipes();
  }

  private renderResearchTree(elements: ElementSystem, inventory: InventorySystem): void {
    if (!this.researchContainer) return;

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

    this.researchContainer.innerHTML = html;

    // Add click handlers
    this.researchContainer.querySelectorAll('.research-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const element = (btn as HTMLElement).dataset.element as ElementType;
        if (element) {
          this.game.researchElement(element);
        }
      });
    });
  }

  private renderRecipes(): void {
    if (!this.recipesContainer) return;

    const crafting = this.game.getCrafting();
    const recipes = crafting.getDiscoveredRecipes();

    if (recipes.length === 0) {
      this.recipesContainer.innerHTML =
        '<p class="empty-message">No recipes discovered yet. Try combining ingredients!</p>';
      return;
    }

    let html = '';

    for (const recipe of recipes) {
      const elementList = Object.entries(recipe.resultingElements)
        .filter(([, amount]) => amount && amount > 0)
        .map(([element, amount]) => `${element}: +${amount}`)
        .join(', ');

      html += `
        <div class="recipe-entry">
          <div class="recipe-ingredients">
            ${recipe.ingredientIds.join(' + ')}
          </div>
          <div class="recipe-result">
            → ${elementList || 'No elements'} (+${recipe.bonusLevel} level)
          </div>
        </div>
      `;
    }

    this.recipesContainer.innerHTML = html;
  }
}
