import * as THREE from 'three';
import type { Portal as PortalType, ElementType, GeneratedEquipment } from '../types';
import { generateId, calculatePortalLevel, calculatePortalColor } from '../utils/helpers';
import { calculatePortalEffects } from './PortalEffectSystem';

/**
 * Scaling factor for converting equipment total cost to portal level bonus.
 * A divisor of 3 means every 3 points of total cost = 1 portal level bonus.
 */
const EQUIPMENT_COST_TO_LEVEL_DIVISOR = 3;

export class Portal {
  private scene: THREE.Scene;
  private portalMesh: THREE.Mesh | null = null;
  private ringMesh: THREE.Mesh | null = null;
  private particleSystem: THREE.Points | null = null;
  private portalData: PortalType;
  private animationTime: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.portalData = this.createEmptyPortal();
  }

  private createEmptyPortal(): PortalType {
    return {
      id: generateId(),
      level: 1,
      manaInvested: 0,
      elements: {},
      ingredients: [],
      equipment: [],
      visualColor: 0x6b46c1,
      visualIntensity: 0.5,
      createdAt: Date.now(),
      generatedEquipmentAttributes: [],
    };
  }

  public initialize(): void {
    this.createPortalVisualization();
  }

  private createPortalVisualization(): void {
    // Main portal circle (2D representation)
    const portalGeometry = new THREE.CircleGeometry(2, 64);
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: this.portalData.visualColor,
      transparent: true,
      opacity: 0.7,
    });
    this.portalMesh = new THREE.Mesh(portalGeometry, portalMaterial);
    this.portalMesh.position.set(0, 0, 0);
    this.scene.add(this.portalMesh);

    // Portal ring
    const ringGeometry = new THREE.RingGeometry(1.9, 2.2, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ringMesh.position.set(0, 0, 0.01);
    this.scene.add(this.ringMesh);

    // Particle system for portal effect
    this.createParticleSystem();
  }

  private createParticleSystem(): void {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.random() * 0.5;

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particleSystem);
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Rotate ring
    if (this.ringMesh) {
      this.ringMesh.rotation.z = this.animationTime * 0.5;
    }

    // Animate portal pulse
    if (this.portalMesh) {
      const scale = 1 + Math.sin(this.animationTime * 2) * 0.05 * this.portalData.visualIntensity;
      this.portalMesh.scale.set(scale, scale, 1);
    }

    // Animate particles
    if (this.particleSystem) {
      const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        const angle = this.animationTime + i * 0.1;
        const radius = 1.5 + Math.sin(this.animationTime + i) * 0.3;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
  }

  public addMana(amount: number): void {
    this.portalData.manaInvested += amount;
    this.portalData.level = calculatePortalLevel(
      this.portalData.manaInvested,
      this.portalData.elements
    );
    this.updateVisualization();
  }

  public addElement(element: ElementType, amount: number): void {
    this.portalData.elements[element] = (this.portalData.elements[element] || 0) + amount;
    this.portalData.level = calculatePortalLevel(
      this.portalData.manaInvested,
      this.portalData.elements
    );
    this.updateVisualization();
  }

  public removeElement(element: ElementType, amount: number): void {
    const current = this.portalData.elements[element] || 0;
    const newAmount = Math.max(0, current - amount);
    if (newAmount === 0) {
      delete this.portalData.elements[element];
    } else {
      this.portalData.elements[element] = newAmount;
    }
    this.portalData.level = calculatePortalLevel(
      this.portalData.manaInvested,
      this.portalData.elements
    );
    this.updateVisualization();
  }

  public addIngredient(ingredientId: string): void {
    this.portalData.ingredients.push(ingredientId);
    this.updateVisualization();
  }

  public addEquipment(equipmentId: string): void {
    this.portalData.equipment.push(equipmentId);
    this.updateVisualization();
  }

  /**
   * Add generated equipment attributes to the portal.
   * These attributes are used to calculate portal effects and rewards.
   */
  public addGeneratedEquipmentAttributes(equipment: GeneratedEquipment[]): void {
    if (!this.portalData.generatedEquipmentAttributes) {
      this.portalData.generatedEquipmentAttributes = [];
    }
    // Deep clone equipment objects before storing to prevent unintended mutations
    this.portalData.generatedEquipmentAttributes.push(
      ...equipment.map((eq) => structuredClone(eq))
    );

    // Generated equipment attributes contribute to portal level
    const attributeBonus = equipment.reduce(
      (sum, eq) => sum + Math.floor(eq.totalCost / EQUIPMENT_COST_TO_LEVEL_DIVISOR),
      0
    );
    if (attributeBonus > 0) {
      this.portalData.level += attributeBonus;
    }

    this.updateVisualization();
  }

  /**
   * Get the generated equipment attributes stored in this portal.
   */
  public getGeneratedEquipmentAttributes(): GeneratedEquipment[] {
    return this.portalData.generatedEquipmentAttributes || [];
  }

  private updateVisualization(): void {
    const newColor = calculatePortalColor(this.portalData.elements);
    this.portalData.visualColor = newColor;

    // Calculate attribute effects for visual modifiers
    const generatedEquipment = this.portalData.generatedEquipmentAttributes || [];
    const effects = calculatePortalEffects(generatedEquipment);

    // Apply color shift from attributes
    let finalColor = newColor;
    if (effects.colorShift !== 0) {
      finalColor = this.applyColorShift(newColor, effects.colorShift);
    }

    if (this.portalMesh) {
      (this.portalMesh.material as THREE.MeshBasicMaterial).color.setHex(finalColor);
    }

    // Increase intensity based on level and attribute effects
    this.portalData.visualIntensity =
      Math.min(1 + this.portalData.level * 0.1, 2) + effects.intensityBonus;
  }

  /**
   * Apply color shift (in degrees) to a hex color.
   * Converts to HSL, shifts hue, and converts back to hex.
   */
  private applyColorShift(hexColor: number, shiftDegrees: number): number {
    // Extract RGB components
    const r = ((hexColor >> 16) & 0xff) / 255;
    const g = ((hexColor >> 8) & 0xff) / 255;
    const b = (hexColor & 0xff) / 255;

    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Apply hue shift (normalized to 0-1 range)
    h = (h + shiftDegrees / 360) % 1;
    if (h < 0) h += 1;

    // Convert HSL back to RGB
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let newR: number, newG: number, newB: number;
    if (s === 0) {
      newR = newG = newB = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      newR = hue2rgb(p, q, h + 1 / 3);
      newG = hue2rgb(p, q, h);
      newB = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert back to hex
    const rHex = Math.round(newR * 255);
    const gHex = Math.round(newG * 255);
    const bHex = Math.round(newB * 255);

    return (rHex << 16) | (gHex << 8) | bHex;
  }

  public reset(): void {
    this.portalData = this.createEmptyPortal();
    this.updateVisualization();
  }

  public getData(): PortalType {
    return { ...this.portalData };
  }

  public setData(data: PortalType): void {
    this.portalData = { ...data };
    this.updateVisualization();
  }

  public meetsRequirements(
    minLevel: number,
    requiredElements?: ElementType[],
    minElementAmount?: number
  ): boolean {
    if (this.portalData.level < minLevel) {
      return false;
    }

    if (requiredElements && requiredElements.length > 0) {
      for (const element of requiredElements) {
        const amount = this.portalData.elements[element] || 0;
        if (amount < (minElementAmount || 1)) {
          return false;
        }
      }
    }

    return true;
  }

  public dispose(): void {
    if (this.portalMesh) {
      this.scene.remove(this.portalMesh);
      this.portalMesh.geometry.dispose();
      (this.portalMesh.material as THREE.Material).dispose();
    }
    if (this.ringMesh) {
      this.scene.remove(this.ringMesh);
      this.ringMesh.geometry.dispose();
      (this.ringMesh.material as THREE.Material).dispose();
    }
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      (this.particleSystem.material as THREE.Material).dispose();
    }
  }
}
