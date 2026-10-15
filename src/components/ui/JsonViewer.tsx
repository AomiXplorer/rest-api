"use client";

import { useEffect, useMemo, useState } from "react";

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
      out.push({ text: m[1], cls: "text-[#7fd4c4]" });
      out.push({ text: m[2], cls: "text-[#7f8fa0]" });
    } else if (m[1]) {
      out.push({ text: m[1], cls: "text-[#ffd98a]" });
    } else if (m[3]) {
      out.push({ text: m[3], cls: "text-[#9cc3e8]" });
    } else if (m[4]) {
      out.push({ text: m[4], cls: "text-[#9cc3e8]" });
    } else {
      out.push({ text: m[5] ?? "", cls: "text-[#7f8fa0]" });
    }
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ text: line.slice(last), cls: "" });
  void KEYWORDS;
  return out;
}

const HL_THRESHOLD = 150; // baris — output di bawah ini langsung di-highlight

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

  // Highlight besar ditunda sampai halaman idle supaya render awal tetap ringan
  const lines = useMemo(() => shown.split("\n"), [shown]);
  const [hl, setHl] = useState(lines.length <= HL_THRESHOLD);
  useEffect(() => {
    if (hl) return;
    const id = requestIdleCallback(() => setHl(true), { timeout: 700 });
    return () => cancelIdleCallback(id);
  }, [hl]);

  return (
    <pre className="overflow-auto bg-code p-4 font-code text-[13px] leading-relaxed text-code-text">
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {hl
            ? tokenize(line).map((t, j) => (
                <span key={j} className={t.cls}>{t.text}</span>
              ))
            : line || "\u00a0"}
        </div>
      ))}
      {truncated && (
        <div className="mt-2 text-ink-faint">… (output dipotong pada {maxChars.toLocaleString()} karakter — salin untuk data penuh)</div>
      )}
    </pre>
  );
}
