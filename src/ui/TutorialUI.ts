export class TutorialUI {
  private container: HTMLElement | null;

  constructor() {
    this.container = document.getElementById('tutorial-content');
  }

  public initialize(): void {
    this.render();
  }

  private render(): void {
    if (!this.container) return;

    const html = `
      <div class="tutorial-section">
        <h4>💰 The Mana System</h4>
        <div class="tutorial-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <strong>Buy Mana</strong>
            <p>Purchase mana using gold in the "Buy Mana" section. Better exchange rates available through upgrades.</p>
          </div>
        </div>
        <div class="tutorial-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <strong>Convert to Elements</strong>
            <p>Use the "Convert Mana to Elements" section to transform mana into elemental energy (Fire, Water, etc.).</p>
          </div>
        </div>
        <div class="tutorial-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <strong>Upgrade Conversion Rates</strong>
            <p>Purchase "Fire Conversion" and "Water Conversion" upgrades to get more elements per mana.</p>
          </div>
        </div>
        <div class="tutorial-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <strong>Craft Portals</strong>
            <p>Add ingredients and elements to crafting slots, then click "Craft Portal" to create portals for customers.</p>
          </div>
        </div>
      </div>
      <div class="tutorial-tips">
        <h4>💡 Quick Tips</h4>
        <ul>
          <li>Higher tier elements cost more mana but provide better portal bonuses</li>
          <li>Research new elements to unlock more powerful combinations</li>
          <li>Conversion rate upgrades stack - the more you buy, the better the rate!</li>
          <li>Check the inventory to see your current element stockpile</li>
        </ul>
      </div>
    `;

    this.container.innerHTML = html;
  }

  public update(): void {
    // Tutorial is static, no updates needed
  }
}
