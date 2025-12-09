import type { Game } from '../game/Game';
import type { Portal as PortalType } from '../types';
import { getElementDefinition } from '../data/elements';
import { getIngredientById } from '../data/ingredients';
import { getEquipmentById } from '../data/equipment';

function buildPortalTooltip(portal: PortalType): string {
  const lines: string[] = [];

  // Portal type name and affinity (if available)
  if (portal.typeName) {
    lines.push(`${portal.typeName}`);
    if (portal.affinity) {
      lines.push(`Affinity: ${portal.affinity}`);
    }
    lines.push('');
  }

  lines.push(`Level ${portal.level} Portal`);
  lines.push('');

  // Mana invested
  if (portal.manaInvested > 0) {
    lines.push(`Raw Mana: ${portal.manaInvested}`);
  }

  // Elements
  const elementEntries = Object.entries(portal.elements).filter(
    ([, amount]) => amount && amount > 0
  );
  if (elementEntries.length > 0) {
    lines.push('');
    lines.push('Elements:');
    for (const [element, amount] of elementEntries) {
      const elementDef = getElementDefinition(element as any);
      const icon = elementDef?.icon || '?';
      const potency = elementDef?.properties.powerMultiplier || 1.0;
      const potencyStr = potency !== 1.0 ? ` (${potency}x)` : '';
      lines.push(`  ${icon} ${element}: ${amount}${potencyStr}`);
    }
  }

  // Portal attributes (if available)
  if (portal.attributes && Object.keys(portal.attributes).length > 0) {
    lines.push('');
    lines.push('Attributes:');
    for (const [attr, value] of Object.entries(portal.attributes)) {
      // Format attribute name: capitalize first letter and convert camelCase to spaces
      const formattedAttr = attr
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      lines.push(`  ${formattedAttr}: ${value}`);
    }
  }

  // Ingredients used
  if (portal.ingredients && portal.ingredients.length > 0) {
    lines.push('');
    lines.push('Items Used:');
    for (const ingredientId of portal.ingredients) {
      const ingredient = getIngredientById(ingredientId);
      if (ingredient) {
        lines.push(`  ${ingredient.icon} ${ingredient.name}`);
      }
    }
  }

  // Equipment used
  if (portal.equipment && portal.equipment.length > 0) {
    for (const equipId of portal.equipment) {
      const equip = getEquipmentById(equipId);
      if (equip) {
        lines.push(`  ${equip.icon} ${equip.name}`);
      }
    }
  }

  // Generated equipment attributes
  if (portal.generatedEquipmentAttributes && portal.generatedEquipmentAttributes.length > 0) {
    lines.push('');
    lines.push('Equipment Effects:');
    for (const equip of portal.generatedEquipmentAttributes) {
      lines.push(`  ${equip.icon} ${equip.name}`);
    }
  }

  // Created timestamp
  const createdDate = new Date(portal.createdAt);
  lines.push('');
  lines.push(`Crafted: ${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`);

  return lines.join('\n');
}

export class PortalInventoryUI {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(_storedPortals: PortalType[]): void {
    // No longer rendering to sidebar, just used for modal
  }

  public renderToModal(container: HTMLElement, storedPortals: PortalType[]): void {
    if (storedPortals.length === 0) {
      container.innerHTML = `
        <p class="empty-message">No crafted portals</p>
        <p class="info-text">Craft portals using ingredients to store them here.</p>
      `;
      return;
    }

    let html = '<div class="portal-list">';
    for (const portal of storedPortals) {
      const elementsStr = Object.entries(portal.elements)
        .filter(([, amount]) => amount && amount > 0)
        .map(([el, amount]) => {
          const elementDef = getElementDefinition(el as any);
          const icon = elementDef?.icon || '';
          return `${icon}${amount}`;
        })
        .join(' ');

      const tooltip = buildPortalTooltip(portal);

      // Display portal type name if available, otherwise show level
      const displayName = portal.typeName || `Level ${portal.level} Portal`;

      html += `
        <div class="stored-portal" data-portal-id="${portal.id}" title="${tooltip}">
          <div class="portal-info">
            <span class="portal-name">${displayName}</span>
            <span class="portal-elements-preview">${elementsStr || 'No elements'}</span>
          </div>
          <div class="portal-actions">
            <button class="btn-reclaim-portal btn-danger-small" data-portal-id="${portal.id}" title="Reclaim for partial mana refund">♻️</button>
          </div>
        </div>
      `;
    }
    html += '</div>';

    container.innerHTML = html;

    container.querySelectorAll('.btn-reclaim-portal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const portalId = (e.target as HTMLElement).dataset.portalId;
        if (portalId) {
          this.game.reclaimStoredPortal(portalId);
        }
      });
    });
  }
}
