import type { Game } from '../game/Game';
import type { Portal as PortalType } from '../types';

export class PortalInventoryUI {
  private game: Game;
  private container: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.container = document.getElementById('portal-inventory');
  }

  public initialize(): void {
    // Initial render will happen on first update
  }

  public update(storedPortals: PortalType[]): void {
    if (!this.container) return;

    if (storedPortals.length === 0) {
      this.container.innerHTML = `
        <p class="empty-message">No crafted portals</p>
        <p class="info-text">Craft portals using ingredients to store them here.</p>
      `;
      return;
    }

    let html = '';
    for (const portal of storedPortals) {
      const elementsStr = Object.entries(portal.elements)
        .filter(([, amount]) => amount && amount > 0)
        .map(([el, amount]) => `${el}: ${amount}`)
        .join(', ');

      html += `
        <div class="stored-portal" data-portal-id="${portal.id}">
          <div class="portal-info">
            <span class="portal-level-badge">Lv ${portal.level}</span>
            <span class="portal-elements-preview">${elementsStr || 'No elements'}</span>
          </div>
          <div class="portal-actions">
            <button class="btn-reclaim-portal btn-danger-small" data-portal-id="${portal.id}" title="Reclaim for partial mana refund">♻️</button>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = html;

    this.container.querySelectorAll('.btn-reclaim-portal').forEach((btn) => {
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
