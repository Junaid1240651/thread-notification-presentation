# URL Safety – Real-Time Threat Notification (Presentation)

A 5–8 slide presentation on the current real-time threat notification flow, its cons, and the improvement plan. Audience: developers. Content is to-the-point and scenario-complete; no code snippets.

## Content source

All content is derived from **URL_SAFETY_SYSTEM_IMPROVEMENT_PLAN.md** (repo root). The presentation summarizes the verified current flow, cons, high-level improvement plan, open source data sources, Google Safe Browsing / Web Risk API, pre-implementation plan, scenarios covered, metrics, and sources (GitHub and data source links).

## How to run

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Slides

1. **Current flow: Real-time threat notification** – User → Desktop (BrowserMonitor, pending queue) → backend batch-scan → agent analyze-urls → allowlist then full pipeline → verdict + cache → “Suspicious Site” for warning/danger.
2. **Cons of current flow** – Allowlist too small, LLM single point of failure, no threat intel, same notification for warning/danger, high latency, login-walled content, 1h TTL cache.
3. **Improvement plan (high level)** – Layer 1 allowlist, Layer 2 threat intel, Layer 3 smarter agent, Layer 4 tiered notifications.
4. **Open source data sources & APIs** – Phishing.Database, Ultimate Hosts Blacklist, URLhaus, PhishTank, Tranco; Google Safe Browsing API v4 (non-commercial) and Web Risk API (commercial option); sync strategy.
5. **Pre-implementation plan** – Phase 1–4 (allowlist → threat feed → notifications → caching/robustness).
6. **Scenarios covered** – Gmail/ChatGPT/Atlassian, known phishing, unknown legit/suspicious, LLM/feed down, new domain.
7. **Metrics** – Current vs target (false positive rate, latency, backend load).
8. **Sources & references** – Threat intelligence feeds (GitHub/data source links), allowlist sources, Google Safe Browsing/Web Risk docs, documentation and repos.

Navigation: Previous / Next and slide index (1–8). URL hash `#slide-N` deep-links to slide N.
