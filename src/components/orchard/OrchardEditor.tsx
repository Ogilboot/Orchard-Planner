"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { savePlot } from "@/lib/actions/orchard";
import {
  ELEMENT_TYPES,
  type ElementType,
  type PlotElementData,
} from "@/lib/orchard-types";

const PPM = 24;
const SNAP = 0.5;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const HANDLE_PX = 9;

const TYPE_INFO: Record<
  ElementType,
  { label: string; color: string; shape: "ellipse" | "rect"; width: number; height: number }
> = {
  TREE: { label: "Tree", color: "#2f855a", shape: "ellipse", width: 4, height: 4 },
  SHRUB: { label: "Shrub", color: "#48bb78", shape: "ellipse", width: 1.5, height: 1.5 },
  ROW: { label: "Row", color: "#d69e2e", shape: "rect", width: 8, height: 0.5 },
  PATH: { label: "Path", color: "#e2e8f0", shape: "rect", width: 6, height: 1 },
  FENCE: { label: "Fence", color: "#744210", shape: "rect", width: 6, height: 0.15 },
  POND: { label: "Pond", color: "#4299e1", shape: "ellipse", width: 4, height: 3 },
  SHED: { label: "Shed", color: "#a0aec0", shape: "rect", width: 3, height: 2 },
  BED: { label: "Bed", color: "#68d391", shape: "rect", width: 5, height: 2 },
};

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface DragState {
  mode: "pan" | "move" | "resize" | "rotate";
  startClientX: number;
  startClientY: number;
  origViewport: Viewport;
  orig: PlotElementData | null;
}

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP;
}

function isDarkColor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

let counter = 0;
function newId() {
  counter += 1;
  return `e${Date.now().toString(36)}${counter.toString(36)}`;
}

export default function OrchardEditor({
  plotId,
  initialElements,
  varieties,
}: {
  plotId: string;
  initialElements: PlotElementData[];
  varieties: { id: string; commonName: string }[];
}) {
  const [elements, setElements] = useState<PlotElementData[]>(initialElements);
  const [viewport, setViewport] = useState<Viewport>({ x: 240, y: 120, zoom: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  const varietyMap = useMemo(
    () => new Map(varieties.map((v) => [v.id, v.commonName])),
    [varieties],
  );

  const overlaps = useMemo(() => {
    const plants = elements.filter((e) => e.type === "TREE" || e.type === "SHRUB");
    const results: string[] = [];
    for (let i = 0; i < plants.length; i++) {
      for (let j = i + 1; j < plants.length; j++) {
        const a = plants[i];
        const b = plants[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minGap = (Math.max(a.width, a.height) + Math.max(b.width, b.height)) / 2;
        if (dist < minGap && dist > 0.001) {
          const labelA = a.label || (a.varietyId ? varietyMap.get(a.varietyId) : null) || a.type;
          const labelB = b.label || (b.varietyId ? varietyMap.get(b.varietyId) : null) || b.type;
          results.push(`${labelA} & ${labelB} are ${dist.toFixed(1)}m apart`);
        }
      }
    }
    return results;
  }, [elements, varietyMap]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const toWorld = useCallback((clientX: number, clientY: number, vp: Viewport) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const s = PPM * vp.zoom;
    return {
      x: (clientX - rect.left - vp.x) / s,
      y: (clientY - rect.top - vp.y) / s,
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setViewport((v) => {
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
        const k = zoom / v.zoom;
        return { zoom, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.mode === "pan") {
        setViewport({
          zoom: drag.origViewport.zoom,
          x: drag.origViewport.x + (e.clientX - drag.startClientX),
          y: drag.origViewport.y + (e.clientY - drag.startClientY),
        });
        return;
      }
      const orig = drag.orig;
      if (!orig) return;
      if (drag.mode === "move") {
        const dx = (e.clientX - drag.startClientX) / (PPM * drag.origViewport.zoom);
        const dy = (e.clientY - drag.startClientY) / (PPM * drag.origViewport.zoom);
        setElements((els) =>
          els.map((el) =>
            el.id === orig.id
              ? { ...el, x: snap(orig.x + dx), y: snap(orig.y + dy) }
              : el,
          ),
        );
      } else if (drag.mode === "resize") {
        const p = toWorld(e.clientX, e.clientY, drag.origViewport);
        const a = (orig.rotation * Math.PI) / 180;
        const dx = p.x - orig.x;
        const dy = p.y - orig.y;
        const lx = dx * Math.cos(a) + dy * Math.sin(a);
        const ly = -dx * Math.sin(a) + dy * Math.cos(a);
        setElements((els) =>
          els.map((el) =>
            el.id === orig.id
              ? {
                  ...el,
                  width: Math.max(0.5, snap(2 * lx)),
                  height: Math.max(0.5, snap(2 * ly)),
                }
              : el,
          ),
        );
      } else if (drag.mode === "rotate") {
        const p = toWorld(e.clientX, e.clientY, drag.origViewport);
        const ang = Math.round((Math.atan2(p.y - orig.y, p.x - orig.x) * 180) / Math.PI + 90);
        setElements((els) =>
          els.map((el) => (el.id === orig.id ? { ...el, rotation: ang } : el)),
        );
      }
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [toWorld]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          setElements((els) => els.filter((el) => el.id !== selectedId));
          setSelectedId(null);
          setSaveState("idle");
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function startDrag(e: ReactPointerEvent, mode: DragState["mode"], el: PlotElementData | null) {
    if (mode === "pan" && e.button !== 0 && e.button !== 1) return;
    if (mode !== "pan" && e.button !== 0) return;
    if (mode !== "pan") e.stopPropagation();
    if (el) setSelectedId(el.id);
    else if (mode === "pan") setSelectedId(null);
    dragRef.current = {
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origViewport: viewport,
      orig: el,
    };
  }

  function addElement(type: ElementType) {
    const info = TYPE_INFO[type];
    const s = PPM * viewport.zoom;
    const el: PlotElementData = {
      id: newId(),
      type,
      x: snap((size.w / 2 - viewport.x) / s),
      y: snap((size.h / 2 - viewport.y) / s),
      width: info.width,
      height: info.height,
      rotation: 0,
      label: null,
      varietyId: null,
      rootstock: null,
      color: null,
    };
    setElements((els) => [...els, el]);
    setSelectedId(el.id);
    setSaveState("idle");
  }

  function updateSelected(patch: Partial<PlotElementData>) {
    if (!selectedId) return;
    setElements((els) => els.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    const payload = elements.map((el) => ({
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      label: el.label || null,
      varietyId: el.varietyId || null,
      rootstock: el.rootstock || null,
      color: el.color || null,
      plantRecordId: el.plantRecordId || null,
    }));
    const res = await savePlot(plotId, JSON.stringify(payload));
    if (res.ok) {
      setSaveState("saved");
    } else {
      setSaveState("error");
      setSaveError(res.error);
    }
  }

  const s = PPM * viewport.zoom;
  const lw = 1 / s;
  const hs = HANDLE_PX / s;
  const minWx = -viewport.x / s;
  const maxWx = (size.w - viewport.x) / s;
  const minWy = -viewport.y / s;
  const maxWy = (size.h - viewport.y) / s;

  const vLines: number[] = [];
  const hLines: number[] = [];
  for (let x = Math.floor(minWx / SNAP) * SNAP; x <= maxWx + SNAP; x += SNAP) vLines.push(x);
  for (let y = Math.floor(minWy / SNAP) * SNAP; y <= maxWy + SNAP; y += SNAP) hLines.push(y);

  const statusEl =
    saveState === "saving" ? (
      <span className="text-sm text-gray-500">Saving…</span>
    ) : saveState === "saved" ? (
      <span className="text-sm text-green-700">Saved</span>
    ) : saveState === "error" ? (
      <span className="text-sm text-red-600">{saveError}</span>
    ) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          Drag to move · scroll to zoom · drag empty space to pan · Delete key to remove
        </p>
        <div className="flex items-center gap-3">
          {statusEl}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Print
          </button>
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save plan
          </button>
        </div>
      </div>

      {overlaps.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <span className="font-semibold">Spacing check:</span>{" "}
          {overlaps.slice(0, 3).join(" · ")}
          {overlaps.length > 3 && ` + ${overlaps.length - 3} more`}
        </div>
      )}

      <div className="flex gap-4" style={{ height: "70vh" }}>
        <aside className="w-40 shrink-0 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Add to plan
          </h2>
          {ELEMENT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => addElement(t)}
              className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:border-green-600 hover:bg-green-50"
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ background: TYPE_INFO[t].color }}
              />
              {TYPE_INFO[t].label}
            </button>
          ))}
        </aside>

        <div
          ref={wrapRef}
          className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <svg
            ref={svgRef}
            onPointerDown={(e) => startDrag(e, "pan", null)}
            className="block h-full w-full touch-none"
            style={{ cursor: "crosshair" }}
          >
            <g transform={`translate(${viewport.x} ${viewport.y}) scale(${s})`}>
              {vLines.map((x) => {
                const major = Math.abs(x - Math.round(x)) < 1e-6;
                return (
                  <line
                    key={`v${x}`}
                    x1={x}
                    y1={minWy}
                    x2={x}
                    y2={maxWy}
                    stroke={major ? "#d1d5db" : "#f1f5f9"}
                    strokeWidth={lw}
                  />
                );
              })}
              {hLines.map((y) => {
                const major = Math.abs(y - Math.round(y)) < 1e-6;
                return (
                  <line
                    key={`h${y}`}
                    x1={minWx}
                    y1={y}
                    x2={maxWx}
                    y2={y}
                    stroke={major ? "#d1d5db" : "#f1f5f9"}
                    strokeWidth={lw}
                  />
                );
              })}

              {elements.map((el) => {
                const info = TYPE_INFO[el.type];
                const color = el.color || info.color;
                const isSel = el.id === selectedId;
                const displayLabel =
                  el.label ||
                  (el.varietyId ? varietyMap.get(el.varietyId) : undefined) ||
                  info.label;
                return (
                  <g
                    key={el.id}
                    transform={`translate(${el.x} ${el.y}) rotate(${el.rotation})`}
                    onPointerDown={(e) => startDrag(e, "move", el)}
                    style={{ cursor: "move" }}
                  >
                    {info.shape === "ellipse" ? (
                      <ellipse
                        rx={el.width / 2}
                        ry={el.height / 2}
                        fill={color}
                        stroke="#1a202c"
                        strokeWidth={lw}
                      />
                    ) : (
                      <rect
                        x={-el.width / 2}
                        y={-el.height / 2}
                        width={el.width}
                        height={el.height}
                        fill={color}
                        stroke="#1a202c"
                        strokeWidth={lw}
                      />
                    )}
                    <text
                      y={4 / s}
                      textAnchor="middle"
                      fontSize={12 / s}
                      fill={isDarkColor(color) ? "#ffffff" : "#111827"}
                      style={{ pointerEvents: "none" }}
                    >
                      {displayLabel}
                    </text>
                    {isSel && (
                      <>
                        <rect
                          x={-el.width / 2}
                          y={-el.height / 2}
                          width={el.width}
                          height={el.height}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth={lw}
                          strokeDasharray={`${4 / s} ${3 / s}`}
                        />
                        <rect
                          x={el.width / 2 - hs / 2}
                          y={el.height / 2 - hs / 2}
                          width={hs}
                          height={hs}
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth={lw}
                          style={{ cursor: "nwse-resize" }}
                          onPointerDown={(e) => startDrag(e, "resize", el)}
                        />
                        <line
                          x1={0}
                          y1={-el.height / 2}
                          x2={0}
                          y2={-el.height / 2 - 14 / s}
                          stroke="#2563eb"
                          strokeWidth={lw}
                        />
                        <circle
                          cx={0}
                          cy={-el.height / 2 - 14 / s}
                          r={hs / 2}
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth={lw}
                          style={{ cursor: "grab" }}
                          onPointerDown={(e) => startDrag(e, "rotate", el)}
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="w-64 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{TYPE_INFO[selected.type].label}</h3>
                <button
                  onClick={() => {
                    setElements((els) => els.filter((e) => e.id !== selected.id));
                    setSelectedId(null);
                    setSaveState("idle");
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              <label className="block text-xs font-medium text-gray-600">
                Label
                <input
                  value={selected.label ?? ""}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
              </label>

              {(selected.type === "TREE" || selected.type === "SHRUB") && (
                <label className="block text-xs font-medium text-gray-600">
                  Variety
                  <select
                    value={selected.varietyId ?? ""}
                    onChange={(e) => updateSelected({ varietyId: e.target.value || null })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">None</option>
                    {varieties.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.commonName}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selected.type === "TREE" && (
                <label className="block text-xs font-medium text-gray-600">
                  Rootstock
                  <input
                    value={selected.rootstock ?? ""}
                    onChange={(e) => updateSelected({ rootstock: e.target.value })}
                    placeholder="e.g. MM106"
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-medium text-gray-600">
                  X (m)
                  <input
                    type="number"
                    step={0.5}
                    value={selected.x}
                    onChange={(e) =>
                      updateSelected({ x: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0 })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Y (m)
                  <input
                    type="number"
                    step={0.5}
                    value={selected.y}
                    onChange={(e) =>
                      updateSelected({ y: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0 })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Width (m)
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={selected.width}
                    onChange={(e) =>
                      updateSelected({ width: Math.max(0.5, Number(e.target.value) || 0.5) })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Height (m)
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={selected.height}
                    onChange={(e) =>
                      updateSelected({ height: Math.max(0.5, Number(e.target.value) || 0.5) })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Rotation (°)
                  <input
                    type="number"
                    step={1}
                    value={selected.rotation}
                    onChange={(e) =>
                      updateSelected({ rotation: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
              </div>

              <label className="block text-xs font-medium text-gray-600">
                Colour
                <input
                  type="color"
                  value={selected.color ?? TYPE_INFO[selected.type].color}
                  onChange={(e) => updateSelected({ color: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-gray-300"
                />
              </label>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Select an element to edit it, or add one from the palette.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
