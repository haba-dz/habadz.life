# UI Redesign Spec — "هبة الجزائر" Institutional Redesign

Extracted from the Claude Design canvas artboards in
`~/Downloads/Institutional website redesign (4)/` (8 `.dc.html` artboards + `support.js` runtime).

**Branch:** `feat/ui-update`, cut from `main` at `4e8ad28`, verified in sync with `origin/main`
(0 ahead / 0 behind at extraction time).

This document is the build contract: tokens, primitives, per-screen specs, route mapping, and the
gap list against the current codebase. Artboards are the visual source of truth; this file is the
implementation source of truth.

---

## 0. Decisions and blockers — read before building

### 0.1 RESOLVED — the header carries the footer's disclaimer, not a state claim

The artboards open every page with a top band reading
`الجمهورية الجزائرية — منصة التضامن الوطني لمواجهة حرائق الشمال الشرقي`, while the footer on the
same page reads `مبادرة تضامنية مستقلة وغير ربحية. غير حكومية وغير تابعة لأي جهة رسمية.` — a direct
contradiction. **Decision: the artboard wording is wrong. The header states the same thing the
footer does.**

**Header band copy (replaces the republic line):**

> مبادرة تضامنية مستقلة وغير حكومية — تنسيق التضامن لمواجهة حرائق الشمال الشرقي

Short form for the 861–1199px band, where the band already tightens:

> مبادرة مستقلة غير حكومية — تنسيق التضامن

The independence clause (`مبادرة تضامنية مستقلة وغير حكومية`) is the load-bearing half. If the line
has to be cut further, cut the campaign half, never the disclaimer.

**Same defect, two more places — fix them together:**

| Location | Artboard says | Ship instead |
|---|---|---|
| Home hero eyebrow (desktop, §5.1) | `بلاغ رسمي — حملة حرائق الشمال الشرقي · نشط الآن` | `متابعة نشطة — حملة حرائق الشمال الشرقي · تُحدَّث الآن` |
| Home hero eyebrow (mobile, §5.2) | `بلاغ رسمي · حرائق الشمال الشرقي` | `متابعة نشطة · حرائق الشمال الشرقي` |

`بلاغ رسمي` ("official bulletin") reads as the platform issuing one. It stays **only** on the news
cards, where it labels a statement by a named source (الحماية المدنية، الدرك الوطني…) and links to
the original — there it is accurate. Same for the `/official-information` page title
`معلومات وإرشادات رسمية` and the `البيانات الرسمية` nav/footer links: those describe relayed
third-party information, which is what the page actually does. Leave them.

**What stays:** the green/white/red flag stripe and the deep-green institutional treatment. A
national flag on an independent solidarity initiative reads as solidarity, not authorship, once the
band states plainly that the platform is non-governmental. The whole visual system survives this
change — it is a copy fix, not a redesign.

### 0.2 All data in the artboards is mock

Counts (12 / 55 / 5 / 4), wilaya tallies, shelter names, phone numbers, the 6 press releases, and
the commune damage table are **demo content**. Do not hardcode. Every one maps to existing
Supabase-backed data or must be flagged as a missing data source (§8).

### 0.3 Nav consolidates routes that currently exist standalone

The design's primary nav is 5 items. The app currently ships 12 public routes. See §7.3 before
deleting or redirecting anything.

---

## 1. Design principles

The system is deliberately **flat, sharp, and hairline-ruled** — an institutional bulletin, not a
consumer app. Four rules carry nearly the whole look:

1. **Zero radius.** `border-radius` appears **0 times** across all 8 artboards. Every box, button,
   input, chip, avatar, and badge is a hard rectangle.
2. **Zero shadow.** `box-shadow` appears **0 times**. Depth is expressed only by background value
   and 1px borders.
3. **Hairline grid, not cards.** Groups of items are a bordered container with `gap: 1px` and a
   `#CFD6D1` background showing through as dividers. Items are opaque (`#fff` / `#F9FAF8`). This
   produces table-like rules with no per-item borders. It is the single most-used pattern.
4. **Colour is meaning, not decoration.** Green = platform / safe / act. Red = urgency, damage,
   emergency. Amber = warning / intermediate severity. Neutrals do everything else.

RTL Arabic is the primary direction (`dir="rtl"` on the page root, `text-align: right`).

---

## 2. Tokens

### 2.1 Colour

Hex is the source of truth from the artboards; OKLCH given because `src/app/globals.css` is
OKLCH-based. Values are exact conversions — use either, don't re-derive.

| Token | Hex | OKLCH | Use |
|---|---|---|---|
| `--forest-900` | `#083D28` | `oklch(0.3205 0.0655 161.33)` | Gov band, footer bg, all h1/h2 |
| `--green-700` | `#0B5D3B` | `oklch(0.4237 0.0928 159.05)` | **Primary**: buttons, links, icons, active nav |
| `--green-800` | `#08432B` | `oklch(0.3401 0.0716 160.29)` | Primary hover |
| `--green-400` | `#6FA88A` | `oklch(0.6834 0.0748 160.59)` | Border on dark green surfaces |
| `--green-300` | `#9CCDB4` | `oklch(0.8068 0.0623 162.42)` | Muted text on dark green |
| `--green-100` | `#CFE3D7` | `oklch(0.8976 0.0268 159.53)` | Body text on dark green |
| `--green-50` | `#DDEBE2` | `oklch(0.9271 0.0191 157.85)` | Gov band text |
| `--green-tint` | `#EEF5F1` | `oklch(0.9638 0.0091 161.35)` | Selected choice-card bg |
| `--red-600` | `#C8102E` | `oklch(0.5304 0.2074 22.32)` | **Danger**: "أحتاج مساعدة", severity high, emergency nums |
| `--red-700` | `#A30C25` | `oklch(0.4563 0.1777 21.94)` | Danger hover |
| `--red-500` | `#E23B3B` | `oklch(0.6055 0.2038 25.74)` | Alert status dot (mobile band) |
| `--red-200` | `#E3B9BF` | `oklch(0.8244 0.0490 8.55)` | Border on red tint |
| `--red-50` | `#FDF3F4` | `oklch(0.9722 0.0108 10.33)` | Red tint surface (selected / urgent tile) |
| `--red-muted` | `#8A5560` | `oklch(0.5123 0.0717 6.43)` | Sub-label on red tint (mobile) |
| `--amber-700` | `#9A7420` | `oklch(0.5821 0.1077 82.67)` | Warning, severity medium, "نقاط تجميع" |
| `--amber-900` | `#6B5214` | `oklch(0.4530 0.0833 85.42)` | Warning heading |
| `--amber-200` | `#E0C98A` | `oklch(0.8407 0.0850 90.26)` | Warning border |
| `--amber-50` | `#FDF8EC` | `oklch(0.9797 0.0167 88.00)` | Warning tint surface |
| `--ink` | `#15201B` | `oklch(0.2311 0.0184 165.14)` | Foreground, h3, strong body |
| `--ink-2` | `#3F4D46` | `oklch(0.4056 0.0213 163.69)` | Paragraph body, labels |
| `--muted-fg` | `#5B6B62` | `oklch(0.5116 0.0239 160.82)` | Meta, captions, table headers, inactive icons |
| `--border` | `#CFD6D1` | `oklch(0.8693 0.0102 155.07)` | **The** border + hairline-grid gap colour |
| `--border-subtle` | `#E4E8E5` | `oklch(0.9271 0.0059 153.77)` | Divider inside tinted blocks |
| `--border-dashed` | `#A9B8AF` | `oklch(0.7683 0.0209 159.60)` | "add another item" dashed affordance |
| `--icon-faint` | `#9AA8A0` | `oklch(0.7182 0.0195 160.91)` | Map-placeholder glyph |
| `--surface` | `#FFFFFF` | `oklch(1 0 0)` | Card / row / input |
| `--surface-2` | `#F9FAF8` | `oklch(0.9838 0.0028 128.49)` | Form step header, stat tile, inset panel |
| `--bg` | `#F4F5F2` | `oklch(0.9686 0.0041 121.56)` | Page background, table thead |
| `--map-placeholder` | `#EEF1EE` | `oklch(0.9550 0.0051 145.54)` | Map viewport before tiles load |

Not tokens (one-off, inline is fine): `#F0F2EF`, `#E7F0EA`, `#F9E5E8`, `#1E5A40`, `#E7EAE6`.

### 2.2 Typography

- **Display / headings:** `'Thmanyah Sans'` — already self-hosted at `public/fonts/thmanyahsans-*.woff2`
  and declared in `globals.css`. No new font loading needed.
- **Body / UI:** `'IBM Plex Sans Arabic'`, weights 400/500/600/700. The artboards pull it from
  Google Fonts. **Self-host it** instead (`next/font/local` or `next/font/google` with
  `display: swap`) — a relief site should not hard-depend on `fonts.gstatic.com` reachability.
  Current fallback in `globals.css` is Vazirmatn; IBM Plex Sans Arabic replaces it as the body face.
- Stack: `'IBM Plex Sans Arabic', system-ui, sans-serif`; headings prepend `'Thmanyah Sans'`.
- `-webkit-font-smoothing: antialiased` on `body`.

**Weights used: 400, 500, 600, 700 only.** No 300, no 900. Bold (700) is heavily used — 257
occurrences vs 252 at 600. This is a high-contrast, bold-leaning system.

**Type scale** (px, from the artboards — half-pixel sizes are intentional and used often):

| Role | Desktop | Mobile | Weight | Line-height |
|---|---|---|---|---|
| Page h1 | `clamp(26px, 4.8vw, 46px)` | 34px | 700 | 1.1 |
| Home hero h1 | `clamp(30px, 6.4vw, 64px)` | 34px | 700 | 1.1 |
| Hero lede | `clamp(18px, 2.2vw, 24px)` | — | 600 | 1.45 |
| Section h2 | `clamp(23px, 3.4vw, 36px)` | 21px | 700 | 1.15 |
| Panel h2 (on dark / split) | `clamp(22px, 3.2vw, 34px)` | — | 700 | 1.15 |
| Card h3 | 19px | 15.5px | 700 | 1.45 |
| Sub-card h3 | 22px / 17px | — | 700 | 1.45 |
| Big stat | `clamp(28px, 3.6vw, 40px)` | 30px / 26px | 700 | 1 |
| Emergency number | 30px | 26px | 700 | 1 |
| Intro paragraph | 16.5px | 14.5px | 400 | 1.7 |
| Body | 14.5px | 13.5px | 400 | 1.7 |
| Body compact / table cell | 14px | 14px | 400–600 | 1.5 |
| Nav link | 14.5px | 14.5px | 500 | — |
| Button | 15px / 14.5px / 14px | 15px | 600–700 | 1 |
| Label (form) | 13px | 13px | 600 | — |
| Meta / caption | 13px / 12.5px | 12px / 11.5px | 400–600 | 1.5 |
| Eyebrow (numbered) | 12px | — | 600 | 1 |
| Chip / badge | 13px / 12.5px / 11.5px | 11px | 600–700 | 1 |
| Tab-bar label | 11px | 10.5px | 600–700 | 1 |

`letter-spacing: .5px` on the numbered eyebrows only. Everything else is default.

### 2.3 Spacing

Gaps cluster tightly — this is a dense layout. Ranked by frequency:
`8px` › `10px` › `6px` › `12px` › `9px` › `5px` › **`1px`** › `14px` › `7px` › `18px` › `20px` › `28px` › `24px`.

The `1px` gaps are the hairline grid (§3.1) — not spacing.

- Section vertical rhythm (desktop): `clamp(30px, 4.8vw, 64px)` top padding per section.
- Page gutter (desktop): `clamp(16px, 2vw, 24px)`. Mobile: `16px`.
- Content max-widths: **1200px** default · **900px** form pages (Help, Donate) ·
  **1000px** Volunteers · **760px** intro paragraph · **560px** hero paragraph ·
  **430px** mobile artboard frame.
- Card padding: `clamp(20px, 2.2vw, 26px) clamp(16px, 2vw, 24px)` (article) ·
  `22px` (form step body) · `22px 18px` (action tile) · `16px` (mobile card).

### 2.4 Borders, radius, elevation

```css
--radius: 0;      /* everywhere, no exceptions */
--border-width: 1px;
/* box-shadow: never */
```

The current `globals.css` sets `--radius: 0.75rem` and derives `--radius-sm` … `--radius-4xl`
from it. Setting `--radius: 0` zeroes the whole derived chain in one edit — but audit admin
screens before doing it globally (§8.1).

Dashed border (`1px dashed #A9B8AF`) appears once: the "add another item" row on Donate.

### 2.5 Breakpoints

Only two, both `max-width` (mobile-last, matching the RTL/desktop-first artboards):

| Range | Behaviour |
|---|---|
| `≥ 1200px` | Full layout |
| `1199–861px` | Brand subtitle hidden · nav gap 18px / 13.5px · action buttons tighten to `9px 12px` / 13px |
| `≤ 860px` | Gov band hidden · nav hidden · burger shown · **bottom tab bar shown** · brand subtitle hidden · "لديّ مساعدات" header button hidden (tab bar covers it) · **all grid tables collapse to `1fr` with `row-gap: 6px`, `<thead>` hidden** · `text-align: left` cells flip to `right` · `body { padding-bottom: 74px }` |

In Tailwind v4 terms: `max-lg:` ≈ 1199px and a custom `max-[860px]:` variant. Prefer expressing
these as `md:`/`lg:` min-width utilities on the React side — but the **860px table-collapse and
the 74px tab-bar offset are hard requirements**, not approximations.

---

## 3. Primitives

These are the reusable pieces. Build them once in `src/components/ui/` (or `shared/`) before
touching pages.

### 3.1 Hairline grid — the core pattern

```html
<div style="display:grid;
            grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));
            gap:1px; background:#CFD6D1; border:1px solid #CFD6D1">
  <div style="background:#fff; padding:…">…</div>
  <div style="background:#fff; padding:…">…</div>
</div>
```

The container's background bleeds through the 1px gaps as dividers. Children **must** set an
opaque background. Used for: action tiles, news cards, region cards, stat tiles, emergency
numbers, choice-card groups, the two-up volunteer/medical split, the "how it works" steps.

Recurring `minmax` floors: `180px` (action tiles) · `195px` (emergency) · `215px` (regions, steps,
choice cards) · `240px` · `280px` (news, form fields, choice cards) · `330px` (hero, map split).
Always `min(Npx, 100%)` so it never overflows a narrow viewport.

### 3.2 Flag stripe

4px tall (3px on mobile), three equal `flex:1` bars: `#0B5D3B` / `#fff` / `#C8102E`. Sits directly
under the header and directly above the footer. On mobile the middle bar is `#F4F5F2`, not white.

### 3.3 Platform band (desktop only, hidden ≤860px)

`#083D28` bg, `#DDEBE2` text, 12.5px, 36px tall, `max-width:1200px` inner.
Right: **independence line** (600, `#fff`) — `مبادرة تضامنية مستقلة وغير حكومية — تنسيق التضامن لمواجهة حرائق الشمال الشرقي`,
per §0.1 — plus last-updated. Left: 8px red square + alert level · `FR`
language link · `الطوارئ: 14 · 1021`.
At 861–1199px swap to the short form `مبادرة مستقلة غير حكومية — تنسيق التضامن`; never truncate the
disclaimer away with `text-overflow`.

**Mobile equivalent** — status band, 11.5px, `7px 16px`: 7px `#E23B3B` square +
`حالة تأهب مرتفعة · تحديث 16:55`, and `عربي | FR`.

### 3.4 Header

76px tall desktop / 60px mobile, `#fff`, sticky on mobile (`top:0; z-index:20`).
- Brand: 46px (38px mobile) solid `#0B5D3B` square holding a white 22px stroke icon; wordmark
  `هبة الجزائر` at `clamp(20px,2.4vw,26px)`/700/`#083D28` in Thmanyah Sans; subtitle
  `منصة تنسيق التضامن والإغاثة` 12px `#5B6B62` (hidden < 1200px).
- Nav (28px gap, 14.5px, 500): الرئيسية · المستجدات والبيانات · المناطق المتضررة · خريطة المراكز · المتطوعون.
  Active = `#0B5D3B`; inactive = `#15201B`.
- Actions: `لديّ مساعدات` (green solid, gift icon) and `أحتاج مساعدة` (red solid, alert icon),
  `10px 18px`, 14px/600.
- Burger button 42px (40px mobile), `#fff` with `1px solid #CFD6D1`, shown ≤860px, opens an
  inline stacked menu (`13px 16px` rows, icon + label, 14.5px/600).

### 3.5 Footer

`#083D28` bg, `#CFE3D7` text, flag stripe on top.
4-column auto-fit (`minmax(min(190px,100%),1fr)`, gap `clamp(24px,3vw,40px)`):
brand block (40px white square + 24px white wordmark + 14px description, `max-width:360px`) then
**سبل المساعدة والتطوع** · **المتابعة والبيانات** · **المنصة**. Column headers 14px/700 `#fff`;
links 14px `#CFE3D7`, 9px gap.
Bottom bar: 12.5px `#9CCDB4`, copyright + `لا نجمع أموالاً · لا نطلب بيانات حساسة · الكود مفتوح`.
Mobile: single column, links in a 2-col grid at 13px.

### 3.6 Bottom tab bar (≤860px)

`position: sticky`, `#fff`, `grid-template-columns: repeat(5,1fr)`, icon over 10.5px/600 label.
الرئيسية · تقديم مساعدة · **طلب إغاثة** · الخريطة · القائمة.
The middle item is inverted: `#C8102E` bg, white text — the emergency action is always the
visual anchor. Active item = `#0B5D3B` + 700. Requires `body { padding-bottom: 74px }`.

### 3.7 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `#0B5D3B` bg, `#fff`, `1px solid #0B5D3B`, `14px 24px`, 15px/600 | Main CTA |
| Danger | `#C8102E` bg, `#fff`, `1px solid #C8102E` | "أحتاج مساعدة", submit relief request |
| Outline | `#fff` bg, `#0B5D3B` text, `1px solid #0B5D3B` | Secondary |
| Outline-neutral | `#fff` bg, `#15201B` text, `1px solid #CFD6D1` | Tertiary |
| On-dark solid | `#fff` bg, `#083D28` text | CTA inside a green panel |
| On-dark outline | transparent, `#fff` text, `1px solid #6FA88A` | Secondary inside a green panel |

Form submit buttons are **full width**, `15px 26px`, 15.5px/700, with a leading icon.
No radius, no shadow, no transform. Always `display: inline-flex` + `gap: 8–10px` for the icon.

### 3.8 Chips, badges, pills

- **Alert eyebrow** (hero): `1px solid #C8102E`, `#C8102E` text, `6px 12px`, 12.5px/600, leading
  8px solid red square or icon. Green variant swaps to `#0B5D3B`.
- **Numbered eyebrow** (sections): `01 — النشرة`, 12px/600 `#0B5D3B`, `letter-spacing:.5px`.
- **Wilaya chip**: selected = `#C8102E` bg + `#fff`; unselected = `#FDF3F4` bg, `#C8102E` text,
  `1px solid #E3B9BF`. `6px 12px`, 13px/600, leading `hugeicons:flash`.
- **Severity badge**: high `#C8102E` on `#FDF3F4` border `#C8102E` · medium `#9A7420` on `#FDF8EC`
  border `#9A7420` · low `#0B5D3B` on `#EEF5F1` border `#0B5D3B`. `4px 10px`, 12.5px/700.
- **Centre-type badge**: outline-only, `3px 9px`, 11.5px/700 — إيواء `#15201B` ·
  استقبال `#0B5D3B` · تجميع `#9A7420`.
- **Status dot**: 8px (7px mobile) solid square, never a circle.
- **"مفتوح" pill** (mobile): `1px solid #0B5D3B`, `#0B5D3B`, `3px 8px`, 11px/700.

### 3.9 Stat tile

Inside a hairline grid. `#F9FAF8` bg, `20px 18px`. Number at `clamp(28px,3.6vw,40px)`/700 in a
semantic colour (green = capacity, red = damage, ink = neutral), then a 13px `#3F4D46` row with a
16px `#5B6B62` icon. Optional footnote strip below the grid: `12px 18px`, 12.5px `#5B6B62`,
`#fff` bg.

### 3.10 Section header

```
[numbered eyebrow]        …………………………………… [trailing link ←]
[icon] [h2]
```
Eyebrow 12px/600 `#0B5D3B`; h2 with a leading `#0B5D3B` icon, `clamp(23px,3.4vw,36px)`, `#083D28`;
trailing link 14px/600 `#0B5D3B` ending in `←`. Sometimes a 14px `#5B6B62` caption replaces the
link. Mobile: no eyebrow, h2 drops to 21px, link becomes `الكل ←` at 13px.

### 3.11 Form field

```html
<label style="display:block;font-size:13px;font-weight:600;color:#3F4D46">…*</label>
<input  style="width:100%;padding:11px 14px;border:1px solid #CFD6D1;background:#fff;
               font-size:14.5px;color:#15201B">
```
Identical for `select` and `textarea`. Required marked with a trailing `*` in the label.
Phone inputs carry `dir="ltr"` with placeholder `0555xxxxxx`.

> **RTL note:** phone/number inputs need a *visual start* alignment inside an RTL form. Per the
> project's RTL rule, write `textAlign: "left"` unconditionally (RN) / rely on `dir="ltr"` (web) —
> do not write a locale-aware `right`.

### 3.12 Form step card

```
┌ #F9FAF8 header ─────────────────────────┐
│ [28px #0B5D3B square, white 700 numeral] │
│ Title 17px/700 #083D28                   │
│ Optional caption 12.5px #5B6B62          │
├ #fff body, padding 22px ─────────────────┤
```
Whole card is `1px solid #CFD6D1` on `#fff`. Help / Donate / Volunteers each use exactly 3 steps.

### 3.13 Choice card (radio / checkbox / multi-select)

`1px solid #CFD6D1`, `#fff`, `14px 16px`, icon + label. **Selected** flips the whole card:
`1px solid #0B5D3B` + `#EEF5F1` bg + `#0B5D3B` text at 700, icon recoloured. The danger variant
selects to `1px solid #C8102E` + `#FDF3F4` + `#C8102E`.
Compact variant (needs picker on Help): `12px 14px`, 14px, no sub-label.
Laid out in a hairline-free grid with real `12px` gaps (not the 1px pattern).

Native `checkbox`/`radio` inputs are 16×16 and appear inside `<label>` choice cards where
multi-select is explicit (safety equipment, consent).

### 3.14 Data table

Desktop: CSS grid, not `<table>`.
- Head: `#F4F5F2` bg, `12px 20px`, 12.5px/600 `#5B6B62`.
- Row: `15–16px 20–22px`, 14–14.5px, separated by the hairline pattern.
- Column templates in use: `2fr 1.2fr 1.2fr 1fr 1fr` (shelters) ·
  `1.4fr 1fr .9fr .8fr 1.8fr` (affected areas) · `1.9fr 1fr 1.1fr` (centres).
- Phone cell: `text-align:left` (LTR number) with a trailing call icon, 700.
- **≤860px:** collapses to a single column, `row-gap: 6px`, `padding: 16px`, head hidden, and the
  `text-align:left` cells flip back to `right`.

### 3.15 Notice block (red-framed)

`1px solid #C8102E` on `#fff`. Header bar `#C8102E` / `#fff` / `12px 24px` / 15px/700 with
`hugeicons:alert-diamond`. Body: auto-fit grid of 14.5px statements, each opening with a `<strong>`.
Footer strip: 13.5px `#3F4D46` + a GitHub source link. Mobile: 3 stacked rows separated by
`#E4E8E5` hairlines.

Content (verbatim, this is legally load-bearing):
- **لا تجمع المنصة أي أموال.** لا حسابات بنكية، لا تحويلات، لا وسيلة دفع مهما كانت. أي طلب مالي باسم المنصة هو احتيال.
- **ليست منصة لجمع التبرعات.** هدفها الأول والأخير تنظيم المساعدات العينية وتوجيهها إلى الولايات المتضررة.
- **لا تجمع أي معطيات شخصية** خارج الاسم ورقم الهاتف، وتُستخدم حصراً للتواصل الميداني لإيصال المساعدة.

### 3.16 Warning block (amber)

`1px solid #E0C98A` on `#FDF8EC`, `18px 20px`, `hugeicons:alert-circle` in `#9A7420`, heading
15px/700 `#6B5214`, body 14px `#3F4D46`. Used once — top of Volunteers, explaining why
uncoordinated turnout is harmful.

### 3.17 Emergency numbers block

Appears at the bottom of **every** page above the footer.
Header: `hugeicons:call-ringing-02` in `#C8102E` + `أرقام الطوارئ الوطنية (مجانية على مدار الساعة)`
15px/700, and `اتصل بها مباشرة، وليس بالمنصة` 13px `#5B6B62`.
Hairline grid, `minmax(min(195px,100%),1fr)`, `#fff` cells `18px 20px`: name 14px/600 + sub
12px `#5B6B62` on one side, number 30px/700 `#C8102E` on the other.

| Number | Name | Sub |
|---|---|---|
| 14 | الحماية المدنية | حرائق وإنقاذ |
| 1021 | الرقم الأخضر | الحماية المدنية |
| 1055 | الدرك الوطني | الطرقات |
| 17 | الشرطة | الأمن الوطني |
| 1548 | الرقم الأخضر | الأمن الوطني |

Cells must be `<a href="tel:…">` on mobile (the mobile artboard makes them links).

### 3.18 Search + filter bar

`1px solid #CFD6D1` on `#fff`, `18px 20px`. Search input sits in a bordered flex box with a
leading `hugeicons:search-01`; the `<input>` itself is `border:none`. Filters are chip rows
(selected = `#0B5D3B` bg + `#fff` + 700).

---

## 4. Icons

The artboards use **Hugeicons via `iconify-icon`** (254 occurrences), CDN-loaded. The repo
currently ships `lucide-react`.

**BUILT (step 1).** No runtime icon dependency at all — better than the `@iconify/react` plan this
section originally carried. `@iconify-json/hugeicons@1.2.33` is a **devDependency**;
`scripts/generate-icons.mjs` extracts only the icons listed below into
`src/components/icons/icon-data.ts` as static SVG markup, and `src/components/icons/index.tsx`
renders them. Nothing is fetched at runtime, no CDN is contacted, and the whole set costs
**12.8 KB gzipped**. Re-run the script after adding a name; it exits non-zero on an unknown icon
rather than emitting a blank one.

Version is pinned to `1.2.33` deliberately: `1.2.34` was published one day before the audit and sat
inside the cooldown window. `lucide-react` stays for the admin panel — do not attempt a
lucide↔hugeicons mapping for the public site (many of these have no lucide equivalent:
`package-process`, `shipping-truck-01`, `kitchen-utensils`, `baby-bottle`, `water-energy`).

**Two artboard names do not exist in hugeicons** and are substituted in the generator:

| Artboard | Ships as | Where |
|---|---|---|
| `dog` | `horse` | Help — `أدوية ومستلزمات بيطرية`; the surrounding copy is about المواشي, so livestock reads correctly |
| `footprint-01` | `walking` | Volunteers — `سأتواجد بمقر التجميع القريب مشياً` |

Icon sizing is consistent: **16px** inline/meta · **18–20px** in choice cards and buttons ·
**22px** brand mark · **26px** section headings. Always `flex: none`.

Full inventory (deduped, 60 icons):
`alert-02` `alert-circle` `alert-diamond` `alarm-clock` `baby-bottle` `bed` `building-03`
`building-06` `calendar-03` `calendar-check-in-01` `call-02` `call-ringing-02` `car-03` `car-04`
`cleaning-bucket` `clock-01` `cloud-fast-wind` `compass` `dashboard-square-02` `delete-02`
`delivery-truck-02` `dog` `filter` `fire` `flash` `footprint-01` `gift` `github` `grid-view`
`heart-check` `home-09` `house-01` `house-04` `kitchen-utensils` `layers-01` `layout-2-column`
`link-square-02` `location-01` `location-05` `maps` `maps-global-01` `maps-location-02`
`map-pinpoint-02` `medicine-02` `menu-01` `more-horizontal` `motorbike-02` `news` `noodles`
`package` `package-process` `plus-sign` `police-badge` `pulse-02` `radio` `refresh` `road-01`
`search-01` `sent` `shield-01` `shield-user` `shipping-truck-01` `stethoscope` `t-shirt` `tent`
`tree-06` `truck` `truck-delivery` `user-check-01` `user-group` `user-multiple` `water-energy`
`workflow-square-10`

---

## 5. Screen specs

### 5.1 Home — desktop (`Hebat Al-Jazair Official.dc.html` → `/`)

13 sections, in order:

1. **Gov band** (§3.3)
2. **Header** (§3.4) + flag stripe
3. **Hero** — `#fff`, two-column auto-fit `minmax(min(330px,100%),1fr)`, gap `clamp(22px,3vw,56px)`,
   padding `clamp(26px,4vw,56px)` top.
   - Left: red alert eyebrow `متابعة نشطة — حملة حرائق الشمال الشرقي · تُحدَّث الآن` (§0.1) → h1 `هبة الجزائر`
     at `clamp(30px,6.4vw,64px)` → lede `ننسّق التضامن، ونوصل المساعدة لمن يحتاجها.` →
     paragraph (`max-width:560px`) → two CTAs (`سجّل مساعدتك` primary, `مراكز الإيواء المفتوحة` outline).
   - Right: **field situation panel**, `1px solid #CFD6D1` on `#F9FAF8`. White header row
     (`لوحة الوضع الميداني` + `مصدر: الحماية المدنية · يُحدَّث كل ساعة`), then a hairline grid of
     4 stat tiles (§3.9) at `minmax(min(280px,100%),1fr)`, then the verification footnote.
   - Stats: `12` نقطة استقبال (green) · `55` بلدية متضررة (red) · `5` مراكز إيواء (ink) ·
     `4` ولايات (ink).
4. **Action tiles** — 6-up hairline grid, `minmax(min(180px,100%),1fr)`. First tile
   (`أحتاج مساعدة`) is `#FDF3F4` + red type; the other five are `#fff`. Each: icon + 11.5px/600
   category label, then 16px/700 title + 13px `#5B6B62` sub.
   `أحتاج مساعدة`(للمتضررين) · `لديّ مساعدات`(للمتبرعين) · `التطوع الميداني`(ميداني) ·
   `أستطيع النقل`(لوجستيك) · `إطار صحي أو بيطري`(صحة) · `أين أسلّم؟`(دليل)
5. **`01 — النشرة` آخر المستجدات الموثّقة** — 4 news `<article>`s in a hairline grid
   (`minmax(min(280px,100%),1fr)`). Each: source row (coloured source name + type + relative time,
   12px) → h3 19px/700 → 14.5px `#3F4D46` body → footer with source attribution and a
   `المصدر الأصلي` link. Trailing link `كل المستجدات ←`.
6. **`02 — الجغرافيا` المناطق المتضررة** — 4 wilaya cards, `minmax(min(215px,100%),1fr)`:
   name (18px/700 + pin icon) + note, and the hotspot count at `clamp(23px,3.4vw,36px)`/700
   `#C8102E`. Below: a bordered panel of commune chips, each `اسم (n)` with the count in red 700.
7. **`03 — الإيواء` مراكز الإيواء المفتوحة** — data table (§3.14), columns
   المركز / البلدية / ما يُستقبل / الحالة / الهاتف. Trailing link `عرض على الخريطة ←`.
8. **`04 — المتطوعون`** — two-up hairline split.
   - Left `#083D28`: eyebrow `#9CCDB4`, h2 `مستعدّ للنزول للميدان وتقديم يد العون؟`,
     body `#CFE3D7`, on-dark solid + on-dark outline CTAs.
   - Right `#fff`: `نداء للأطباء والكوادر الصحية والبياطرة`, three inline stats
     (38 طبيب · 11 بيطري · 3 فرق) at 28px/700 green, primary CTA.
9. **`05 — السكن` تضرّر منزلك؟ رقّمه معنا** — two-up hairline split, both `#fff`:
   damage declaration (red eyebrow, primary CTA → Help) and artisan volunteering
   (green eyebrow, outline CTA → Volunteers). Caption: `نوثّق الأضرار لتسهيل التكفّل ولا نُصدر أي تعويض`.
10. **`06 — المنهجية` كيف تعمل المنصة؟** — step cards in a hairline grid
    (`minmax(min(215px,100%),1fr)`), each with a huge `clamp(32px,4vw,44px)`/700 **`#CFD6D1`**
    numeral (the number is the same colour as the border — deliberately recessive), 17px/700 title,
    14px body. Followed by a transparency strip: `أين ذهبت المساعدات؟` + outline CTA `صفحة الشفافية`.
11. **Notice block** (§3.15)
12. **Emergency numbers** (§3.17)
13. **Footer** (§3.5), plus the hidden bottom tab bar that activates ≤860px.

### 5.2 Home — mobile (`Homepage Mobile.dc.html` → `/` at ≤860px)

Frame `max-width: 430px`, `border-inline: 1px solid #CFD6D1`. Not a separate route — the same page
under the ≤860px rules. Differences beyond the responsive rules:

- Status band replaces the platform band (§3.3) — it carries no affiliation claim, so it is
  unchanged from the artboard. The mobile footer still carries the full `غير تابعة لأي جهة رسمية` line.
- Hero eyebrow becomes `متابعة نشطة · حرائق الشمال الشرقي` (§0.1).
- Hero h1 is **`ننسّق التضامن، ونوصل المساعدة`** (not the brand name), 34px. CTAs stack full-width.
- **Situation strip:** 2-col hairline grid of 4 stats at 30px/700, each with a coloured value.
- **`كيف تريد المساعدة؟`** — the 6 action tiles in a **2-col** hairline grid, compacted to
  `16px 14px` with 15px/700 titles and 12px subs.
- **`المناطق المتضررة`** — horizontal scroll rail (`data-scroll`, `overflow-x:auto`,
  scrollbar hidden via `scrollbar-width:none` + `::-webkit-scrollbar{display:none}`), 1px gaps,
  each card `flex:none` with a 26px/700 red count.
- **Updates** — stacked single column, 15.5px h3, 13.5px body, no source-link footer.
- **Shelters** — stacked cards, each ending in a full-width bordered `tel:` button.
- **Notice** — 3 stacked rows.
- 74px spacer div before the sticky tab bar.

### 5.3 Official information (`OfficialInfo.dc.html` → `/official-information`)

- Hero: green eyebrow `تغطية حية موثّقة للمصادر الرسمية`, h1 `معلومات وإرشادات رسمية`, lede about
  source verification.
- **Stat row** — 4 tiles, value + label on one side, large icon on the other:
  `7` بلاغات حرائق نشطة (red) · `4` حالة الطرقات (ink) · `2` نشرات جوية خاصة (amber) ·
  `23` إجمالي البيانات الموثّقة (green).
- **Emergency strip** — inline bordered pills: `14` الحماية المدنية · `1021` الغابات ·
  `1055` الدرك الوطني · `1548` الشرطة.
- **Search + filters** (§3.18): search input + `تحديث المصادر الرسمية` outline button; then
  source chips (جميع المصادر / الحماية المدنية جيجل / الحماية المدنية الوطنية / الدرك الوطني /
  محافظة الغابات / الأمن الوطني / خلية الأزمة والأرصاد); then type filters as plain text tabs
  (الكل / حرائق وإخماد / حالة الطرقات / نشرات الطقس / إرشادات وإجلاء).
- **Feed** — 6 news articles in a hairline grid, same card as home §5.1(5).
- Emergency numbers + footer.

### 5.4 Affected areas (`AffectedAreas.dc.html` → `/affected-areas`)

- Hero: red eyebrow `جغرافيا الحملة — بيانات موثّقة`, h1 `المناطق المتضررة`, lede
  `55 بلدية مسجَّلة عبر 4 ولايات…`.
- **Wilaya summary** — 4 hairline cards: name + note, count at `clamp(23px,3.4vw,36px)`/700 red.
  بجاية 17 · جيجل 14 · سكيكدة 20 · ميلة 4.
- **Filter bar** — bordered panel, flex: wilaya `<select>` (flex 1) · damage-level `<select>`
  (flex 1) · commune search (flex 2) · result counter `عرض <strong>14</strong> من أصل 55 منطقة`.
- **Table** (§3.14) — `1.4fr 1fr .9fr .8fr 1.8fr`: البلدية / الولاية / مستوى الضرر (severity badge)
  / البؤر (red 700) / الوضع الميداني.
- **CTA panel** — `#083D28`, `1px solid #CFD6D1`, h2 `هل ترغب في المساهمة في إغاثة هذه المناطق؟`,
  on-dark solid `لديّ مساعدات` + on-dark outline `أستطيع النقل`.
- Emergency numbers + footer.

### 5.5 Centres map (`CentersMap.dc.html` → `/map`)

- Hero: green eyebrow, h1 `خريطة الميدان والإغاثة`.
- **Search bar** — search input + all-wilayas `<select>` (`flex:1 1 180px`), plus a
  `الولايات الأكثر تضرراً:` row of wilaya chips (18 جيجل selected).
- **Type counters** — 4 hairline tiles, each label+icon and a 26px/700 count:
  الكل `12` (ink, `#F9FAF8` = active) · مراكز إيواء `5` (ink) · مراكز استقبال `3` (green) ·
  نقاط تجميع `4` (amber).
- **Result bar** — `<strong>12</strong> نقطة ومركز متاح حالياً` + a 3-state segmented control
  (`عرض مدمج` active `#083D28`/white · `الخريطة` · `البطاقات`), bordered, no radius.
- **Split layout** — `minmax(min(330px,100%),1fr)`, gap **20px** (a real gap, not hairline):
  - Left: centre table (`1.9fr 1fr 1.1fr`) — name + type badge + accepted-goods caption /
    commune, wilaya / hours + `tel:` link.
  - Right: map panel. Header `الخريطة الميدانية` + `فتح بحجم كامل`. Below it a legend
    (10px squares: ink = إيواء, green = استقبال, amber = تجميع) and a `#F9FAF8` advisory
    `قبل التوجّه إلى أي مركز` + two CTAs.
- Emergency numbers + footer.

**BUILT.** Notes on where the implementation departs from, or goes past, the artboard:

- **Kind colours are the artboard's, not the old app's.** إيواء = ink, استقبال = green,
  تجميع = amber, replacing the `#7c3aed` / `#1d4ed8` / `#00843D` triple that was off-palette.
  One source of truth in `src/components/map/point-kind.ts`, which also carries the literal hex
  for the maplibre markers and popups — those are raw DOM strings that no Tailwind class or
  `[data-site]` variable can reach, so the values are duplicated there deliberately.
- **The table is one markup at both widths**: a stacked hairline list below 861px, the
  `1.9fr 1fr 1.1fr` grid above it. No second mobile component to keep in sync.
- **`فتح بحجم كامل` is a real full-viewport toggle** (`fixed inset-0`), not a link to a bigger
  page. Escape closes it and the body scroll lock is restored on unmount. maplibre v6 observes its
  container with a ResizeObserver, so the same map instance resizes with no remount and no refetch.
- **The advisory stays full-width below the split**, not inside the right column. It reads as a
  page-level instruction and it already lived in `page.tsx`.
- **The map degrades instead of taking the page down.** maplibre needs WebGL2; without it the
  constructor fires an error event, finishes with no painter, and the next `map.remove()` throws a
  TypeError that reached the route error boundary and blanked the entire page — list included,
  though the list needs no GPU. `relief-map.tsx` now probes for a `webgl2` context first and
  renders a panel-sized explanation, so old phones and blocklisted GPUs still get every centre,
  phone number and opening time.
- **Deviation from §3.11 for the two location selects.** `components/ui/{wilaya,commune}-select.tsx`
  are shared with `/admin`, so they were not restyled. `components/site/location-select.tsx` is a
  site-owned pair with the same props and the same option data, in the site's control metrics; all
  eight site call sites now use it. The admin dialog keeps the originals untouched.

### 5.6 Help / relief request (`Help.dc.html` → `/help`) — `max-width: 900px`

Red eyebrow, h1 `طلب مساعدة وإغاثة عاجلة`. Three step cards (§3.12):

**1 — بيانات الاتصال ومكان التواجد**
`الاسم واللقب *` · `رقم الهاتف *` (`dir=ltr`) · `الولاية *` (select: جيجل/بجاية/سكيكدة/ميلة) ·
`البلدية / القرية أو الحي *` (select, first option `غير محدد / كامل الولاية (اختياري)`) ·
`تحديد العنوان أو معالم الوصول (اختياري)`.

**2 — حجم الأسرة ووضعية السكن**
`عدد أفراد العائلة الإجمالي` · `منهم عدد الأطفال والرُضَّع` · then
`هل السكن صالح للإقامة حالياً أم تضرّر؟` as 3 choice cards:
`نعم، صالح للإقامة` · `أضرار جزئية` (danger-selected variant) · `لا، متضرر أو تم إخلاؤه`.

**3 — نوع المساعدات المطلوبة بإلحاح**
12 compact choice cards (`minmax(min(215px,100%),1fr)`): ماء · غذاء · ملابس · بطانيات ·
مستلزمات أطفال · أدوية / مستلزمات طبية · أدوية ومستلزمات بيطرية · مواد تنظيف · أدوات طبخ ·
مأوى · مواد بناء · أخرى. Then two checkbox rows (chronic illness / injured needing care) and
`ملاحظات وتفاصيل إضافية (اختياري)` textarea.

Then a privacy reassurance strip (`hugeicons:shield-01`, 13.5px) and a **full-width danger**
submit `إرسال طلب الإغاثة والمساعدة`.

### 5.7 Donate / offer aid (`Donate.dc.html` → `/donate`) — `max-width: 900px`

Green eyebrow `للمتبرعين — مساعدات عينية`, h1 **`ماذا لديك؟`**.

**1 — المواد والمساعدات المتوفرة لديك** (caption: running count of registered items)
Repeatable item block on `#F9FAF8` inset (`1px solid #CFD6D1`, `18px`) headed
`المادة رقم N` (13px/700 green + package icon), containing
`نوع المادة *` (select) · `الكمية التقديرية *` · `الوحدة *` (select: لتر/كلغ/وحدة/طرد) and a
notes input. Below: the **dashed** `إضافة مادة إضافية أخرى` row (§2.4).

**2 — الموقع وطريقة التسليم**
`الولايات الأكثر احتياجاً حالياً` wilaya chip row → `الولاية *` + `البلدية / الحي` selects →
`كيف سيتم إيصال هذه المساعدات؟` as 2 choice cards with sub-labels:
`أستطيع نقلها بنفسي لنقطة تجميع` (selected) · `أحتاج إلى وسيلة شحن / نقل`.

**3 — بيانات المتبرع أو الجهة المانحة**
`الاسم الكامل أو اسم الجمعية *` · `رقم الهاتف *` · notes textarea.

Full-width primary submit `تأكيد وتسجيل المساعدات`, then the no-money reassurance strip.

### 5.8 Volunteers (`Volunteers.dc.html` → `/volunteers`) — `max-width: 1000px`

Green eyebrow `سواعد الإغاثة`, h1 `التطوع والإغاثة الميدانية`.
Opens with the **amber warning block** (§3.16) explaining why uncoordinated turnout hurts.

**1 — بيانات المتطوع والموقع**
`الاسم واللقب *` · `رقم الهاتف *` · `رقم هاتف شخص قريب للطوارئ` · `البلدية *` (select) ·
`الولاية *` as a wilaya chip row.

**2 — مجالات المساعدة الميدانية** (multi-select, 8 choice cards, `minmax(min(280px,100%),1fr)`)
فرز وتغليف المساعدات · شحن وتفريغ الشاحنات · توزيع المساعدات على الأسر · تنظيف وإزالة الركام ·
إعداد وتحضير الوجبات · دليل محلي ومعرفة بالمسالك · إسعافات أولية ودعم ميداني · مساعدة عامة.

**3 — وسيلة التنقل والجاهزية**
- `وضع ووسيلة التنقل` — 4 choice cards: 4x4 · سيارة سياحية · دراجة نارية · مشياً.
- `أوقات التوفر والجاهزية` — 4 choice cards: متاح فوراً · عطلة نهاية الأسبوع · أيام محددة ·
  حسب النداء.
- `معدات السلامة المتوفرة` — 4 native checkbox cards: أحذية أمان · قفازات · أدوات حفر ومجارف ·
  حقيبة إسعاف.
- notes textarea + a consent checkbox
  (`أوافق على إتاحة رقم هاتفي لمنسقي الفرق الميدانية…`).

Full-width primary submit `تأكيد تسجيل التطوع الميداني`, then two cross-links
(`فتح خريطة المراكز`, `لديّ مساعدات عينية`).

---

## 6. Content inventory

Strings that must live in `src/i18n/messages/ar.ts` + `fr.ts` — the artboards are Arabic-only and
the design ships an `FR` switch with **no French artboard**. French copy is a deliverable, not a
freebie.

| Group | Where |
|---|---|
| Nav (5) + brand + subtitle + 2 header CTAs | §3.4 |
| Platform band (desktop) + status band (mobile) | §3.3 — use the §0.1 copy, not the artboard's |
| Footer: 4 column headers + 12 links + 2 legal lines | §3.5 |
| Tab bar (5 labels) | §3.6 |
| Notice block (3 statements + source line) | §3.15 |
| Emergency numbers (5 × name + sub) | §3.17 |
| 6 section eyebrows + headings + trailing links | §5.1 |
| 6 action tiles (category + title + sub) | §5.1(4) |
| Help: 3 step titles + 9 fields + 3 housing options + 12 need types + 2 checkboxes | §5.6 |
| Donate: 3 step titles + 8 fields + 2 delivery options + unit/type enums | §5.7 |
| Volunteers: warning block + 3 steps + 8 tasks + 4 transport + 4 availability + 4 equipment + consent | §5.8 |
| Filter/empty/search labels across map, areas, official info | §5.3–5.5 |

---

## 7. Mapping to the codebase

### 7.1 Artboard → route

| Artboard | Route | Existing? |
|---|---|---|
| `Hebat Al-Jazair Official.dc.html` | `/` | yes |
| `Homepage Mobile.dc.html` | `/` ≤860px | same route |
| `OfficialInfo.dc.html` | `/official-information` | yes |
| `AffectedAreas.dc.html` | `/affected-areas` | yes |
| `CentersMap.dc.html` | `/map` | yes |
| `Donate.dc.html` | `/donate` | yes |
| `Help.dc.html` | `/help` | yes |
| `Volunteers.dc.html` | `/volunteers` | yes |

Every artboard maps to a route that already exists. **No new routes required.**

### 7.2 Components to rewrite

| File | Change |
|---|---|
| `src/app/globals.css` | Add the §2.1 palette + IBM Plex Sans Arabic. **Do not set `--radius: 0` globally** — scope it to `(site)` per §8.1 |
| `src/components/layout/site-header.tsx` | Gov band, flag stripe, 5-item nav, 2 CTAs, burger |
| `src/components/layout/site-footer.tsx` | 4-column dark footer + flag stripe + bottom bar |
| `src/components/layout/mobile-bottom-nav.tsx` | 5-item tab bar, inverted red centre item |
| `src/components/layout/mobile-nav.tsx` | Inline stacked menu (not a sheet) |
**CORRECTED — nothing in `src/components/ui/` gets rewritten.** This table originally listed
`button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`, `badge.tsx`, `card.tsx` and `table.tsx`.
Every one of those is imported by `/admin`, so editing them contradicts §8.1. The site's versions
live in `src/components/site/` instead. `ui/` is left alone, and picks up the new palette and
radius 0 for free inside `[data-site]` because those are token overrides.

**BUILT (step 2) — `src/components/site/`:**

| Component | Spec | Note |
|---|---|---|
| `HairlineGrid` · `HairlineCell` · `HairlineRail` | §3.1 | `min` for auto-fit, `cols` for fixed. The rail draws dividers as borders on the cells, not a background through a gap — the grid trick leaks the divider colour into the empty track when cells do not fill the rail |
| `FlagStripe` | §3.2 | 3px mobile / 4px desktop, middle bar is page-bg on mobile |
| `Chip` · `StatusDot` | §3.8 | One `tone × fill × size` component covers all nine pill types |
| `Eyebrow` | §3.10 | Auto zero-pads the index; hidden on mobile by the caller |
| `StatTile` | §3.9 | `amber` tone uses `--color-haba-amber-bright`, valid only at ≥24px |
| `SectionHeader` | §3.10 | Eyebrow + icon heading + trailing link *or* caption |
| `Action` | §3.7 | 6 variants, 4 sizes. Renders `Link` or `button` from one prop |
| `Field` · `FieldInput` · `FieldPhoneInput` · `FieldSelect` · `FieldTextarea` · `FieldLabel` | §3.11 | `FieldPhoneInput` sets `dir="ltr"` + `text-left` — a genuine LTR run, written unconditionally |
| `FormStep` | §3.12 | Numbered header + body |
| `ChoiceCard` | §3.13 | Real `<label>` + `<input>`, selection via `:has(:checked)` — no client state. Fixes the div-based controls flagged in §8.5 |
| `NoticeBlock` | §3.15 | Statements stack behind hairlines on mobile |
| `WarningBlock` | §3.16 | |
| `EmergencyNumbers` | §3.17 | Cells are `tel:` links on every breakpoint, not just mobile |

Two supporting pieces: `focus.ts` exports `FOCUS_RING` (2px green outline at 2px offset — §8.5 noted
the artboards define no focus style at all), and `src/app/(site)/design-system/page.tsx` is a
dev-only living reference for all of the above. It calls `notFound()` in a production build, so it
has no production surface; delete it whenever it stops earning its place.

**BUILT (step 3) — chrome:**

| File | State |
|---|---|
| `src/components/site/platform-band.tsx` | **new** — `PlatformBand` (≥861px) + `StatusBand` (≤860px), §3.3 with the §0.1 copy |
| `src/components/layout/site-header.tsx` | rewritten — server component, builds the 5 nav items and the two bands |
| `src/components/layout/site-header-bar.tsx` | **new** client island — brand, nav, CTAs, burger, inline menu, flag stripe |
| `src/components/layout/mobile-menu-context.tsx` | **new** — shared open state; the header burger and the tab bar's `القائمة` drive the same panel, and it self-closes on navigation |
| `src/components/layout/site-footer.tsx` | rewritten — §3.5 four-column dark footer |
| `src/components/layout/mobile-bottom-nav.tsx` | rewritten — §3.6 flat 5-item bar, inverted red centre |
| `src/components/layout/mobile-nav.tsx` | **deleted** — the sheet drawer is replaced by the inline panel |
| `src/components/layout/language-switcher.tsx` | added a `band` variant (plain `عربي \| FR`); the default variant is untouched |
| `src/components/shared/news-ticker.tsx` | restyled square + `--color-haba-red`; behaviour unchanged |
| `src/app/globals.css` | `body:has([data-site]) { padding-bottom: 74px }` under 860px |
| `src/i18n/messages/ar.ts` · `fr.ts` | new `chrome` block; `fr.ts` is typechecked against `ar.ts`, so both are complete |
| `src/config/site.ts` | added `repoUrl` |

**Three judgement calls, all deliberate:**

- **`alertLevel` and `updatedAt` are optional props and are not currently passed.** The artboards
  hardcode `حالة تأهب: مرتفعة · تحديث 16:55`. Rendering a fabricated alert level or update time on a
  disaster platform is worse than rendering neither. Wire them when a real source exists (§8.2); the
  band already has the slots.
- **`EmergencyFab` was removed from the site layout** (the file is left in place). The tab bar's
  inverted red `طلب إغاثة` is the mobile emergency action, and the emergency-numbers block sits on
  every page — a third fixed element competing for the same corner is noise, and it collided with
  the new bar.
- **`NewsTicker` was kept.** It is not in the artboards, but it is an admin-controlled live
  announcement channel backed by the `announcements` table and it self-hides when empty. Removing a
  broadcast channel during a fire response is not a visual decision.

`WelcomeDialog` is untouched. It is a product decision rather than chrome, but it covers the page on
first visit and duplicates the homepage's own action tiles — worth revisiting in step 4.

**BUILT (step 4) — homepage + the cache fix:**

`src/app/(site)/page.tsx` rewritten to §5.1/§5.2: hero + field panel, 6 action tiles, and sections
01–06, then the notice and emergency blocks. Two components were added and one restyled:

| Component | Note |
|---|---|
| `src/components/site/update-card.tsx` | §5.1(5) news card, also intended for §5.3. Carries its own source→label/icon/tone map |
| `src/components/site/severity.ts` | See below |
| `src/components/shared/platform-notice.tsx` | Now renders through `NoticeBlock`; keeps the project's own (longer, more specific) wording, split into the design's bold-lead pattern. Its stale hardcoded `REPO_URL` is replaced by `siteConfig.repoUrl` |
| `src/lib/emergency.ts` | Added `emergencyNumberRows()` — derives the §3.17 rows from the verified contact list instead of the artboards' hardcoded five |

**The schema has no three-level severity.** `affected_severity` is
`ravaged | evacuated | threatened | burning | unconfirmed`, not the artboards' مرتفع/متوسط/منخفض.
`severity.ts` derives the badge tone, following the `severityEmoji` map already in
`lib/constants.ts` (🔴🟠🟡🔥⚪) so the colour keeps the meaning it already had in the product:
`ravaged`/`burning` → red, `evacuated`/`threatened` → amber, `unconfirmed` → neutral.

**There is no hotspot-count column either.** Each `affected_areas` row is one recorded spot, so the
wilaya and commune counts are row counts. That matches what the previous homepage did.

**Two bugs found while building this:**

- `HairlineGrid` leaked its divider colour as a solid grey slab across any track the items did not
  fill — visible on the emergency block, which has six rows in a five-column grid. Dividers are now
  drawn as `border-b`/`border-e` on the cells, with the container drawing only the top and start
  edges. Same root cause as the `HairlineRail` bug in step 2; both are fixed the same way.
- The hero's stat grid is `cols={2}`, not `min={280}`. The panel resolves to ~557px at a 1200px
  shell, four pixels short of two 280px auto-fit tracks, so all four tiles stacked. Fixed two-up is
  also what §5.2 specifies on mobile.

**BUILT (step 5) — read-only pages:**

| Route | What changed |
|---|---|
| `/official-information` | Page shell rewritten to §5.3. `official-info-client.tsx` keeps its filter, sync and stats logic **verbatim**; only the render was replaced — counters, §3.18 search + filter chips, and `UpdateCard` in place of `OfficialUpdateCard` |
| `/affected-areas` | Rewritten to §5.4. `areas-filters.tsx` rebuilt as two selects + a debounced commune search, still driven through `searchParams` so filtering stays on the server |
| `/map` | Page shell rewritten to §5.5 (hero, pre-visit advisory). `map-client.tsx` keeps all behaviour |

Two shared pieces came out of this: `src/components/site/page-shell.tsx` (`SHELL`, `SECTION`,
`PageHero`) and `src/components/shared/emergency-section.tsx`, which wraps §3.17 with its locale
plumbing so pages close with one line. The homepage was moved onto both. `StatTile` gained an
`iconPlacement="end"` variant for the §5.3 counters.

**The affected-areas table aggregates.** The artboard shows one row per commune with a hotspot
count; the table stores one row per recorded spot. Rows are grouped by commune, taking the worst
severity and the field note attached to it.

**`map-client.tsx` needed no colour work.** It uses only semantic tokens (`text-foreground`,
`bg-muted`, `text-algeria-green`, `bg-priority-critical`) — zero hardcoded Tailwind palette classes —
so the `[data-site]` overrides re-skinned it for free. What it did need was shape: 54 explicit
`rounded-*`/`shadow-*` classes across it and `point-card.tsx` were stripped, since those do not derive
from `--radius`. `animate-spin` keeps its `rounded-full`; a square spinner reads as broken.

**Still open on `/map`:** the results list is a card grid, where §5.5 specifies a
`1.9fr 1fr 1.1fr` table alongside the map panel, and the map legend and "full size" affordance are
not built. The behaviour is all there — this is a layout pass, not a functional one.

**`components/shared/official-update-card.tsx` is now unused by `/official-information`.** It still
holds a second copy of the authority labels that `update-card.tsx` carries. Retire it once nothing
imports it.

**BUILT (step 6) — the three forms:**

`/help`, `/donate` and `/volunteers`, per §5.6–§5.8. Every `useForm`, `register`,
`setValue`, `watch`, `useFieldArray` and server-action call is untouched — this was a
presentation pass, as §9 step 6 requires. Page shells use the narrower widths the design
specifies: 900px for Help and Donate, 1000px for Volunteers.

| Was | Now |
|---|---|
| `Card` + `CardContent` + a numbered `<span>` | `FormStep` |
| `Label` + `Input` + error `<p>` | `Field` / `FieldInput` / `FieldPhoneInput` |
| `<button>` option grids with `cn()` selected styling | `ChoiceCard` |
| Amber safety `Card` on /volunteers | `WarningBlock` |
| `Button` submit | `Action variant size="submit"` |
| lucide icon maps | hugeicons `IconName` maps |

**The option grids are now real form controls.** Every one of them was a `<button>` driving
`setValue`: not focusable as a group, not announced as a radio or checkbox, and invisible to
assistive tech as a selection. They are now `<label>` + `<input>` inside `<fieldset>`/`<legend>`,
with selection rendered from `:has(:checked)`. That closes §8.5's finding on the pages where it
mattered most.

**Donate and Volunteers were converted, not rewritten.** Their `useFieldArray` item blocks,
quantity steppers and render-prop `Select`s are intricate and submit real aid offers; they keep
their existing markup and inherit the palette and radius 0 through the tokens. What changed is the
scaffolding around them. Help was rewritten in full because its body is simple enough to verify.

### 7.3 RESOLVED (option a) — routes with no artboard

`/transparency` · `/transport` · `/needs` · `/artisans` · `/news` · `/medical`

The redesign folds several of these into other pages:
- `أستطيع النقل`, `إطار صحي أو بيطري`, and `أنا حرفي متطوع` all link to **Volunteers**, implying
  `/transport`, `/medical`, `/artisans` become role selections inside one volunteer form rather
  than separate pages.
- `المستجدات والبيانات` → `/official-information` carries the news feed, overlapping `/news`.
- The footer links `تقارير التوزيع` and the home CTA `صفحة الشفافية` → `/transparency`, which has
  **no artboard**.

**Taken: option (a) — restyled with the new primitives, every route still reachable.** Option (b),
consolidating them into `/volunteers` and `/official-information`, is an IA change that needs an
explicit decision; links to `/transport` and `/medical` have already been shared in the field, so
nothing was deleted or redirected. **The consolidation question is still open.**

Restyled in this step, nine routes in total — the six above plus three that had also been left
behind and are reachable from redesigned pages, so leaving them would have shown a visible seam:

| Route | What it became |
| --- | --- |
| `/transparency` | Designed from the system, since no artboard exists: hero, a hairline stat pair, and two hairline tables. Totals stay grouped by unit and are never summed across units. |
| `/needs` | Hero + a green veterinary call-out, square filter chips, restyled `NeedCard`s. |
| `/news`, `/news/[slug]` | Hero + a hairline list; the detail page is a 760px reading column. |
| `/transport`, `/artisans`, `/medical` | `PageHero` + `FormStep`s; option grids became `ChoiceCard`s. |
| `/medical` list | `SectionHeader` + `HairlineGrid` + `Chip`s. |
| `/help/damage-assessment` | `PageHero` + `FormStep`s; damage picker became real checkboxes. |
| `/official-information/[id]` | Hairline article, `Chip` authority badge, shared `EmergencySection`. |

Each of these carried an off-palette accent of its own — `/transport` blue, `/artisans` and
`/help/damage-assessment` orange, `/medical` emerald — all now the site green and red.

**Bugs found while restyling, all pre-existing:**
- **The damage-category picker on `/help/damage-assessment` did not work at all.** It was a
  `<label onClick={toggle}>` wrapping a checkbox with a no-op `onChange`. One user click fired
  `toggleDamage` twice — once directly, once when the browser forwarded the click to the input and
  it bubbled back — so the two toggles cancelled. Verified in the browser: clicking any option
  changed nothing, and the form was stuck on its `needs_roofing` default, meaning **every damage
  report ever filed through this page claimed roof damage and nothing else**. Now real checkboxes
  with `onChange` on the input; select and deselect both verified.
- `/news/[slug]` formatted dates with a hardcoded `ar-DZ` locale and an Arabic back-link, so French
  readers got Arabic. Same for `generateMetadata` on `/official-information/[id]`.
- The medical visibility options had **Arabic text in their French branches** — `isFr ? "نشر في
  الدليل العام" : …`. Real French now.
- The medical directory search icon was positioned with `right-3`, which put it over the text in
  LTR French. Logical `end-3.5` now.
- `/official-information/[id]` hardcoded its own four emergency numbers, a second copy of the
  verified contact list. It renders the shared `EmergencySection` instead.
- `components/shared/official-update-card.tsx` was dead — only its type was still imported. The
  type moved to `components/site/update-card.tsx` and the file is deleted.

**Not restyled, deliberately:** `category-icon`, `empty-state`, `priority-badge`, `severity-badge`,
`stat-card`, `status-badge` and `verification-badge` in `components/shared/` are imported by
`/admin`. Restyling them would change admin, which is out of scope, so the site renders its own
`Chip` at the call sites instead and those files are untouched. `ui/dialog.tsx` is the same story:
its `rounded-xl` is overridden per call site with `rounded-none`.

**Known seam:** `NeedsFilters` still renders lucide glyphs from the shared `categoryIcon` and
`priorityIcon` maps, while the rest of the site uses hugeicons. Those maps are admin-shared, so the
shapes were restyled and the glyph source left alone.

## 8. Gaps and risks

### 8.1 RESOLVED — admin is out of scope; scope the tokens to `(site)`

**`/admin` is not being redesigned. Do not touch it.** That makes the token change a scoping
problem, because `globals.css` derives `--radius-sm … --radius-4xl` from a single `--radius`, and
the shadcn components under `src/app/admin/` (18 route groups) read the same variables as the public
site.

Setting `--radius: 0` on `:root` would silently restyle the whole dashboard. Scope it instead —
override on the public shell only, leaving `:root` (and therefore admin) untouched:

```css
/* globals.css — :root keeps --radius: 0.75rem and its palette for /admin */

[data-site] {
  --radius: 0;
  /* §2.1 palette overrides live here too */
}
```

The anchor is the wrapper already returned by `src/app/(site)/layout.tsx:16`
(`<div className="flex min-h-screen flex-col">`) — add `data-site` there. **Not `<body>`**:
`src/app/layout.tsx:51` is the shared root layout, so `/admin` renders inside the same `<body>`.
The derived `--radius-*` chain recomputes inside the subtree because each is a `calc()` on `--radius`.

Two things that do **not** follow automatically from that scoping:

- **Page background.** `<body>` carries `bg-background text-foreground` from the root layout, resolved
  against `:root`. The site wrapper is `min-h-screen`, so it covers the viewport — but overscroll
  gutters and any area outside it still paint the admin background, not `#F4F5F2`. Either set the
  background explicitly on `[data-site]` and accept the seam, or move `bg-background` off `<body>`
  and onto each layout. Check on iOS Safari, where rubber-band overscroll makes this visible.
- **The body font will not swap via `--font-sans`.** `globals.css` declares fonts under
  `@theme inline`, so the `font-sans` utility compiles to the literal value
  (`'Thmanyah Sans', var(--font-vazirmatn), …`) rather than to `var(--font-sans)`. Redefining
  `--font-sans` inside `[data-site]` therefore does nothing. Set `font-family` directly on
  `[data-site]` and let it inherit, or point `--font-vazirmatn` at IBM Plex Sans Arabic within the
  scope — do not assume the theme token override took effect. Verify in devtools, not by reading CSS.

Dark mode: the artboards define no dark palette. `@custom-variant dark (&:is(.dark *))` is active in
this codebase — make sure the public shell never receives `.dark`, or the site renders with admin's
dark tokens and no design to match.

**Verification before merge:** open `/admin` and one public route side by side. Admin keeps rounded
corners, shadows, and its current palette; the public site is square. Any admin visual diff is a
scoping bug, not an accepted change. `git diff` touching anything under `src/app/admin/` or
`src/components/admin/` is out of scope by definition.

The same scoping applies to the palette and the font swap — everything in §2.1/§2.2 goes inside
`[data-site]`, never on bare `:root`.

### 8.1b FIXED — `getStatOverview` and 17 sibling reads called `cookies()` inside a cache

Not introduced by this work — `src/lib/data/public.ts:90` wraps `getStatOverview` in
`unstable_cache()`, and the callback calls `createClient()` (`src/lib/supabase/server.ts:9`), which
calls `cookies()`. Next.js 16 forbids dynamic data sources inside a cache scope:

> Route / used `cookies()` inside a function cached with `unstable_cache()`.

In `next dev` this replaces the whole homepage with the error overlay. In a production build the
throw is swallowed by the `try/catch` around it, which returns `emptyStatOverview` — so `next start`
answers 200 and **the homepage's field-situation counters silently render as zeros**. That matters
directly for §5.1, whose hero panel is four of those counters.

**Fixed in step 4.** `createPublicClient()` was added to `src/lib/supabase/server.ts` — a cookie-free
anonymous client — and all 18 cached reads in `public.ts` now use it.

It is also the safer shape. `unstable_cache` keys these reads globally, so caching the results of a
cookie-scoped RLS client meant whatever the first requester could see could be served to everyone
sharing that cache key. An anonymous client makes the RLS result deterministic and genuinely
shareable.

**Still open, and worse: `src/lib/data/admin.ts` has the same pattern in 12 places.** It is out of
scope here (admin is not being touched), and the fix there is not the same — admin data is meant to
be auth-scoped, so the answer is probably to stop caching those reads rather than to anonymise them.
Worth its own branch.

### 8.2 Data sources not proven to exist
The artboards assume, per screen: hotspot counts per wilaya and per commune · damage severity level
per commune · shelter "accepts" free-text · shelter open/closed status · per-centre opening hours ·
official-source attribution + original-source URL on every news item · a documented-statements
counter · road-status and weather-bulletin post types. Verify each against the Supabase schema
before building the UI that renders it; anything missing is a migration, not a CSS change.

### 8.3 Map is a placeholder
`CentersMap` ships a 300px `#EEF1EE` box with explanatory text. The repo has `src/components/map/`
— the real component must be dropped in, and its own styling reconciled with radius-0.

### 8.4 RESOLVED — French locale has no design
The `FR` switch is present on every artboard; no French artboard exists. Arabic is dense and
compact — French runs ~20–30% longer.

**Measured, 861–1199px, French.** The header row is `justify-between` with `shrink-0` on the brand
and the CTA group, so it overflows silently rather than wrapping: at 861px it needed **1064px against
789px of usable width**, pushing `J'ai besoin d'aide` 251px past the viewport edge. Arabic overflowed
the same row by 95px. Every rebuilt route was affected, because the header is shared; page bodies
were clean at 861px in both locales.

A second, separate break sat at **exactly 1200px**, where three things expand at once — the brand
subtitle appears, the nav switches to full labels, and the donate CTA returns — for 1246px of content
inside a 1152px container. Above ~1294px the overflow hid itself in the page margin, so it only
*looked* fine.

**Fixed, three ways:**
- `NavItem.labelCompact` — full labels ≥1200px, compact below (`Communiqués & données` →
  `Communiqués`, `Carte des centres` → `Carte`). Same two-span pattern the platform band already used.
- The secondary `J'ai des dons` CTA is `max-wide:hidden`, so it shows only ≥1200px. Below 861px the
  tab bar carries it; in the 861–1199 band the header genuinely has no room, and the red emergency
  CTA is the one that must survive. **`/donate` is therefore not in the header on tablets** — it is
  still in the footer, the homepage action tiles, and the mobile tab bar.
- French copy shortened where it was the binding constraint: `Communiqués & données` →
  `Communiqués`, brand subtitle `Plateforme de coordination de la solidarité` →
  `Coordination de la solidarité`.

Plus a structural guard so this cannot silently return: the brand link lost `shrink-0` and its
subtitle got `truncate`, so a future long string degrades instead of escaping the container.

Verified at 861 / 1000 / 1199 / 1200 / 1280 / 1440 in both locales: nothing clipped, nothing
escaping. French at 1200px has 33px of slack — tight, so re-measure before lengthening any header
string.

Remaining French debt: the orphan routes (§7.3) still hold untranslated Arabic — `/transport`,
`/artisans`, `/needs`, `/transparency`, `/medical`. That belongs to step 7, not this pass.

### 8.5 RESOLVED — Accessibility debts in the artboards
- **Colour-only status.** `StatusDot` is `aria-hidden` and documented as requiring an adjacent text
  label; every call site has one. `PointStatusBadge` pairs its dot with `getPointStatusLabel`.
- **`--amber-700` (`#9A7420`) fails WCAG AA.** Measured **4.29:1** on `#fff` and **4.05:1** on its own
  `#FDF8EC` tint. Fixed by darkening to `#856419` (5.48 / 5.17), `oklch(0.5235 0.0976 83.15)`.
  `#9A7420` survives as `--color-haba-amber-bright`, used only for ≥24px numerals.
- **Contrast verified by measurement, not by token arithmetic.** A rasterising audit (canvas
  readback — Chrome returns `oklab()` for these tokens, which no regex parser reads) walked every
  text-bearing element on all seven rebuilt routes in both locales, compositing translucent
  backgrounds up the ancestor chain. **One real failure:** the recessive `01–04` numerals on the
  how-it-works cards were drawn in `--color-haba-border` at **1.48:1**, against the 3:1 that ≥24px
  text needs. Added `--color-haba-numeral` — same hue, `oklch(0.66 0.0102 155.07)`, **3.10:1** — which
  keeps the numerals recessive. Everything else passes. Caveat: this audits the initial render only,
  so hover and transient states are unverified.
- **Choice cards must be real controls.** Done in step 6: `<label>` + `<input>` with `:has(:checked)`
  selection. The last two hold-outs, the volunteers equipment list and the phone-privacy consent row,
  were still shadcn `Checkbox` and were converted here.
- **Keyboard-open mobile forms.** Confirmed as a real defect at 390×430: **8 of 26 controls on /help
  and 13 of 33 on /volunteers landed under the fixed tab bar at the moment they received focus.**
  The browser scrolls a focused control only until it touches the viewport edge and knows nothing
  about the sticky header or the tab bar.
  `scroll-margin` does **not** fix this — it changes how far to scroll once the browser has decided
  to scroll at all, and a control sitting under the tab bar already counts as visible. The fix is
  `scroll-padding` on the scrollport (`html:has([data-site])`, so /admin is untouched), which shrinks
  the region that counts as visible: 108/88px on mobile, 130/24px on desktop.
  Two follow-ons were needed. `ChoiceCard`'s hidden input was `sr-only`, a 1px box the browser
  considered visible while the card itself was not — it now covers the card
  (`absolute inset-0 opacity-0`). And with `showControl` the focus target is the 16px control, so
  those get `scroll-mb-14` to clear the rest of the row. **Now 0 occluded on all three forms at both
  390×430 and 390×844.**
- **Focus-visible styling.** `FOCUS_RING` was defined in step 2 and is applied across the chrome and
  the primitives.

Found during this pass, beyond the artboard list:
- **No skip link.** Three sticky strips plus a five-item nav sat ahead of the content on every page.
  Added one as the first focusable element, targeting `<main id="main-content" tabIndex={-1}>`.
- **Form fields with no programmatic label.** `/donate` (5), `/volunteers` (6) and `/map` (2) used
  shared `Label` + `Input` as siblings with no `htmlFor`/`id`, so a screen reader announced them
  unlabelled — on the forms people file aid offers through. All wired; the two base-ui `Select`
  triggers use `aria-labelledby`. `/help` was already clean because it uses `Field`.
- **Heading level skip** `h1 → h3` on all three form pages: `FormStep` rendered an `h3` with no `h2`
  between it and the page title. Now `h2`, and the `<section>` is `aria-labelledby` its own heading
  so steps are announced as named regions.
- **Three unlabelled `<nav>` landmarks** in the footer, indistinguishable in a landmark list. Each is
  now `aria-label`led with its column title.
- **The news ticker announced every alert twice** — the scrolling copy and the `sr-only` static copy
  were both in the accessibility tree. The visual one is now `aria-hidden`.
- **`PointCard` was a `<div onClick>` opening a dialog** — no keyboard path, no role, on the centres
  list. The point name is now a real `<button aria-haspopup="dialog">`.
- **A dangling `hover:` class** in `point-card.tsx`, left when `hover:shadow-md` was stripped for the
  flat system. Swept the whole tree for the pattern; this was the only one.

Verified after the pass, all seven rebuilt routes × both locales: one `h1`, no heading skips, every
landmark named, no unlabelled control or field, no contrast failure. `/admin/login` still reports no
`[data-site]`, `scroll-padding: auto`, `--radius: .75rem` and its original font.

### 8.6 Open PR
PR #72 (`chore/ponytail-overengineering-cleanup` — removes unused UI primitives and dependencies)
is open against `main` and touches `src/components/ui/`. Merge or close it before the UI rewrite,
or expect conflicts in exactly the files §7.2 rewrites.

---

## 9. Suggested build order

1. **Tokens** — palette + `--radius: 0` + IBM Plex Sans Arabic self-hosted + Iconify/hugeicons wired,
   **all scoped to `[data-site]` (§8.1)**. Nothing visual yet. Gate: `/admin` renders pixel-identical
   to `main`.
2. **Primitives** — the 10 new components in §7.2, in isolation.
3. **Chrome** — header, gov band, flag stripe, footer, mobile menu, tab bar, and the ≤860px rules.
   This alone re-skins every page.
4. **Home** — desktop and mobile, the densest use of every primitive.
5. **Read-only pages** — Official info, Affected areas, Centres map (map component last).
6. **Forms** — Help, Donate, Volunteers. Wire to the existing Server Actions; do not
   re-architect submission as part of a visual pass.
7. **Orphan routes** (§7.3) — restyle or consolidate, per whatever was decided. **DONE** — option
   (a), restyled and kept reachable, nine routes. Consolidation is still an open decision.
8. **Passes** — French copy, a11y (§8.5), 861–1199px band, keyboard-open mobile forms. **DONE** —
   see §8.4 and §8.5, both now marked RESOLVED. Step 7 (orphan routes) is still open and still needs
   the IA decision in §7.3; the untranslated French on those routes belongs with it.
9. **Centres map + the two dialogs** — §5.5 in full (filters, counters, result bar, table, map
   panel, legend, full-screen), the first-visit `WelcomeDialog`, and the centre-detail dialog.
   **DONE.** Also fixed here, all pre-existing:
   - `WelcomeDialog` opened on the next animation frame, i.e. while React was still hydrating.
     Marking the page outside it `aria-hidden` mid-hydration is reported as an attribute mismatch on
     every container in `<main>`, on every route, on a first visit. It now opens on a 700ms timer.
   - The wilaya select's chevron was positioned against a `w-full` wrapper while the select itself
     was `sm:w-auto`, so the two came apart as soon as a wilaya was chosen and the commune select
     appeared. The site-owned select has no such split.
   - The `+`/`−` quantity steppers on `/donate` had no accessible name.

**Still open:** the §7.3 consolidation decision. `src/lib/data/admin.ts` still has the
`unstable_cache` + `cookies()` pattern in 12 places — a separate branch, since admin is out of
scope here.

Steps 1–3 are the real leverage. Do not start step 4 before step 3 is settled.
