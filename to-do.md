# Feature To-Do — canna

Informal backlog for **canna**, a mobile-first minimalist period tracker.
Each item gets a proper `/spec` and GitHub issue before implementation.

**Status markers:** `[ ]` not started · `[🔄]` in progress (issue created) · `[x]` done (PR merged)
**Dependency format:** `*(needs: #N Title)*` or `*(needs: none)*`

Full roadmap, sequencing rationale, and the agreed prediction model live in
`ai/sessions/planning-canna-2026-07-01.md`.

---

## Phase 1 — Prediction subsystem (pure domain)

- [🔄] **Cycle statistics primitives** — cycle/period lengths, means, standard deviation, irregularity detection, current cycle day. *(needs: none)*
- [ ] **Prediction basis resolver (waterfall)** — history + onboarding + population → `{cycleMean, cycleSd, periodMean, source}`. *(needs: Cycle statistics primitives)*
- [ ] **Period prediction + confidence intervals** — basis → predicted start/length + 70%/95% ranges, σ floor. *(needs: Prediction basis resolver)*
- [ ] **Ovulation + fertile window + intervals + disclaimer** — anchored to fixed 14-day luteal; mandatory "not for contraception" disclaimer. *(needs: Period prediction)*

## Phase 0 / 2 — Data + logging

- [ ] **Data model** — Prisma schema for Cycle, Period, DailyLog, BirthControl. *(needs: none)*
- [ ] **Daily logging UI + persistence** — flow (heavy/med/light), symptoms (spotting, cramps, acne), mood, notes, birth-control usage. *(needs: Data model)*

## Phase 3 — Visualization

- [ ] **Calendar + phase/symptom graphs** — Flo-like charts correlating symptoms to cycle phase. *(needs: Daily logging)*

## Phase 4+ — Data portability & onboarding

- [ ] **CSV/JSON export + import** — data-portability / backup story for the web beta. *(needs: Data model)*
- [ ] **Onboarding questionnaire** — capture typical period length + cycle length (feeds prediction tier 2). *(needs: Data model)*

## Deferred to native phase (post-beta)

- [ ] **React Native app** — port the pure domain layer; native UI.
- [ ] **Apple Health (HealthKit) sync** — native-only; not possible from the web app.
- [ ] **Flo import** — parse Flo data export (format TBD).

## Optional / later

- [ ] **Partner sharing** — share cycle data with a partner for visibility (multi-user access control).
- [ ] **One-time payment** — Stripe Checkout in `payment` mode; no subscription, no ads.
