export class ManaSystem {
  private mana: number = 0;
  private maxMana: number = 1000;
  private manaPerGold: number = 10;
  private goldCostPerMana: number = 1;
  private onChangeCallbacks: ((mana: number) => void)[] = [];

  constructor() {}

  public initialize(mana: number = 0): void {
    this.mana = mana;
    this.notifyChange();
  }

  public onChange(callback: (mana: number) => void): void {
    this.onChangeCallbacks.push(callback);
  }

  private notifyChange(): void {
    this.onChangeCallbacks.forEach((cb) => cb(this.mana));
  }

  public getMana(): number {
    return this.mana;
  }

  public getMaxMana(): number {
    return this.maxMana;
  }

  public addMana(amount: number): void {
    this.mana = Math.min(this.mana + amount, this.maxMana);
    this.notifyChange();
  }

  public spendMana(amount: number): boolean {
    if (this.mana >= amount) {
      this.mana -= amount;
      this.notifyChange();
      return true;
    }
    return false;
  }

  public hasMana(amount: number): boolean {
    return this.mana >= amount;
  }

  public purchaseMana(goldSpent: number): number {
    const manaGained = Math.floor(goldSpent * this.manaPerGold);
    this.addMana(manaGained);
    return manaGained;
  }

  public getManaPrice(amount: number): number {
    return Math.ceil(amount / this.manaPerGold) * this.goldCostPerMana;
  }

  public getExchangeRate(): { manaPerGold: number; goldCostPerMana: number } {
    return {
      manaPerGold: this.manaPerGold,
      goldCostPerMana: this.goldCostPerMana,
    };
  }

  public setExchangeRate(manaPerGold: number): void {
    this.manaPerGold = manaPerGold;
  }

  public setMaxMana(max: number): void {
    this.maxMana = max;
    if (this.mana > this.maxMana) {
      this.mana = this.maxMana;
      this.notifyChange();
    }
  }

  public reset(): void {
    this.mana = 0;
    this.maxMana = 1000;
    this.manaPerGold = 10;
    this.goldCostPerMana = 1;
    this.notifyChange();
  }

  public setMana(amount: number): void {
    this.mana = Math.min(Math.max(0, amount), this.maxMana);
    this.notifyChange();
  }
}
