"use client";

import { useMemo, useState } from "react";
import { Play, RotateCcw, Loader2, AlertTriangle, CheckCircle2, CircleDashed, Clock, HardDrive } from "lucide-react";
import type { EndpointDefinition, ApiResponse } from "@/types/api";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonViewer } from "@/components/ui/JsonViewer";

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

export function EndpointDetail({ endpoint, verified }: { endpoint: EndpointDefinition; verified: boolean }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const p of endpoint.params) v[p.name] = p.example;
    return v;
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);

  const requestUrl = useMemo(() => {
    const u = `${localPath(endpoint)}`;
    const qs = endpoint.params
      .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.example)}`)
      .join("&");
    return qs ? `${u}?${qs}` : u;
  }, [endpoint]);

  async function send(resend = false) {
    if (loading) return;
    void resend;
    setLoading(true);
    setResponse(null);
    const started = performance.now();
    try {
      const url = buildUrl(endpoint, values);
      const res = await fetch(url, { method: "GET" });
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
    <article className="p-4 md:p-6">
      <header className="flex flex-wrap items-center gap-2.5">
        <span className="rounded border border-mint px-1.5 py-0.5 font-code text-[11px] font-semibold text-mint">
          {endpoint.method}
        </span>
        <h1 className="font-display text-xl font-extrabold md:text-2xl">{endpoint.name}</h1>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-mint/50 bg-mint/10 px-2 py-0.5 font-code text-[11px] text-mint">
            <CheckCircle2 size={11} /> Terverifikasi
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-card px-2 py-0.5 font-code text-[11px] text-ink-faint">
            <CircleDashed size={11} /> Belum terverifikasi
          </span>
        )}
      </header>

      <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">{endpoint.description}</p>

      <div className="mt-5 rounded-lg border-2 border-line bg-card-soft p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-code text-xs text-ink-faint">endpoint lokal</span>
          <CopyButton text={requestUrl} label="Salin URL" />
        </div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto rounded-md border-2 border-line bg-[#120e24] px-3 py-2.5">
          <span className="shrink-0 font-code text-xs font-semibold text-mint">{endpoint.method}</span>
          <code className="font-code text-sm text-lemon">{localPath(endpoint)}</code>
        </div>
        {endpoint.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {endpoint.tags.map((t) => (
              <span key={t} className="rounded border border-line-strong px-1.5 py-0.5 font-code text-[10px] text-ink-faint">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold">Parameter</h2>
        {endpoint.params.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Endpoint ini tidak membutuhkan parameter.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border-2 border-line">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-line bg-surface text-left font-code text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-3 py-2 font-medium">Nama</th>
                  <th className="px-3 py-2 font-medium">Tipe</th>
                  <th className="px-3 py-2 font-medium">Wajib</th>
                  <th className="px-3 py-2 font-medium">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr key={p.name} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2 font-code text-lemon">{p.name}</td>
                    <td className="px-3 py-2 font-code text-xs text-ink-muted">
                      {p.enum ? `enum (${p.enum.length} opsi)` : p.type}
                    </td>
                    <td className="px-3 py-2">
                      {p.required ? (
                        <span className="font-code text-xs text-primary-soft">wajib</span>
                      ) : (
                        <span className="font-code text-xs text-ink-faint">opsional</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-muted">
                      {p.description || <span className="text-ink-faint">—</span>}
                      {p.enum && (
                        <span className="mt-1 block font-code text-[10px] text-ink-faint">
                          opsi: {p.enum.slice(0, 6).join(", ")}
                          {p.enum.length > 6 ? `, …` : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold">Try API</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Request dikirim nyata ke backend lokal. Endpoint ini hanya operasi baca (GET) — aman untuk dicoba.
        </p>

        {endpoint.params.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border-2 border-line bg-card-soft p-4 sm:grid-cols-2">
            {endpoint.params.map((p) => (
              <label key={p.name} className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 font-code text-xs text-ink-muted">
                  {p.name}
                  {p.required && <span className="text-primary">*</span>}
                  <span className="text-ink-faint">({p.enum ? "enum" : p.type})</span>
                </span>
                {p.enum ? (
                  <select
                    value={values[p.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                    className="rounded-md border-2 border-line bg-bg px-2.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    {p.enum.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={values[p.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                    inputMode={p.type === "integer" || p.type === "number" ? "numeric" : undefined}
                    className="rounded-md border-2 border-line bg-bg px-2.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                )}
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => send()}
            disabled={loading}
            className="press inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-4 py-2.5 font-display text-sm font-bold text-[#140f00] shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            {loading ? "Mengirim…" : "Kirim Request"}
          </button>
          {response && (
            <button
              onClick={() => send(true)}
              disabled={loading}
              className="press inline-flex items-center gap-2 rounded-md border-2 border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink-muted"
            >
              <RotateCcw size={14} /> Ulangi
            </button>
          )}
        </div>

        {response && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg border-2 border-b-0 border-line bg-surface px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-code text-xs">
                <span
                  className={`flex items-center gap-1.5 font-semibold ${
                    response.status >= 200 && response.status < 300 ? "text-mint" : "text-danger"
                  }`}
                >
                  {response.status >= 200 && response.status < 300 ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  HTTP {response.status}
                </span>
                <span className="flex items-center gap-1 text-ink-faint">
                  <Clock size={12} /> {response.timeMs} ms
                </span>
                {response.sizeBytes > 0 && (
                  <span className="flex items-center gap-1 text-ink-faint">
                    <HardDrive size={12} /> {(response.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
              <CopyButton text={response.raw} label="Salin Response" />
            </div>

            <div className="rounded-b-lg border-2 border-line">
              {response.error && (
                <div className="border-b-2 border-line bg-danger/10 px-4 py-2.5 font-code text-sm text-danger">
                  {response.error}
                </div>
              )}
              {response.contentType.startsWith("image/") && response.status < 300 ? (
                <div className="flex justify-center bg-[#120e24] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={response.raw}
                    alt="Response gambar dari endpoint"
                    className="max-h-96 max-w-full rounded-md border-2 border-line object-contain"
                  />
                </div>
              ) : (
                <JsonViewer value={response.body} />
              )}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
