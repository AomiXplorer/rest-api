"use client";

import { useMemo, useState } from "react";
import {
  RotateCcw, Loader2, AlertTriangle, CheckCircle2, Clock, HardDrive,
  Send, Link2, SlidersHorizontal, X, Terminal,
} from "lucide-react";
import type { EndpointDefinition, ApiResponse } from "@/types/api";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonViewer } from "@/components/ui/JsonViewer";

/**
 * Detail endpoint — modal Try API mengikuti referensi:
 * badge metode + path, form parameter bertumpuk (wajib/opsional + helper),
 * tombol full-width "Kirim request", panel "</> Response" + salin.
 * Fitur lama yang tetap dipertahankan: toggle GET/POST, contoh cURL,
 * response gambar/video, status HTTP + waktu + ukuran.
 */

interface ResponseState {
  status: number;
  timeMs: number;
  sizeBytes: number;
  body: unknown;
  raw: string;
  contentType: string;
  error?: string;
}

function localPath(e: EndpointDefinition) {
  return `/api/v1${e.upstreamPath.replace(/^\/api/, "")}`;
}

function buildUrl(e: EndpointDefinition, values: Record<string, string>) {
  const u = new URL(localPath(e), window.location.origin);
  for (const p of e.params) {
    const v = values[p.name];
    if (v) u.searchParams.set(p.name, v);
  }
  return u.toString();
}

export function EndpointDetail({
  endpoint,
  verified,
  variant = "page",
  onClose,
}: {
  endpoint: EndpointDefinition;
  verified: boolean;
  variant?: "page" | "modal";
  onClose?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const p of endpoint.params) v[p.name] = p.example;
    return v;
  });
  const [loading, setLoading] = useState(false);
  const [postMode, setPostMode] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);

  // URL lengkap dengan domain web (bukan cuma path), mengikuti nilai input terkini
  const requestUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const qs = endpoint.params
      .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(values[p.name] ?? "")}`)
      .filter((kv) => !kv.endsWith("="))
      .join("&");
    return `${origin}${localPath(endpoint)}${qs ? `?${qs}` : ""}`;
  }, [endpoint, values]);

  /* Body JSON untuk contoh POST */
  const postBody = useMemo(() => {
    const body: Record<string, string> = {};
    for (const p of endpoint.params) {
      const v = values[p.name];
      if (v) body[p.name] = v;
      else if (p.example) body[p.name] = p.example;
      else if (!p.required) continue;
      else body[p.name] = "";
    }
    return JSON.stringify(body);
  }, [endpoint, values]);

  async function send(resend = false) {
    if (loading) return;
    void resend;
    setLoading(true);
    setResponse(null);
    const started = performance.now();
    try {
      const url = buildUrl(endpoint, values);
      const opts: RequestInit = postMode
        ? {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""))),
          }
        : { method: "GET" };
      const res = await fetch(url, opts);
      const contentType = res.headers.get("content-type") ?? "";
      const timeMs = Math.round(performance.now() - started);

      if (contentType.startsWith("image/")) {
        const blob = await res.blob();
        setResponse({
          status: res.status,
          timeMs,
          sizeBytes: blob.size,
          body: null,
          raw: url,
          contentType,
          error: res.ok ? undefined : `Gambar gagal dimuat (HTTP ${res.status})`,
        });
        return;
      }

      const raw = await res.text();
      let parsed: unknown = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        /* non-JSON body */
      }
      const envelope = parsed as ApiResponse | null;
      setResponse({
        status: res.status,
        timeMs,
        sizeBytes: raw.length,
        body: parsed,
        raw,
        contentType,
        error: envelope && envelope.success === false ? envelope.error.message : undefined,
      });
    } catch (err) {
      const timeMs = Math.round(performance.now() - started);
      setResponse({
        status: 0,
        timeMs,
        sizeBytes: 0,
        body: null,
        raw: "",
        contentType: "",
        error: err instanceof Error ? `Request gagal: ${err.message}` : "Request gagal",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flex flex-col">
      {/* ===== Header ===== */}
      <header className="flex items-start gap-3 border-b border-line p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 font-code text-[10px] font-bold text-onprimary">
              {endpoint.method}
            </span>
            <h2 className="min-w-0 break-all font-display text-lg font-bold capitalize text-ink">
              {endpoint.name}
            </h2>
          </div>
          <code className="mt-1 block truncate font-code text-[12px] text-ink-faint" title={localPath(endpoint)}>
            {localPath(endpoint)}
          </code>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{endpoint.description}</p>
          {variant === "page" ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${verified ? "bg-mint" : "bg-ink-faint"}`} />
              {verified ? "active" : "beta"}
            </p>
          ) : null}
        </div>
        {variant === "modal" && onClose && (
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-card-soft hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </header>

      <div className="p-5">
        {/* ===== Parameter ===== */}
        {endpoint.params.length > 0 ? (
          <section aria-label="Parameter">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Parameter</h3>
              <span className="rounded bg-surface px-1.5 py-0.5 font-code text-[11px] text-ink-muted">
                {endpoint.params.length}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {endpoint.params.map((p) => (
                <label key={p.name} className="flex flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-code text-sm font-semibold text-ink">{p.name}</span>
                    {p.required ? (
                      <span className="text-[11px] font-semibold text-lemon">wajib</span>
                    ) : (
                      <span className="text-[11px] text-ink-faint">opsional</span>
                    )}
                    <span className="font-code text-[10px] uppercase tracking-wide text-ink-faint">
                      {p.enum ? `enum (${p.enum.length} opsi)` : p.type}
                    </span>
                  </span>
                  {p.description ? (
                    <span className="text-xs leading-relaxed text-ink-muted">{p.description}</span>
                  ) : null}
                  {p.enum ? (
                    <select
                      value={values[p.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                      className="h-10 rounded-lg border border-line bg-bg px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {p.required ? null : <option value="">Pilih {p.name}…</option>}
                      {p.enum.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={values[p.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                      placeholder={p.example ? `Contoh: ${p.example}` : `Isi ${p.name}…`}
                      inputMode={p.type === "integer" || p.type === "number" ? "numeric" : undefined}
                      className="h-10 rounded-lg border border-line bg-bg px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ) : (
          <p className="rounded-lg bg-card-soft px-3.5 py-2.5 text-[13px] text-ink-muted">
            Endpoint ini tidak butuh parameter — langsung kirim request.
          </p>
        )}

        {/* ===== Contoh request (cURL) — bisa dilipat ===== */}
        <details className="group mt-5 rounded-lg border border-line bg-bg">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <Terminal size={13} /> Contoh request (cURL)
          </summary>
          <div className="border-t border-line p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-code text-[11px] text-ink-faint">
                {postMode ? "POST (body JSON)" : "GET (query)"}
              </span>
              <CopyButton
                text={postMode
                  ? `curl -X POST -H "Content-Type: application/json" -d '${postBody}' "${requestUrl}"`
                  : `curl "${requestUrl}"`}
                label="Salin"
              />
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-code px-3 py-2.5 font-code text-[12px] leading-relaxed text-code-text">
              <code>{postMode
                ? `curl -X POST -H "Content-Type: application/json" -d '${postBody}' "${requestUrl}"`
                : `curl "${requestUrl}"`}</code>
            </pre>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-code text-[11px] text-ink-faint">
                <Link2 size={11} className="mr-1 inline" /> URL lengkap
              </span>
              <CopyButton text={requestUrl} label="Salin URL" />
            </div>
            <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code px-3 py-2.5 font-code text-[12px] leading-relaxed text-code-text">
              <code>{requestUrl}</code>
            </pre>
          </div>
        </details>
      </div>

      {/* ===== Kirim request ===== */}
      <div className="flex flex-col gap-2 border-t border-line p-5">
        <button
          onClick={() => send()}
          disabled={loading}
          aria-busy={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {loading ? "Mengirim…" : postMode ? "Kirim request (POST)" : "Kirim request"}
        </button>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPostMode((m) => !m)}
            title="Ganti metode kirim: GET (query) atau POST (body JSON)"
            className="rounded-md px-2 py-1 font-code text-[11px] font-semibold text-ink-faint transition-colors hover:text-ink"
          >
            Metode: {postMode ? "POST" : "GET"} <span aria-hidden>↔</span>
          </button>
          {response ? (
            <button
              onClick={() => send(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-ink-faint transition-colors hover:text-ink"
            >
              <RotateCcw size={12} /> Kirim ulang
            </button>
          ) : null}
        </div>
      </div>

      {/* ===== Response ===== */}
      {response ? (
        <section className="animate-fade-in border-t border-line p-5" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-code text-sm font-semibold text-ink">&lt;/&gt; Response</h3>
            <CopyButton text={response.raw} label="Copy" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-code text-[11px]">
            <span
              className={`flex items-center gap-1.5 font-semibold ${
                response.status >= 200 && response.status < 300 ? "text-mint" : "text-danger"
              }`}
            >
              {response.status >= 200 && response.status < 300 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              HTTP {response.status}
            </span>
            <span className="flex items-center gap-1 text-ink-faint">
              <Clock size={11} /> {response.timeMs} ms
            </span>
            {response.sizeBytes > 0 ? (
              <span className="flex items-center gap-1 text-ink-faint">
                <HardDrive size={11} /> {(response.sizeBytes / 1024).toFixed(1)} KB
              </span>
            ) : null}
          </div>

          {response.error ? (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3 font-code text-xs leading-relaxed text-danger"
            >
              {response.error}
            </div>
          ) : null}

          <div className="mt-3">
            {response.contentType.startsWith("image/") && response.status < 300 ? (
              <div className="flex justify-center rounded-lg bg-code p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={response.raw}
                  alt="Response gambar dari endpoint"
                  className="max-h-80 max-w-full rounded-lg object-contain"
                />
              </div>
            ) : response.contentType.startsWith("video/") && response.status < 300 ? (
              <div className="flex justify-center rounded-lg bg-code p-4">
                <video src={response.raw} controls preload="metadata" className="max-h-80 max-w-full rounded-lg">
                  Browser Anda tidak mendukung pemutar video.
                </video>
              </div>
            ) : response.body !== null && response.body !== undefined ? (
              <div className="overflow-hidden rounded-lg border border-line">
                <JsonViewer value={response.body} />
              </div>
            ) : (
              <pre className="overflow-x-auto rounded-lg border border-line bg-code px-3.5 py-3 font-code text-[12px] leading-relaxed text-code-text">
                <code>{response.raw || "(respons kosong)"}</code>
              </pre>
            )}
          </div>
        </section>
      ) : null}
    </article>
  );
}
