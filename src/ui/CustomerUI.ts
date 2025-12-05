import type { Game } from '../game/Game';
import type { CustomerSystem } from '../game/Customer';
import type { Portal } from '../game/Portal';
import { formatTime } from '../utils/helpers';

export class CustomerUI {
  private game: Game;
  private queueContainer: HTMLElement | null;
  private contractContainer: HTMLElement | null;

  constructor(game: Game) {
    this.game = game;
    this.queueContainer = document.getElementById('customer-queue');
    this.contractContainer = document.getElementById('current-contract');
  }

  public initialize(): void {
    // Add complete contract button
    if (this.contractContainer) {
      const completeBtn = document.createElement('button');
      completeBtn.id = 'complete-contract-btn';
      completeBtn.className = 'btn-primary';
      completeBtn.textContent = 'Complete Contract';
      completeBtn.style.marginTop = '1rem';
      completeBtn.style.display = 'none';
      completeBtn.addEventListener('click', () => {
        this.game.completeContract();
      });
      this.contractContainer.appendChild(completeBtn);
    }
  }

  public update(customers: CustomerSystem, portal: Portal): void {
    this.renderQueue(customers);
    this.renderCurrentContract(customers, portal);
  }

  private renderQueue(customers: CustomerSystem): void {
    if (!this.queueContainer) return;

    const queue = customers.getQueue();

    if (queue.length === 0) {
      this.queueContainer.innerHTML = '<p class="empty-message">No customers waiting...</p>';
      return;
    }

    let html = '';
    const now = Date.now();

    for (let i = 0; i < queue.length; i++) {
      const customer = queue[i];
      const waitTime = Math.floor((now - customer.arrivedAt) / 1000);
      const timeRemaining = Math.max(0, customer.patience - waitTime);
      const isActive = i === 0;

      html += `
        <div class="customer-card ${isActive ? 'active' : ''}">
          <div class="customer-name">${customer.icon} ${customer.name}</div>
          <div class="customer-requirements">
            Level ${customer.requirements.minLevel}+
            ${customer.requirements.requiredElements?.map((e) => `• ${e}`).join(' ') || ''}
          </div>
          <div class="customer-reward">💰 ${customer.payment} gold</div>
          <div class="customer-timer">⏱️ ${formatTime(timeRemaining)}</div>
        </div>
      `;
    }

    this.queueContainer.innerHTML = html;
  }

  private renderCurrentContract(customers: CustomerSystem, portal: Portal): void {
    if (!this.contractContainer) return;

    const customer = customers.getCurrentCustomer();
    const completeBtn = document.getElementById('complete-contract-btn');

    if (!customer) {
      const existingContent = this.contractContainer.querySelector('.contract-content');
      if (existingContent) {
        existingContent.remove();
      }
      if (completeBtn) {
        completeBtn.style.display = 'none';
      }
      return;
    }

    const portalData = portal.getData();
    const meetsLevel = portalData.level >= customer.requirements.minLevel;

    let meetsElements = true;
    if (customer.requirements.requiredElements) {
      for (const element of customer.requirements.requiredElements) {
        const amount = portalData.elements[element] || 0;
        if (amount < (customer.requirements.minElementAmount || 1)) {
          meetsElements = false;
          break;
        }
      }
    }

    const canComplete = meetsLevel && meetsElements;

    // Find or create contract content div
    let contentDiv = this.contractContainer.querySelector('.contract-content') as HTMLElement;
    if (!contentDiv) {
      contentDiv = document.createElement('div');
      contentDiv.className = 'contract-content';
      this.contractContainer.insertBefore(contentDiv, completeBtn);
    }

    contentDiv.innerHTML = `
      <h4>Current Contract</h4>
      <div class="contract-details">
        <p><strong>${customer.name}</strong></p>
        <p>Requirements:</p>
        <ul>
          <li class="${meetsLevel ? 'met' : 'unmet'}">
            ${meetsLevel ? '✓' : '✗'} Level ${customer.requirements.minLevel}+
            (Current: ${portalData.level})
          </li>
          ${
            customer.requirements.requiredElements
              ?.map((el) => {
                const amount = portalData.elements[el] || 0;
                const needed = customer.requirements.minElementAmount || 1;
                const met = amount >= needed;
                return `<li class="${met ? 'met' : 'unmet'}">
                  ${met ? '✓' : '✗'} ${el}: ${amount}/${needed}
                </li>`;
              })
              .join('') || ''
          }
        </ul>
        <p class="contract-reward">Reward: 💰 ${customer.payment} gold</p>
      </div>
    `;

    if (completeBtn) {
      completeBtn.style.display = 'block';
      (completeBtn as HTMLButtonElement).disabled = !canComplete;
    }
  }
}
