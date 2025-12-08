import type { Game } from '../game/Game';
import type { ExpeditionSystem } from '../game/ExpeditionSystem';
import type { Portal as PortalType } from '../types';
import { formatTime } from '../utils/helpers';

export class ExpeditionUI {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public initialize(): void {
    // Expedition UI is rendered in a modal, so no initialization needed here
  }

  public render(expeditions: ExpeditionSystem, storedPortals: PortalType[]): string {
    const activeExpeditions = expeditions.getActiveExpeditions();

    let html = '<div class="expeditions-panel">';

    // Introduction text
    html += '<div class="expedition-intro">';
    html += '<p>Send parties through your crafted portals to gather resources! The portal\'s elemental composition determines what can be found.</p>';
    html += '<p><strong>Note:</strong> Portals are consumed when used for expeditions.</p>';
    html += '</div>';

    // Active Expeditions Section
    html += '<div class="expeditions-section">';
    html += '<h3>Active Expeditions</h3>';
    
    if (activeExpeditions.length === 0) {
      html += '<p class="empty-message">No active expeditions</p>';
    } else {
      html += '<div class="active-expeditions-list">';
      for (const expedition of activeExpeditions) {
        const timeRemaining = expeditions.getTimeRemaining(expedition.id);
        const isComplete = expeditions.isExpeditionComplete(expedition.id);
        const portal = expedition.portalSnapshot;
        
        // Get expected rewards
        const rewards = expeditions.getExpectedRewards(portal);
        
        // Format portal elements
        const elementsStr = Object.entries(portal.elements)
          .filter(([, amt]) => amt && amt > 0)
          .map(([el, amt]) => `${el}:${amt}`)
          .join(', ');
        
        html += `
          <div class="expedition-card active-expedition ${isComplete ? 'complete' : ''}">
            <div class="expedition-header">
              <h4>🗺️ Expedition (Lv${portal.level} Portal)</h4>
              <span class="expedition-timer ${isComplete ? 'complete' : ''}">${isComplete ? '✅ Complete!' : `⏱️ ${formatTime(timeRemaining)}`}</span>
            </div>
            <p class="expedition-description">Portal elements: ${elementsStr || 'None'}</p>
            <div class="expedition-rewards">
              <strong>Potential Rewards:</strong>
              ${this.renderRewardsList(rewards)}
            </div>
            ${isComplete ? `
              <button class="btn-primary collect-expedition-btn" data-expedition-id="${expedition.id}">
                Collect Rewards
              </button>
            ` : ''}
          </div>
        `;
      }
      html += '</div>';
    }
    html += '</div>';

    // Available Portals Section
    html += '<div class="expeditions-section">';
    html += '<h3>Send Portal on Expedition</h3>';
    
    if (storedPortals.length === 0) {
      html += '<p class="empty-message">No portals available. Craft portals to send on expeditions!</p>';
    } else {
      html += '<div class="available-expeditions-list">';
      
      for (const portal of storedPortals) {
        const duration = expeditions.getExpectedDuration(portal);
        const rewards = expeditions.getExpectedRewards(portal);
        
        // Format portal elements
        const elementsStr = Object.entries(portal.elements)
          .filter(([, amt]) => amt && amt > 0)
          .map(([el, amt]) => `${el}:${amt}`)
          .join(', ');

        html += `
          <div class="expedition-card portal-card">
            <div class="expedition-header">
              <h4>🌀 Level ${portal.level} Portal</h4>
              <span class="expedition-duration">⏱️ ${Math.floor(duration / 60)} min</span>
            </div>
            <p class="expedition-description">
              <strong>Elements:</strong> ${elementsStr || 'Pure mana portal'}<br>
              <strong>Mana:</strong> ${portal.manaInvested}
            </p>
            <div class="expedition-rewards">
              <strong>Expected Rewards:</strong>
              ${this.renderRewardsList(rewards)}
            </div>
            <button 
              class="btn-primary send-expedition-btn" 
              data-portal-id="${portal.id}">
              Send Expedition
            </button>
          </div>
        `;
      }

      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    return html;
  }

  private renderRewardsList(rewards: { type: string; itemId?: string; amount: number; chance: number }[]): string {
    if (rewards.length === 0) {
      return '<p class="no-rewards">This portal may not yield useful resources.</p>';
    }
    
    return `
      <ul class="reward-list">
        ${rewards.map(r => `
          <li>${r.amount}x ${r.itemId || r.type} (${Math.round(r.chance * 100)}% chance)</li>
        `).join('')}
      </ul>
    `;
  }

  public attachEventListeners(): void {
    // Send expedition buttons
    document.querySelectorAll('.send-expedition-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const portalId = button.dataset.portalId;
        if (portalId) {
          this.game.startExpedition(portalId);
        }
      });
    });

    // Collect expedition buttons
    document.querySelectorAll('.collect-expedition-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const expeditionId = button.dataset.expeditionId;
        if (expeditionId) {
          this.game.completeExpedition(expeditionId);
        }
      });
    });
  }
}
