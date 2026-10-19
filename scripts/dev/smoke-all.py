#!/usr/bin/env python3
"""Smoke test seluruh endpoint publik terhadap produksi (pacing 38 req/menit)."""
import json, time, sys, urllib.request, urllib.error, threading
from concurrent.futures import ThreadPoolExecutor

BASE = "https://cyronime.my.id/api/v1"
PATH = sys.argv[1] if len(sys.argv) > 1 else "/api"
cases = [c for c in json.load(open("/tmp/cases.json")) if c["path"].startswith(PATH)]
results = []
lock = threading.Lock()
bucket = {"n": 0, "t": time.time()}

def throttle():
    while True:
        with lock:
            now = time.time()
            if now - bucket["t"] >= 60: bucket.update(n=0, t=now)
            if bucket["n"] < 38: bucket["n"] += 1; return
            wait = 60 - (now - bucket["t"]) + 0.2
        time.sleep(wait)

def run(c):
    throttle()
    url = BASE + c["path"].replace("/api", "", 1) + ("?" + c["qs"] if c["qs"] else "")
    t0 = time.time()
    try:
        with urllib.request.urlopen(url, timeout=90) as r:
            body = r.read(600).decode("utf-8", "ignore")
            st, code, msg = r.status, "-", "ok"
            try:
                j = json.loads(body); code = j.get("error", {}).get("code", "-") if not j.get("success", True) else "-"
                msg = (j.get("error", {}).get("message", "ok")[:70] if not j.get("success", True) else "ok")
            except Exception: code, msg = "NON-JSON", body[:40]
    except urllib.error.HTTPError as e:
        body = e.read(600).decode("utf-8", "ignore"); st = e.code
        try:
            j = json.loads(body); code = j.get("error", {}).get("code", "-"); msg = j.get("error", {}).get("message", "")[:70]
        except Exception: code, msg = "NON-JSON", body[:40]
    except Exception as e:
        st, code, msg = 0, "EXC", str(e)[:60]
    with lock:
        results.append({"id": c["id"], "path": c["path"], "status": st, "code": code, "msg": msg, "ms": int((time.time()-t0)*1000)})
        n = len(results)
        if n % 20 == 0: print(f"  ... {n}/{len(cases)}", flush=True)

with ThreadPoolExecutor(max_workers=6) as ex:
    list(ex.map(run, cases))
json.dump(results, open("/tmp/results.json", "w"))
ok = [r for r in results if r["status"] == 200 and r["code"] in ("-",)]
bad = [r for r in results if r not in ok]
print(f"SELESAI {len(cases)} kasus — OK: {len(ok)} | GAGAL: {len(bad)}")
for r in sorted(bad, key=lambda x: x["code"]):
    print(f"  [{r['status']}|{r['code']}] {r['path']} :: {r['msg']}")
