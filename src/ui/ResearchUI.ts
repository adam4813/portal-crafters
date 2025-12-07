import type { Game } from '../game/Game';
import type { ElementSystem } from '../game/ElementSystem';
import type { InventorySystem } from '../game/Inventory';
import type { ElementType } from '../types';
import { formatNumber, showToast } from '../utils/helpers';
import { getIngredientById } from '../data/ingredients';

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
    const inventory = this.game.getInventory();

    if (recipes.length === 0) {
      this.recipesContainer.innerHTML =
        '<p class="empty-message">No recipes discovered yet. Try combining ingredients!</p>';
      return;
    }

    let html = '';

    for (const recipe of recipes) {
      // Check which ingredients are owned
      const ingredientStatuses = recipe.ingredientIds.map((id) => {
        const ingredient = getIngredientById(id);
        const owned = inventory.hasIngredient(id);
        return {
          id,
          ingredient,
          owned,
        };
      });

      const allOwned = ingredientStatuses.every((status) => status.owned);
      const someOwned = ingredientStatuses.some((status) => status.owned);

      // Build ingredient display with icons and status styling
      const ingredientDisplay = ingredientStatuses
        .map((status) => {
          const icon = status.ingredient?.icon || '?';
          const name = status.ingredient?.name || status.id;
          const cssClass = status.owned ? 'recipe-ingredient-owned' : 'recipe-ingredient-missing';
          return `<span class="${cssClass}" title="${name}">${icon}</span>`;
        })
        .join(' + ');

      const elementList = Object.entries(recipe.resultingElements)
        .filter(([, amount]) => amount && amount > 0)
        .map(([element, amount]) => `${element}: +${amount}`)
        .join(', ');

      // Add clickable class and data attribute if all ingredients are owned
      const clickableClass = allOwned ? 'recipe-clickable' : '';
      const tooltip = allOwned
        ? 'Click to auto-fill crafting slots'
        : someOwned
          ? 'Some ingredients missing'
          : 'All ingredients missing';

      html += `
        <div class="recipe-entry ${clickableClass}" data-recipe-id="${recipe.id}" title="${tooltip}">
          <div class="recipe-ingredients">
            ${ingredientDisplay}
          </div>
          <div class="recipe-result">
            → ${elementList || 'No elements'} (+${recipe.bonusLevel} level)
          </div>
        </div>
      `;
    }

    this.recipesContainer.innerHTML = html;

    // Add click handlers to recipes
    this.recipesContainer.querySelectorAll('.recipe-clickable').forEach((recipeEl) => {
      recipeEl.addEventListener('click', () => {
        const recipeId = (recipeEl as HTMLElement).dataset.recipeId;
        if (recipeId) {
          this.handleRecipeClick(recipeId);
        }
      });
    });
  }

  private handleRecipeClick(recipeId: string): void {
    const crafting = this.game.getCrafting();
    const recipes = crafting.getDiscoveredRecipes();
    const recipe = recipes.find((r) => r.id === recipeId);

    if (!recipe) {
      showToast('Recipe not found!', 'error');
      return;
    }

    const inventory = this.game.getInventory();

    // Check if we have enough crafting slots for this recipe
    if (recipe.ingredientIds.length > crafting.getMaxSlots()) {
      showToast(
        `Not enough crafting slots! Need ${recipe.ingredientIds.length} slots.`,
        'error'
      );
      return;
    }

    // Check if all ingredients are available
    const missingIngredients: string[] = [];
    for (const ingredientId of recipe.ingredientIds) {
      if (!inventory.hasIngredient(ingredientId)) {
        const ingredient = getIngredientById(ingredientId);
        missingIngredients.push(ingredient?.name || ingredientId);
      }
    }

    if (missingIngredients.length > 0) {
      showToast(`Missing ingredients: ${missingIngredients.join(', ')}`, 'warning');
      return;
    }

    // Clear existing slots and return items to inventory
    for (let i = 0; i < crafting.getMaxSlots(); i++) {
      const slot = crafting.getSlot(i);
      if (slot?.ingredient || slot?.equipment) {
        this.game.clearCraftingSlot(i);
      }
    }

    // Add ingredients to crafting slots
    let successCount = 0;
    for (let i = 0; i < recipe.ingredientIds.length; i++) {
      const ingredientId = recipe.ingredientIds[i];
      if (this.game.addIngredientToSlot(i, ingredientId)) {
        successCount++;
      } else {
        // If adding fails, stop trying to add more
        break;
      }
    }

    if (successCount === recipe.ingredientIds.length) {
      showToast('Recipe ingredients added to crafting slots!', 'success');
    } else {
      showToast(
        `Failed to add all ingredients. Added ${successCount} of ${recipe.ingredientIds.length}.`,
        'error'
      );
    }
  }
}
