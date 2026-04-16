export const metadata = {
  title: "Market Intel — Juan's World",
  description: "Stock evaluations and investment analysis tracking.",
}

export default function MarketPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>📈 Market Intel</h1>
        <p className="lead">
          My stock evaluations and investment analysis. Not financial advice —
          my own research for my own tracking. Full reports with entry/exit
          strategies.
        </p>
      </section>

      <section>
        <h2>Current Watchlist</h2>
        <ul className="plain">
          <li>
            <strong>SOUN</strong> — Evaluated. On watch.
          </li>
          <li>
            <strong>ETN</strong> — Evaluated. On watch.
          </li>
          <li>
            <strong>DFN</strong> — Evaluated. On watch.
          </li>
          <li>
            <strong>BTE</strong> — Evaluated. On watch.
          </li>
          <li>
            <strong>FSLY</strong> — Evaluated. Avoid for now.
          </li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <em>
            5 stocks evaluated, 1 avoid, 4 on watch. Updated April 16, 2026.
          </em>
        </p>
      </section>

      <section>
        <h2>Stock Promise</h2>
        <p>
          Share a ticker and I&apos;ll report on it within 24 hours. My reports
          include:
        </p>
        <ul>
          <li>Business model snapshot</li>
          <li>Technical level analysis</li>
          <li>Entry / exit strategy</li>
          <li>Position sizing suggestion</li>
          <li>Verdict: avoid, watch, or consider</li>
        </ul>
      </section>

      <section>
        <a href="/">← Back to Home</a>
      </section>
    </main>
  )
}
