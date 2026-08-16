export interface PlantShape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string | null;
}

export interface Overlap<T extends PlantShape = PlantShape> {
  a: T;
  b: T;
  distance: number;
}

export function detectOverlaps<T extends PlantShape>(plants: T[]): Overlap<T>[] {
  const results: Overlap<T>[] = [];
  for (let i = 0; i < plants.length; i++) {
    for (let j = i + 1; j < plants.length; j++) {
      const a = plants[i];
      const b = plants[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minGap = (Math.max(a.width, a.height) + Math.max(b.width, b.height)) / 2;
      if (dist < minGap && dist > 0.001) {
        results.push({ a, b, distance: dist });
      }
    }
  }
  return results;
}
