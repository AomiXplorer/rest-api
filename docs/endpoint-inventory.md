# Inventaris Endpoint

Sumber: [api.siputzx.my.id](https://api.siputzx.my.id) (OpenAPI spec resmi di `/api/openapi.json`,
ditemukan melalui audit halaman playground `app.siputzx.my.id/playground` pada 2026-10-15).

- **197 endpoint** GET terdeteksi dari OpenAPI spec resmi (halaman playground adalah SPA React yang
  merender data dari spec yang sama).
- Semua endpoint sumber bersifat publik tanpa API key, tanpa autentikasi, dan memakai query parameter.
- Path lokal memakai namespace `/api/v1/<kategori>/<endpoint>` dan hanya mendukung GET (read-only, aman).
- Status "Terverifikasi" = request valid dikirim melalui backend lokal dan mengembalikan data nyata
  (JSON `success:true` atau gambar binary). Detail proses di `docs/testing-report.md`.

| Kategori | Nama Endpoint | Metode | Parameter | Sumber | Status |
|---|---|---|---|---|---|
| canvas (Canvas & Effects) | Affect Image | GET | image* | `/api/canvas/affect` | Terverifikasi |
| canvas (Canvas & Effects) | Batslap Image | GET | image1*, image2* | `/api/canvas/batslap` | Terverifikasi |
| canvas (Canvas & Effects) | Beautiful Image Effect | GET | image* | `/api/canvas/beautiful` | Terverifikasi |
| canvas (Canvas & Effects) | Blur Image Effect | GET | image* | `/api/canvas/blur` | Terverifikasi |
| canvas (Canvas & Effects) | Captcha Image | GET | background*, captchaKey, border, overlayOpacity | `/api/canvas/captcha` | Terverifikasi |
| canvas (Canvas & Effects) | Circle Image | GET | image* | `/api/canvas/circle` | Terverifikasi |
| canvas (Canvas & Effects) | Darkness Image Effect | GET | image*, amount | `/api/canvas/darkness` | Terverifikasi |
| canvas (Canvas & Effects) | Delete Image | GET | image* | `/api/canvas/delete` | Terverifikasi |
| canvas (Canvas & Effects) | eKTP Generator | GET | provinsi*, kota*, nik*, nama*, ttl*, jenis_kelamin*, golongan_darah*, alamat*, rt/rw*, kel/desa*, kecamatan*, agama*, status*, pekerjaan*, kewarganegaraan*, masa_berlaku*, terbuat*, pas_photo* | `/api/canvas/ektp` | Terverifikasi |
| canvas (Canvas & Effects) | Facepalm Image | GET | image* | `/api/canvas/facepalm` | Terverifikasi |
| canvas (Canvas & Effects) | Fake XNXX Comment | GET | name*, quote*, likes, dislikes | `/api/canvas/fake-xnxx` | Terverifikasi |
| canvas (Canvas & Effects) | Gay Image | GET | nama*, avatar*, num* | `/api/canvas/gay` | Terverifikasi |
| canvas (Canvas & Effects) | Goodbye V1 | GET | username*, guildName*, guildIcon*, memberCount*, avatar*, background*, quality | `/api/canvas/goodbyev1` | Terverifikasi |
| canvas (Canvas & Effects) | Goodbye V2 | GET | username*, guildName*, memberCount*, avatar*, background* | `/api/canvas/goodbyev2` | Terverifikasi |
| canvas (Canvas & Effects) | Goodbye V3 | GET | username*, avatar* | `/api/canvas/goodbyev3` | Terverifikasi |
| canvas (Canvas & Effects) | Goodbye V4 | GET | avatar*, background*, title*, description*, border, avatarBorder, overlayOpacity | `/api/canvas/goodbyev4` | Terverifikasi |
| canvas (Canvas & Effects) | Goodbye V5 | GET | username*, guildName*, memberCount*, avatar*, background*, quality | `/api/canvas/goodbyev5` | Terverifikasi |
| canvas (Canvas & Effects) | Greyscale Image | GET | image* | `/api/canvas/greyscale` | Terverifikasi |
| canvas (Canvas & Effects) | Invert Image | GET | image* | `/api/canvas/invert` | Terverifikasi |
| canvas (Canvas & Effects) | Kiss Image | GET | image1*, image2* | `/api/canvas/kiss` | Terverifikasi |
| canvas (Canvas & Effects) | Level Up Card | GET | backgroundURL*, avatarURL*, fromLevel*, toLevel*, name* | `/api/canvas/level-up` | Terverifikasi |
| canvas (Canvas & Effects) | Profile Card | GET | backgroundURL*, avatarURL*, rankName*, rankId*, exp*, requireExp*, level*, name* | `/api/canvas/profile` | Terverifikasi |
| canvas (Canvas & Effects) | Security Card | GET | avatar*, background*, createdTimestamp*, suspectTimestamp*, locale* | `/api/canvas/security` | Terverifikasi |
| canvas (Canvas & Effects) | Sertifikat Tolol | GET | text* | `/api/canvas/sertifikat-tolol` | Terverifikasi |
| canvas (Canvas & Effects) | Ship Image | GET | avatar1*, avatar2*, background*, persen* | `/api/canvas/ship` | Terverifikasi |
| canvas (Canvas & Effects) | Spotify Card | GET | title*, artist*, start*, end*, image*, album, border | `/api/canvas/spotify` | Terverifikasi |
| canvas (Canvas & Effects) | Top Leaderboard | GET | background*, usersData*, scoreMessage, opacity | `/api/canvas/top` | Sumber gagal saat uji (503/504) |
| canvas (Canvas & Effects) | Tweet Card | GET | displayName*, username*, comment*, avatar*, verified, theme | `/api/canvas/tweet` | Terverifikasi |
| canvas (Canvas & Effects) | Welcome V1 | GET | username*, guildName*, guildIcon*, memberCount*, avatar*, background*, quality | `/api/canvas/welcomev1` | Terverifikasi |
| canvas (Canvas & Effects) | Welcome V2 | GET | username*, guildName*, memberCount*, avatar*, background* | `/api/canvas/welcomev2` | Terverifikasi |
| canvas (Canvas & Effects) | Welcome V3 | GET | username*, avatar* | `/api/canvas/welcomev3` | Terverifikasi |
| canvas (Canvas & Effects) | Welcome V4 | GET | avatar*, background*, description* | `/api/canvas/welcomev4` | Terverifikasi |
| canvas (Canvas & Effects) | Welcome V5 | GET | username*, guildName*, memberCount*, avatar*, background*, quality | `/api/canvas/welcomev5` | Terverifikasi |
| canvas (Canvas & Effects) | Fake XNXX Image | GET | title*, image* | `/api/canvas/xnxx` | Terverifikasi |
| games (Games & Quiz) | Asah Otak | GET | — | `/api/games/asahotak` | Terverifikasi |
| games (Games & Quiz) | Cak Lontong | GET | — | `/api/games/caklontong` | Terverifikasi |
| games (Games & Quiz) | Cerdas Cermat | GET | matapelajaran*, jumlahsoal | `/api/games/cc-sd` | Terverifikasi |
| games (Games & Quiz) | Family100 | GET | — | `/api/games/family100` | Terverifikasi |
| games (Games & Quiz) | Tebak Kabupaten | GET | — | `/api/games/kabupaten` | Sumber gagal saat uji (503/504) |
| games (Games & Quiz) | Tebak Karakter Free Fire | GET | — | `/api/games/karakter-freefire` | Terverifikasi |
| games (Games & Quiz) | Lengkapi Kalimat | GET | — | `/api/games/lengkapikalimat` | Terverifikasi |
| games (Games & Quiz) | Maths | GET | level | `/api/games/maths` | Terverifikasi |
| games (Games & Quiz) | Siapakah Aku | GET | — | `/api/games/siapakahaku` | Terverifikasi |
| games (Games & Quiz) | Tebak Surah | GET | — | `/api/games/surah` | Terverifikasi |
| games (Games & Quiz) | Susun Kata | GET | — | `/api/games/susunkata` | Terverifikasi |
| games (Games & Quiz) | Tebak Bendera | GET | — | `/api/games/tebakbendera` | Terverifikasi |
| games (Games & Quiz) | Tebak Gambar | GET | — | `/api/games/tebakgambar` | Terverifikasi |
| games (Games & Quiz) | Tebak Game | GET | — | `/api/games/tebakgame` | Terverifikasi |
| games (Games & Quiz) | Tebak Hero ML | GET | — | `/api/games/tebakheroml` | Terverifikasi |
| games (Games & Quiz) | Tebak Hewan | GET | — | `/api/games/tebakhewan` | Sumber gagal saat uji (503/504) |
| games (Games & Quiz) | Tebak JKT | GET | — | `/api/games/tebakjkt` | Terverifikasi |
| games (Games & Quiz) | Tebak Kalimat | GET | — | `/api/games/tebakkalimat` | Terverifikasi |
| games (Games & Quiz) | Tebak Kartun | GET | — | `/api/games/tebakkartun` | Terverifikasi |
| games (Games & Quiz) | Tebak Kata | GET | — | `/api/games/tebakkata` | Terverifikasi |
| games (Games & Quiz) | Tebak Kimia | GET | — | `/api/games/tebakkimia` | Terverifikasi |
| games (Games & Quiz) | Tebak Lagu | GET | — | `/api/games/tebaklagu` | Terverifikasi |
| games (Games & Quiz) | Tebak Lirik | GET | — | `/api/games/tebaklirik` | Terverifikasi |
| games (Games & Quiz) | Tebak Logo | GET | — | `/api/games/tebaklogo` | Terverifikasi |
| games (Games & Quiz) | Tebak Tebakan | GET | — | `/api/games/tebaktebakan` | Terverifikasi |
| games (Games & Quiz) | Tebak Warna | GET | — | `/api/games/tebakwarna` | Terverifikasi |
| games (Games & Quiz) | Teka Teki | GET | — | `/api/games/tekateki` | Terverifikasi |
| anime (Anime) | anichin detail | GET | url* | `/api/anime/anichin-detail` | Sumber gagal saat uji (503/504) |
| anime (Anime) | anichin download | GET | url* | `/api/anime/anichin-download` | Sumber gagal saat uji (503/504) |
| anime (Anime) | anichin episode | GET | url* | `/api/anime/anichin-episode` | Sumber gagal saat uji (503/504) |
| anime (Anime) | anichin latest | GET | — | `/api/anime/anichin-latest` | Sumber gagal saat uji (503/504) |
| anime (Anime) | anichin popular | GET | — | `/api/anime/anichin-popular` | Sumber gagal saat uji (503/504) |
| anime (Anime) | anichin search | GET | query* | `/api/anime/anichin-search` | Sumber gagal saat uji (503/504) |
| anime (Anime) | auratail detail | GET | url* | `/api/anime/auratail-detail` | Terverifikasi |
| anime (Anime) | auratail latest | GET | — | `/api/anime/auratail-latest` | Terverifikasi |
| anime (Anime) | auratail schedule | GET | — | `/api/anime/auratail-schedule` | Terverifikasi |
| anime (Anime) | auratail search | GET | query* | `/api/anime/auratail-search` | Terverifikasi |
| anime (Anime) | komikindo detail | GET | url* | `/api/anime/komikindo-detail` | Sumber gagal saat uji (503/504) |
| anime (Anime) | komikindo download | GET | url* | `/api/anime/komikindo-download` | Sumber gagal saat uji (503/504) |
| anime (Anime) | komikindo search | GET | query* | `/api/anime/komikindo-search` | Sumber gagal saat uji (503/504) |
| anime (Anime) | oploverz download | GET | url* | `/api/anime/oploverz-download` | Sumber gagal saat uji (503/504) |
| anime (Anime) | oploverz episode | GET | url* | `/api/anime/oploverz-episode` | Sumber gagal saat uji (503/504) |
| anime (Anime) | oploverz ongoing | GET | — | `/api/anime/oploverz-ongoing` | Sumber gagal saat uji (503/504) |
| anime (Anime) | oploverz search | GET | query* | `/api/anime/oploverz-search` | Sumber gagal saat uji (503/504) |
| anime (Anime) | otakudesu detail | GET | url* | `/api/anime/otakudesu/detail` | Terverifikasi |
| anime (Anime) | otakudesu download | GET | url* | `/api/anime/otakudesu/download` | Terverifikasi |
| anime (Anime) | otakudesu ongoing | GET | — | `/api/anime/otakudesu/ongoing` | Terverifikasi |
| anime (Anime) | otakudesu search | GET | s* | `/api/anime/otakudesu/search` | Terverifikasi |
| anime (Anime) | samehadaku detail | GET | link* | `/api/anime/samehadaku/detail` | Terverifikasi |
| anime (Anime) | samehadaku download | GET | url* | `/api/anime/samehadaku/download` | Sumber gagal saat uji (503/504) |
| anime (Anime) | samehadaku latest | GET | — | `/api/anime/samehadaku/latest` | Sumber gagal saat uji (503/504) |
| anime (Anime) | samehadaku release | GET | — | `/api/anime/samehadaku/release` | Sumber gagal saat uji (503/504) |
| anime (Anime) | samehadaku search | GET | query* | `/api/anime/samehadaku/search` | Sumber gagal saat uji (503/504) |
| s (Search) | 8 font | GET | query*, page | `/api/s/8font` | Terverifikasi |
| s (Search) | quoted anime | GET | query* | `/api/s/animequotes` | Terverifikasi |
| s (Search) | music apple | GET | query*, region | `/api/s/applemusic` | Terverifikasi |
| s (Search) | bing image | GET | query* | `/api/s/bimg` | Terverifikasi |
| s (Search) | brave search | GET | query* | `/api/s/brave` | Terverifikasi |
| s (Search) | duckduckgo | GET | query*, kl, df | `/api/s/duckduckgo` | Terverifikasi |
| s (Search) | gitagram search | GET | search* | `/api/s/gitagram` | Terverifikasi |
| s (Search) | google image | GET | query* | `/api/s/googleimg` | Terverifikasi |
| s (Search) | gsmarena | GET | query* | `/api/s/gsmarena` | Terverifikasi |
| s (Search) | kbbi | GET | q* | `/api/s/kbbi` | Sumber gagal saat uji (503/504) |
| s (Search) | lahelu search | GET | query* | `/api/s/lahelu` | Terverifikasi |
| s (Search) | mangatoon search | GET | query* | `/api/s/mangatoon` | Terverifikasi |
| s (Search) | mcpedl search | GET | q* | `/api/s/mcpedl` | Terverifikasi |
| s (Search) | musixmatch | GET | query* | `/api/s/musixmatch` | Sumber gagal saat uji (503/504) |
| s (Search) | my instants search | GET | query* | `/api/s/myinstants` | Terverifikasi |
| s (Search) | otakotaku search | GET | query* | `/api/s/otakotaku` | Terverifikasi |
| s (Search) | pinterest | GET | query*, type | `/api/s/pinterest` | Terverifikasi |
| s (Search) | resep koki search | GET | query* | `/api/s/resep` | Terverifikasi |
| s (Search) | seegore search | GET | query* | `/api/s/seegore` | Terverifikasi |
| s (Search) | soundcloud search | GET | query* | `/api/s/soundcloud` | Terverifikasi |
| s (Search) | spotify search | GET | query* | `/api/s/spotify` | Route tidak ada di sumber (404) |
| s (Search) | youtube | GET | query* | `/api/s/youtube` | Terverifikasi |
| d (Downloader) | capcut | GET | url* | `/api/d/capcut` | Terverifikasi |
| d (Downloader) | douyin downloader | GET | url* | `/api/d/douyin` | Terverifikasi |
| d (Downloader) | facebook | GET | url* | `/api/d/facebook` | Terverifikasi |
| d (Downloader) | fastdl instagram downloader | GET | url* | `/api/d/fastdl` | Sumber gagal saat uji (503/504) |
| d (Downloader) | gdrive | GET | url* | `/api/d/gdrive` | Terverifikasi |
| d (Downloader) | github downloader | GET | url* | `/api/d/github` | Terverifikasi |
| d (Downloader) | igram downloader | GET | url* | `/api/d/igram` | Sumber gagal saat uji (503/504) |
| d (Downloader) | lahelu downloader | GET | url* | `/api/d/lahelu` | Terverifikasi |
| d (Downloader) | rednote | GET | url* | `/api/d/rednote` | Sumber gagal saat uji (503/504) |
| d (Downloader) | SaveFrom Downloader | GET | url* | `/api/d/savefrom` | Terverifikasi |
| d (Downloader) | snack video | GET | url* | `/api/d/snackvideo` | Sumber gagal saat uji (503/504) |
| d (Downloader) | soundCloud | GET | url* | `/api/d/soundcloud` | Sumber gagal saat uji (503/504) |
| d (Downloader) | Spotify | GET | url* | `/api/d/spotify` | Sumber gagal saat uji (503/504) |
| d (Downloader) | spotify v2 | GET | url* | `/api/d/spotifyv2` | Sumber gagal saat uji (503/504) |
| d (Downloader) | sssinstagram downloader | GET | url* | `/api/d/sssinstagram` | Terverifikasi |
| d (Downloader) | SSSTWITER Downloader | GET | url* | `/api/d/ssstwiter` | Sumber gagal saat uji (503/504) |
| d (Downloader) | tiktok | GET | url* | `/api/d/tiktok` | Sumber gagal saat uji (503/504) |
| d (Downloader) | tiktok v2 | GET | url* | `/api/d/tiktok/v2` | Terverifikasi |
| d (Downloader) | twitter downloader | GET | url* | `/api/d/twitter` | Terverifikasi |
| d (Downloader) | ummy downloader | GET | url* | `/api/d/ummy` | Terverifikasi |
| d (Downloader) | Youtube Community | GET | url* | `/api/d/ytpost` | Sumber gagal saat uji (503/504) |
| r (Random) | random blue archive | GET | — | `/api/r/blue-archive` | Terverifikasi |
| r (Random) | random foto kucing | GET | — | `/api/r/cats` | Sumber gagal saat uji (503/504) |
| r (Random) | Random Cecan CHINA | GET | — | `/api/r/cecan/china` | Terverifikasi |
| r (Random) | Random Cecan Indonesia | GET | — | `/api/r/cecan/indonesia` | Terverifikasi |
| r (Random) | Random Cecan JAPAN | GET | — | `/api/r/cecan/japan` | Terverifikasi |
| r (Random) | Random Cecan KOREA | GET | — | `/api/r/cecan/korea` | Terverifikasi |
| r (Random) | Random Cecan THAILAND | GET | — | `/api/r/cecan/thailand` | Terverifikasi |
| r (Random) | Random Cecan VIETNAM | GET | — | `/api/r/cecan/vietnam` | Terverifikasi |
| r (Random) | lahelu | GET | — | `/api/r/lahelu` | Terverifikasi |
| r (Random) | random anime neko | GET | — | `/api/r/neko` | Sumber gagal saat uji (503/504) |
| r (Random) | animequotes | GET | — | `/api/r/quotesanime` | Terverifikasi |
| r (Random) | seegore | GET | — | `/api/r/seegore` | Sumber gagal saat uji (503/504) |
| r (Random) | random waifu | GET | — | `/api/r/waifu` | Sumber gagal saat uji (503/504) |
| ai (AI & Chat) | Bible AI | GET | question*, translation | `/api/ai/bibleai` | Terverifikasi |
| ai (AI & Chat) | DeepSeek R1 | GET | prompt*, system, temperature | `/api/ai/deepseekr1` | Terverifikasi |
| ai (AI & Chat) | DuckAI Chat | GET | message*, model, systemPrompt | `/api/ai/duckai` | Sumber gagal saat uji (503/504) |
| ai (AI & Chat) | DuckAI Image Generator | GET | prompt* | `/api/ai/duckaiimage` | Sumber gagal saat uji (503/504) |
| ai (AI & Chat) | gemini [ BETA ] | GET | text*, cookie*, promptSystem, imageUrl, conversationID, responseID, choiceID | `/api/ai/gemini` | Sumber gagal saat uji (503/504) |
| ai (AI & Chat) | gita | GET | q* | `/api/ai/gita` | Terverifikasi |
| ai (AI & Chat) | GLM 4.7 Flash | GET | prompt*, system, temperature | `/api/ai/glm47flash` | Terverifikasi |
| ai (AI & Chat) | GPT OSS 120B | GET | prompt*, system, temperature | `/api/ai/gptoss120b` | Terverifikasi |
| ai (AI & Chat) | meta ai | GET | query* | `/api/ai/metaai` | Sumber gagal saat uji (503/504) |
| ai (AI & Chat) | Phi-2 | GET | prompt*, system, temperature | `/api/ai/phi2` | Terverifikasi |
| ai (AI & Chat) | QwQ 32B | GET | prompt*, system, temperature | `/api/ai/qwq32b` | Terverifikasi |
| primbon (Primbon) | arti nama | GET | nama* | `/api/primbon/artinama` | Terverifikasi |
| primbon (Primbon) | cek potensi penyakit | GET | tgl*, bln*, thn* | `/api/primbon/cek_potensi_penyakit` | Terverifikasi |
| primbon (Primbon) | kecocokan nama pasangan | GET | nama1*, nama2* | `/api/primbon/kecocokan_nama_pasangan` | Terverifikasi |
| primbon (Primbon) | nomor hoki | GET | phoneNumber* | `/api/primbon/nomorhoki` | Terverifikasi |
| primbon (Primbon) | ramalan jodoh | GET | nama1*, tgl1*, bln1*, thn1*, nama2*, tgl2*, bln2*, thn2* | `/api/primbon/ramalanjodoh` | Terverifikasi |
| primbon (Primbon) | ramalan jodoh bali | GET | nama1*, tgl1*, bln1*, thn1*, nama2*, tgl2*, bln2*, thn2* | `/api/primbon/ramalanjodohbali` | Terverifikasi |
| primbon (Primbon) | rejeki hoki weton | GET | tgl*, bln*, thn* | `/api/primbon/rejeki_hoki_weton` | Terverifikasi |
| primbon (Primbon) | sifat usaha bisnis | GET | tgl*, bln*, thn* | `/api/primbon/sifat_usaha_bisnis` | Terverifikasi |
| primbon (Primbon) | tafsir mimpi | GET | mimpi* | `/api/primbon/tafsirmimpi` | Terverifikasi |
| primbon (Primbon) | zodiak | GET | zodiak* | `/api/primbon/zodiak` | Terverifikasi |
| berita (Berita & News) | antara news | GET | — | `/api/berita/antara` | Route tidak ada di sumber (404) |
| berita (Berita & News) | cnbc indonesia | GET | — | `/api/berita/cnbcindonesia` | Terverifikasi |
| berita (Berita & News) | cnn Indonesia | GET | — | `/api/berita/cnn` | Terverifikasi |
| berita (Berita & News) | jkt48 news | GET | — | `/api/berita/jkt48` | Route tidak ada di sumber (404) |
| berita (Berita & News) | kompas news | GET | — | `/api/berita/kompas` | Terverifikasi |
| berita (Berita & News) | liputan6 | GET | — | `/api/berita/liputan6` | Terverifikasi |
| berita (Berita & News) | merdeka news | GET | — | `/api/berita/merdeka` | Terverifikasi |
| berita (Berita & News) | sindonews | GET | — | `/api/berita/sindonews` | Terverifikasi |
| berita (Berita & News) | suara news | GET | — | `/api/berita/suara` | Terverifikasi |
| berita (Berita & News) | tribunnews | GET | — | `/api/berita/tribunnews` | Terverifikasi |
| stalk (Stalker) | github | GET | user* | `/api/stalk/github` | Terverifikasi |
| stalk (Stalker) | instagram | GET | username* | `/api/stalk/instagram` | Sumber gagal saat uji (503/504) |
| stalk (Stalker) | pinterest | GET | q* | `/api/stalk/pinterest` | Terverifikasi |
| stalk (Stalker) | roblox | GET | user* | `/api/stalk/roblox` | Route tidak ada di sumber (404) |
| stalk (Stalker) | threads | GET | q* | `/api/stalk/threads` | Terverifikasi |
| stalk (Stalker) | tiktok | GET | username* | `/api/stalk/tiktok` | Sumber gagal saat uji (503/504) |
| stalk (Stalker) | twitter stalk | GET | user* | `/api/stalk/twitter` | Terverifikasi |
| stalk (Stalker) | youtube stalk | GET | username* | `/api/stalk/youtube` | Terverifikasi |
| tools (Tools) | country Info | GET | name* | `/api/tools/countryInfo` | Terverifikasi |
| tools (Tools) | kodepos | GET | form* | `/api/tools/kodepos` | Terverifikasi |
| tools (Tools) | Website Screenshot | GET | url*, device, theme, fullPage | `/api/tools/ssweb` | Sumber gagal saat uji (503/504) |
| tools (Tools) | subdomain finder | GET | domain* | `/api/tools/subdomains` | Terverifikasi |
| tools (Tools) | translate | GET | text*, source, target | `/api/tools/translate` | Terverifikasi |
| tools (Tools) | vcc generator | GET | type*, count | `/api/tools/vcc-generator` | Sumber gagal saat uji (503/504) |
| info (Info) | bmkg gempa | GET | — | `/api/info/bmkg` | Terverifikasi |
| info (Info) | cuaca | GET | q* | `/api/info/cuaca` | Terverifikasi |
| info (Info) | Indonesia Event | GET | — | `/api/info/event-indonesia` | Sumber gagal saat uji (503/504) |
| info (Info) | jadwalTV | GET | channel | `/api/info/jadwaltv` | Terverifikasi |
| m (Maker) | brat | GET | text*, isAnimated, delay | `/api/m/brat` | Terverifikasi |
| m (Maker) | ephoto360 | GET | url*, text1*, text2 | `/api/m/ephoto360` | Terverifikasi |
| m (Maker) | photooxy | GET | url*, text1*, text2 | `/api/m/photooxy` | Terverifikasi |
| m (Maker) | textpro | GET | url*, text1*, text2 | `/api/m/textpro` | Terverifikasi |
| sticker (Sticker) | combot sticker | GET | q*, page | `/api/sticker/combot-search` | Terverifikasi |

Total: **197** · Terverifikasi: **148** · Tidak dapat diverifikasi (masalah sumber): **49**

\* = parameter wajib.

> Catatan: 45 endpoint terakhir terimplementasi penuh di proyek ini (validasi + handler +
> terdokumentasi), tetapi node sumber siputzx mengembalikan `503 All nodes failed` / timeout
> selama jendela pengujian, sehingga tidak bisa diklaim terverifikasi. 4 endpoint lain
> (`s/spotify`, `berita/jkt48`, `berita/antara`, `stalk/roblox`) tercantum di OpenAPI spec
> tetapi route-nya tidak ada di server sumber (404).
