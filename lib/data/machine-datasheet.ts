/**
 * Derivations for the CNC datasheet detail template. Every section that can be
 * computed from a machine's existing spec rows is computed here rather than
 * duplicated as content: the spec table groups, the performance strip, the
 * working-space readout and the envelope wireframe all read the same `specs`
 * array. Rows a machine does not publish come back as `null` so the view can
 * render an "updating" placeholder in a fixed slot — the layout stays identical
 * across machines regardless of how complete the datasheet is.
 */

import type { MachineSpec } from "@/data/machines";

/** Spec-table groups, in render order, with the spec keys each one collects. */
const SPEC_GROUP_KEYS: { id: string; keys: string[] }[] = [
  { id: "capacity", keys: ["axes", "machineTravel", "tableSize", "tableLoad", "spindleNose"] },
  { id: "spindle", keys: ["spindleSpeed", "spindlePower", "toolHead", "collet", "toolCapacity", "toolMagazine"] },
  { id: "feed", keys: ["rapidSpeed", "feedSpeed", "transmission", "rotaryAxis"] },
  { id: "accuracy", keys: ["positioning", "repeatability", "resolution"] },
  { id: "machine", keys: ["machineSize", "weight", "powerSupply", "airPressure"] },
  { id: "cnc", keys: ["controller", "controlSystem"] },
];

/** Spec keys promoted to the four performance tiles, in order. */
export const PERFORMANCE_KEYS = ["spindleSpeed", "spindlePower", "rapidSpeed", "feedSpeed"];

/** Spec keys promoted to the working-space readout, in order. */
export const WORKSPACE_KEYS = ["machineTravel", "tableSize", "tableLoad", "spindleNose"];

export type SpecGroupView = { id: string; rows: MachineSpec[] };

/**
 * Bucket spec rows into the datasheet groups. Every group is returned even when
 * empty so all machines render the same six panels; keys outside the map are
 * collected into a trailing `other` group instead of being dropped.
 */
export function groupSpecs(specs: MachineSpec[]): SpecGroupView[] {
  const byKey = new Map(specs.map((s) => [s.k, s]));
  const claimed = new Set<string>();

  const groups = SPEC_GROUP_KEYS.map(({ id, keys }) => {
    const rows: MachineSpec[] = [];
    for (const k of keys) {
      const row = byKey.get(k);
      if (row) {
        rows.push(row);
        claimed.add(k);
      }
    }
    return { id, rows };
  });

  const rest = specs.filter((s) => !claimed.has(s.k));
  return rest.length > 0 ? [...groups, { id: "other", rows: rest }] : groups;
}

/** Look up a spec row's value by key; null when the machine doesn't publish it. */
export function specValue(specs: MachineSpec[], key: string): string | null {
  return specs.find((s) => s.k === key)?.v ?? null;
}

export type SplitValue = { value: string; unit: string };

/**
 * Split a spec value into its leading number and trailing unit so the
 * performance tiles can typeset them apart, e.g. "24.000 rpm" →
 * { value: "24.000", unit: "rpm" }. Values that don't start with a number
 * (e.g. "Ray trượt tuyến tính") come back whole with an empty unit.
 */
export function splitSpecValue(v: string): SplitValue {
  const m = /^([\d.,]+)\s*(.*)$/.exec(v.trim());
  return m ? { value: m[1], unit: m[2] } : { value: v, unit: "" };
}

export type TravelAxes = { x: string; y: string; z: string; unit: string };

/**
 * Parse a travel spec ("250 × 150 × 300 mm") into its three axis figures for
 * the envelope wireframe. Null when the machine publishes no travel or the
 * value isn't a three-axis product.
 */
export function parseTravel(v: string | null): TravelAxes | null {
  if (!v) return null;
  const m = /^\s*([\d.,]+)\s*[×x]\s*([\d.,]+)\s*[×x]\s*([\d.,]+)\s*(.*)$/.exec(v);
  return m ? { x: m[1], y: m[2], z: m[3], unit: m[4].trim() } : null;
}
