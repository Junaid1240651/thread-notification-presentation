import { useState, useEffect } from "react";

const SLIDE_COUNT = 10;

const ICON = {
  flow: "🔄",
  cons: "⚠️",
  plan: "🛡️",
  sources: "📁",
  phases: "📋",
  scenarios: "✅",
  metrics: "📊",
  links: "🔗",
  api: "☁️",
};

function useHashSlide() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#slide-(\d+)$/);
    if (match) {
      const i = parseInt(match[1], 10) - 1;
      if (i >= 0 && i < SLIDE_COUNT) setIndex(i);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#slide-(\d+)$/);
      if (match) {
        const i = parseInt(match[1], 10) - 1;
        if (i >= 0 && i < SLIDE_COUNT) setIndex(i);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const goTo = (i) => {
    const next = Math.max(0, Math.min(i, SLIDE_COUNT - 1));
    setIndex(next);
    window.location.hash = `slide-${next + 1}`;
  };

  return [index, goTo];
}

function CurrentFlowDiagram() {
  return (
    <div className="flow-diagram">
      <div className="flow-row">
        <span className="box">User</span>
        <span className="arrow">→</span>
        <span className="box">Desktop (BrowserMonitor)</span>
        <span className="arrow">→</span>
        <span className="box">Pending queue</span>
      </div>
      <div className="flow-row">
        <span className="box">Every 10s batch</span>
        <span className="arrow">→</span>
        <span className="box">Backend /url-safety/batch-scan</span>
        <span className="arrow">→</span>
        <span className="box">Agent /analyze-urls</span>
      </div>
      <div className="flow-row">
        <span className="box">Allowlist (.gov, .edu, TRUSTED_DOMAINS)</span>
        <span className="arrow">→</span>
        <span className="box">Full pipeline (WHOIS, DNS, LLM, SSL)</span>
        <span className="arrow">→</span>
        <span className="box">Verdict + cache 1h</span>
      </div>
      <div className="flow-row">
        <span className="box">Desktop</span>
        <span className="arrow">→</span>
        <span className="box">"Suspicious Site" for warning/danger (2 notification types)</span>
      </div>
    </div>
  );
}

function NewLayeredFlowDiagram() {
  return (
    <div className="flow-diagram">
      <div className="flow-row">
        <span className="box">Layer 1: Allowlist</span>
        <span className="arrow">→</span>
        <span className="box">Layer 2: Threat intel blocklist</span>
        <span className="arrow">→</span>
        <span className="box">Layer 3: Smarter agent</span>
        <span className="arrow">→</span>
        <span className="box">Layer 4: Tiered notifications</span>
      </div>
      <div className="flow-row flow-row-hint">
        (Built-in 500–1k + Tranco/Majestic 1M via sync) → (Phishing.DB, UHB, URLhaus, PhishTank) →
        (threat DB before LLM, tiered cache) → (2 notification types: suspicious / dangerous)
      </div>
    </div>
  );
}

const slides = [
  {
    title: "URL Safety – Real-Time Threat Notification",
    type: "title",
    content: (
      <div className="slide-title-only">
        <h1>URL Safety – Real-Time Threat Notification</h1>
        <p className="subtitle">Improvement Strategy</p>
        <p className="intro">
          Multi-layered approach: Current flow, cons, open-source threat intel,
          allowlists, Google Web Risk API, and pre-implementation plan.
        </p>
      </div>
    ),
  },
  {
    title: "Current system & cons (what we have today and what's wrong)",
    icon: ICON.flow,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-flow">
          <h3>Components & flow (current architecture)</h3>
          <div className="card-inner card-inner-flow">
            <h4>Desktop • Backend • Agent (who does what)</h4>
            <ul className="text-sm">
              <li><strong>Desktop:</strong> Browser Monitor (watches tabs), URL Filter, Heuristic (turned off), URL Safety Service (batches checks every 10s), Notification Helper (shows alerts).</li>
              <li><strong>Backend:</strong> URL Safety Controller/Service (receives requests), API Client that talks to the Agent.</li>
              <li><strong>Agent:</strong> Allowlist (.gov, .edu + env only), Risk Engine (WHOIS, DNS, SSL, content), Trust Detector (LLM), AI Phishing check, Cache 1 hour.</li>
              <li><strong>Threat intel:</strong> Not implemented yet — Safe Browsing, VirusTotal, PhishTank are placeholders only.</li>
              <li><strong>Domain age / typosquatting:</strong> Only in an old, deprecated path; not used in the main risk-engine path.</li>
            </ul>
          </div>
          <CurrentFlowDiagram />
        </div>
        <div className="card-section card-section-cons">
          <h3>{ICON.cons} Key cons (critical problems with current system)</h3>
          <ul className="slide-points">
            <li><strong>CON 1–2 (Critical):</strong> Our allowlist only has .gov and .edu (and a few from env). So when users visit Gmail, ChatGPT, or Atlassian we often wrongly flag them as suspicious. Also, we rely on one LLM call for “trust”; if it fails or is slow, we have no fallback.</li>
            <li><strong>CON 3 (High):</strong> We do not use any real threat lists. Phishing.Database (857k domains), Ultimate Hosts (1.39M), URLhaus (200k+) exist but we do not check them, so we miss most known-bad sites.</li>
            <li><strong>CON 4–6 (Medium):</strong> We show the same strong notification for both “caution” and “unsafe,” so users get tired and ignore all warnings. Response is slow (15–40 seconds). We do not use domain age, typosquatting, or homograph checks in the main path.</li>
            <li><strong>CON 7–8:</strong> We cache every result for 1 hour (even wrong “safe” verdicts). Google Safe Browsing is non-commercial only; Web Risk API costs $200 per 400k requests after the free tier.</li>
          </ul>
          <table className="storage-table mt-4">
            <thead><tr><th>Issue</th><th>Severity</th><th>Impact</th></tr></thead>
            <tbody>
              <tr><td>Insufficient Allowlist / LLM SPOF</td><td>🔴 Critical</td><td>False positives; trust erosion</td></tr>
              <tr><td>No threat intel</td><td>🔴 High</td><td>Misses 90% known threats</td></tr>
              <tr><td>Notification UX / Latency / Extraction / API</td><td>🟡 Medium</td><td>Fatigue; 30+ s; gaps; limits</td></tr>
              <tr><td>Inefficient caching</td><td>🟢 Low</td><td>False positives repeat 1h</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Industry research & improvement plan (how others do it and our layered approach)",
    icon: ICON.plan,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-plan">
          <h3>Four layers – how enterprise products do it (Norton, McAfee, Kaspersky)</h3>
          <ul className="slide-points text-sm">
            <li><strong>Layer 1 (fastest):</strong> Check if the URL is in our <em>allowlist</em> (1 million trusted sites from Tranco/Majestic) or in our <em>blocklist</em> (known-bad sites from daily threat feeds). If yes, we decide immediately: trusted = safe, known-bad = block. <strong>Result:</strong> Answer in under 5 milliseconds for about 95% of URLs.</li>
            <li><strong>Layer 2 (medium):</strong> If not in Layer 1, we ask <em>cloud reputation</em> services and <em>threat intel</em> (external APIs that know if a URL is malicious). <strong>Result:</strong> Answer in about 100–500 milliseconds.</li>
            <li><strong>Layer 3–4 (slower, for unclear cases):</strong> We do <em>deep content</em> checks (fetch the page, check WHOIS for domain registration info, check SSL certificate). Then we use <em>ML and heuristics</em> (rules + machine learning) only for URLs that are still borderline (not clearly safe or bad).</li>
          </ul>
          <h3 className="slide-subtitle">Principles (defense in depth, fail open, tiered response)</h3>
          <ul className="text-sm slide-points">
            <li><strong>Defense in depth:</strong> We never rely on one check; we use several independent checks.</li>
            <li><strong>Confidence-based:</strong> We turn risk into a score (0–100): 0–25 = SAFE, 25–50 = CAUTION, 50–75 = WARNING, 75–100 = DANGER. Actions and notifications match these bands (per plan §6.1).</li>
            <li><strong>Fail open:</strong> When we are unsure, we allow the URL and log it (we do not block everything unknown).</li>
            <li><strong>Tiered response:</strong> Different action per risk level: safe = no notification; caution = warning notification (system); danger = critical notification (system). We show only system notifications, no in-app banners.</li>
          </ul>
        </div>
        <div className="card-section card-section-plan">
          <h3>{ICON.plan} Our layered approach (allowlist → blocklist → heuristics → LLM)</h3>
          <NewLayeredFlowDiagram />
          <ul className="slide-points text-sm">
            <li><strong>Order we want:</strong> Check allowlist first (trusted sites), then blocklist (2.5M+ known-bad domains from threat feeds). Only use the LLM for URLs that are still unclear after that.</li>
            <li><strong>Cache:</strong> Keep results for different lengths by verdict: SAFE = 24 hours, CAUTION = 6 hours, WARNING = 10 minutes, DANGER = 1 hour (so a false “safe” does not stick for too long).</li>
            </ul>
          <table className="storage-table mt-4">
            <thead><tr><th>Metric (what we measure)</th><th>Current</th><th>New</th><th>Improvement</th></tr></thead>
            <tbody>
              <tr><td>False positive (safe sites wrongly flagged)</td><td>~15–20%</td><td>&lt;1%</td><td>15–20x better</td></tr>
              <tr><td>Latency for known-good or known-bad URLs (time until we show result)</td><td>15–30 s</td><td>&lt;10 ms</td><td>1500–3000x faster</td></tr>
              <tr><td>Backend load / LLM cost (how much work and money)</td><td>100%</td><td>~10% / ~5%</td><td>90% / 95% reduction</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Open-source feeds & integration (Tier 1 blocklist sources we must use)",
    icon: ICON.sources,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>Tier 1 (must integrate – known-bad lists we will use)</h3>
          <div className="feed-card">
            <ul className="feed-links text-sm">
              <li><strong>Phishing.Database</strong> — 857k domains (MIT license). <a href="https://github.com/Phishing-Database/Phishing.Database" target="_blank" rel="noopener noreferrer">GitHub</a> • <a href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt" target="_blank" rel="noopener noreferrer">domains (download)</a> • <a href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt" target="_blank" rel="noopener noreferrer">links (download)</a></li>
              <li><strong>Ultimate Hosts Blacklist</strong> — 1.39M domains. <a href="https://github.com/Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist" target="_blank" rel="noopener noreferrer">GitHub</a> • <a href="https://hosts.ubuntu101.co.za/domains.list" target="_blank" rel="noopener noreferrer">domains.list (download)</a></li>
              <li><strong>URLhaus</strong> — ~200k malware/phishing URLs. <a href="https://urlhaus.abuse.ch/" target="_blank" rel="noopener noreferrer">Project</a> • <a href="https://urlhaus.abuse.ch/downloads/text/" target="_blank" rel="noopener noreferrer">text</a> • <a href="https://urlhaus.abuse.ch/downloads/csv/" target="_blank" rel="noopener noreferrer">CSV</a></li>
              <li><strong>PhishTank</strong> — ~15k community-reported phishing URLs. <a href="https://www.phishtank.com/" target="_blank" rel="noopener noreferrer">Website</a> • <a href="https://data.phishtank.com/data/online-valid.csv" target="_blank" rel="noopener noreferrer">online-valid.csv (download)</a></li>
            </ul>
          </div>
          <h3 className="slide-subtitle">Tier 2 (optional blocklists) & Allowlist (trusted-domain sources)</h3>
          <div className="feed-card text-sm">
            <strong>Tier 2 (optional):</strong> <a href="https://github.com/sefinek/Sefinek-Blocklist-Collection" target="_blank" rel="noopener noreferrer">Sefinek</a> (6M+) • <a href="https://blocklist.sefinek.net/generated/v1" target="_blank" rel="noopener noreferrer">Download (generated/v1)</a>, <a href="https://github.com/hagezi/dns-blocklists" target="_blank" rel="noopener noreferrer">Hagezi</a>, <a href="https://github.com/jarelllama/Scam-Blocklist" target="_blank" rel="noopener noreferrer">Scam-Blocklist</a>. <strong>Allowlist (trusted domains):</strong> <a href="https://tranco-list.eu/" target="_blank" rel="noopener noreferrer">Tranco List</a> (1M), <a href="https://majestic.com/reports/majestic-million" target="_blank" rel="noopener noreferrer">Majestic Million</a> (1M).
          </div>
          <table className="storage-table">
            <caption className="text-sm mb-2">Rough size of each Tier 1 feed: number of domains, file size when downloaded, and approximate RAM if we load the full list in memory.</caption>
            <thead><tr><th>Feed</th><th>Domains</th><th>Size</th><th>RAM</th></tr></thead>
            <tbody>
              <tr><td>Phishing.Database</td><td>857k</td><td>~15 MB</td><td>~30 MB</td></tr>
              <tr><td>Ultimate Hosts</td><td>1.39M</td><td>~25 MB</td><td>~50 MB</td></tr>
              <tr><td>URLhaus</td><td>200k</td><td>~5 MB</td><td>~10 MB</td></tr>
              <tr><td>PhishTank</td><td>15k</td><td>~500 KB</td><td>~1 MB</td></tr>
              <tr><td><strong>Total (merged/deduped)</strong></td><td><strong>~2.5M unique</strong></td><td><strong>~40 MB</strong></td><td><strong>~80 MB</strong></td></tr>
            </tbody>
          </table>
          <div className="card-inner text-sm">
            <strong>How we keep the blocklist up to date:</strong> Every day at 02:00 UTC we download all Tier 1 threat feeds, merge them and remove duplicates, then remove any domain that is on our allowlist (so we do not block trusted sites). We write the result to a blocklist file; the agent loads it on startup or reload. We sync the allowlist (Tranco/Majestic) weekly.
            <div className="mt-2 p-2" style={{ background: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffc107)', borderRadius: '6px', color: 'black' }}>
              <strong>⚠️ Before downloading:</strong> Visit the official Git repos (or project sites), review all data and documentation there, then download and use it. Do not download directly from source links without review.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Whitelist & blacklist updates (how and when we sync trusted vs threat data)",
    icon: ICON.sources,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>How to update blacklist & whitelist (sync strategy)</h3>
          <div className="card-inner">
            <h4>Blacklist (known-bad domains – threat feeds)</h4>
            <ul className="slide-points text-sm">
              <li><strong>When and where:</strong> A scheduled job (e.g. 02:00 UTC) runs on the agent host or a separate worker. It downloads all Tier 1 threat feeds, merges and dedupes them, removes any domain that is on our allowlist, then writes a single blocklist file. The agent loads this file at startup or when it changes (e.g. SIGHUP or file watch), so we can avoid a full restart if we add hot-reload.</li>
              <li><strong>Who holds the list:</strong> The blocklist lives in the agent only. The backend does not store it; it just forwards URLs to the agent. The agent does the “is this URL in the blocklist?” check.</li>
              <li><strong>Respect sources:</strong> We do not download feeds every hour; we sync once per day so we do not overload the maintainers or hit rate limits.</li>
              <li><strong>⚠️ Before downloading:</strong> Visit the official Git repos (or project sites), review all data and documentation there, then download and use it. Do not download data directly from source links without review.</li>
            </ul>
          </div>
          <div className="card-inner">
            <h4>Whitelist (known-good domains – Tranco/Majestic 1M)</h4>
            <ul className="slide-points text-sm">
              <li><strong>Built-in 500–1000 domains:</strong> A small list shipped with the app (no download, works offline). We update it with app releases. It covers Gmail, ChatGPT, Atlassian, and similar big sites so they are never wrongly flagged.</li>
              <li><strong>Tranco List / Majestic Million:</strong> Each list has 1 million trusted domains. We sync them weekly to build the full allowlist. We can also use user feedback and a quarterly review to keep the list accurate.</li>
            </ul>
          </div>
          <h3 className="slide-subtitle">Research: our source data updates daily or frequently (why we sync at least daily)</h3>
          <div className="feed-card">
            <p className="text-sm mb-2">
              <strong>Why we sync at least daily:</strong> The lists we use (threat feeds and allowlists) are updated by their maintainers every day or more often. If we do not sync at least once per day, we miss new bad sites and new trusted sites.
            </p>
            <ul className="feed-links text-sm">
              <li>
                <strong>Ultimate Hosts Blacklist (UHB):</strong> The maintainers update the list <strong>daily</strong>. The central repo (GitHub) is updated around 19:05–19:15 UTC; the official mirror (where we download from) is ready around 19:30 UTC. The list has about 1.39M bad domains and ~149k bad IPs. Source:{" "}
                <a
                  href="https://github.com/Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UHB GitHub
                </a>
                . Mirror (download):{" "}
                <a
                  href="https://hosts.ubuntu101.co.za/domains.list"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  domains.list
                </a>
                ,{" "}
                <a
                  href="https://hosts.ubuntu101.co.za/ips.list"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ips.list
                </a>
                .
              </li>
              <li>
                <strong>Phishing.Database, URLhaus, PhishTank:</strong> These are also updated daily or hourly by their maintainers. We run one sync per day (e.g. 02:00 UTC, after UHB is ready) so we stay current without overloading the sources with too many requests.
              </li>
            </ul>
          </div>
          <div className="card-inner text-sm mt-2">
            <strong>Takeaway:</strong> Run one daily sync after the upstream lists are updated (e.g. after 19:30 UTC for UHB). In that run: download all feeds, merge and dedupe, remove any domain that is on our allowlist, then write the blocklist file and have the agent load it (restart or reload). That way we stay current without hammering the sources.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Recommended flow, Google APIs & phases (7-step order and Phase 1–4 rollout)",
    icon: ICON.api,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-plan">
          <h3>7-step recommended flow (order of checks: allowlist → blocklist → heuristics → optional API → score → LLM → cache)</h3>
          <ol className="slide-points text-sm">
            <li><strong>Allowlist:</strong> If the URL’s domain is in our trusted list (built-in + Tranco/Majestic 1M), return SAFE immediately. No LLM, no slow checks.</li>
            <li><strong>Blocklist:</strong> If the URL or domain is in our local threat list (from daily feeds), return DANGER immediately and show a dangerous-site notification.</li>
            <li><strong>Heuristics:</strong> Run fast rules (e.g. domain age, typosquatting) and compute a risk score 0–100. If score ≥ 75, return DANGER. If ≥ 50, WARNING. If ≥ 25, CAUTION. Otherwise continue to next step.</li>
            <li><strong>(Optional) Web Risk API:</strong> For URLs still unclear, we can call Google’s Web Risk API (paid). If it says bad, we block. If it fails or says nothing, we continue (fail open).</li>
            <li><strong>URL features + content:</strong> Fetch the page and combine signals (WHOIS, DNS, SSL, content) into one aggregate risk score.</li>
            <li><strong>LLM only for borderline:</strong> Call the LLM only when the aggregate score is in the middle (e.g. 40–60). For clearly safe or clearly bad we do not use the LLM.</li>
            <li><strong>Tiered cache:</strong> Store the result with different expiry: SAFE = 24 h, CAUTION = 6 h, WARNING = 10 min, DANGER = 1 h. So wrong “safe” verdicts do not last too long.</li>
          </ol>
          <div className="card-inner text-sm mt-2">
            <strong>Where this runs:</strong> The blocklist check is a new step in the agent, right after the allowlist. A daily sync job downloads feeds and writes the blocklist file; the agent loads it on startup or when the file changes.
          </div>
        </div>
        <div className="card-section card-section-sources">
          <h3>Google Safe Browsing & Web Risk API (commercial vs non-commercial options)</h3>
          <div className="card-inner">
            <h4>Safe Browsing API v4 (non-commercial use only – not for our product)</h4>
            <div className="text-sm">
              Non-commercial use only (since 2019). Not viable for commercial
              products. Terms:{" "}
              <a
                href="https://developers.google.com/safe-browsing/v4/usage-limits"
                target="_blank"
                rel="noopener noreferrer"
              >
                usage limits
              </a>
              .
            </div>
          </div>
          <div className="card-inner">
            <h4>Web Risk API (commercial – pricing and our estimated cost)</h4>
            <div className="text-sm">
              Same URL reputation (phishing, malware, unwanted software, social
              engineering). <strong>Pricing:</strong> Free first 100k requests/month; then $200 per 400k requests ($0.50 per 1k).{" "}
              <a
                href="https://cloud.google.com/web-risk"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
              .
            </div>
            <div className="text-sm mt-2 card-inner" style={{ background: 'var(--card-bg, #f8f9fa)', padding: '0.75rem', borderRadius: '6px', color:'red', fontWeight: 'bold' }}>
              <strong>Estimated cost for us (initial):</strong> Assume 1,500 users, each visiting at least 500 URLs per day → 1,500 × 500 = <strong>750,000 requests/day</strong> → ~22.5M requests/month (×30). First 100k free; 22.5M − 100k ≈ 22.4M paid. 22.4M ÷ 400k × $200 = <strong>~$11,200/month</strong>. The total cost we need to bear is very cheap initially. As we add allowlist/blocklist, most URLs never hit the API, so actual cost will be lower.
            </div>
          </div>
        </div>
        <div className="card-section card-section-plan">
          <h3>{ICON.phases} Pre-implementation phases (Phase 1 → 2 → 3 → 4)</h3>
          <div className="card-inner card-inner-plan">
            <h4>Phase 1 – Allowlist expansion (built-in + Tranco/Majestic 1M)</h4>
            <div className="text-sm">
              We add a built-in list of 500–1000 trusted domains (no download, works offline) and sync Tranco/Majestic 1M domains weekly for the full allowlist. We match both the main domain (apex) and subdomains (e.g. mail.google.com if google.com is trusted). Optionally the desktop can cache “safe” so repeat visits do not hit the backend. <strong>Success looks like:</strong> Gmail, ChatGPT, and Atlassian never show a warning.
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>Phase 2 – Threat feed integration (blocklist before LLM, known-bad in &lt;10 ms)</h4>
            <div className="text-sm">
              We build a pipeline that downloads Tier 1 threat feeds daily and keeps a local list (in-memory or on disk). The agent checks this blocklist right after the allowlist and before calling the LLM. Any URL that is known-bad gets a DANGER result in under 10 milliseconds.
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>
              Phase 3 – Multi-tier notifications (notifications only, no in-app banners) • Phase 4 – Caching & robustness (tiered TTL, retry)
            </h4>
            <div className="text-sm">
              <strong>Phase 3:</strong> We show only system notifications (no in-app banners or in-app alerts). Two notification types: DANGER = critical system notification (popup); CAUTION (warning) = warning system notification (popup). Both are system-level notifications so the user sees them consistently. <strong>Phase 4:</strong> We use different cache durations per verdict (tiered TTL), add retry and fallback when services fail, and use a login-walled heuristic where needed.
            </div>
          </div>
          <div className="text-sm mt-2">
            <strong>Order:</strong> Phase 1 → 2 → 3 → 4.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Scenarios covered by enhancement (what happens in each user case)",
    icon: ICON.scenarios,
    content: (
      <div className="card-section card-section-plan">
        <h3>{ICON.scenarios} Scenarios (user visits Gmail, known phishing, unknown site, LLM down, etc.)</h3>
        <ul className="slide-points">
          <li>
            <strong>User visits Gmail, ChatGPT, or Atlassian:</strong> The agent finds the domain on the allowlist (Layer 1) and returns SAFE without calling the LLM. The user sees no warning (no false positive).
          </li>
          <li>
            <strong>User visits a known phishing URL:</strong> The agent finds the URL or domain on the blocklist (Layer 2) and returns DANGER immediately. We show a dangerous-site (system) notification.
          </li>
          <li>
            <strong>User visits an unknown but legitimate site:</strong> The URL is not on allowlist or blocklist. The agent runs the full pipeline (heuristics, content, maybe LLM). Result is safe or caution. Safe = no notification; caution = we show a warning system notification (no in-app banners).
          </li>
          <li>
            <strong>User visits an unknown suspicious site:</strong> The agent returns warning (caution) or danger. We show only system notifications: CAUTION = warning notification (system popup); DANGER = critical notification (system popup). No in-app banners.
          </li>
          <li>
            <strong>LLM or a feed is down (after Phase 2):</strong> The allowlist and blocklist still work (they are local). For URLs that need deeper analysis, the agent falls back to heuristics instead of the LLM so we still give a result.
          </li>
          <li>
            <strong>Brand-new or rare domain:</strong> We run the full agent analysis and return a verdict (safe / caution / danger) and show the right notification type for that verdict.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Risks & mitigation (from plan §9 – technical and business)",
    icon: ICON.cons,
    content: (
      <div className="card-section card-section-cons">
        <h3>Technical risks (what can go wrong and how we handle it)</h3>
        <div className="card-inner card-inner-cons">
          <h4>
            Allowlist stale / Threat feeds false positives / Memory / Feed download failures (and mitigations)
          </h4>
          <ul className="text-sm">
            <li><strong>Allowlist goes stale:</strong> We sync Tranco/Majestic (1M domains) weekly, use user feedback, and do a quarterly review so trusted sites stay on the list and we do not block them.</li>
            <li><strong>Threat feeds give false positives:</strong> We use high-quality feeds (PhishingDB, URLhaus), cross-reference at least two sources, and remove any domain that is on our allowlist so we do not block trusted sites.</li>
            <li><strong>Memory usage:</strong> We can use Bloom filters or LRU caches; on the desktop we can keep a subset (e.g. ~100k). We alert when memory use reaches 80% so we can act before it becomes a problem.</li>
            <li><strong>Feed download fails:</strong> We persist the last good blocklist to disk. If a download fails we keep using the previous file (stale is better than empty). We fall back to heuristics + LLM for analysis and alert if we have not updated for more than 24 hours.</li>
          </ul>
        </div>
        <h3 className="slide-subtitle">Business & operational risks (licensing, liability, deployment)</h3>
        <div className="card-inner card-inner-cons">
          <ul className="text-sm">
            <li>
              <strong>Licensing:</strong> We use only feeds with permissive licenses (MIT/CC0). We get legal review and keep attribution as required by each source.
            </li>
            <li>
              <strong>Liability:</strong> We use disclaimers, allow user override where appropriate, and log decisions. We consider E&amp;O insurance for product liability.
            </li>
            <li>
              <strong>Deployment:</strong> We roll out in phases, use feature flags to turn layers on/off, and use blue-green or similar so we can roll back quickly if something goes wrong.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Conclusion & next steps (summary of improvements and what to do after approval)",
    icon: ICON.plan,
    content: (
      <div className="card-section card-section-plan">
        <h3>Summary of improvements (from plan – what we get after Phase 1–4)</h3>
        <ul className="slide-points">
          <li>
            ✅ <strong>Fewer false positives:</strong> With a built-in allowlist and Tranco/Majestic 1M domains synced weekly, safe sites (e.g. Gmail, ChatGPT) are no longer wrongly flagged.
          </li>
          <li>✅ <strong>Known threats caught:</strong> We check 2.5M+ known-bad domains from threat feeds, so most real phishing URLs are blocked quickly.</li>
          <li>✅ <strong>Faster response:</strong> For about 95% of URLs we can answer in under 10 ms (allowlist + blocklist), instead of 15–30 seconds.</li>
          <li>✅ <strong>Better UX:</strong> We show only system notifications (no in-app banners): two types — warning (caution) and critical (danger) — so users see consistent, clear alerts and are more likely to pay attention to real threats.</li>
          <li>✅ <strong>More reliable:</strong> We do not depend on a single LLM call; allowlist and blocklist work even if the LLM or a feed is down.</li>
          <li>✅ <strong>Lower cost:</strong> We use the LLM only for borderline URLs, so LLM cost drops by about 95%.</li>
        </ul>
        <h3 className="slide-subtitle">Expected outcomes (target metrics)</h3>
        <div className="text-sm">
          <strong>Target numbers:</strong> False positive rate under 1%; true positive (correctly flagged bad sites) over 95%; latency under 10 ms for known-good/bad URLs; user satisfaction up by about 2 points; backend cost down by about 50%.
        </div>
        <h3 className="slide-subtitle">Next steps (what to do after approval – Phase 1 then Phase 2)</h3>
        <ul className="slide-points">
          <li>
            Review and approve plan → assign resources → Phase 1 immediately →
            phased rollout: staging → production after validation.
          </li>
          <li>
            Phase 1: extend agent allowlist (built-in + Tranco/Majestic 1M). Phase 2: agent blocklist + daily sync job. Phase 3: notifications only (two system notification types). Phase 4: tiered TTL, retry, fallback, robustness.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Sources & references (all links to feeds, APIs and docs)",
    icon: ICON.links,
    content: (
      <div className="card-section card-section-sources">
        <h3>{ICON.links} Tier 1 – Threat intelligence feeds (must-integrate blocklist sources)</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          These are lists of <strong>known-bad</strong> domains and URLs (phishing, malware, scam sites). We must integrate them so we can block known threats in under 10 ms without calling the LLM. Each source is updated daily; we download and merge them once per day.
        </p>
        <div className="text-sm mb-3 p-2" style={{ background: 'var(--warning-bg, #fff3cd)', border: '1px solid var(--warning-border, #ffc107)', borderRadius: '6px', color:'black' }}>
          <strong>⚠️ Warning:</strong> Do not download data directly from source links without review. It's just for the refrence. First <strong>visit the official Git repos</strong> (or project sites), <strong>review the data and documentation</strong> there, then download and use it.
        </div>
        <ul className="sources-list">
          <li>
            <strong>Phishing.Database</strong> — Open-source list of phishing domains and URLs (~857k).{" "}
            <a href="https://github.com/Phishing-Database/Phishing.Database" target="_blank" rel="noopener noreferrer">GitHub (project)</a>
            {" • "}
            <a href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt" target="_blank" rel="noopener noreferrer">Active domains (download)</a>
            {" • "}
            <a href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt" target="_blank" rel="noopener noreferrer">Active links (download)</a>
          </li>
          <li>
            <strong>Ultimate Hosts Blacklist</strong> — Large blocklist of bad domains and IPs (~1.4M).{" "}
            <a href="https://github.com/Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist" target="_blank" rel="noopener noreferrer">GitHub (project)</a>
            {" • "}
            <a href="https://hosts.ubuntu101.co.za/domains.list" target="_blank" rel="noopener noreferrer">domains.list (download bad domains)</a>
            {" • "}
            <a href="https://hosts.ubuntu101.co.za/ips.list" target="_blank" rel="noopener noreferrer">ips.list (download bad IPs)</a>
          </li>
          <li>
            <strong>URLhaus</strong> — Malware and phishing URLs from abuse.ch (~200k).{" "}
            <a href="https://urlhaus.abuse.ch/" target="_blank" rel="noopener noreferrer">Project (info)</a>
            {" • "}
            <a href="https://urlhaus.abuse.ch/downloads/text/" target="_blank" rel="noopener noreferrer">Text (download)</a>
            {" • "}
            <a href="https://urlhaus.abuse.ch/downloads/csv/" target="_blank" rel="noopener noreferrer">CSV (download)</a>
          </li>
          <li>
            <strong>PhishTank</strong> — Community-reported phishing URLs (~15k).{" "}
            <a href="https://www.phishtank.com/" target="_blank" rel="noopener noreferrer">Website (info)</a>
            {" • "}
            <a href="https://data.phishtank.com/data/online-valid.csv" target="_blank" rel="noopener noreferrer">online-valid.csv (download current list)</a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Tier 2 – Supplementary blocklist feeds (optional)</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          Extra blocklists we can add for broader coverage. Not required for the first release; use if we want more protection against scam and abuse domains.
        </p>
        <ul className="sources-list">
          <li>
            <strong>Sefinek Blocklist Collection</strong> — Large optional blocklist (6M+ entries). Verify license (CC BY-NC-ND) for commercial use before production.{" "}
            <a href="https://github.com/sefinek/Sefinek-Blocklist-Collection" target="_blank" rel="noopener noreferrer">GitHub (project)</a>
            {" • "}
            <a href="https://blocklist.sefinek.net/generated/v1/" target="_blank" rel="noopener noreferrer">Download (blocklist files)</a>
          </li>
          <li>
            <strong>Hagezi DNS Blocklists</strong> — DNS-level blocklists for malware, phishing, and ads.{" "}
            <a href="https://github.com/hagezi/dns-blocklists" target="_blank" rel="noopener noreferrer">GitHub (project & download)</a>
          </li>
          <li>
            <strong>Scam-Blocklist</strong> — Community list of scam and phishing domains.{" "}
            <a href="https://github.com/jarelllama/Scam-Blocklist" target="_blank" rel="noopener noreferrer">GitHub (project & download)</a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Allowlist sources (trusted-domain lists – Tranco, Majestic)</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          Lists of <strong>trusted, popular</strong> domains (e.g. top 1 million by traffic). If a URL’s domain is on the allowlist, we treat it as safe and skip all other checks — so Gmail, ChatGPT, and similar sites never show a warning.
        </p>
        <ul className="sources-list">
          <li>
            <strong>Tranco List</strong> — Top 1M domains by traffic (research-backed ranking).{" "}
            <a href="https://tranco-list.eu/" target="_blank" rel="noopener noreferrer">Website (info & download)</a>
          </li>
          <li>
            <strong>Majestic Million</strong> — Top 1M domains by backlink count (trusted, popular sites).{" "}
            <a href="https://majestic.com/reports/majestic-million" target="_blank" rel="noopener noreferrer">Website (info & download)</a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Google Safe Browsing & Web Risk API (links to usage and docs)</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          <strong>Safe Browsing v4</strong> is free but for non-commercial use only (not for our product). <strong>Web Risk API</strong> is the paid, commercial option: we use it for URLs that are not on our allowlist or blocklist, to get Google’s verdict (phishing, malware, etc.). First 100k requests/month free; then paid.
        </p>
        <ul className="sources-list">
          <li>
            <strong>Safe Browsing API v4</strong> — Free URL check API; non-commercial use only (not for our product).{" "}
            <a href="https://developers.google.com/safe-browsing/v4/usage-limits" target="_blank" rel="noopener noreferrer">Usage limits (docs)</a>
          </li>
          <li>
            <strong>Google Web Risk API</strong> — Paid commercial API for phishing/malware checks; we use it for URLs not on our lists.{" "}
            <a href="https://cloud.google.com/web-risk" target="_blank" rel="noopener noreferrer">Documentation (docs & pricing)</a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Documentation (plan doc and repo references)</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          The full improvement plan (what we build, in what order, and why) is in the repo. Our code lives in three GitHub repos: desktop app, backend, and URL-safety agent.
        </p>
        <ul className="sources-list">
          <li>
            Plan document: <strong>URL_SAFETY_SYSTEM_IMPROVEMENT_PLAN.md</strong> (repo root)
          </li>
          <li>
            GitHub repos: <strong>spam-site-desktop</strong>, <strong>spam-site-backend</strong>, <strong>spam-site-agent</strong>
          </li>
        </ul>
      </div>
    ),
  },
];

function App() {
  const [index, goTo] = useHashSlide();

  useEffect(() => {
    if (!window.location.hash || !/^#slide-\d+$/.test(window.location.hash)) {
      window.location.hash = `slide-${index + 1}`;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        goTo(index - 1);
      } else if (e.key === "ArrowRight") {
        goTo(index + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, goTo]);

  const slide = slides[index];
  const isTitleSlide = slide.type === "title";

  return (
    <div className="pres-container">
      <header className="pres-header">
        <div className="pres-header-left">
          <button
            type="button"
            className="pres-nav-btn"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            ← Previous
          </button>
        </div>
        <div className="pres-header-center">
          <span className="pres-header-count">
            {index + 1} / {SLIDE_COUNT}
          </span>
          <span className="pres-header-slide-title" title={slide.title}>
            {slide.title}
          </span>
          <div className="pres-dots pres-dots-below-title" role="tablist" aria-label="Slide index">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={i === index ? "active" : ""}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
        <nav className="pres-header-right" aria-label="Slide navigation">
          <button
            type="button"
            className="pres-nav-btn btn-next"
            onClick={() => goTo(index + 1)}
            disabled={index === SLIDE_COUNT - 1}
            aria-label="Next slide"
          >
            Next →
          </button>
        </nav>
      </header>

      <main
        className="pres-main"
        role="main"
        aria-label={`Slide ${index + 1} of ${SLIDE_COUNT}`}
      >
        <div className="pres-card">
          {!isTitleSlide && (
            <h2 className="slide-title">
              <span className="slide-title-icon" aria-hidden="true">
                {slide.icon}
              </span>
              {slide.title}
            </h2>
          )}
          {slide.content}
        </div>
      </main>
    </div>
  );
}

export default App;
