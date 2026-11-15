import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-primary-container text-on-primary border-t border-tertiary-fixed-dim/20 pt-space-xl pb-space-lg">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter lg:gap-space-lg pb-space-xl">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm tracking-tighter">
                R
              </span>
              <span className="font-headline-sm text-headline-sm font-bold tracking-[0.2em] uppercase text-on-primary">
                RICHU
              </span>
            </div>
            <p className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-widest mt-space-xs">
              Dress Beyond Ordinary
            </p>
            <p className="font-body-sm text-body-sm text-on-primary-container max-w-sm mt-space-sm leading-relaxed">
              Curating architectural discipline and uncompromising luxury for the modern gentleman. Bespoke tailoring engineered for presence and timeless individuality.
            </p>
            <div className="flex items-center gap-space-sm mt-space-md">
              <span className="w-9 h-9 rounded-full border border-tertiary-fixed-dim/30 flex items-center justify-center text-on-primary hover:text-tertiary-fixed hover:border-tertiary-fixed transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[1.125rem]">photo_camera</span>
              </span>
              <span className="w-9 h-9 rounded-full border border-tertiary-fixed-dim/30 flex items-center justify-center text-on-primary hover:text-tertiary-fixed hover:border-tertiary-fixed transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[1.125rem]">diamond</span>
              </span>
              <span className="w-9 h-9 rounded-full border border-tertiary-fixed-dim/30 flex items-center justify-center text-on-primary hover:text-tertiary-fixed hover:border-tertiary-fixed transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[1.125rem]">support_agent</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-widest mb-space-xs">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-primary-container">
              <li className="hover:text-on-primary transition-colors">
                <Link to="/shop">Collections</Link>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <Link to="/shop?category=bespoke-suiting-tuxedos">Bespoke Suits</Link>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <Link to="/shop?category=artisanal-leather-accessories">Accessories</Link>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <Link to="/shop?sort=newest">Lookbook Drops</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-widest mb-space-xs">
              Customer Care
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-primary-container">
              <li className="hover:text-on-primary transition-colors">
                <Link to="/orders">Order Tracking</Link>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <span className="cursor-pointer">Shipping &amp; Returns</span>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <span className="cursor-pointer">Sartorial Size Guide</span>
              </li>
              <li className="hover:text-on-primary transition-colors">
                <span className="cursor-pointer">VIP Salon Concierge</span>
              </li>
            </ul>
          </div>

          {/* The Atelier Newsletter */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-widest mb-space-xs">
              The Atelier
            </h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mb-space-xs">
              Receive private salon invitations and seasonal preview drops.
            </p>
            {subscribed ? (
              <div className="p-3 bg-secondary-fixed/20 border border-secondary-fixed rounded text-xs text-secondary-fixed">
                ✓ Welcome to the RICHU Inner Circle.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-space-xs">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-primary text-on-primary text-body-sm px-space-sm py-2.5 rounded border border-tertiary-fixed-dim/30 focus:outline-none focus:border-tertiary-fixed font-body-sm placeholder:text-on-primary-container"
                  />
                  <button
                    type="submit"
                    className="mt-space-xs w-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim font-label-caps text-label-caps uppercase tracking-widest py-2.5 px-space-sm transition-all text-center font-bold"
                  >
                    Join the Atelier
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-md border-t border-tertiary-fixed-dim/20 flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-primary-container font-body-sm text-body-sm">
          <p className="text-[0.75rem]">© {new Date().getFullYear()} RICHU Haute Couture. All rights reserved.</p>
          <div className="flex items-center gap-space-md text-[0.75rem]">
            <span className="hover:text-on-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-on-primary transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-on-primary transition-colors cursor-pointer">Atelier Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
