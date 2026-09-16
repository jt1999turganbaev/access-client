# Access Client (planshet / kiosk)

Planshet uchun **display/kiosk** ilovasi. Yuzni tanish terminalda, qaror backend'da,
bu ilova faqat natijani ko'rsatadi.

```
Terminal  → yuzni tanish
Backend   → access decision
Planshet  → shu natijani ko'rsatish   ← ushbu repo
Admin     → users / roles / rooms / tasks
```

## Ishga tushirish

```bash
npm install
npm run dev        # .env.dev — backend: BACKEND_PROXY_TARGET (Vite proxy orqali)
npm run build      # .env.prod
```

## Ekran

Portret kiosk: **1080×1920 (FHD)** va **768×1366 (HD)**. Ilova butun ekranni egallaydi, scroll yo'q.

Maket 1080px enga chizilgan: `html { font-size: min(100vw, 56.25vh) / 54 }` → 1080px da `1rem = 20px`,
768px da `1rem ≈ 14.2px`. Barcha o'lchamlar `rem` da, shuning uchun ikkala ekranda ham bir xil
ko'rinadi. Mantine komponentlari ham `rem` ishlatadi va birga masshtablanadi.

Task ko'p bo'lsa, task kartasi bo'sh joygacha o'sadi, keyin ichida scroll bo'ladi.

## Holatlar

| Route         | Ekran      | Izoh                                            |
| ------------- | ---------- | ----------------------------------------------- |
| `/`           | DEFAULT    | Doimiy holat, aloqa indikatori, ⚙ Sozlash       |
| `/processing` | PROCESSING | Event kelgach qisqa animatsiya (0.9s)           |
| `/success`    | SUCCESS    | User info + Task bloki                          |
| `/denied`     | DENIED     | User info + "Orqaga qaytish"                    |
| `/not-found`  | NOT FOUND  | Faqat status + "Orqaga qaytish", user card yo'q |
| `/error`      | XATO       | Kutilmagan xato; router'ning `errorElement` i ham shu |

Natija ekranlari 12s dan keyin avtomatik `/` ga qaytadi (`src/config/env.ts`).

Xona tanlanmagan bo'lsa, `RoomSetupModal` avtomatik ochiladi va yopilmaydi.
Tanlangan xona planshetning `localStorage` ida saqlanadi (`iacs:tablet-room`) — backend uni saqlamaydi.

## PWA (planshetga o'rnatish)

Ilova PWA: planshetga alohida dastur sifatida o'rnatiladi va offline'da ham ochiladi
(ekran qobig'i keshdan, ma'lumot esa backenddan keladi).

- `vite-plugin-pwa`, `registerType: 'autoUpdate'` — yangi versiya chiqsa planshet o'zi yangilaydi;
- `display: fullscreen`, `orientation: portrait` — brauzer paneli ko'rinmaydi;
- ikonkalar: `public/icons/` (192, 512, maskable 512, apple-touch 180);
- `/api/**` so'rovlari va SSE oqimi **hech qachon keshlanmaydi** (`NetworkOnly`).

**O'rnatish:** Chrome'da saytni ochib, menyudan "Install app" / "Add to Home screen".

> Brauzer o'rnatishga ruxsat berishi uchun sayt **HTTPS** orqali berilishi kerak
> (`localhost` bundan mustasno). HTTP bo'lsa, ilova ishlaydi, lekin o'rnatish taklifi chiqmaydi.

Tekshirish:

```bash
npm run build
npx vite preview --port 4173     # http://localhost:4173
```

## Backend (`/api/tablet`)

Hujjat: http://192.168.1.250:8000/docs/tablet

| Method | URL                                   | Ishlatilishi                                    |
| ------ | ------------------------------------- | ----------------------------------------------- |
| GET    | `/rooms/list`                         | Sozlash modalidagi xonalar ro'yxati             |
| GET    | `/rooms/{id}/latest`                  | Ishga tushganda oxirgi event id; yaqinda (12s ichida) bo'lsa ekranga tiklanadi |
| GET    | `/rooms/{id}/stream?after_event_id=&device=` | SSE, `event: access`                     |

Javobni UI modeliga o'girish — `toAccessEvent()` (`src/api/tablet.api.ts`):

| Backend                         | Ekran     |
| ------------------------------- | --------- |
| `user == null`                  | NOT FOUND |
| `user != null && granted`       | SUCCESS   |
| `user != null && !granted`      | DENIED    |

- F.I.O. ← `user.full_name`, rasm ← `user.photo` (nisbiy yo'l bo'lsa `VITE_BACKEND_ORIGIN` ga ulanadi)
- Xona ← tanlangan xona (`number (name)`)
- Terminal ← `direction`: `in` → Kirish, `out` → Chiqish
- Task ← `task.name` + `task.description`
- **Lavozim** backend'da yo'q — maydon bo'sh bo'lsa card'da ko'rsatilmaydi

### Qurilma identifikatori (`device`)

SSE oqimiga `?device=<identifier>` yuboriladi — dashboard planshet tirikligini va qaysi
xonani ko'rsatayotganini shu orqali biladi. Identifikator birinchi ishga tushganda
generatsiya qilinadi (`tablet-xxxxxxxx`) va `localStorage` da saqlanadi (`iacs:device-id`).

Hozircha UI'da ko'rsatilmaydi. Qo'lda o'zgartirish kerak bo'lsa — brauzer konsolidan:
`localStorage.setItem('iacs:device-id', 'kerakli-nom')` va sahifani yangilash.
Sozlash oynasidagi maydonni qaytarish uchun `room-setup-modal.tsx` dagi `TextInput` ni tiklash yetarli.

SSE (`src/features/tablet/hooks/use-access-events.ts`) ikki xil hodisani tinglaydi:

| Hodisa   | Ma'nosi                                                          |
| -------- | ---------------------------------------------------------------- |
| `access` | Identifikatsiya — ekran shu bo'yicha almashadi                   |
| `ping`   | Har ~15 soniyada keladigan tiriklik signali (data = oxirgi event id) |

- Ulanish uzilsa, o'zimiz qayta ulanamiz va `after_event_id` yuboramiz — hech bir event o'tkazib yuborilmaydi.
- Har bir `ping` aloqa borligini tasdiqlaydi. 45 soniya (3 ta ping) hech narsa kelmasa, ulanish
  jim uzilgan deb hisoblanadi va majburan qayta ochiladi.
- Ketma-ket ikki marta ulanib bo'lmasa — ekranda "Server bilan aloqa tiklanmoqda...".

### CORS

Backend `Access-Control-Allow-Origin` qaytarmaydi. Dev'da `/api` Vite proxy orqali ketadi.
Prod'da frontend backend bilan bitta domenda (nginx) turishi kerak, yoki backendda CORS yoqilib,
`VITE_API_URL` to'liq manzil bilan berilishi kerak.

## Env

| O'zgaruvchi            | dev                                   | prod                   |
| ---------------------- | ------------------------------------- | ---------------------- |
| `VITE_API_URL`         | `/api/tablet`                         | `/api/tablet`          |
| `VITE_BACKEND_ORIGIN`  | (bo'sh — rasmlar ham proxy orqali)    | (bo'sh — joriy origin) |
| `BACKEND_PROXY_TARGET` | backend manzili (faqat Vite proxy uchun) | —                   |

Dev proxy `/api`, `/media`, `/static` yo'llarini `BACKEND_PROXY_TARGET` ga uzatadi.

Mock ma'lumot va dev panel yo'q — ilova faqat haqiqiy backend bilan ishlaydi.

## Struktura

```
src/
  features/tablet/
    api/            tablet API (rooms, latest, stream)
    hooks/          use-access-events (SSE)
    tablet-context/ provider + context: holat mashinasi, xona, aloqa
    types/          backend va UI modellari
    ui/             ekranlar, info-card, xona modali, tablet-root
    utils/          backend javobini UI modeliga o'girish
  pages/            route komponentlari (idle, processing, success, denied, not-found, error)
  shared/
    config, constants, http, hooks, layouts, query-client, router, theme, types, ui, utils
public/             background.jpg, uzinfocom-logo.svg, tmbm-logo.png
```
