import type { Game } from '../game/Game';
import type { InventorySystem } from '../game/Inventory';
import type { UpgradeSystem } from '../game/UpgradeSystem';
import { formatNumber } from '../utils/helpers';

export class ShopUI {
  private game: Game;
  private manaShopContainer: HTMLElement | null;
  private upgradeShopContainer: HTMLElement | null;

  private manaPackages = [
    { gold: 10, label: 'Small Mana Pack' },
    { gold: 50, label: 'Medium Mana Pack' },
    { gold: 100, label: 'Large Mana Pack' },
  ];

  constructor(game: Game) {
    this.game = game;
    this.manaShopContainer = document.getElementById('mana-shop');
    this.upgradeShopContainer = document.getElementById('upgrade-shop');
  }

  public initialize(): void {
    this.renderManaShop();
  }

  private renderManaShop(): void {
    if (!this.manaShopContainer) return;

    const manaSystem = this.game.getManaSystem();
    const exchangeRate = manaSystem.getExchangeRate();

    let html = '<h4>Buy Mana</h4>';
    html += '<div class="exchange-rate-info">';
    html += `<p class="info-text">Current rate: <strong>${exchangeRate.manaPerGold} mana per gold</strong></p>`;
    html += '</div>';

    for (const pack of this.manaPackages) {
      const manaAmount = pack.gold * exchangeRate.manaPerGold;
      html += `
        <div class="shop-item" data-gold="${pack.gold}">
          <div class="shop-item-info">
            <div class="shop-item-name">${pack.label}</div>
            <div class="shop-item-description">+${manaAmount} mana</div>
          </div>
          <button class="btn-secondary buy-mana-btn" data-gold="${pack.gold}">
            ${pack.gold} 💰
          </button>
        </div>
      `;
    }

    this.manaShopContainer.innerHTML = html;

    // Add click handlers
    this.manaShopContainer.querySelectorAll('.buy-mana-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gold = parseInt((btn as HTMLElement).dataset.gold || '0', 10);
        this.game.purchaseMana(gold);
      });
    });
  }

  public update(inventory: InventorySystem, upgrades: UpgradeSystem): void {
    this.updateManaShop(inventory);
    this.renderUpgradeShop(upgrades, inventory);
  }

  private updateManaShop(inventory: InventorySystem): void {
    if (!this.manaShopContainer) return;

    const gold = inventory.getGold();

    this.manaShopContainer.querySelectorAll('.buy-mana-btn').forEach((btn) => {
      const cost = parseInt((btn as HTMLElement).dataset.gold || '0', 10);
      (btn as HTMLButtonElement).disabled = gold < cost;
    });
  }

  private renderUpgradeShop(upgrades: UpgradeSystem, inventory: InventorySystem): void {
    if (!this.upgradeShopContainer) return;

    const allUpgrades = upgrades.getAllUpgrades();
    const gold = inventory.getGold();

    let html = '<h4>Upgrades</h4>';

    for (const upgrade of allUpgrades) {
      const cost = upgrades.getUpgradeCost(upgrade.id);
      const canAfford = gold >= cost;
      const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;

      // Show conversion rate effect for conversion upgrades
      let effectInfo = '';
      if (upgrade.id.includes('conversion') && upgrade.currentLevel > 0) {
        const effectValue = upgrades.getEffect(upgrade.id);
        const percentage = Math.round(effectValue * 100);
        effectInfo = `<div class="upgrade-effect">+${percentage}% efficiency</div>`;
      }

      html += `
        <div class="shop-item ${isMaxed ? 'maxed' : ''}">
          <div class="shop-item-info">
            <div class="shop-item-name">${upgrade.name}</div>
            <div class="shop-item-description">${upgrade.description}</div>
            ${effectInfo}
            <div class="shop-item-level">
              Level: ${upgrade.currentLevel}/${upgrade.maxLevel}
            </div>
          </div>
          <button 
            class="btn-secondary buy-upgrade-btn" 
            data-id="${upgrade.id}"
            ${!canAfford || isMaxed ? 'disabled' : ''}
          >
            ${isMaxed ? 'MAX' : `${formatNumber(cost)} 💰`}
          </button>
        </div>
      `;
    }

    this.upgradeShopContainer.innerHTML = html;

    // Add click handlers
    this.upgradeShopContainer.querySelectorAll('.buy-upgrade-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          this.game.purchaseUpgrade(id);
        }
      });
    });
  }
}
