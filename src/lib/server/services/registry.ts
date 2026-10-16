import "server-only";
import { ENDPOINTS } from "@/config/endpoints";
import type { EndpointDefinition } from "@/types/api";

/**
 * Registry service — pencarian endpoint & informasi kandidat provider.
 * Endpoint baru cukup didaftarkan di src/config/endpoints.ts; route proxy,
 * docs, dan pencarian otomatis mengikutinya.
 */

/** Cari endpoint berdasarkan segmen path publik (/api/v1/<segments...>). */
export function findEndpoint(segments: string[]): EndpointDefinition | undefined {
  const upstreamPath = `/api/${segments.join("/")}`;
  return ENDPOINTS.find((e) => e.upstreamPath === upstreamPath);
}

/** true bila endpoint punya sumber alternatif Sanka. */
export function hasSankaSource(endpoint: EndpointDefinition): boolean {
  return Boolean(endpoint.sanka);
}
