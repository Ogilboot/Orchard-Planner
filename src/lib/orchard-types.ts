export const ELEMENT_TYPES = [
  "TREE",
  "SHRUB",
  "ROW",
  "PATH",
  "FENCE",
  "POND",
  "SHED",
  "BED",
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

export interface PlotElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string | null;
  varietyId: string | null;
  rootstock: string | null;
  color: string | null;
}
