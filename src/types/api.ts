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
  /** Provider fallback yang dipakai bila upstream utama down, mis. "scrapr:snaptik". */
  fallback?: string;
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
