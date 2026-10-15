"use client";

import { useMemo, useState } from "react";

const KEYWORDS = [
  "string", "number", "integer", "boolean", "true", "false", "null",
  '"status"', '"data"', '"success"', '"error"', '"message"', '"meta"',
];

function tokenize(line: string): { text: string; cls: string }[] {
  // Minimal JSON syntax highlight — no external highlighter dependency.
  const out: { text: string; cls: string }[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+\.?\d*)|([{}[\],])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), cls: "" });
    if (m[1] && m[2]) {
      out.push({ text: m[1], cls: "text-mint" });
      out.push({ text: m[2], cls: "text-ink-faint" });
    } else if (m[1]) {
      out.push({ text: m[1], cls: "text-lemon" });
    } else if (m[3]) {
      out.push({ text: m[3], cls: "text-primary-soft" });
    } else if (m[4]) {
      out.push({ text: m[4], cls: "text-primary-soft" });
    } else {
      out.push({ text: m[5] ?? "", cls: "text-ink-faint" });
    }
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ text: line.slice(last), cls: "" });
  void KEYWORDS;
  return out;
}

export function JsonViewer({ value, maxChars = 40000 }: { value: unknown; maxChars?: number }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  const truncated = text.length > maxChars;
  const shown = truncated ? text.slice(0, maxChars) : text;

  return (
    <pre className="overflow-auto rounded-md border-2 border-line bg-[#120e24] p-4 font-code text-[13px] leading-relaxed text-ink-muted">
      {shown.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre">
          {tokenize(line).map((t, j) => (
            <span key={j} className={t.cls}>{t.text}</span>
          ))}
        </div>
      ))}
      {truncated && (
        <div className="mt-2 text-ink-faint">… (output dipotong pada {maxChars.toLocaleString()} karakter — salin untuk data penuh)</div>
      )}
    </pre>
  );
}
