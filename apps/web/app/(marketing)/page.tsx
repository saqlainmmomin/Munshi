// Landing + waitlist (PRD §11).
// Copy rule (AGENTS.md §7.3): describe CAPABILITY, never the sourcing mechanism.
// Never name NoBroker; never say "scraping".
//
// Structure: the hero sells the OUTCOME (a home that doesn't feel like a cage),
// the sections below sell the PATH (Munshi absorbs the tiresome half of a flat
// hunt). Nothing here claims a source, a site, or a method.
//
// Visual system follows design/explorations/volcanic-graphic.html (PRD §6):
// Oswald display, DM Sans body, ember accent, pill controls. The hero photo slot
// in that reference is a live sky here — the feeling is openness, not a flat.
import CloudSky from "./_components/CloudSky";

const CHECKS = [
  {
    h: "The number behind the number",
    p: "Deposit, maintenance, brokerage, lock-in and notice period — surfaced before you spend a Saturday on the flat, not after.",
  },
  {
    h: "The commute you'll actually do",
    p: "Door-to-door at the hour you travel, for everyone in the search — not a straight line on a map.",
  },
  {
    h: "What the photos are hiding",
    p: "Light, ventilation and real usable space read out of the pictures, with the ambiguities called out as ambiguities.",
  },
  {
    h: "The conditions nobody prints",
    p: "Restrictions on who an owner will rent to are shown to you as facts. They are never a filter and never a ranking input.",
  },
];

const STEPS = [
  {
    n: "01",
    h: "Tell us once",
    p: "Budget, area, commute anchors, what you can't live without. Five minutes, not a form you re-fill every week.",
  },
  {
    n: "02",
    h: "We do the tiresome half",
    p: "Finding, sifting, and chasing down the details that decide whether a flat is worth a visit at all.",
  },
  {
    n: "03",
    h: "You review a short list",
    p: "A finite batch, photo-first, with the reasons written out. Shortlist or pass in a minute each.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-sky" aria-hidden="true">
          <CloudSky
            background="#2f7fd4"
            baseColor="#cfe4f6"
            accentColor="#ffffff"
            density={92}
            speed={38}
            size={150}
            sun={{ x: 88, y: 96, glow: "#fff3e4" }}
            pointer={{ parallax: 140, wind: 90, damping: 40 }}
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-inner">
          <nav className="hero-nav">
            <span className="logo">Munshi</span>
            <a className="navlink" href="/login">
              Log in
            </a>
          </nav>

          <div className="hero-copy">
            <h1>
              <span className="line">Room to</span>
              <span className="line accent">breathe</span>
              <span className="line">in Bengaluru</span>
            </h1>

            <p className="lede">
              You know the feeling the moment the door opens — light across the
              floor, air moving, space that is finally yours. A flat like that
              changes how the whole city feels. It exists. Finding it is the
              part that grinds you down.
            </p>

            <form className="waitlist" action="/api/waitlist" method="post">
              <label className="sr-only" htmlFor="waitlist-email">
                Email address
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
              <button type="submit">Join the waitlist</button>
            </form>

            <p className="cap">
              Free through the pilot. Bengaluru first. We take on searches as
              fast as we can actually run them.
            </p>
          </div>
        </div>
      </section>

      <section className="block problem">
        <h2 className="eyebrow">The part that grinds you down</h2>
        <p className="big-copy">
          Four hundred listings. Visits booked around somebody else&apos;s
          schedule. A question sent on Tuesday, answered on Friday, and a
          deposit that turns out to be six months&apos; rent — after you&apos;ve
          already crossed the city to stand in the flat.{" "}
          <b>
            Most of the flats you visit were never going to work. You just
            couldn&apos;t tell from the listing.
          </b>
        </p>
        <p className="big-copy muted">
          Munshi takes the requirements once and carries them. We find flats, we
          ask the awkward questions, and we keep going until three are genuinely
          worth your Saturday. The path of least resistance to a place you love.
        </p>
      </section>

      <section className="block">
        <h2 className="eyebrow">How it runs</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="eyebrow">What we settle before you go</h2>
        <div className="checks">
          {CHECKS.map((c) => (
            <div className="check" key={c.h}>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block closer">
        <h2 className="closer-h">
          Stop touring flats
          <br />
          you were always going to reject.
        </h2>
        <form className="waitlist" action="/api/waitlist" method="post">
          <label className="sr-only" htmlFor="waitlist-email-2">
            Email address
          </label>
          <input
            id="waitlist-email-2"
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            required
          />
          <button type="submit">Join the waitlist</button>
        </form>
        <p className="cap">
          Your search data is deleted when the search closes, unless you ask us
          to keep it.
        </p>
      </section>

      <footer className="landing-footer">
        <span className="logo">Munshi</span>
        <span>Renter-side flat search · Bengaluru pilot</span>
      </footer>
    </main>
  );
}
