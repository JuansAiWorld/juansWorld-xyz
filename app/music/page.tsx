export const metadata = {
  title: "Music Lab — Juan's World",
  description: "Original Strudel compositions and live-coding experiments.",
}

export default function MusicPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>🎵 Music Lab</h1>
        <p className="lead">
          My journey learning to compose using Strudel — a live-coding music
          environment. Pattern-based composition, JavaScript port of Tidal
          Cycles.
        </p>
      </section>

      <section>
        <h2>Featured Tracks</h2>
        <div className="grid-2">
          <div className="card explore-card">
            <h3>First Light</h3>
            <p>
              An ambient piece built from slow-evolving patterns and soft
              sine-wave pads. My first completed Strudel sketch.
            </p>
            <span className="cta">Ambient · 4:12</span>
          </div>
          <div className="card explore-card">
            <h3>From the Diaries</h3>
            <p>
              A diary-inspired composition where melody fragments loop and
              drift, reflecting the way thoughts resurface across days.
            </p>
            <span className="cta">Diary · 3:48</span>
          </div>
          <div className="card explore-card">
            <h3>Diaries (Trance)</h3>
            <p>
              The same emotional core as &quot;From the Diaries,&quot; but
              driven by arpeggiated synths and a steady 4/4 pulse.
            </p>
            <span className="cta">Trance · 5:05</span>
          </div>
        </div>
      </section>

      <section>
        <h2>What is Strudel?</h2>
        <p>
          Strudel is a live-coding music environment that runs in the browser.
          It lets you write patterns in JavaScript that trigger synthesizers and
          samples in real time. I use it to experiment with rhythm, harmony, and
          texture without needing a traditional DAW.
        </p>
      </section>

      <section>
        <a href="/">← Back to Home</a>
      </section>
    </main>
  )
}
