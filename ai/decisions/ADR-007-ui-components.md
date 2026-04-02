# ADR-007: UI Components — Radix UI + shadcn pattern + Tailwind v4

**Status:** Accepted
**Date:** 2026-03-30
**Revisit when:** shadcn releases official Tailwind v4 component library, or a packaged component library better fits the project

---

## Decision

Use the shadcn/ui pattern for UI components: unstyled, accessible primitives from Radix UI, styled with Tailwind v4 utility classes and composed using `class-variance-authority`. Components live in `src/components/ui/` and are owned by this project — not installed from a package.

Icons from `lucide-react`. Class name merging via `clsx` + `tailwind-merge` (exposed as `cn()` in `src/lib/utils.ts`).

---

## Why

- **Ownership** — components are copied into the project, not installed from a registry. They can be modified freely without fighting library internals or waiting for upstream fixes.
- **Accessibility** — Radix UI primitives handle keyboard navigation, ARIA attributes, and focus management correctly out of the box.
- **Tailwind-native** — styles are plain Tailwind utility classes; no CSS-in-JS runtime, no style conflicts.
- **Tailwind v4 compatibility** — shadcn's official CLI doesn't yet support Tailwind v4 fully, so components are hand-ported using v4's `@theme` directive and CSS variable approach rather than the v3 `theme.extend` config.

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Chakra UI** | Runtime CSS-in-JS adds bundle weight; less Tailwind-compatible |
| **MUI (Material UI)** | Opinionated Material Design aesthetics; hard to restyle |
| **Headless UI** | Good alternative to Radix, but smaller primitive set |
| **shadcn CLI** | Doesn't support Tailwind v4 at time of writing; components ported manually |

---

## Tailwind v4 notes

- Theme variables defined in `src/app/globals.css` using `@theme { }` — not in `tailwind.config.ts`
- PostCSS plugin: `@tailwindcss/postcss` (not the v3 `tailwindcss` plugin)
- Color tokens use CSS custom properties (`--background`, `--foreground`, etc.) on `:root` and `.dark`
- `tailwind.config.ts` exists but is minimal — only `darkMode: 'class'`

---

## Toast notifications — Sonner

**Added:** 2026-04-01

Toast notifications use [Sonner](https://sonner.emilkowal.dev/) (`sonner` v2.x, ~3kb). Sonner is the shadcn/ui recommended toast library.

**Why Sonner:**
- Standalone `toast()` function — no React context or hook required to trigger toasts
- Built-in variants: `toast.success()`, `toast.error()`, `toast()`, `toast.warning()`
- Supports CSS variable theming — maps directly to project theme tokens
- Accessible: manages focus, ARIA live regions, keyboard dismiss

**Integration:**
- `src/components/ui/sonner.tsx` — thin `<Toaster />` wrapper with project defaults
- Mounted once in `src/app/layout.tsx`
- CSS variable overrides in `src/app/globals.css` (`:root` and `.dark`)
