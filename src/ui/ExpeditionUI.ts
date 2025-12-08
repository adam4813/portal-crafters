import type { Game } from '../game/Game';
import type { ExpeditionSystem } from '../game/ExpeditionSystem';
import { formatTime } from '../utils/helpers';

export class ExpeditionUI {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public initialize(): void {
    // Expedition UI is rendered in a modal, so no initialization needed here
  }

  public render(expeditions: ExpeditionSystem, inventory: { gold: number; mana: number }): string {
    const availableExpeditions = expeditions.getAvailableExpeditions();
    const activeExpeditions = expeditions.getActiveExpeditions();

    let html = '<div class="expeditions-panel">';

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
        
        html += `
          <div class="expedition-card active-expedition ${isComplete ? 'complete' : ''}">
            <div class="expedition-header">
              <h4>🗺️ ${expedition.name}</h4>
              <span class="expedition-timer ${isComplete ? 'complete' : ''}">${isComplete ? '✅ Complete!' : `⏱️ ${formatTime(timeRemaining)}`}</span>
            </div>
            <p class="expedition-description">${expedition.description}</p>
            <div class="expedition-rewards">
              <strong>Potential Rewards:</strong>
              <ul class="reward-list">
                ${expedition.rewards.map(r => `
                  <li>${r.amount}x ${r.itemId || r.type} (${Math.round(r.chance * 100)}% chance)</li>
                `).join('')}
              </ul>
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

    // Available Expeditions Section
    html += '<div class="expeditions-section">';
    html += '<h3>Available Expeditions</h3>';
    html += '<div class="available-expeditions-list">';
    
    availableExpeditions.forEach((expedition, index) => {
      const canAfford = (!expedition.requirements?.gold || inventory.gold >= expedition.requirements.gold) &&
                       (!expedition.requirements?.mana || inventory.mana >= expedition.requirements.mana);
      
      const costDisplay = [];
      if (expedition.requirements?.gold) {
        costDisplay.push(`💰 ${expedition.requirements.gold} gold`);
      }
      if (expedition.requirements?.mana) {
        costDisplay.push(`✨ ${expedition.requirements.mana} mana`);
      }

      html += `
        <div class="expedition-card">
          <div class="expedition-header">
            <h4>🗺️ ${expedition.name}</h4>
            <span class="expedition-duration">⏱️ ${Math.floor(expedition.duration / 60)} min</span>
          </div>
          <p class="expedition-description">${expedition.description}</p>
          <div class="expedition-cost">
            <strong>Cost:</strong> ${costDisplay.join(', ')}
          </div>
          <div class="expedition-rewards">
            <strong>Potential Rewards:</strong>
            <ul class="reward-list">
              ${expedition.rewards.map(r => `
                <li>${r.amount}x ${r.itemId || r.type} (${Math.round(r.chance * 100)}% chance)</li>
              `).join('')}
            </ul>
          </div>
          <button 
            class="btn-primary start-expedition-btn ${!canAfford ? 'disabled' : ''}" 
            data-expedition-index="${index}"
            ${!canAfford ? 'disabled' : ''}>
            Start Expedition
          </button>
        </div>
      `;
    });

    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
  }

  public attachEventListeners(): void {
    // Start expedition buttons
    document.querySelectorAll('.start-expedition-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const index = parseInt(button.dataset.expeditionIndex || '0', 10);
        this.game.startExpedition(index);
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
