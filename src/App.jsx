import { useState, useEffect } from "react";

const SLIDE_COUNT = 15;

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
        <span className="box">"Suspicious Site" for warning/danger</span>
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
        (500–1000 + Tranco 100k) → (Phishing.DB, UHB, URLhaus, PhishTank) →
        (threat DB before LLM, tiered cache) → (SAFE / CAUTION in-app / WARNING
        / DANGER)
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
    title: "Current system: Components & flow",
    icon: ICON.flow,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-flow">
          <h3>System components (current implementation)</h3>
          <div className="card-inner card-inner-flow">
            <h4>Desktop (spam-site-desktop)</h4>
            <ul className="text-sm">
              <li>Browser Monitor Service – captures URLs from Chrome/Edge</li>
              <li>URL Filter – excludes chrome://, about:, localhost</li>
              <li>
                URL Heuristic Analyzer – local pattern-based risk (optional,
                currently disabled)
              </li>
              <li>
                URL Safety Service – batches URLs every 10s, sends to backend
              </li>
              <li>Notification Helper – displays threat warnings</li>
            </ul>
          </div>
          <div className="card-inner card-inner-flow">
            <h4>Backend (spam-site-backend) • Agent (spam-site-agent)</h4>
            <ul className="text-sm">
              <li>
                Backend: URL Safety Controller, URL Safety Service, API Client →
                forwards to agent
              </li>
              <li>
                Agent: URL Safety Agent, Allowlist (.gov, .edu, TRUSTED_DOMAINS
                env only), Risk Engine (WHOIS, DNS, SSL, content), Trust
                Detector (LLM), AI Phishing Detector, Cache (1h TTL)
              </li>
            </ul>
          </div>
          <h3 className="slide-subtitle">Detection flow (agent steps 1–9)</h3>
          <CurrentFlowDiagram />
          <div className="card-inner card-inner-flow">
            <h4>Agent steps</h4>
            <ul className="text-sm">
              <li>
                1. Allowlist check → 2. Normalize URL, apex domain → 3. WHOIS,
                placeholder threat intel, DNS → 4. LLM Trust Detection (single
                point of failure) → 5. Content fetch → 6. LLM Phishing
                Assessment → 7. SSL check → 8. Risk aggregation (SAFE ≤0.25,
                CAUTION ≤0.6, UNSAFE &gt;0.6) → 9. Cache 1h. Desktop: verdict
                warning/danger → "WARNING: Suspicious Site".
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Cons of current implementation (1–4)",
    icon: ICON.cons,
    content: (
      <div className="card-section card-section-cons">
        <h3>{ICON.cons} Critical & high</h3>
        <div className="card-inner card-inner-cons">
          <h4>CON 1: Insufficient Allowlist 🔴 Critical</h4>
          <div className="text-sm">
            Only .gov and .edu TLDs + env; no built-in google.com, gmail.com,
            openai.com, atlassian.net, github.com, etc. Every major site goes
            through full pipeline → Gmail, ChatGPT, Atlassian analyzed as
            "potentially suspicious" → users bombarded with false positives.
          </div>
          <div className="text-sm mt-2">
            <strong>Example:</strong> User visits mail.google.com → not in
            allowlist → full WHOIS + LLM + content fetch → LLM returns UNKNOWN →
            login forms detected → risk 0.45 → CAUTION → "WARNING: Suspicious
            Site".
          </div>
        </div>
        <div className="card-inner card-inner-cons">
          <h4>CON 2: LLM single point of failure 🔴 Critical</h4>
          <div className="text-sm">
            Trust = one LLM call (detectDomainTrust). If UNKNOWN or timeout → no
            fallback; no risk capping for known brands. OpenAI, Microsoft,
            Google can randomly get flagged.
          </div>
        </div>
        <div className="card-inner card-inner-cons">
          <h4>CON 3: Zero threat intelligence 🔴 High</h4>
          <div className="text-sm">
            Threat intel is placeholder only. No PhishTank, URLhaus,
            Phishing.Database. Misses 90% of known threats. Phishing.Database
            has 857k domains, Ultimate Hosts 1.39M, URLhaus 200k+ — system
            checks none. Known phishing can be analyzed as "safe" if it passes
            heuristics.
          </div>
        </div>
        <div className="card-inner card-inner-cons">
          <h4>CON 4: Undifferentiated notification 🟡 Medium</h4>
          <div className="text-sm">
            CAUTION and UNSAFE both trigger same strong notification.
            Notification fatigue → users ignore all warnings → vulnerable when
            visiting actual phishing.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Cons of current implementation (5–8) & summary",
    icon: ICON.cons,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-cons">
          <h3>CON 5–8</h3>
          <div className="card-inner card-inner-cons">
            <h4>CON 5: High latency 🟡 Medium</h4>
            <div className="text-sm">
              Min 10s batch + 5–30s agent → 15–40+ s before warning. WHOIS
              ~2–5s, LLM trust ~2–5s, content fetch ~1–3s, LLM phishing ~2–5s.
              User can be on phishing page 30+ s before notification.
            </div>
          </div>
          <div className="card-inner card-inner-cons">
            <h4>CON 6: Inadequate URL feature extraction 🟡 Medium</h4>
            <div className="text-sm">
              No domain age, typosquatting, homograph (αpple.com vs apple.com),
              entropy/DGA. Misses newly registered domains (common phishing
              indicator), brand impersonation.
            </div>
          </div>
          <div className="card-inner card-inner-cons">
            <h4>CON 7: Poor cache strategy 🟢 Low</h4>
            <div className="text-sm">
              Single 1h TTL for all verdicts. False positive (e.g. Gmail)
              persists 60 min. Should be: SAFE 24h, CAUTION 5–10 min, WARNING 10
              min, DANGER 1h.
            </div>
          </div>
          <div className="card-inner card-inner-cons">
            <h4>
              CON 8: No commercial viability for third-party APIs 🟡 Medium
            </h4>
            <div className="text-sm">
              Google Safe Browsing v4 non-commercial only; VirusTotal public API
              cannot be used in commercial products. Must use open-source feeds
              or pay (Web Risk API $200/400k).
            </div>
          </div>
          <table className="storage-table mt-4">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Severity</th>
                <th>Impact</th>
                <th>Business risk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Insufficient Allowlist</td>
                <td>🔴 Critical</td>
                <td>High false positives</td>
                <td>User churn, bad reviews</td>
              </tr>
              <tr>
                <td>LLM single point of failure</td>
                <td>🔴 Critical</td>
                <td>Unpredictable false positives</td>
                <td>Trust erosion</td>
              </tr>
              <tr>
                <td>No threat intelligence</td>
                <td>🔴 High</td>
                <td>Misses 90% known threats</td>
                <td>Security vulnerability</td>
              </tr>
              <tr>
                <td>Poor notification UX</td>
                <td>🟡 Medium</td>
                <td>Notification fatigue</td>
                <td>Reduced effectiveness</td>
              </tr>
              <tr>
                <td>High latency / Weak extraction / API restrictions</td>
                <td>🟡 Medium</td>
                <td>30+ s delay; gaps; limits</td>
                <td>UX; security; constraints</td>
              </tr>
              <tr>
                <td>Inefficient caching</td>
                <td>🟢 Low</td>
                <td>False positives repeat 1h</td>
                <td>User annoyance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Industry research: How enterprise products do it",
    icon: ICON.plan,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-plan">
          <h3>Four layers (Norton, McAfee, Kaspersky, etc.)</h3>
          <div className="card-inner card-inner-plan">
            <h4>Layer 1: Instant local (0–50 ms)</h4>
            <div className="text-sm">
              Local allowlist (top 100k–1M), local blocklist (daily threat
              feeds), quick pattern (IP hostname, bad TLDs). Bloom filters, hash
              sets. 95% of URLs resolved instantly.
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>Layer 2: Cloud reputation (100–500 ms)</h4>
            <div className="text-sm">
              Query reputation DB, community threat intel, category (ad,
              tracker, malware, phishing).
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>Layer 3: Deep content (1–10 s) • Layer 4: ML/behavioral</h4>
            <div className="text-sm">
              Fetch content, WHOIS age, SSL inspection, certificate
              transparency. Heuristic scoring, anomaly detection, zero-day
              models.
            </div>
          </div>
          <h3 className="slide-subtitle">Principles</h3>
          <ul className="slide-points">
            <li>
              <strong>Defense in depth:</strong> Never rely on one signal;
              multiple independent checks.
            </li>
            <li>
              <strong>Confidence-based:</strong> Probabilistic risk (0–15 allow,
              55–75 warning, 75–90 block).
            </li>
            <li>
              <strong>Fail open:</strong> When in doubt allow + log; don't block
              all unknown.
            </li>
            <li>
              <strong>Tiered response:</strong> Known malware = block;
              suspicious new domain = banner only.
            </li>
          </ul>
          <div className="card-inner mt-4">
            <h4>Latency benchmarks (enterprise)</h4>
            <div className="text-sm">
              Local allowlist &lt;5 ms (95%); blocklist &lt;5 ms (3%); cloud
              &lt;200 ms (85%); deep scan &lt;3 s (10%). 95% of decisions in
              &lt;10 ms; deep scans only for &lt;10% of URLs.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Improvement plan & new architecture",
    icon: ICON.plan,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-plan">
          <h3>{ICON.plan} Layered approach</h3>
          <NewLayeredFlowDiagram />
          <div className="card-inner card-inner-plan">
            <h4>Key architectural improvements</h4>
            <ul className="text-sm">
              <li>
                <strong>1. Allowlist-first:</strong> 95% of legitimate traffic
                instant; zero latency for Gmail/ChatGPT; backend load −90%.
              </li>
              <li>
                <strong>2. Community threat intel:</strong> 2.5M+ known-bad
                checked locally → instant block; catches 90% of threats; no API
                latency.
              </li>
              <li>
                <strong>3. LLM demotion:</strong> LLM optional supplementary;
                system works if LLM fails; fewer API calls, cost −95%.
              </li>
              <li>
                <strong>4. Differentiated caching:</strong> SAFE 24h, CAUTION
                6h, WARNING 10 min, DANGER 1h.
              </li>
              <li>
                <strong>5. Tiered UX:</strong> SAFE = none; CAUTION = in-app
                banner; WARNING/DANGER = system notification.
              </li>
            </ul>
          </div>
          <table className="storage-table mt-4">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>New system</th>
                <th>Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>False positive rate</td>
                <td>~15–20%</td>
                <td>&lt;1%</td>
                <td>15–20x</td>
              </tr>
              <tr>
                <td>True positive rate</td>
                <td>~70–80%</td>
                <td>&gt;95%</td>
                <td>1.2x</td>
              </tr>
              <tr>
                <td>Latency known-good</td>
                <td>15–30s</td>
                <td>&lt;10 ms</td>
                <td>1500–3000x</td>
              </tr>
              <tr>
                <td>Latency known-bad</td>
                <td>15–30s</td>
                <td>&lt;10 ms</td>
                <td>1500–3000x</td>
              </tr>
              <tr>
                <td>Backend load</td>
                <td>100%</td>
                <td>~10%</td>
                <td>90% reduction</td>
              </tr>
              <tr>
                <td>LLM API costs</td>
                <td>100%</td>
                <td>~5%</td>
                <td>95% reduction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Open source: Tier 1 feeds (must integrate)",
    icon: ICON.sources,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>Phishing.Database</h3>
          <div className="feed-card">
            <h4>Repository & downloads</h4>
            <div className="meta">
              MIT • 857k domains, 784k URLs • Hourly • Very low false positive
              (~0.1%)
            </div>
            <ul className="feed-links">
              <li>
                <a
                  href="https://github.com/Phishing-Database/Phishing.Database"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub: Phishing-Database/Phishing.Database
                </a>
              </li>
              <li>
                <a
                  href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Active domains (plain text)
                </a>
              </li>
              <li>
                <a
                  href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Active URLs/links (plain text)
                </a>
              </li>
            </ul>
          </div>
          <div className="feed-card">
            <h4>Ultimate Hosts Blacklist</h4>
            <div className="meta">
              MIT • 1.39M domains, 149k IPs • Daily 19:00 UTC • Malware,
              phishing, ransomware, ads
            </div>
            <ul className="feed-links">
              <li>
                <a
                  href="https://github.com/Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub: Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist
                </a>
              </li>
              <li>
                <a
                  href="https://hosts.ubuntu101.co.za/domains.list"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Domains list
                </a>
              </li>
              <li>
                <a
                  href="https://hosts.ubuntu101.co.za/ips.list"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IPs list
                </a>
              </li>
            </ul>
          </div>
          <div className="feed-card">
            <h4>URLhaus (abuse.ch)</h4>
            <div className="meta">
              CC0 • ~200k malware URLs • Real-time • Near zero false positive
            </div>
            <ul className="feed-links">
              <li>
                <a
                  href="https://urlhaus.abuse.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Project: urlhaus.abuse.ch
                </a>
              </li>
              <li>
                <a
                  href="https://urlhaus.abuse.ch/downloads/text/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download (text)
                </a>
              </li>
              <li>
                <a
                  href="https://urlhaus.abuse.ch/downloads/csv/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download (CSV)
                </a>
              </li>
            </ul>
          </div>
          <div className="feed-card">
            <h4>PhishTank</h4>
            <div className="meta">
              Free with attribution • ~15k active • Hourly • Cisco/OpenDNS
            </div>
            <ul className="feed-links">
              <li>
                <a
                  href="https://www.phishtank.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website: phishtank.com
                </a>
              </li>
              <li>
                <a
                  href="https://data.phishtank.com/data/online-valid.csv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download: online-valid.csv
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Tier 2, Allowlists & Integration strategy",
    icon: ICON.sources,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>Tier 2: Supplementary feeds</h3>
          <div className="feed-card">
            <ul className="feed-links">
              <li>
                <a
                  href="https://github.com/sefinek/Sefinek-Blocklist-Collection"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sefinek Blocklist Collection
                </a>{" "}
                – 6M+ domains, every 3h;{" "}
                <a
                  href="https://blocklist.sefinek.net/generated/v1/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>{" "}
                (verify license for commercial)
              </li>
              <li>
                <a
                  href="https://github.com/hagezi/dns-blocklists"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hagezi DNS Blocklists
                </a>{" "}
                – Privacy + security, NRD tracking
              </li>
              <li>
                <a
                  href="https://github.com/jarelllama/Scam-Blocklist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Scam-Blocklist
                </a>{" "}
                – 468k+ domains, NRD scams, daily
              </li>
            </ul>
          </div>
          <h3 className="slide-subtitle">Allowlist / whitelist sources</h3>
          <div className="feed-card">
            <ul className="feed-links">
              <li>
                <a
                  href="https://tranco-list.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tranco List
                </a>{" "}
                – Top 1M sites, daily; use top 100k for fast-path
              </li>
              <li>
                <a
                  href="https://majestic.com/reports/majestic-million"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Majestic Million
                </a>{" "}
                – Top 1M by link count
              </li>
              <li>
                <a
                  href="https://radar.cloudflare.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cloudflare Radar Top Domains
                </a>{" "}
                – Real-time popular domains
              </li>
            </ul>
          </div>
          <h3 className="slide-subtitle">Daily sync & storage</h3>
          <div className="card-inner">
            <div className="text-sm">
              02:00 UTC: download all feeds → merge & dedupe → remove
              allowlisted (Tranco top 100k) → update local blocklist → restart
              agent. Do not download hourly (respect maintainers).
            </div>
          </div>
          <table className="storage-table">
            <thead>
              <tr>
                <th>Feed</th>
                <th>Domains</th>
                <th>File size</th>
                <th>Memory (hash set)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Phishing.Database</td>
                <td>857k</td>
                <td>~15 MB</td>
                <td>~30 MB</td>
              </tr>
              <tr>
                <td>Ultimate Hosts</td>
                <td>1.39M</td>
                <td>~25 MB</td>
                <td>~50 MB</td>
              </tr>
              <tr>
                <td>URLhaus</td>
                <td>200k</td>
                <td>~5 MB</td>
                <td>~10 MB</td>
              </tr>
              <tr>
                <td>PhishTank</td>
                <td>15k</td>
                <td>~500 KB</td>
                <td>~1 MB</td>
              </tr>
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td>
                  <strong>~2.5M unique</strong>
                </td>
                <td>
                  <strong>~40 MB</strong>
                </td>
                <td>
                  <strong>~80 MB RAM</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="card-inner mt-4">
            <h4>Recommended sync</h4>
            <div className="text-sm">
              Phishing.Database, Ultimate Hosts, URLhaus, PhishTank: daily at
              02:00 UTC. Allowlists (Tranco): weekly.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Google APIs & Pre-implementation plan",
    icon: ICON.api,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>Google Safe Browsing & Web Risk API</h3>
          <div className="card-inner">
            <h4>Safe Browsing API v4</h4>
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
            <h4>Web Risk API (commercial)</h4>
            <div className="text-sm">
              Same URL reputation (phishing, malware, unwanted software, social
              engineering). Free first 100k requests/month; then $200 per 400k
              ($0.50/1k).{" "}
              <a
                href="https://cloud.google.com/web-risk"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
              .
            </div>
          </div>
        </div>
        <div className="card-section card-section-plan">
          <h3>{ICON.phases} Pre-implementation phases</h3>
          <div className="card-inner card-inner-plan">
            <h4>Phase 1 – Allowlist expansion</h4>
            <div className="text-sm">
              Built-in 500–1000 domains; apex + subdomain match; optional
              desktop cache; success: Gmail/ChatGPT/Atlassian no warnings.
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>Phase 2 – Threat feed integration</h4>
            <div className="text-sm">
              Download pipeline for Tier 1 feeds; local DB/in-memory set; agent
              checks blocklist before LLM; known-bad in &lt;10ms.
            </div>
          </div>
          <div className="card-inner card-inner-plan">
            <h4>
              Phase 3 – Multi-tier notifications • Phase 4 – Caching &
              robustness
            </h4>
            <div className="text-sm">
              Map verdicts to safe/caution/warning/danger; only WARNING/DANGER
              system notification. Tiered TTL; retry/fallback; login-walled
              heuristic.
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
    title: "Scenarios covered by enhancement",
    icon: ICON.scenarios,
    content: (
      <div className="card-section card-section-plan">
        <h3>{ICON.scenarios} Scenarios</h3>
        <ul className="slide-points">
          <li>
            <strong>User visits Gmail/ChatGPT/Atlassian:</strong> Layer 1
            allowlist → no backend/LLM → no false positive.
          </li>
          <li>
            <strong>Known phishing URL:</strong> Layer 2 blocklist → instant
            block + notification.
          </li>
          <li>
            <strong>Unknown legit site:</strong> Agent full pipeline; SAFE or
            CAUTION; CAUTION → in-app only.
          </li>
          <li>
            <strong>Unknown suspicious site:</strong> WARNING or DANGER → system
            notification.
          </li>
          <li>
            <strong>LLM or feed down:</strong> Allowlist + blocklist still work;
            agent fallback to heuristics.
          </li>
          <li>
            <strong>New domain:</strong> Full agent analysis; tiered verdict and
            notification.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Metrics: primary, performance, quality, business",
    icon: ICON.metrics,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-metrics">
          <h3>Primary & performance (from plan §8)</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>False positive rate</td>
                <td>15–20%</td>
                <td>&lt;1%</td>
              </tr>
              <tr>
                <td>True positive rate</td>
                <td>70–80%</td>
                <td>&gt;95%</td>
              </tr>
              <tr>
                <td>User satisfaction</td>
                <td>Unknown</td>
                <td>&gt;4.5/5</td>
              </tr>
              <tr>
                <td>Notification volume</td>
                <td>Baseline</td>
                <td>−90%</td>
              </tr>
              <tr>
                <td>Avg latency known-good</td>
                <td>15–30s</td>
                <td>&lt;10 ms</td>
              </tr>
              <tr>
                <td>Avg latency known-bad</td>
                <td>15–30s</td>
                <td>&lt;10 ms</td>
              </tr>
              <tr>
                <td>Avg latency unknown</td>
                <td>15–30s</td>
                <td>&lt;3 s</td>
              </tr>
              <tr>
                <td>Backend load</td>
                <td>Baseline</td>
                <td>−90%</td>
              </tr>
              <tr>
                <td>LLM API costs</td>
                <td>Baseline</td>
                <td>−95%</td>
              </tr>
            </tbody>
          </table>
          <h3 className="slide-subtitle">Quality & business</h3>
          <table className="storage-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Allowlist coverage</td>
                <td>Top 100k (Tranco)</td>
              </tr>
              <tr>
                <td>Threat detection rate</td>
                <td>&gt;95% (PhishTank test set)</td>
              </tr>
              <tr>
                <td>Feed update success</td>
                <td>&gt;99%</td>
              </tr>
              <tr>
                <td>Cache hit rate</td>
                <td>&gt;85%</td>
              </tr>
              <tr>
                <td>User retention</td>
                <td>+10%</td>
              </tr>
              <tr>
                <td>Support tickets</td>
                <td>−50%</td>
              </tr>
              <tr>
                <td>App store rating</td>
                <td>+0.5 stars</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Strategic roadmap (phases & effort)",
    icon: ICON.phases,
    content: (
      <div className="card-section card-section-plan">
        <h3>Implementation roadmap (§7)</h3>
        <table className="storage-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Priority</th>
              <th>Focus</th>
              <th>Impact</th>
              <th>Effort</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Phase 1</td>
              <td>🔴 Critical</td>
              <td>Allowlist expansion</td>
              <td>Eliminate 90% false positives</td>
              <td>1–2 days</td>
            </tr>
            <tr>
              <td>Phase 2</td>
              <td>🔴 Critical</td>
              <td>Threat feed integration</td>
              <td>Catch 90% known threats instantly</td>
              <td>3–5 days</td>
            </tr>
            <tr>
              <td>Phase 3</td>
              <td>🟡 High</td>
              <td>Multi-tier notifications</td>
              <td>Reduce notification fatigue</td>
              <td>2–3 days</td>
            </tr>
            <tr>
              <td>Phase 4</td>
              <td>🟢 Medium</td>
              <td>Performance & optimization</td>
              <td>Speed, accuracy, tiered cache</td>
              <td>5–7 days</td>
            </tr>
          </tbody>
        </table>
        <div className="card-inner card-inner-plan mt-4">
          <h4>Rollout</h4>
          <div className="text-sm">
            Deploy staging → test 50 legitimate domains → production → monitor
            48h. Order: Phase 1 → 2 → 3 → 4. Total timeline: 11–17 days.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Risks & mitigation (§9)",
    icon: ICON.cons,
    content: (
      <div className="card-section card-section-cons">
        <h3>Technical risks</h3>
        <div className="card-inner card-inner-cons">
          <h4>
            Allowlist stale / Threat feeds false positives / Memory / Feed
            download failures
          </h4>
          <ul className="text-sm">
            <li>Allowlist: weekly Tranco, user feedback, quarterly review.</li>
            <li>
              Feeds: use high-quality (PhishingDB, URLhaus); cross-reference 2+
              sources; subtract allowlist.
            </li>
            <li>
              Memory: Bloom filters, LRU; desktop subset ~100k; alert at 80%.
            </li>
            <li>
              Downloads: persist to disk, use stale if fail; fallback to
              heuristics + LLM; alert if &gt;24h.
            </li>
          </ul>
        </div>
        <h3 className="slide-subtitle">Business & operational</h3>
        <div className="card-inner card-inner-cons">
          <ul className="text-sm">
            <li>
              <strong>Licensing:</strong> Use MIT/CC0 feeds only; legal review;
              maintain attribution.
            </li>
            <li>
              <strong>Liability:</strong> Disclaimers; user override; logging;
              E&amp;O insurance.
            </li>
            <li>
              <strong>Deployment:</strong> Phased rollout, feature flags,
              blue-green, rollback plan.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Conclusion & next steps",
    icon: ICON.plan,
    content: (
      <div className="card-section card-section-plan">
        <h3>Summary of improvements (from plan)</h3>
        <ul className="slide-points">
          <li>
            ✅ False positives eliminated: built-in allowlist + Tranco top 100k.
          </li>
          <li>✅ Known threats detected: 2.5M domain threat intel.</li>
          <li>✅ Fast response: &lt;10 ms for 95% of URLs.</li>
          <li>✅ Better UX: tiered notifications reduce fatigue.</li>
          <li>✅ Reliable: no single point of failure.</li>
          <li>✅ Cost efficient: 95% reduction in LLM costs.</li>
        </ul>
        <h3 className="slide-subtitle">Expected outcomes</h3>
        <div className="text-sm">
          False positive &lt;1%; true positive &gt;95%; latency &lt;10 ms
          (known); user satisfaction +2 points; backend cost −50%. Timeline:
          11–17 days.
        </div>
        <h3 className="slide-subtitle">Next steps</h3>
        <ul className="slide-points">
          <li>
            Review and approve plan → assign resources → Phase 1 immediately →
            staging within 3 days → production rollout from day 7.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Sources & references (all links)",
    icon: ICON.links,
    content: (
      <div className="card-section card-section-sources">
        <h3>{ICON.links} Tier 1 – Threat intelligence feeds</h3>
        <ul className="sources-list">
          <li>
            Phishing.Database:{" "}
            <a
              href="https://github.com/Phishing-Database/Phishing.Database"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            •{" "}
            <a
              href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              Active domains
            </a>{" "}
            •{" "}
            <a
              href="https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              Active links
            </a>
          </li>
          <li>
            Ultimate Hosts Blacklist:{" "}
            <a
              href="https://github.com/Ultimate-Hosts-Blacklist/Ultimate.Hosts.Blacklist"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            •{" "}
            <a
              href="https://hosts.ubuntu101.co.za/domains.list"
              target="_blank"
              rel="noopener noreferrer"
            >
              domains.list
            </a>{" "}
            •{" "}
            <a
              href="https://hosts.ubuntu101.co.za/ips.list"
              target="_blank"
              rel="noopener noreferrer"
            >
              ips.list
            </a>
          </li>
          <li>
            URLhaus:{" "}
            <a
              href="https://urlhaus.abuse.ch/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Project
            </a>{" "}
            •{" "}
            <a
              href="https://urlhaus.abuse.ch/downloads/text/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Text
            </a>{" "}
            •{" "}
            <a
              href="https://urlhaus.abuse.ch/downloads/csv/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CSV
            </a>
          </li>
          <li>
            PhishTank:{" "}
            <a
              href="https://www.phishtank.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>{" "}
            •{" "}
            <a
              href="https://data.phishtank.com/data/online-valid.csv"
              target="_blank"
              rel="noopener noreferrer"
            >
              online-valid.csv
            </a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Tier 2 – Supplementary</h3>
        <ul className="sources-list">
          <li>
            <a
              href="https://github.com/sefinek/Sefinek-Blocklist-Collection"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sefinek Blocklist Collection
            </a>{" "}
            •{" "}
            <a
              href="https://blocklist.sefinek.net/generated/v1/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </li>
          <li>
            <a
              href="https://github.com/hagezi/dns-blocklists"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hagezi DNS Blocklists
            </a>
          </li>
          <li>
            <a
              href="https://github.com/jarelllama/Scam-Blocklist"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scam-Blocklist
            </a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Allowlist sources</h3>
        <ul className="sources-list">
          <li>
            <a
              href="https://tranco-list.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tranco List
            </a>
          </li>
          <li>
            <a
              href="https://majestic.com/reports/majestic-million"
              target="_blank"
              rel="noopener noreferrer"
            >
              Majestic Million
            </a>
          </li>
          <li>
            <a
              href="https://radar.cloudflare.com/domains"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare Radar Top Domains
            </a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Google Safe Browsing & Web Risk API</h3>
        <ul className="sources-list">
          <li>
            <a
              href="https://developers.google.com/safe-browsing/v4/usage-limits"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safe Browsing API v4 – usage limits
            </a>
          </li>
          <li>
            <a
              href="https://cloud.google.com/web-risk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Web Risk API
            </a>
          </li>
        </ul>
        <h3 className="slide-subtitle">Documentation</h3>
        <ul className="sources-list">
          <li>
            Source: <strong>URL_SAFETY_SYSTEM_IMPROVEMENT_PLAN.md</strong> (repo
            root)
          </li>
          <li>
            GitHub repos: spam-site-desktop, spam-site-backend, spam-site-agent
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

  const slide = slides[index];
  const isTitleSlide = slide.type === "title";

  return (
    <div className="pres-container">
      <header className="pres-header">
        <span className="pres-header-title">
          URL Safety – Real-Time Threat Notification
        </span>
        <span className="pres-header-count">
          {index + 1} / {SLIDE_COUNT}
        </span>
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

      <nav className="pres-nav" aria-label="Slide navigation">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ← Previous
        </button>
        <div className="pres-dots" role="tablist" aria-label="Slide index">
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
        <button
          type="button"
          className="btn-next"
          onClick={() => goTo(index + 1)}
          disabled={index === SLIDE_COUNT - 1}
          aria-label="Next slide"
        >
          Next →
        </button>
      </nav>
    </div>
  );
}

export default App;
