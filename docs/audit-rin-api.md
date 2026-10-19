# Audit Rin API vs Aomi API — 2026-10-19

Sumber: https://apiii-xrina.my.id/docs (diakses via browser automation, 284 endpoint, 20 kategori).

## Temuan kelayakan kritis

Seluruh endpoint Rin API dilayani dari domain yang sama dan dilindungi Cloudflare managed-challenge.
Request server-to-server (curl / fetch dari server) ditolak 403 `Just a moment...`.
Konsekuensi: Rin API TIDAK LAYAK dipakai sebagai provider upstream Aomi API selama Cloudflare
menantang client non-browser. Integrasi ditunda sampai Rin menyediakan akses API tanpa challenge.
Sebagai gantinya, fitur baru yang bernilai tinggi dan tidak tergantung Rin diimplementasikan NATIF
(scrape/API publik langsung). Batch pertama: MangaDex (5 endpoint, API resmi publik).

## Tabel perbandingan

| Endpoint Rin | Deskripsi | Padanan Aomi | Status | Tindakan |
|---|---|---|---|---|
| `/animein/comments` | Komentar dari satu episode anime | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/detail` | Detail anime beserta season, episode, trailer | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/episodes` | Daftar episode anime per halaman | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/genres` | Daftar genre anime di Animein | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/home` | Beranda Animein | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/schedule` | Jadwal rilis anime per hari | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/search` | Cari katalog anime di Animein | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/animein/stream` | Link nonton per episode | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/donghive/catalog` | Katalog donghua terbaru Donghive | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/donghive/episode` | Data episode Donghive + m3u8 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/donghive/series` | Detail series Donghive | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/mangadex/chapter` | Halaman gambar satu chapter MangaDex | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/mangadex/chapters` | Daftar chapter manga di MangaDex | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/mangadex/latest` | Chapter terbaru di MangaDex | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/mangadex/manga` | Detail manga MangaDex | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/mangadex/search` | Cari manga di MangaDex | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/aicostum` | Chat AI karakter custom | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/algolia` | Algolia Agent AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/asyntai` | Asyntai AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/blackbox-ai` | Blackbox AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/chatgpt` | ChatGPT teks/gambar | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/clara` | Clara AI companion | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/claudehaiku` | Claude Haiku 4.5 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/deepai` | DeepAI Chat | ai/duckai | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/ai/ethan` | Ethan AI companion | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/gemini` | Google Gemini | ai/gemini | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/ai/geminiv2` | Gemini v2 dengan session | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/gpt` | GPT fast | ai/gpt | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/ai/guru` | Guru AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/honcho` | Honcho AI (Claude Sonnet) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/maya` | Maya AI companion | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/naxa` | Naxa AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/notegpt` | NoteGPT AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/notrack-ai` | NoTrack AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/nova` | Nova AI companion | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/overchat` | Overchat AI (GPT-4o) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai/qwen` | Qwen3 80B | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/ai/unlimitedai` | Unlimited AI karakter | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/crateimg` | Buat gambar AI multi-model | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/editimg` | Edit gambar AI (Flux Kontext) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/flux` | Gambar AI Flux dari prompt | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/hd` | Upscaler gambar 2x/3x/4x | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/hd2` | HD upscaler AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/ihancer` | Ihancer (standard/sharpen/restore/ultra) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/imagetoprompt` | Image to prompt | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/mirror-Macbook` | Foto jadi mirror selfie MacBook | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/notegpt-nano` | Edit gambar AI Nano Banana | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/remove-wm` | Hapus watermark AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/text2img` | Text to image AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tobotak` | Foto jadi botak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tochibi` | Foto jadi chibi | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tofigurav2` | Foto jadi action figure v2 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tofigurav3` | Foto jadi action figure v3 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tofigure` | Foto jadi figurine Bandai | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tofunk` | Foto jadi Funko Pop | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/toghibli` | Foto jadi gaya Ghibli | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tohijab` | Tambah hijab pada foto | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tohitam` | Kulit jadi hitam | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tojas` | Pakaian jadi jas formal | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tojepang` | Foto gaya Jepang | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tokacamata` | Tambah kacamata | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tokece` | Foto gaya kece | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tolego` | Foto jadi minifigure LEGO | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/toliquor` | Efek liquor | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomaid` | Pakaian maid | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomanga` | Foto jadi manga | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomirorv2` | Mirror selfie v2 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomirror` | Mirror selfie | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomodel` | Foto model fashion | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tomonyet` | Wajah jadi monyet | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tonikah` | Suasana pernikahan | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/tooutfit` | Ganti outfit | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/topacar` | Tambah pasangan | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/topantai` | Potret pantai golden hour | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/topeci` | Tambah peci | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/topiramida` | Latar piramida | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/toputih` | Kulit jadi putih | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/toreal` | Jadi realistis | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/toroblox` | Avatar Roblox 3D | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/totangga` | Streetwear di tangga | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/totato` | Tambah tato | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/totua` | Jadi tua | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/ai-image/unblur` | Jernihkan foto buram multi-model | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/call-andro` | Fake panggilan WA Android | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/call-ios` | Fake panggilan WA iOS | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/codesnap` | Code snapshot ala Carbon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakech` | Fake saluran WA iOS | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakedana` | Saldo DANA palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakedev` | Fake developer profile card | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakeff` | Lobby custom Free Fire | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakeff2` | Lobi FF palsu v2 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakeffduo` | Lobby FF duo | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakegc` | Grup WA iOS palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakegopay` | Saldo GoPay palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakeml` | Fake lobby Mobile Legends | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/fakeovo` | Saldo OVO palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/faketele` | Profil Telegram palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/ffgirl` | Kartu karakter cewek FF | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/ig-story` | Instagram Story palsu | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/igqc` | Fake chat IG reaksi emoji | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/iqc` | Chat iPhone dark | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/iqcpink` | Chat iPhone pink | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/iqcpinkv2` | Chat iPhone pink v2 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/meledak` | Tempel foto ke ledakan | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/meme-polisi` | Meme timpa template kertas | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/musiccard` | Kartu pemutar musik | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/nokia` | SMS ala HP Nokia | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/qoutes-anime` | Quotes karakter anime | r/quotesanime | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/canvas/quotes` | Quotes estetik | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/canvas/topixel` | Foto jadi pixel art | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/ttqc` | Fake chat TikTok | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/canvas/windows` | Meme quotes Windows | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/download/aio` | AIO downloader banyak platform | d/savefrom | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/aio2` | AIO downloader v2 | d/savefrom | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/bilibili` | Download video Bilibili | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/capcut` | Download template CapCut no-WM | d/capcut | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/facebook` | Download video Facebook HD+MP3 | d/facebook | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/gdrive` | Download file Google Drive | d/gdrive | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/igmp3` | MP3 dari IG Reel | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/download/instagram` | Download IG foto/video/reel | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/mediafire` | Download file Mediafire | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/pindl` | Download gambar/video Pinterest | d/pinterest | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/play` | MP3 YouTube via pencarian | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/play-spotify` | MP3 dari lagu Spotify | d/spotify | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/shopee` | Download video Shopee Video | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/snackvideo` | Download SnackVideo no-WM | d/snackvideo | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/terabox` | Download file Terabox | d/terabox | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/tiktok` | Download TikTok no-WM | d/tiktok | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/tiktok2` | Download TikTok v2 | d/tiktok | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/twitterdl` | Download video/gambar tweet X | d/twitter | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/uc-dl` | Download UC Drive | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/download/youtube-dl` | Download YouTube multi-kualitas | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/download/ytmp3` | MP3 YouTube | d/ytmp3 | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/download/ytmp4` | MP4 YouTube 360p | d/ytmp4 | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/fun/artinama` | Arti nama | primbon/artinama | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/fun/cekcantik` | Cek kecantikan acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/cekganteng` | Cek kegantengan acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/cekiq` | Cek IQ acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/cekkhodam` | Cek khodam dari nama | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/fun/ceksifat` | Cek sifat dari nama | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/longteks` | Teks romantis acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/pantun` | Pantun acak | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/fun/pap` | Gambar pap acak Pinterest | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/quotes-bijak` | Quotes bijak acak | r/quotes | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/fun/quotes-bucin` | Quotes bucin acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/quotes-galau` | Quotes galau acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/quotes-gombal` | Gombalan receh acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/fun/quotes-motivasi` | Quotes motivasi acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/asahotak` | Soal asah otak | games/asahotak | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/caklontong` | Cak Lontong | games/caklontong | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/kataacak` | Susun huruf acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/susunkata` | Susun kata | games/susunkata | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/tebakbendera` | Tebak bendera | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/tebakbuah` | Tebak buah | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/tebakepep` | Tebak karakter FF | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/tebakgambar` | Tebak gambar | games/tebakgambar | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/tebakhewan` | Tebak hewan | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/tebakkalimat` | Lengkapi kalimat | games/tebakkalimat | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/tebakkata` | Tebak kata | games/tebakkata | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/game/tebakkimia` | Tebak unsur kimia | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/game/tebaktebakan` | Tebak-tebakan lucu | games/tekateki | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/info/antara` | Berita Antara News | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/info/beritajakarta` | Berita Jakarta | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/info/bmkg-gempa` | Info gempa BMKG | info/bmkg | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/info/cnbc` | Berita CNBC Indonesia | berita/cnbc | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/info/cnn` | Berita CNN Indonesia | berita/cnn | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/info/infopublik` | Berita InfoPublik | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/info/kemenag` | Shorts Kemenag RI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/info/kemkes` | Rilis Kemenkes RI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/info/kompas` | Berita Kompas | berita/kompas | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/info/sindonews` | Berita SINDOnews | berita/tribunnews | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/komik/browse` | Jelajahi komik VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komik/detail` | Detail komik VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komik/home` | Komik populer VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komik/read` | Baca chapter komik VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komik/search` | Cari komik VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komik/update` | Komik update terbaru VoraToon | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/chapter` | Gambar chapter Komiku | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/detail` | Detail komik Komiku | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/genre` | Komik per genre | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/home` | Beranda Komiku | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/populer` | Komik populer | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/random` | Komik acak | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/search` | Cari komik Komiku | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/terbaru` | Komik terbaru | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/komiku/type` | Komik per tipe | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/attp` | Stiker teks ATTP | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/maker/brat` | Stiker teks Brat | m/brat | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/maker/brat-vermeil` | Brat template Vermeil | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/bratgojo` | Brat template Gojo | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/brathd` | Brat HD | m/brat | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/maker/bratspongebob` | Brat papan SpongeBob | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/bratvid` | Brat animasi | m/bratvideo | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/maker/bratvid2` | Brat animasi v2 | m/bratvideo | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/maker/emojimix` | Gabung 2 emoji | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/maker/jarvis` | Meme Jarvis | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/qc` | Quote chat custom | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/maker/smeme` | Stiker meme | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/maker/smemevid` | Video meme 512x512 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/maker/sticker-reaksi` | Stiker reaksi custom | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/premium/am-bulk` | Akun AM Pro bulk (TempMail) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/am-bulk2` | Akun AM Pro bulk2 | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/am-send` | Magic Link AM | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/am-verify` | Verifikasi Magic Link AM | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/ffguest` | Akun guest FF | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/ig-like` | Like IG (boost) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/ig-story-view` | Views story IG (boost) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/ig-views` | Views IG (boost) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/nftoken` | Token Netflix | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/nftoken2` | Token Netflix v2 | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/rch-vip` | React WA Channel VIP | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/tiktok-like` | Like TikTok (boost) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/tiktok-view` | Views TikTok (boost) | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/premium/viu` | Akun VIU | - | TIDAK LAYAK | Butuh akun VIP/apikey Rin + layaknya boost engagement (like/view palsu) — di luar kebijakan |
| `/search/amfinder` | Cari preset AM | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/search/capcut-comment` | Komentar template CapCut | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/search/cc-search` | Cari template CapCut | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/search/github-srch` | Cari file di GitHub | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/search/lyrics` | Cari lirik lagu | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/search/npm` | Cari package NPM | s/npm | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/pinterest` | Cari gambar Pinterest | s/pinterest | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/resep` | Cari resep Cookpad | s/resep | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/spotify` | Cari lagu Spotify | s/spotify | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/sticker-telegram` | Cari sticker pack Telegram | sticker/ | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/stickerly` | Cari sticker Sticker.ly | sticker/ | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/search/ttsearch` | Cari video TikTok | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/search/yt-comment` | Komentar video YouTube | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/search/ytsearch` | Cari video YouTube | s/youtube | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/npm-stalk` | Stalk package NPM | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/stalker/stalk-ff` | Stalk akun FF | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/stalker/stalk-gh` | Stalk GitHub | stalk/github | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-ig` | Stalk Instagram | stalk/instagram | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-ml` | Stalk Mobile Legends | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/stalker/stalk-roblox` | Stalk Roblox | stalk/roblox | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-telegram` | Stalk Telegram | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/stalker/stalk-threads` | Stalk Threads | stalk/threads | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-tiktok` | Stalk TikTok | stalk/tiktok | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-x` | Stalk X | stalk/twitter | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/stalker/stalk-yt` | Stalk YouTube | stalk/youtube | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/system/block` | Block apikey (admin) | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/system/blocklist` | Daftar blocklist | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/system/cek-limit` | Cek limit apikey | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/system/cf-setup` | Setup CF (admin) | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/system/cf-status` | Status CF (admin) | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/system/unblock` | Unblock apikey (admin) | - | TIDAK LAYAK | Sistem internal Rin (apikey/CF admin), bukan fitur publik |
| `/tools/am-send` | Magic Link AM gratis | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/am-verify` | Verifikasi Magic Link AM gratis | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/bypass` | Bypass shortener | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/bypassv2` | Bypass shortener v2 | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/cek-nsfw` | Deteksi NSFW gambar | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/cekban-wa` | Cek banned WA | r/cek-nomor | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/tools/cekmail` | Baca inbox tempmail | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/ceknomor-operator` | Cek operator nomor | r/cek-nomor | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/tools/cekphising` | Cek link phishing | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/convert` | Konversi file format lain | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/createvid` | Video dari teks AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/hdvid` | Perjelas video (ffmpeg) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/hdvid2` | Perjelas video AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/img2vid` | Gambar jadi video AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/img2vid-v2` | Gambar jadi video AI v2 | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/ocr` | OCR teks dari gambar | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/ouo-io-bypass` | Bypass ouo.io | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/qrcode` | QR Code generator | tools/qrcode | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/tools/rateweb` | Nilai web via PageSpeed | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/rch` | React WA Channel (apikey) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/readqr` | Baca QR Code | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/recordweb` | Rekam website jadi video | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/removebg` | Hapus background gambar | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/scan-ai-slopweb` | Deteksi AI-generated image | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/shortlink` | Perpendek link custom | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/spam-ngl` | Spam pesan NGL (apikey) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/speed-web` | Tes kecepatan web Pingdom | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/ssweb` | Screenshot website 3 ukuran | tools/ssweb | SUDAH ADA | Aomi sudah punya fitur setara; tidak dibuat duplikat |
| `/tools/tempmail` | Buat email sementara | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/tiktok-checker` | Cek profil TikTok | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/trackip` | Lacak info IP | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/transkripsi` | Audio jadi teks (ID) | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/ttdracin` | TTS narator drama China | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/tts` | Text to speech | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |
| `/tools/txt2video` | Video dari teks AI | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/vid2prompt` | Video jadi prompt | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/web2apk` | Website jadi APK | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/webtozip` | Website jadi ZIP | - | BARU | Fitur baru (jika diintegrasikan); status integrasi provider Rin: TERBLOKIR Cloudflare |
| `/tools/whatmusic` | Deteksi lagu dari audio | (tidak persis) | BARU* | Padanan tidak ditemukan persis; perlu evaluasi manual |

## Ringkasan

- Endpoint Rin ditemukan: 284
- SUDAH ADA (duplikat, tidak dibuat ulang): 54
- BARU (belum ada di Aomi): 210
- TIDAK LAYAK: 20
- Diimplementasikan natif batch ini: 5 (MangaDex)
- Sisa BARU menunggu integrasi provider (terblokir CF) atau implementasi natif bertahap
