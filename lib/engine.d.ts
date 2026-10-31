// Minimal types for the shared physics engine (lib/engine.js). The engine is plain JS so the
// same file runs in the browser (public/lab) and on the server (API routes).
export type Build = Record<string, any> & { name?: string };
export type Analysis = Record<string, any> & {
  weightG: number; scores: { performance: number; buildQuality: number; overall: number };
  issues: { severity: "High" | "Medium" | "Low" | "Info"; area: string; title: string; why: string; fix: string }[];
};
export const ENGINE_VERSION: string;
export const BASE_BUILD: Build;
export const SHEET_DRAFT: Build;
export const BLANK_BUILD: Build;
export const REFERENCES: { id: string; source: string; publishedWeightG: number; build: Build }[];
export const OPT_GOALS: { key: string; name: string }[];
export function analyze(build: Build, opts?: { units?: "metric" | "us"; stations?: number }): Analysis;
export function optimize(build: Build, opts?: { goal?: string; lock?: string[]; maxWeight177?: number; units?: "metric" | "us"; thorough?: boolean; top?: number }): any;
export function similarity(a: Analysis, b: Analysis): number;
export function clone<T>(o: T): T;
export function billOfMaterials(build: Build, opts?: { units?: "metric" | "us" }): { items: { group: string; item: string; spec: string; qty: string; cost: number; buy: string; note: string; est: boolean }[]; total: number; perSki: number; note: string };
