import Link from 'next/link';
import { ArrowRight, Heart, LockKeyhole, MessageCircle, ShieldCheck, Sparkles, PenLine, Users } from 'lucide-react';

export default function Home() {
  return <main>
    <section className="hero-wrap">
      <div className="glow glow-one"/><div className="glow glow-two"/>
      <div className="hero shell">
        <div className="eyebrow"><span className="eyebrow-dot"/> CodingGita Student Community</div>
        <h1>Say what you <span>really</span> think.</h1>
        <p className="lead">A private space for confessions, campus conversations, friendships and study support — without putting your identity on the post.</p>
        <div className="actions">
          <Link className="btn primary btn-lg" href="/submit"><PenLine size={18}/> Post anonymously <ArrowRight size={17}/></Link>
          <Link className="btn ghost btn-lg" href="/community">Explore community</Link>
        </div>
        <div className="hero-note"><LockKeyhole size={15}/> Your public confession can stay anonymous</div>
      </div>
    </section>

    <section className="shell feature-section">
      <div className="section-heading"><div><span className="section-kicker">WHY CG COMMUNITY</span><h2>Made for real student life.</h2></div><p>Simple tools, clear boundaries and a calmer place to talk.</p></div>
      <div className="feature-grid">
        <article className="feature-card featured"><div className="icon-box purple"><LockKeyhole/></div><span className="mini-label">PRIVATE BY DEFAULT</span><h3>Confess without the spotlight.</h3><p>Share what is on your mind while keeping your public identity separate from the post.</p><Link href="/submit">Write a confession <ArrowRight size={15}/></Link></article>
        <article className="feature-card"><div className="icon-box blue"><MessageCircle/></div><span className="mini-label">FRIENDS & CHAT</span><h3>Talk beyond the feed.</h3><p>Keep normal conversations with people you choose, with reporting and blocking tools.</p></article>
        <article className="feature-card"><div className="icon-box pink"><Sparkles/></div><span className="mini-label">CG BUDDY</span><h3>Get help when you're stuck.</h3><p>Use the community's AI buddy for study, coding and everyday questions.</p></article>
      </div>
    </section>

    <section className="shell trust-section">
      <div className="trust-card"><div><span className="section-kicker">A BETTER COMMUNITY</span><h2>Honest conversations need good boundaries.</h2><p>Posts go through moderation before appearing publicly. Users can report harmful content, and the site provides privacy and community guidelines.</p></div><div className="trust-points"><div><ShieldCheck/><span>Moderation before publishing</span></div><div><Users/><span>Student-first experience</span></div><div><Heart/><span>Respect over reach</span></div></div></div>
    </section>

    <section className="shell final-cta"><div><span className="section-kicker">READY?</span><h2>Have something to say?</h2><p>You choose what to share. We provide the space.</p></div><Link className="btn primary btn-lg" href="/submit">Post a confession <ArrowRight size={17}/></Link></section>
  </main>;
}
