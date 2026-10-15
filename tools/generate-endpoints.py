#!/usr/bin/env python3
"""
Regenerates src/config/endpoints.ts from the official upstream OpenAPI spec:
    python3 tools/generate-endpoints.py
"""
import json, re, urllib.request, collections

SPEC_URL = "https://api.siputzx.my.id/api/openapi.json"
OUT = "src/config/endpoints.ts"

CATEGORIES = {
 "canvas": ("Canvas & Effects", "Endpoints pengolahan gambar dan generator kartu profil, welcome, dan efek visual. Response berupa gambar binary."),
 "games": ("Games & Quiz", "Kuis, teka-teki, dan permainan interaktif seperti family100, caklontong, dan tebak gambar."),
 "anime": ("Anime", "Informasi anime, manga, dan platform streaming anime Indonesia seperti Otakudesu, Samehadaku, dan Anichin."),
 "s": ("Search", "Pencarian lintas platform: YouTube, Pinterest, Spotify, Google, KBBI, dan banyak lagi."),
 "d": ("Downloader", "Ekstraksi media dari URL TikTok, Instagram, Facebook, Twitter, YouTube, dan platform lain."),
 "r": ("Random", "Gambar dan konten acak seperti quote anime, neko, waifu, dan cecan berbagai negara."),
 "ai": ("AI & Chat", "Endpoint AI dan chatbot: DuckAI, GPT, DeepSeek, Qwen, GLM, Gemini, dan Meta AI."),
 "primbon": ("Primbon", "Perhitungan primbon Jawa: arti nama, ramalan jodoh, zodiak, tafsir mimpi, dan weton."),
 "berita": ("Berita & News", "Berita terkini dari CNN Indonesia, Liputan6, dan sumber berita nasional lain."),
 "stalk": ("Stalker", "Informasi profil publik dari GitHub, Instagram, TikTok, Twitter/X, YouTube, dan lainnya."),
 "tools": ("Tools", "Utilitas: translate, screenshot web, kode pos, info negara, subdomain, dan VCC generator."),
 "info": ("Info", "Informasi cuaca, gempa BMKG, jadwal TV, dan event di Indonesia."),
 "m": ("Maker", "Generator gambar teks dari photoOxy, ephoto360, textpro, dan brat."),
 "sticker": ("Sticker", "Pencarian stiker Telegram melalui combot."),
}

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def example_for(name, ptype, enum):
    if enum: return str(enum[0])
    if ptype == "integer": return "1"
    if ptype == "number": return "0.7"
    if ptype == "boolean": return "true"
    if name in ("url", "link"): return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    if name in ("image","avatar","avatar1","avatar2","image1","image2","background",
                "backgroundURL","avatarURL","pas_photo","guildIcon"):
        return "https://github.com/fluidicon.png"
    return {
        "user":"octocat","username":"octocat","q":"indonesia","query":"indonesia","search":"indonesia",
        "name":"Rina","nama":"Budi","text":"halo dunia","text1":"teks pertama","text2":"teks kedua",
        "prompt":"tuliskan puisi singkat tentang laut","message":"hai, siapa kamu?","question":"siapa itu Yesus?",
        "domain":"example.com","form":"jakarta barat","channel":"tvri","region":"id-id","kl":"id-id","df":"m",
        "translation":"world english version","source":"auto","target":"id","device":"desktop","theme":"dark",
        "caption":"kucing",
    }.get(name, "contoh")

def lit(v):
    """Serialize a Python value as a TS literal."""
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, str): return json.dumps(v, ensure_ascii=False)
    return str(v)

def main():
    import os
    req = urllib.request.Request(SPEC_URL, headers={"User-Agent": "sipuapi-config-generator/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            spec = json.loads(r.read().decode())
    except Exception:
        cache = os.path.join(os.path.dirname(__file__), "openapi.cache.json")
        if not os.path.exists(cache):
            cache = "/tmp/openapi.json"
        with open(cache) as f:
            spec = json.load(f)
    endpoints = []
    for path, ops in spec["paths"].items():
        get = ops["get"]
        seg = path.split("/")[2]
        sub = "/".join(path.split("/")[3:])
        params = []
        for p in get.get("parameters", []):
            sch = p.get("schema", {})
            ptype = sch.get("type", "string")
            enum = sch.get("enum")
            params.append({
                "name": p["name"],
                "required": bool(p.get("required")),
                "type": ptype,
                "description": (p.get("description") or "").replace("\n", " ").strip(),
                "example": str(p.get("example") or example_for(p["name"], ptype, enum)),
                **({"min": sch["minimum"]} if "minimum" in sch else {}),
                **({"max": sch["maximum"]} if "maximum" in sch else {}),
                **({"enum": enum} if enum else {}),
            })
        endpoints.append({
            "id": slug(seg + "-" + (sub or "index")),
            "name": get.get("summary") or sub,
            "description": (get.get("description") or "").replace("\n", " ").strip(),
            "category": seg,
            "method": "GET",
            "timeoutMs": 90000 if seg == "ai" else (60000 if seg == "anime" else (30000 if seg == "d" else 25000)),
            "upstreamPath": path,
            "params": params,
            "tags": get.get("tags", [])[:4],
        })

    order = sorted(CATEGORIES, key=lambda k: -sum(1 for e in endpoints if e["category"] == k))
    L = [
        "// AUTO-GENERATED from https://api.siputzx.my.id/api/openapi.json (" + __import__("datetime").datetime.now().isoformat()[:10] + ")",
        "// Regenerate with: python3 tools/generate-endpoints.py",
        'import type { EndpointCategory, EndpointDefinition } from "@/types/api";',
        "",
        'export const UPSTREAM_BASE_URL = process.env.UPSTREAM_BASE_URL ?? "https://api.siputzx.my.id";',
        "",
        "export const CATEGORIES: EndpointCategory[] = [",
    ]
    for k in order:
        t, d = CATEGORIES[k]
        L.append(f"  {{ key: {lit(k)}, title: {lit(t)}, description: {lit(d)} }},")
    L.append("];")
    L.append("")
    L.append("export const ENDPOINTS: EndpointDefinition[] = [")
    for e in endpoints:
        L.append("  {")
        for k in ("id","name","description","category","method","timeoutMs","upstreamPath"):
            L.append(f"    {k}: {lit(e[k])},")
        L.append("    params: [" if e["params"] else "    params: [],")
        for p in e["params"]:
            L.append("      {")
            for k in ("name","required","type","description","example"):
                L.append(f"        {k}: {lit(p[k])},")
            if "min" in p: L.append(f"        min: {p['min']},")
            if "max" in p: L.append(f"        max: {p['max']},")
            if "enum" in p: L.append("        enum: " + json.dumps(p["enum"]) + ",")
            L.append("      },")
        if e["params"]: L.append("    ],")
        L.append("    tags: " + json.dumps(e["tags"], ensure_ascii=False) + ",")
        L.append("  },")
    L.append("];")
    with open(OUT, "w") as f:
        f.write("\n".join(L) + "\n")
    print(f"wrote {OUT}: {len(endpoints)} endpoints, {len(CATEGORIES)} categories")

if __name__ == "__main__":
    main()
