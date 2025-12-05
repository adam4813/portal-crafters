import type { ElementType, ResearchNode, ConversionRate } from '../types';
import { ELEMENTS, RESEARCH_TREE, CONVERSION_RATES, getElementDefinition } from '../data/elements';

export class ElementSystem {
  private unlockedElements: Set<ElementType> = new Set(['fire', 'water']);
  private researchNodes: Map<ElementType, ResearchNode> = new Map();
  private conversionRates: Map<ElementType, ConversionRate> = new Map();
  private onUnlockCallbacks: ((element: ElementType) => void)[] = [];

  constructor() {
    this.initializeResearch();
    this.initializeConversionRates();
  }

  private initializeResearch(): void {
    for (const node of RESEARCH_TREE) {
      this.researchNodes.set(node.element, { ...node });
    }
  }

  private initializeConversionRates(): void {
    for (const rate of CONVERSION_RATES) {
      this.conversionRates.set(rate.element, { ...rate });
    }
  }

  public initialize(unlockedElements: ElementType[]): void {
    this.unlockedElements = new Set(unlockedElements);
    // Update research nodes
    for (const element of unlockedElements) {
      const node = this.researchNodes.get(element);
      if (node) {
        node.unlocked = true;
      }
    }
  }

  public onUnlock(callback: (element: ElementType) => void): void {
    this.onUnlockCallbacks.push(callback);
  }

  public getUnlockedElements(): ElementType[] {
    return Array.from(this.unlockedElements);
  }

  public isElementUnlocked(element: ElementType): boolean {
    return this.unlockedElements.has(element);
  }

  public canResearch(element: ElementType): boolean {
    const node = this.researchNodes.get(element);
    if (!node || node.unlocked) return false;

    // Check prerequisites
    return node.prerequisites.every((prereq) => this.unlockedElements.has(prereq));
  }

  public getResearchCost(element: ElementType): number {
    const node = this.researchNodes.get(element);
    return node?.cost || 0;
  }

  public research(element: ElementType): boolean {
    if (!this.canResearch(element)) return false;

    const node = this.researchNodes.get(element);
    if (!node) return false;

    node.unlocked = true;
    this.unlockedElements.add(element);

    // Notify callbacks
    this.onUnlockCallbacks.forEach((cb) => cb(element));

    return true;
  }

  public getResearchableElements(): ElementType[] {
    const researchable: ElementType[] = [];
    for (const [element, node] of this.researchNodes) {
      if (!node.unlocked && this.canResearch(element)) {
        researchable.push(element);
      }
    }
    return researchable;
  }

  public getAllResearchNodes(): ResearchNode[] {
    return Array.from(this.researchNodes.values());
  }

  public getConversionRate(element: ElementType): number {
    const rate = this.conversionRates.get(element);
    if (!rate) return 10;
    return rate.manaPerUnit / (rate.baseRate * rate.currentMultiplier);
  }

  public getManaPerElement(element: ElementType): number {
    const rate = this.conversionRates.get(element);
    if (!rate) return 10;
    return Math.ceil(rate.manaPerUnit / (rate.baseRate * rate.currentMultiplier));
  }

  public convertManaToElement(
    element: ElementType,
    manaAmount: number
  ): { elementAmount: number; manaUsed: number } {
    if (!this.isElementUnlocked(element)) {
      return { elementAmount: 0, manaUsed: 0 };
    }

    const manaPerElement = this.getManaPerElement(element);
    const elementAmount = Math.floor(manaAmount / manaPerElement);
    const manaUsed = elementAmount * manaPerElement;

    return { elementAmount, manaUsed };
  }

  public upgradeConversionRate(element: ElementType, multiplier: number): void {
    const rate = this.conversionRates.get(element);
    if (rate) {
      rate.currentMultiplier *= multiplier;
    }
  }

  public getElementInfo(element: ElementType): {
    name: string;
    color: number;
    icon: string;
    description: string;
  } | null {
    const def = getElementDefinition(element);
    if (!def) return null;

    return {
      name: def.name,
      color: def.color,
      icon: def.icon,
      description: def.description,
    };
  }

  public getAllElements(): ElementType[] {
    return ELEMENTS.map((e) => e.type);
  }

  public reset(): void {
    this.unlockedElements = new Set(['fire', 'water']);
    this.initializeResearch();
    this.initializeConversionRates();
  }
}
