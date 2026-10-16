export type ParamType = "string" | "integer" | "number" | "boolean" | "enum";

export interface EndpointParam {
  name: string;
  required: boolean;
  type: ParamType | string;
  description: string;
  example: string;
  min?: number;
  max?: number;
  enum?: string[];
}

/**
 * Konfigurasi provider alternatif "Sanka" untuk sebuah endpoint.
 * Hanya berisi path & pemetaan parameter — TIDAK ada rahasia di sini
 * (api key disimpan di environment variable sisi server).
 */
export interface SankaProviderConfig {
  /** Path endpoint di API Sanka, tanpa query, mis. "/download/tiktok". */
  path: string;
  /** Pemetaan nama parameter lokal -> nama parameter Sanka. Tanpa entri = nama sama. */
  paramMap?: Record<string, string>;
  /** Nilai default yang selalu dikirim ke Sanka bila tidak diisi pengguna. */
  fixedParams?: Record<string, string>;
}

export interface EndpointDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  method: string;
  /** Local path relative to /api/v1 */
  timeoutMs: number;
  /** Full path on the upstream service, e.g. /api/s/youtube */
  upstreamPath: string;
  params: EndpointParam[];
  tags: string[];
  /** Provider alternatif Sanka: fallback otomatis + bisa dipilih via ?provider=sanka. */
  sanka?: SankaProviderConfig;
  /**
   * true = endpoint baru yang SEPENUHNYA dilayani Sanka (tidak ada di upstream
   * primary). Resolver akan memakai Sanka sebagai sumber utamanya.
   */
  sankaOnly?: boolean;
}

export interface EndpointCategory {
  key: string;
  title: string;
  description: string;
}

export interface ApiEnvelopeMeta {
  path?: string;
  upstream_status?: number;
  time_ms?: number;
  size_bytes?: number;
  /** Provider yang benar-benar dipakai, mis. "primary", "sanka", atau "scrapr:snaptik" (fallback). */
  fallback?: string;
  /** Provider sumber response ini (primary/sanka) bila relevan. */
  provider?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  /** Watermark author — branding pada setiap response API. */
  author: string;
  data: T;
  message: string;
  meta: ApiEnvelopeMeta;
}

export interface ApiError {
  success: false;
  /** Watermark author — branding pada setiap response API. */
  author: string;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta?: ApiEnvelopeMeta;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
