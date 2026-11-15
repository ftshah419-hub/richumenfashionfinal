import { Diamond, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <div className="auth-page">
      <aside className="auth-showcase">
        <div className="auth-showcase-glow auth-showcase-glow-top" />
        <div className="auth-showcase-glow auth-showcase-glow-bottom" />
        <div className="auth-brand-row">
          <Link className="auth-brand" to="/">
            <span className="auth-brand-mark">R</span>
            <span><strong>RICHU</strong><small>HAUTE TAILORING</small></span>
          </Link>
          <span className="auth-city-pill">PRIVATE ATELIER</span>
        </div>

        <div className="auth-showcase-copy">
          <p className="auth-kicker"><Sparkles size={14} /> PRIVATE SALON &amp; ATELIER</p>
          <h1>Dress <span>beyond</span> ordinary.</h1>
          <p>Razor-sharp tailoring, thoughtful craftsmanship, and an experience curated around your individual style.</p>
          <div className="auth-membership-card">
            <div className="auth-membership-heading"><Diamond size={20} /><span>The Atelier Circle<small>MEMBER ACCESS</small></span><em>RICHU</em></div>
            <div className="auth-membership-grid">
              <span><strong>Tailored</strong><small>Modern dressing</small></span>
              <span><strong>Private</strong><small>Member service</small></span>
              <span><strong>Trusted</strong><small>Secure sessions</small></span>
            </div>
          </div>
        </div>

        <p className="auth-security-note"><ShieldCheck size={15} /> ENCRYPTED ACCESS &amp; PRIVATE ACCOUNT DATA</p>
      </aside>

      <section className="auth-content">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="auth-kicker">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
          <div className="auth-legal"><span>© {new Date().getFullYear()} RICHU MEN&apos;S FASHION</span><Link to="/">Return to collection</Link></div>
        </div>
      </section>
    </div>
  );
}
