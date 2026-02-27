# Migration Scan / Evaluation Plan

**Purpose:** Input template for AI-powered site migration tools. Extract design tokens, patterns, and conventions to generate a migration template that eases content and style migration.

---

## 1. Global CSS Variables (Design Tokens)

### 1.1 Colors
| Token | Source Value | Usage Context |
|-------|--------------|---------------|
| `--background-color` | white | Body, cards, modals |
| `--light-color` | #f8f8f8 | Sections, accordions, disabled states |
| `--dark-color` | #505050 | Borders, secondary text |
| `--text-color` | #131313 | Primary text |
| `--link-color` | #3b63fb | Links, buttons |
| `--link-hover-color` | #1d3ecf | Link/button hover |
| `--overlay-background-color` | lightgrey | Overlays |

**Scan instructions:** Extract all `--*-color` and hex/rgb values from `:root` and component CSS. Map to semantic names.

### 1.2 Typography
| Token | Mobile | Desktop (≥900px) |
|-------|--------|-------------------|
| `--body-font-size-m` | 22px | 18px |
| `--body-font-size-s` | 18px | 16px |
| `--body-font-size-xs` | 16px | 14px |
| `--heading-font-size-xxxl` | 64px | — |
| `--heading-font-size-xxl` | 48px | 45px |
| `--heading-font-size-xl` | 40px | 36px |
| `--heading-font-size-l` | 32px | 28px |
| `--heading-font-size-m` | 27px | 22px |
| `--heading-font-size-s` | 24px | 20px |
| `--heading-font-size-xs` | 22px | 18px |

**Scan instructions:** Extract all `--*-font-size*` and `font-size` declarations. Note responsive overrides.

### 1.3 Font Families
| Role | Font Stack | Used In |
|------|------------|---------|
| Body (default) | roboto, roboto-fallback, sans-serif | Body, forms |
| Headings (default) | roboto-condensed, roboto-condensed-fallback, sans-serif | h1–h6 |
| Brand/UI | Gotham, Arial, Helvetica, sans-serif | Header, footer, tabs, hero |
| Brand (book weight) | Gotham-book, Arial, Helvetica, sans-serif | Cards, stats |
| Body (alt) | "Open Sans", sans-serif | Hero, accordion, tabs content |
| Accent | Figtree, Gotham, Arial | Footer (some sections) |

**Scan instructions:** Extract all `font-family` declarations. Group by component/context. Note fallback chains.

### 1.4 Layout / Structure
| Token | Value | Usage |
|-------|-------|-------|
| `--nav-height` | 80px (mobile), 120px (≥1200px) | Header height |
| `--breadcrumbs-height` | 34px | Header with breadcrumbs |
| `--header-height` | var(--nav-height) or calc | Fixed header, modals |

**Scan instructions:** Extract `--*-height`, `--*-width`, `max-width` values.

---

## 2. Breakpoints (Media Queries)

| Breakpoint | Min Width | Typical Use |
|------------|-----------|-------------|
| xs | 426px | Large mobile |
| sm | 600px | Small tablet |
| md | 650px | Tablet (footer) |
| lg | 768px | Tablet |
| xl | 900px | Desktop |
| 2xl | 1024px | Large desktop |
| 3xl | 1200px | Wide desktop |

**Scan instructions:** Extract all `@media (width >= Npx)` and `@media (width > Npx)`. Normalize to a standard breakpoint scale.

---

## 3. Spacing Scale

### 3.1 Padding
| Value | Usage |
|-------|-------|
| 4px | List items, tight spacing |
| 8px | Small gaps |
| 12px | Form fields |
| 16px | Section padding (mobile) |
| 20px | Content padding |
| 24px | Section padding, gaps |
| 32px | Desktop section padding |
| 40px | Large sections, hero |
| 48px | Hero content |
| 54px | Footer margin |
| 60px | Border radius (hero content) |

**Scan instructions:** Extract all `padding`, `padding-*` values. Build spacing scale (e.g. 4, 8, 12, 16, 24, 32, 40, 48).

### 3.2 Margin
| Value | Usage |
|-------|-------|
| 0 | Reset |
| 4px | Tight |
| 8px | Small |
| 12px | Buttons |
| 16px | Gaps |
| 24px | Between sections |
| 40px | Main sections |

**Scan instructions:** Extract all `margin`, `margin-*` values.

### 3.3 Gap
| Value | Usage |
|-------|-------|
| 4px | Tight grids |
| 8px | Icon/text |
| 12px | Small gaps |
| 16px | Flex/grid gaps |
| 24px | Nav, cards |
| 29px | Footer grid |
| 32px | Desktop grids |

**Scan instructions:** Extract all `gap` values.

---

## 4. Border Radius

| Value | Usage |
|-------|-------|
| 0 | Sharp corners |
| 2px | Buttons (subtle) |
| 4px | Inputs, badges |
| 8px | Code blocks |
| 40px | Hero content (top) |
| 60px | Hero content (desktop) |
| 2.4em | Buttons (pill) |

**Scan instructions:** Extract all `border-radius` values. Map to semantic tokens (e.g. `--radius-sm`, `--radius-lg`).

---

## 5. Max-Width / Layout

| Value | Usage |
|-------|-------|
| 550px | Text content (narrow) |
| 600px | Content blocks |
| 670px | Hero heading |
| 785px | Hero content box |
| 1200px | Main content, sections |
| 1248px | Breadcrumbs |
| 1264px | Breadcrumbs (desktop) |

**Scan instructions:** Extract all `max-width` values. Identify content vs. layout widths.

---

## 6. Typography Patterns

### 6.1 Heading Hierarchy
- h1: `--heading-font-size-xxl`, Gotham/sans
- h2: `--heading-font-size-l` → `xl` (768px) → `xxl` (1200px), Gotham 700
- h3–h6: `--heading-font-size-*`
- Line-height: 1.01 (hero), 1.25 (headings), 1.5 (body), 1.6 (body default)

### 6.2 Letter Spacing
- 0.3px (h2)
- -1.8px (hero h1, tight)

**Scan instructions:** Extract `font-weight`, `line-height`, `letter-spacing` by element type.

---

## 7. Media / Images

### 7.1 Object Fit
- `cover`: Hero, cards, carousel, video
- `contain`: Footer icons

### 7.2 Aspect Ratios
- Hero: 3:2, 16:9, 21:9 (varies by block)
- Object-position: center, left center, 25% 40%

**Scan instructions:** Extract `object-fit`, `object-position`, `aspect-ratio`, `min-height` for media containers.

---

## 8. Component Patterns

### 8.1 Block Structure
- Container → Wrapper → Content
- `max-width: 1200px`, `margin: auto`, `padding: 0 24px` (mobile) / `0 32px` (desktop)

### 8.2 Section Metadata
- `.light`, `.highlight`: `background-color: var(--light-color)`, `padding: 40px 0`

### 8.3 Cards
- `background-color: var(--background-color)`
- Gotham-book for titles
- Open Sans for descriptions

**Scan instructions:** Map block names to shared patterns (container, padding, fonts).

---

## 9. Scan Output Format (for AI Tool)

Produce a JSON or structured output with:

```json
{
  "designTokens": {
    "colors": { "name": "value", "..." },
    "typography": { "fontSizes": {}, "fontFamilies": {} },
    "spacing": { "scale": [] },
    "breakpoints": []
  },
  "patterns": {
    "components": {},
    "layout": {}
  },
  "mapping": {
    "sourceSelector": "targetToken",
    "..."
  }
}
```

---

## 10. Scan Checklist

- [ ] Extract all CSS custom properties from `:root`
- [ ] Extract responsive overrides (media queries)
- [ ] List all font-family declarations by file
- [ ] List all breakpoints used
- [ ] Build spacing scale from padding/margin/gap
- [ ] Extract border-radius values
- [ ] Extract max-width values
- [ ] Map component → design token usage
- [ ] Identify hardcoded values to tokenize
- [ ] Document @font-face declarations and font files
