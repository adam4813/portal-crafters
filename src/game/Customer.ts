import type { Customer, CustomerTemplate, ContractRequirements, ElementType } from '../types';
import {
  CUSTOMER_TEMPLATES,
  generateCustomerName,
  generateCustomerIcon,
  generatePayment,
  selectElementRequirements,
} from '../data/customers';
import { generateId } from '../utils/helpers';

export class CustomerSystem {
  private queue: Customer[] = [];
  private maxQueueSize: number = 5;
  private customerSpawnInterval: number = 30000; // 30 seconds
  private lastSpawnTime: number = 0;
  private unlockedElements: ElementType[] = ['fire', 'water'];
  private difficultyLevel: number = 1;

  constructor() {
    this.lastSpawnTime = Date.now();
  }

  public initialize(unlockedElements: ElementType[]): void {
    this.unlockedElements = unlockedElements;
    // Spawn initial customers
    this.spawnCustomer();
    this.spawnCustomer();
  }

  public update(_deltaTime: number): void {
    const now = Date.now();

    // Spawn new customers periodically
    if (
      now - this.lastSpawnTime >= this.customerSpawnInterval &&
      this.queue.length < this.maxQueueSize
    ) {
      this.spawnCustomer();
      this.lastSpawnTime = now;
    }

    // Check for impatient customers
    this.queue = this.queue.filter((customer) => {
      const waitTime = (now - customer.arrivedAt) / 1000;
      return waitTime < customer.patience;
    });
  }

  public spawnCustomer(): Customer | null {
    if (this.queue.length >= this.maxQueueSize) {
      return null;
    }

    const templateIndex = Math.min(
      Math.floor(Math.random() * this.difficultyLevel),
      CUSTOMER_TEMPLATES.length - 1
    );
    const template = CUSTOMER_TEMPLATES[templateIndex];

    const requirements = this.generateRequirements(template);
    const customer: Customer = {
      id: generateId(),
      name: generateCustomerName(template),
      icon: generateCustomerIcon(template),
      requirements,
      payment: generatePayment(template),
      patience: template.basePatience + Math.floor(Math.random() * 30),
      arrivedAt: Date.now(),
    };

    this.queue.push(customer);
    return customer;
  }

  private generateRequirements(template: CustomerTemplate): ContractRequirements {
    const elements = selectElementRequirements(
      this.unlockedElements,
      template.difficultyMultiplier
    );

    return {
      minLevel: Math.max(1, Math.floor(template.difficultyMultiplier * 2)),
      requiredElements: elements,
      minElementAmount: Math.ceil(template.difficultyMultiplier * 3),
    };
  }

  public getCurrentCustomer(): Customer | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  public getQueue(): Customer[] {
    return [...this.queue];
  }

  public completeContract(customerId: string): number {
    const index = this.queue.findIndex((c) => c.id === customerId);
    if (index === -1) return 0;

    const customer = this.queue[index];
    this.queue.splice(index, 1);
    return customer.payment;
  }

  public removeCustomer(customerId: string): void {
    this.queue = this.queue.filter((c) => c.id !== customerId);
  }

  public setUnlockedElements(elements: ElementType[]): void {
    this.unlockedElements = elements;
  }

  public setDifficultyLevel(level: number): void {
    this.difficultyLevel = level;
  }

  public setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
  }

  public setSpawnRate(multiplier: number): void {
    // Adjust customer spawn interval based on multiplier
    this.customerSpawnInterval = 30000 / multiplier;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public loadQueue(customers: Customer[]): void {
    this.queue = [...customers];
  }

  public saveQueue(): Customer[] {
    return [...this.queue];
  }
}
