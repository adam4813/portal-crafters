import type { Game } from '../game/Game';
import type { ExpeditionSystem } from '../game/ExpeditionSystem';
import type { Portal as PortalType } from '../types';
import { formatTime } from '../utils/helpers';

export class ExpeditionUI {
  private game: Game;
  private currentTab: 'active' | 'available' | null = null;

  constructor(game: Game) {
    this.game = game;
  }

  public initialize(): void {
    // Expedition UI is rendered in a modal, so no initialization needed here
  }

  public resetTabState(): void {
    this.currentTab = null;
  }

  public render(expeditions: ExpeditionSystem, storedPortals: PortalType[]): string {
    const activeExpeditions = expeditions.getActiveExpeditions();
    const hasActive = activeExpeditions.length > 0;

    // Use stored tab if set, otherwise default based on active expeditions
    const activeTab = this.currentTab ?? (hasActive ? 'active' : 'available');

    let html = '<div class="expeditions-panel">';

    // Tabs
    html += `
      <div class="expedition-tabs">
        <button class="expedition-tab ${activeTab === 'active' ? 'active' : ''}" data-tab="active">
          🗺️ Active (${activeExpeditions.length})
        </button>
        <button class="expedition-tab ${activeTab === 'available' ? 'active' : ''}" data-tab="available">
          🌀 Available (${storedPortals.length})
        </button>
      </div>
    `;

    // Active tab content
    html += `<div class="expedition-tab-content" data-tab-content="active" style="${activeTab === 'active' ? '' : 'display:none'}">`;
    if (activeExpeditions.length === 0) {
      html += '<p class="empty-message">No active expeditions. Send a portal to start one!</p>';
    } else {
      html += this.renderActiveExpeditions(expeditions);
    }
    html += '</div>';

    // Available tab content
    html += `<div class="expedition-tab-content" data-tab-content="available" style="${activeTab === 'available' ? '' : 'display:none'}">`;
    html += '<div class="expedition-intro">';
    html +=
      "<p>Send portals to gather resources! The portal's elemental composition determines what can be found.</p>";
    html += '<p><strong>Note:</strong> Portals are consumed when used for expeditions.</p>';
    html += '</div>';

    if (storedPortals.length === 0) {
      html +=
        '<p class="empty-message">No portals available. Craft portals to send on expeditions!</p>';
    } else {
      html += '<div class="available-expeditions-list">';
      for (const portal of storedPortals) {
        const duration = expeditions.getExpectedDuration(portal);
        const rewards = expeditions.getExpectedRewards(portal);

        const elementsStr = Object.entries(portal.elements)
          .filter(([, amt]) => amt && amt > 0)
          .map(([el, amt]) => `${el}:${amt}`)
          .join(', ');

        const durationMinutes = Math.floor(duration / 60);
        const durationDisplay = durationMinutes < 1 ? '< 1 min' : `${durationMinutes} min`;

        html += `
          <div class="expedition-card portal-card">
            <div class="expedition-header">
              <h4>🌀 Level ${portal.level} Portal</h4>
              <span class="expedition-duration">⏱️ ${durationDisplay}</span>
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

  private renderRewardsList(
    rewards: { type: string; itemId?: string; amount: number; chance: number }[]
  ): string {
    if (rewards.length === 0) {
      return '<p class="no-rewards">This portal may not yield useful resources.</p>';
    }

    return `
      <ul class="reward-list">
        ${rewards
          .map(
            (r) => `
          <li>${r.amount}x ${r.itemId || r.type} (${Math.round(r.chance * 100)}% chance)</li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  public renderActiveExpeditions(expeditions: ExpeditionSystem): string {
    const activeExpeditions = expeditions.getActiveExpeditions();

    if (activeExpeditions.length === 0) {
      return '<p class="empty-message">No active expeditions</p>';
    }

    let html = '<div class="active-expeditions-list">';
    for (const expedition of activeExpeditions) {
      const timeRemaining = expeditions.getTimeRemaining(expedition.id);
      const isComplete = expeditions.isExpeditionComplete(expedition.id);
      const portal = expedition.portalSnapshot;

      // Format portal elements
      const elementsStr = Object.entries(portal.elements)
        .filter(([, amt]) => amt && amt > 0)
        .map(([el, amt]) => `${el}:${amt}`)
        .join(', ');

      // Build detailed tooltip
      const rewards = expeditions.getExpectedRewards(portal);
      const rewardsStr =
        rewards.length > 0
          ? rewards
              .map((r) => `${r.amount}x ${r.itemId || r.type} (${Math.round(r.chance * 100)}%)`)
              .join('\n')
          : 'No special rewards';
      const durationMinutes = Math.floor(expedition.duration / 60);
      const durationDisplay = durationMinutes < 1 ? '< 1 min' : `${durationMinutes} min`;
      const tooltip = `Portal Level: ${portal.level}\nMana Invested: ${portal.manaInvested}\nElements: ${elementsStr || 'None'}\nDuration: ${durationDisplay}\n\nPotential Rewards:\n${rewardsStr}`;

      html += `
        <div class="expedition-card active-expedition ${isComplete ? 'complete' : ''}" data-expedition-id="${expedition.id}" title="${tooltip.replace(/"/g, '&quot;')}">
          <div class="expedition-header">
            <h4>🗺️ Lv${portal.level} Portal</h4>
            <span class="expedition-timer ${isComplete ? 'complete' : ''}">${isComplete ? '✅ Complete!' : `⏱️ ${formatTime(timeRemaining)}`}</span>
          </div>
          <p class="expedition-description">${elementsStr || 'Pure mana'}</p>
          <div class="expedition-rewards">
            <strong>Potential Rewards:</strong>
            ${this.renderRewardsList(rewards)}
          </div>
          ${
            isComplete
              ? `
            <button class="btn-primary collect-expedition-btn" data-expedition-id="${expedition.id}">
              Collect Rewards
            </button>
          `
              : ''
          }
        </div>
      `;
    }
    html += '</div>';

    return html;
  }

  public attachEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.expedition-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const tabName = button.dataset.tab as 'active' | 'available';

        // Store the tab state
        this.currentTab = tabName;

        // Update tab active state
        document.querySelectorAll('.expedition-tab').forEach((t) => t.classList.remove('active'));
        button.classList.add('active');

        // Show/hide tab content
        document.querySelectorAll('.expedition-tab-content').forEach((content) => {
          const el = content as HTMLElement;
          el.style.display = el.dataset.tabContent === tabName ? '' : 'none';
        });
      });
    });

    // Send expedition buttons
    document.querySelectorAll('.send-expedition-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const portalId = button.dataset.portalId;
        if (portalId) {
          this.game.startExpedition(portalId);
        }
      });
    });

    // Collect expedition buttons
    document.querySelectorAll('.collect-expedition-btn').forEach((btn) => {
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
