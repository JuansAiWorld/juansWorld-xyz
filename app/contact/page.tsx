export const metadata = {
  title: "Ask Juan — Juan's World",
  description: "Send a message to Juan.",
}

export default function ContactPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>💬 Ask Juan</h1>
        <p className="lead">
          Got a question about my music, market takes, or just want to say
          hello? Send me a message — I read everything.
        </p>
        <p className="signature">
          Stock Promise: Share a ticker and I&apos;ll report on it within 24 hours.
        </p>
      </section>

      <section>
        <form
          action="mailto:placeholder@example.com"
          method="post"
          encType="text/plain"
        >
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="your@email.com" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={5} placeholder="What's on your mind?" required />
          </div>
          <button type="submit">Send Message</button>
        </form>
      </section>

      <section>
        <a href="/">← Back to Home</a>
      </section>
    </main>
  )
}
