import type { Game } from '../game/Game';
import type { CustomerSystem } from '../game/Customer';
import type { ProgressionSystem } from '../game/ProgressionSystem';
import type { ElementSystem } from '../game/ElementSystem';
import type { Portal as PortalType, Customer } from '../types';
import { formatTime } from '../utils/helpers';

export class CustomerUI {
  private game: Game;
  private queueContainer: HTMLElement | null;
  private progressionContainer: HTMLElement | null;
  private timerInterval: number | null = null;
  private isPaused: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.queueContainer = document.getElementById('customer-queue');
    this.progressionContainer = document.getElementById('progression-status');
  }

  public initialize(): void {
    // Start timer interval for updating countdowns (every second)
    this.timerInterval = window.setInterval(() => {
      if (!this.isPaused) {
        this.updateTimers();
      }
    }, 1000);
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public dispose(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimers(): void {
    if (!this.queueContainer) return;

    const now = Date.now();
    const timerElements = this.queueContainer.querySelectorAll('.customer-timer');
    let hasExpired = false;
    
    timerElements.forEach((timerEl) => {
      const card = timerEl.closest('.customer-card') as HTMLElement;
      if (!card) return;
      
      const arrivedAt = parseInt(card.dataset.arrivedAt || '0', 10);
      const patience = parseInt(card.dataset.patience || '0', 10);
      
      if (arrivedAt && patience) {
        const waitTime = Math.floor((now - arrivedAt) / 1000);
        const timeRemaining = Math.max(0, patience - waitTime);
        
        timerEl.textContent = `⏱️ ${formatTime(timeRemaining)}`;
        timerEl.classList.toggle('urgent', timeRemaining < 30);
        
        if (timeRemaining === 0) {
          hasExpired = true;
        }
      }
    });

    // If any customer expired, trigger a full UI refresh
    if (hasExpired) {
      this.game.refreshUI();
    }
  }

  public update(
    customers: CustomerSystem, 
    storedPortals: PortalType[], 
    progression?: ProgressionSystem, 
    elements?: ElementSystem
  ): void {
    this.renderProgressionStatus(progression, elements);
    this.renderQueue(customers, storedPortals);
  }

  private renderProgressionStatus(progression?: ProgressionSystem, elements?: ElementSystem): void {
    if (!this.progressionContainer || !progression || !elements) return;

    const currentTier = progression.getCurrentTier();
    const nextTier = progression.getNextTier();
    const contractsCompleted = progression.getContractsCompletedThisTier();
    const miniBossCompleted = progression.isMiniBossCompleted(currentTier.tier);

    let html = '<div class="progression-info">';
    html += `<div class="tier-name">🏆 ${currentTier.name} (Tier ${currentTier.tier})</div>`;
    html += `<div class="tier-progress">`;
    html += `<span class="contracts-count">Contracts: ${contractsCompleted}</span>`;
    html += `<span class="miniboss-status ${miniBossCompleted ? 'complete' : 'incomplete'}">`;
    html += miniBossCompleted ? '✅ Mini-boss Complete' : '⚔️ Mini-boss Pending';
    html += `</span>`;
    html += `</div>`;

    // Show next tier unlock requirements if available
    if (nextTier) {
      const unlockStatus = progression.getNextTierUnlockStatus(elements.getUnlockedElements());
      html += `<div class="next-tier-info">`;
      html += `<div class="next-tier-name">Next: ${nextTier.name}</div>`;
      html += `<div class="unlock-requirements">`;
      
      // Mini-boss requirement
      html += `<div class="requirement ${unlockStatus.miniBossCompleted ? 'met' : 'unmet'}">`;
      html += `${unlockStatus.miniBossCompleted ? '✅' : '❌'} Complete mini-boss`;
      html += `</div>`;
      
      // Contracts requirement
      html += `<div class="requirement ${unlockStatus.contractsCompleted ? 'met' : 'unmet'}">`;
      html += `${unlockStatus.contractsCompleted ? '✅' : '❌'} ${contractsCompleted}/${unlockStatus.contractsNeeded} contracts`;
      html += `</div>`;
      
      // Element requirement
      if (unlockStatus.elementNeeded) {
        html += `<div class="requirement ${unlockStatus.elementUnlocked ? 'met' : 'unmet'}">`;
        html += `${unlockStatus.elementUnlocked ? '✅' : '❌'} Research ${unlockStatus.elementNeeded}`;
        html += `</div>`;
      }
      
      html += `</div>`;
      html += `</div>`;
    } else {
      html += `<div class="next-tier-info">🎉 Max tier reached!</div>`;
    }

    html += '</div>';
    this.progressionContainer.innerHTML = html;
  }

  private renderQueue(customers: CustomerSystem, storedPortals: PortalType[]): void {
    if (!this.queueContainer) return;

    const queue = customers.getQueue();

    if (queue.length === 0) {
      this.queueContainer.innerHTML = '<p class="empty-message">No customers waiting...</p>';
      return;
    }

    let html = '';
    const now = Date.now();

    for (const customer of queue) {
      const waitTime = Math.floor((now - customer.arrivedAt) / 1000);
      const timeRemaining = Math.max(0, customer.patience - waitTime);
      const isMiniBoss = customer.id.startsWith('miniboss-');

      // Find which portals can fulfill this customer
      const matchingPortals = storedPortals.filter(portal => 
        this.portalMeetsRequirements(portal, customer)
      );

      // Build requirements display
      const reqElements = this.formatElementRequirement(customer.requirements);
      const reqMana = customer.requirements.minMana 
        ? `✨ ≥${customer.requirements.minMana}` 
        : '';

      // Add special class for mini-boss
      const cardClass = isMiniBoss ? 'customer-card miniboss-card' : 'customer-card';
      const timerDisplay = isMiniBoss 
        ? '<div class="customer-timer unlimited">⏱️ ∞ Unlimited</div>' 
        : `<div class="customer-timer ${timeRemaining < 30 ? 'urgent' : ''}">⏱️ ${formatTime(timeRemaining)}</div>`;

      html += `
        <div class="${cardClass}" data-customer-id="${customer.id}" data-arrived-at="${customer.arrivedAt}" data-patience="${customer.patience}">
          <div class="customer-header">
            <div class="customer-name">${customer.icon} ${customer.name}</div>
            ${timerDisplay}
          </div>
          <div class="customer-requirements">
            <span class="req-level">Lv ${customer.requirements.minLevel}+</span>
            ${reqMana ? `<span class="req-mana">${reqMana}</span>` : ''}
            <span class="req-elements">${reqElements}</span>
          </div>
          <div class="customer-reward">💰 ${customer.payment} gold</div>
          <div class="customer-fulfill">
            ${this.renderPortalSelector(customer, matchingPortals, storedPortals)}
          </div>
        </div>
      `;
    }

    this.queueContainer.innerHTML = html;

    // Add event listeners for fulfill buttons
    this.queueContainer.querySelectorAll('.btn-fulfill-contract').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target as HTMLButtonElement;
        const customerId = button.dataset.customerId;
        const portalId = button.dataset.portalId;
        if (customerId && portalId) {
          this.game.fulfillCustomerWithPortal(customerId, portalId);
        }
      });
    });

    // Add event listeners for portal selectors
    this.queueContainer.querySelectorAll('.portal-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const selectEl = e.target as HTMLSelectElement;
        const customerId = selectEl.dataset.customerId;
        const fulfillBtn = this.queueContainer?.querySelector(
          `.btn-fulfill-contract[data-customer-id="${customerId}"]`
        ) as HTMLButtonElement;
        
        if (fulfillBtn) {
          fulfillBtn.dataset.portalId = selectEl.value;
          fulfillBtn.disabled = !selectEl.value;
        }
      });
    });
  }

  private renderPortalSelector(customer: Customer, matchingPortals: PortalType[], allPortals: PortalType[]): string {
    if (allPortals.length === 0) {
      return '<span class="no-portals">No portals crafted</span>';
    }

    if (matchingPortals.length === 0) {
      return '<span class="no-match">No matching portals</span>';
    }

    if (matchingPortals.length === 1) {
      // Single matching portal - show direct fulfill button
      const portal = matchingPortals[0];
      const elementsStr = Object.entries(portal.elements)
        .filter(([, amt]) => amt && amt > 0)
        .map(([el, amt]) => `${el}:${amt}`)
        .join(' ');
      
      return `
        <button class="btn-fulfill-contract btn-primary-small" 
                data-customer-id="${customer.id}" 
                data-portal-id="${portal.id}">
          Fulfill (Lv${portal.level} ${elementsStr})
        </button>
      `;
    }

    // Multiple matching portals - show dropdown
    let options = '<option value="">Select portal...</option>';
    for (const portal of matchingPortals) {
      const elementsStr = Object.entries(portal.elements)
        .filter(([, amt]) => amt && amt > 0)
        .map(([el, amt]) => `${el}:${amt}`)
        .join(' ');
      options += `<option value="${portal.id}">Lv${portal.level} - ${elementsStr || 'No elements'}</option>`;
    }

    return `
      <select class="portal-select" data-customer-id="${customer.id}">
        ${options}
      </select>
      <button class="btn-fulfill-contract btn-primary-small" 
              data-customer-id="${customer.id}" 
              data-portal-id=""
              disabled>
        Fulfill
      </button>
    `;
  }

  private formatElementRequirement(requirements: Customer['requirements']): string {
    const req = requirements.requiredElements;
    
    if (req === undefined) {
      return 'Any'; // No restriction
    }
    
    if (req === 'any') {
      return 'Any element';
    }
    
    if (req === 'none') {
      return 'No elements';
    }
    
    // Specific elements array
    if (Array.isArray(req) && req.length > 0) {
      const needed = requirements.minElementAmount || 1;
      return req.map(el => `${el} ≥${needed}`).join(', ');
    }
    
    return 'Any';
  }

  private portalMeetsRequirements(portal: PortalType, customer: Customer): boolean {
    // Check level requirement
    if (portal.level < customer.requirements.minLevel) {
      return false;
    }

    // Check mana requirement
    if (customer.requirements.minMana && portal.manaInvested < customer.requirements.minMana) {
      return false;
    }

    // Check element requirements
    const reqElements = customer.requirements.requiredElements;
    const portalElementTotal = Object.values(portal.elements).reduce((sum, val) => sum + (val || 0), 0);
    
    if (reqElements === 'any') {
      // Must have at least some elements
      if (portalElementTotal === 0) {
        return false;
      }
    } else if (reqElements === 'none') {
      // Must have no elements (raw mana only)
      if (portalElementTotal > 0) {
        return false;
      }
    } else if (Array.isArray(reqElements) && reqElements.length > 0) {
      // Must have specific elements
      for (const element of reqElements) {
        const amount = portal.elements[element] || 0;
        if (amount < (customer.requirements.minElementAmount || 1)) {
          return false;
        }
      }
    }
    // If reqElements is undefined, any combination is allowed

    return true;
  }
}
