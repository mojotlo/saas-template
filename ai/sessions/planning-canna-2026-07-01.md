# Planning: canna — minimalist period tracker

**Date:** 2026-07-01
**Status:** In progress — roadmap agreed, first domain issue being specced

## Product

**canna** is a mobile-first, minimalist period tracker. This repo (cloned from the
Next.js SaaS starter, "meant to be cloned and customized") is being pivoted into it.
The prior SaaS-starter backlog (admin views, plan management, Stripe subscription
overview) is now obsolete and has been cleared from `to-do.md`.

### Product requirements (from the user)

- Data importable from Flo
- No subscription fee — one-time payment acceptable; no ads
- Accurate period predictions, including for **irregular** cycles
- Track flow (heavy / medium / light)
- Track symptoms (spotting, cramps, acne, ...)
- Track mood
- Free-form notes / comments
- Syncs to Apple Health
- Cloud backup — no risk of data loss
- Flo-like graphs: identify which symptoms occur at which cycle phase
- Track birth-control usage
- Optional: share data with a partner for visibility

## Key strategic decisions

### Platform sequencing (web beta → native later)

Apple Health (HealthKit) is **native-iOS-only** — a web app / PWA physically cannot
access it. Rather than commit to the app-store process for an unproven prototype, we
sequence:

1. **Beta (web, now):** mobile-first responsive Next.js app; cloud backup via the
   existing Postgres/Prisma. Data portability via our **own CSV/JSON export+import**
   (not Apple Health).
2. **Validate:** real cycles logged, predictions checked, retention observed.
3. **Native (React Native, if it graduates):** port the pure `src/domain/` layer
   untouched (the architecture invariants guarantee it has zero infra/UI deps), build
   native UI, and *then* add HealthKit sync + Flo import — the features that genuinely
   need native and weren't worth building for a throwaway prototype.

Consequence: **Apple Health sync and Flo import are both deferred to the native phase.**
Keeping domain logic pure during the web beta is what makes the native port cheap — and
it's already mandated by `ai/core/system-invariants.md`.

### Monetization

**v1 ships free.** No paywall. One-time Stripe payment (Checkout in `payment` mode, not
subscription) is a later, optional issue.

## Prediction subsystem — agreed model

A prediction needs a **mean (μ)** and a **standard deviation (σ)**, and they have
*separate* waterfalls (best-judgment defaults recorded while the user was away — reconfirm):

**μ waterfall (typical value):**
1. Personal — from logged cycles (needs ≥2 cycles = ≥3 periods for a mean)
2. Onboarding — self-reported typical period length + cycle length
3. Population — clinical defaults

**σ waterfall (variability → confidence ranges):**
1. Personal σ — needs more data than the mean (≥5–6 cycles to be trustworthy)
2. Population σ — borrowed whenever personal data is too thin

A user can be on **personal μ but population σ** — honest, and ranges tighten as they log more.

### Confidence ranges

- Model next-period-start as `Normal(μ, σ)`; central C% range = `μ ± z·σ`, rounded to whole days.
- **Bands: 70% (z≈1.04) + 95% (z≈1.96).** 99% rejected — ~±2.6σ produces near-useless
  ~3-week windows on fallback tiers.
- **σ floor ≈ 1.5 days** — overconfidence guardrail so identical logged cycles can't yield
  a dishonest "certain, ±0 days" range. Floor value tunable.
- Consider suppressing / de-emphasizing the wide band when on population σ (low confidence).

### Model choice

- **Hard tiered waterfall for v1** (explainable, trivially testable). Accepts a small
  visible "jump" when crossing a data threshold.
- Possible later upgrade: **Bayesian blending** (shrink personal toward population prior by
  N) for smoother transitions.

### Ovulation

- Anchor to the luteal phase (more stable than cycle length): `ovulation = predictedNextStart − 14`.
- Fertile window = `[ovulation − 5 days, ovulation + 1 day]`.
- **Mandatory "not for contraception / not medical advice" disclaimer** must accompany any
  ovulation/fertility output — a firm acceptance criterion, not optional.
- v1 assumes a fixed 14-day luteal length (deriving it needs BBT/LH data we won't collect yet).

### Population / clinical constants (TO BE VALIDATED against a cited source — needs an ADR)

Starting values, not yet sourced:
- Mean cycle length ≈ 28 days; population σ ≈ 4 days
- Mean period length ≈ 5 days; σ ≈ 1.5 days
- Luteal length ≈ 14 days

## Roadmap (phases)

| Phase | Epic | Notes |
|---|---|---|
| 0 | Data model (Cycle, Period, DailyLog, BirthControl) | Prisma schema |
| **1** | **Prediction subsystem (pure domain)** | 4-issue mini-epic — see below |
| 2 | Daily logging UI + persistence | flow, symptoms, mood, notes, birth control |
| 3 | Calendar + phase/symptom graphs | the "Flo-like" charts |
| 4 | CSV/JSON export + import (data portability / backup story) | web-era substitute for Apple Health |
| 5 | Onboarding questionnaire (feeds prediction tier 2) | UI + storage |
| — | **Native phase (post-beta): React Native, Apple Health sync, Flo import** | deferred |
| — | Partner sharing (optional) | multi-user access control |
| — | One-time payment (optional) | Stripe `payment` mode |

## Prediction subsystem — issue sequence (Phase 1)

All pure `src/domain/`, side-effect-free, TDD-friendly.

| # | Issue | Depends on |
|---|---|---|
| 1 | **Cycle statistics primitives** — cycle/period lengths, means, **SD**, irregularity, current cycle day | none |
| 2 | **Prediction basis resolver** (the waterfall) — history + onboarding + population → `{cycleMean, cycleSd, periodMean, source}` | #1 |
| 3 | **Period prediction + confidence intervals** — basis → predicted start/length + 70%/95% ranges, σ floor | #2 |
| 4 | **Ovulation + fertile window + intervals + disclaimer** | #3 |

**Issue #1 is the first `/spec` deliverable this session.**

## Open items to reconfirm with user

- The four prediction forks above were answered on best-judgment (user stepped away):
  hard waterfall / 70+95 bands / σ floor 1.5 / fixed-14 ovulation. Reconfirm.
- Population constants need a cited source + ADR before they ship in issue #2/#3.
- Whether the obsolete SaaS-starter admin backlog items should be deleted from the repo
  (routes/components), or just dropped from the to-do and left as dead code for now.
