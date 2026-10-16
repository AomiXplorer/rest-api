/**
 * Mock Upstash Redis REST untuk pengujian LOKAL (bukan produksi).
 * Implementasi subset pipeline command yang dipakai proyek:
 * get, set (NX/EX), expire, hincrby, hgetall, lpush, ltrim, llen,
 * zincrby, zrevrange (WITHSCORES).
 * Jalankan: node scripts/dev/mock-upstash.mjs [port]
 */
import http from "node:http";

const port = Number(process.argv[2] ?? 3199);
const strings = new Map();
const hashes = new Map();
const lists = new Map();
const zsets = new Map();
const expirations = new Map();

const nowSec = () => Math.floor(Date.now() / 1000);
const expired = (k) => expirations.has(k) && expirations.get(k) < nowSec();
const getS = (k) => (expired(k) ? undefined : strings.get(k));
const getH = (k) => { if (expired(k)) return undefined; if (!hashes.has(k)) hashes.set(k, new Map()); return hashes.get(k); };

function run(cmd) {
  const [op, ...args] = cmd;
  switch (op.toLowerCase()) {
    case "get": return getS(args[0]) ?? null;
    case "set": {
      let i = 2, nx = false, ex = null;
      while (i < args.length) {
        if (args[i] === "NX") nx = true;
        else if (args[i] === "EX") ex = Number(args[i + 1]);
        i += args[i] === "EX" ? 2 : 1;
      }
      if (nx && getS(args[0]) !== undefined) return null;
      strings.set(args[0], args[1]);
      if (ex) expirations.set(args[0], nowSec() + ex); else expirations.delete(args[0]);
      return "OK";
    }
    case "expire": { if (getS(args[0]) !== undefined || hashes.has(args[0]) || lists.has(args[0]) || zsets.has(args[0])) { expirations.set(args[0], nowSec() + Number(args[1])); return 1; } return 0; }
    case "del": { for (const m of [strings, hashes, lists, zsets]) m.delete(args[0]); expirations.delete(args[0]); return 1; }
    case "hincrby": { const h = getH(args[0]); h.set(args[1], Number(h.get(args[1]) ?? 0) + Number(args[2])); return h.get(args[1]); }
    case "hgetall": {
      if (expired(args[0])) return {};
      const h = hashes.get(args[0]);
      if (!h) return {};
      const o = {};
      for (const [k, v] of h) o[k] = String(v);
      return o;
    }
    case "lpush": { if (expired(args[0])) lists.delete(args[0]); if (!lists.has(args[0])) lists.set(args[0], []); lists.get(args[0]).unshift(args[1]); return lists.get(args[0]).length; }
    case "ltrim": { const l = lists.get(args[0]); if (l) lists.set(args[0], l.slice(Number(args[1]), Number(args[2]) + 1)); return "OK"; }
    case "llen": return expired(args[0]) ? 0 : (lists.get(args[0])?.length ?? 0);
    case "zincrby": {
      if (expired(args[0])) zsets.delete(args[0]);
      if (!zsets.has(args[0])) zsets.set(args[0], new Map());
      const z = zsets.get(args[0]);
      z.set(args[2], (z.get(args[2]) ?? 0) + Number(args[1]));
      return z.get(args[2]);
    }
    case "zrevrange": {
      if (expired(args[0])) return [];
      const z = zsets.get(args[0]);
      if (!z) return [];
      const sorted = [...z.entries()].sort((a, b) => b[1] - a[1]);
      const from = Number(args[1]), to = Number(args[2]);
      const slice = sorted.slice(from, to === -1 ? undefined : to + 1);
      if ((args[3] ?? "").toUpperCase() === "WITHSCORES") {
        const out = [];
        for (const [m, sc] of slice) out.push(m, String(sc));
        return out;
      }
      return slice.map(([m]) => m);
    }
    default: return null;
  }
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url.endsWith("/pipeline")) {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const cmds = JSON.parse(body);
        const results = cmds.map((c) => ({ result: run(c) }));
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(results));
      } catch {
        res.writeHead(400); res.end("[]");
      }
    });
    return;
  }
  res.writeHead(404); res.end();
}).listen(port, () => console.log(`mock-upstash on :${port}`));
