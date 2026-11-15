import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // 3D Tilt Card Ref & State
  const tiltCardRef = useRef(null);
  const glareRef = useRef(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          productService.getCategories(),
          productService.getFeaturedProducts(8)
        ]);

        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
        }
        if (prodsRes.success && prodsRes.data) {
          setFeaturedProducts(prodsRes.data);
        }
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleMouseMove = (e) => {
    const card = tiltCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 15;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.opacity = "0.5";
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(254,224,136,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = tiltCardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  // Filter products by tab
  const filteredProducts = featuredProducts.filter((product) => {
    if (activeTab === "all") return true;
    const catName = product.category?.name?.toLowerCase() || "";
    if (activeTab === "outerwear") return catName.includes("outerwear") || product.name.toLowerCase().includes("coat");
    if (activeTab === "suiting") return catName.includes("suit") || catName.includes("tuxedo") || product.name.toLowerCase().includes("tuxedo");
    if (activeTab === "footwear") return catName.includes("footwear") || product.name.toLowerCase().includes("shoe");
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Cinematic Menswear Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-primary-container">
        {/* Visual Backdrop with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDz-S6emI4qTKbkBOVQZcRQd1Q5lH3ZJihBxV-pzjUQlJSqn1PxcXU2bnHqL3mpxmqMJoqG0I0ht8v7ZZ8p3L229yaPbI9S-VZ__cwGdJo-nwWrmnasqxDEyZNneHDIMEww7y8sBDqlHa9_MTMyo50UzQVO6SrwFaRbQPhb08gwvdWHp0iEp5nWaNvRa2r6vpNt1JDaoPz95jM9318ZBqg634BLpUqKS4JGc85HzSU"
            alt="Bespoke tailored suit atmosphere"
            className="w-full h-full object-cover object-top filter brightness-[0.85] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/95 via-primary-container/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-primary-container/40"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-margin-mobile lg:px-margin pt-36 pb-space-xl flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center min-h-[580px]">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-7 flex flex-col gap-space-md text-on-primary">
              <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-primary-container/80 backdrop-blur-md w-fit shadow-md border border-secondary-fixed/30">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-secondary-fixed">
                  Autumn / Winter Sartorial Edition
                </span>
              </div>

              <h1 className="font-display text-display font-bold uppercase tracking-wider text-on-primary leading-[1.08] max-w-2xl drop-shadow-sm">
                Upgrade Your Style With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-fixed via-tertiary-fixed-dim to-secondary-fixed-dim">
                  RICHU
                </span>
              </h1>

              <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-xl leading-relaxed">
                Discover fashion that defines your personality. Hand-finished bespoke suiting, Italian silk craftsmanship, and timeless sartorial excellence engineered for commanding presence.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(238,220,154,0.4)] font-bold"
                >
                  <span>Shop The Collection</span>
                  <span className="material-symbols-outlined text-[1rem] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to="/shop?category=bespoke-suiting-tuxedos"
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-primary-container/60 hover:bg-primary-container/90 text-on-primary font-label-caps text-label-caps uppercase tracking-widest backdrop-blur-md transition-all duration-300 hover:text-secondary-fixed border border-secondary-fixed/20"
                >
                  <span className="material-symbols-outlined text-[1rem]">tune</span>
                  <span>Bespoke Atelier</span>
                </Link>
              </div>

              {/* Quick Metrics Ticker */}
              <div className="pt-space-md mt-space-sm flex flex-wrap items-center gap-y-2 gap-x-6 text-on-primary-container text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-[1.125rem]">verified</span>
                  <span className="font-label-caps text-label-caps uppercase text-on-primary tracking-wider">
                    Super 180s Wool
                  </span>
                </div>
                <span className="text-tertiary-fixed-dim/40">•</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-[1.125rem]">handyman</span>
                  <span className="font-label-caps text-label-caps uppercase text-on-primary tracking-wider">
                    Hand-Sewn in Milan
                  </span>
                </div>
                <span className="text-tertiary-fixed-dim/40">•</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-[1.125rem]">flight_takeoff</span>
                  <span className="font-label-caps text-label-caps uppercase text-on-primary tracking-wider">
                    48h VIP Worldwide
                  </span>
                </div>
              </div>
            </div>

            {/* Right 3D Interactive Floating Accent Card */}
            <div className="lg:col-span-5 flex justify-end relative">
              <div
                ref={tiltCardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full max-w-sm p-space-md bg-primary-container/90 backdrop-blur-2xl rounded-2xl border border-secondary-fixed/30 shadow-[0_25px_60px_rgba(0,0,0,0.65)] hover:shadow-[0_30px_70px_rgba(238,220,154,0.25)] transition-all duration-300 cursor-pointer"
              >
                {/* Glare effect */}
                <div
                  ref={glareRef}
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 z-20"
                ></div>

                {/* Floating Top Badge */}
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-fixed text-[1.25rem]">diamond</span>
                    <span className="font-label-caps text-label-caps uppercase text-secondary-fixed tracking-widest font-bold">
                      Savile Row Masterpiece
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/80 border border-secondary-fixed/50 text-secondary-fixed font-label-caps text-[0.5625rem] tracking-wider uppercase font-bold">
                    01 / 15 Made
                  </span>
                </div>

                {/* Visual Image */}
                <div className="relative h-60 rounded-xl overflow-hidden my-space-xs bg-primary shadow-inner group">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-1hod0IPOth-hpTwy-jCOl8eVXCpZxZ842wRaoJvEsSzLSohhsLBv2rTjgsphZ9_jK99puqyRAEyBqkQTWbhkBPJt3uf1avl7wNClNosPAylrnSXZhNQmnc0zbfMEJWT2dMSERKjp8uf1muOnMeM0QJW7PRJYOax5whaXla2SyaUOFMd6SJu12cgWsX5JVoTHv7meR_xEnB2iVdn829Hn6sSN1ZIkTD_Fhc-0rh9B"
                    alt="Midnight Navy tuxedo lapel detail"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-md bg-primary-container/95 border border-secondary-fixed/40 backdrop-blur text-secondary-fixed font-label-caps text-label-caps tracking-widest uppercase flex items-center gap-1.5 shadow-md">
                    <span className="material-symbols-outlined text-[0.875rem]">straighten</span>
                    <span>Bespoke Hand-Canvas</span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="pt-space-xs flex items-center justify-between">
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-primary font-semibold tracking-wide">
                      Navy Pinstripe Tuxedo
                    </p>
                    <p className="font-body-sm text-body-sm text-primary-fixed-dim flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                      <span>Archival Peak Lapel 2-Piece</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-price-lg text-price-lg text-secondary-fixed font-bold tracking-tight">
                      $3,200
                    </p>
                    <p className="font-body-sm text-[0.6875rem] text-primary-fixed-dim uppercase tracking-wider">
                      Bespoke Fit
                    </p>
                  </div>
                </div>

                <div className="mt-space-sm pt-space-xs border-t border-tertiary-fixed-dim/20 flex items-center justify-between">
                  <span className="font-label-caps text-[0.625rem] uppercase text-primary-fixed-dim tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[0.875rem] text-secondary-fixed">touch_app</span>
                    Hover &amp; Tilt in 3D
                  </span>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 text-secondary-fixed hover:text-on-primary font-label-caps text-[0.6875rem] uppercase tracking-wider transition-colors"
                  >
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-[0.875rem]">arrow_outward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories Section */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div className="flex items-center gap-2 text-secondary">
                <span className="w-8 h-[2px] bg-secondary-fixed-dim"></span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest">
                  Sartorial Collections
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-1">
                Curated Categorizations
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Engineered silhouettes, tactile noble fabrics, and uncompromising heritage construction designed for enduring distinction.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {categories.map((cat, idx) => (
              <Link
                key={cat._id || cat.slug}
                to={`/shop?category=${cat.slug || cat._id}`}
                className="group relative flex flex-col h-[460px] overflow-hidden rounded-xl bg-surface-container shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container/95 via-primary-container/30 to-transparent"></div>
                </div>
                <div className="relative z-10 mt-auto p-space-md flex flex-col gap-1 text-on-primary">
                  <span className="font-label-caps text-label-caps uppercase text-secondary-fixed tracking-widest">
                    0{idx + 1} / Collection
                  </span>
                  <h3 className="font-headline-md text-headline-md font-bold uppercase tracking-wider text-on-primary">
                    {cat.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-primary-fixed-dim line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                  <div className="pt-space-sm flex items-center gap-2 text-secondary-fixed font-label-caps text-label-caps uppercase tracking-widest group-hover:text-on-primary transition-colors font-bold">
                    <span>Explore Collection</span>
                    <span className="material-symbols-outlined text-[1rem] transition-transform duration-300 group-hover:translate-x-1">
                      trending_flat
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sartorial Signatures (Featured / New Arrivals) */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          {/* Section Header & Tab Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-space-lg gap-space-md">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">
                New Arrivals Spotlight
              </span>
              <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-1">
                Sartorial Signatures
              </h2>
            </div>
            {/* Filter Pills */}
            <div className="flex items-center flex-wrap gap-2">
              {[
                { id: "all", label: "All Pieces" },
                { id: "outerwear", label: "Outerwear" },
                { id: "suiting", label: "Evening Suiting" },
                { id: "footwear", label: "Footwear" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="inline-block w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin mr-2"></span>
              Presenting sartorial creations...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {filteredProducts.slice(0, 8).map((product, idx) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  badge={idx === 0 ? "Exclusive" : idx === 1 ? "Best Seller" : idx === 2 ? "Limited Run" : ""}
                />
              ))}
            </div>
          )}

          {/* Bottom Discovery Link */}
          <div className="mt-space-lg text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-on-primary font-label-caps text-label-caps uppercase tracking-widest rounded shadow-sm transition-all duration-300 font-bold"
            >
              <span>View Complete Catalog ({featuredProducts.length}+ Items)</span>
              <span className="material-symbols-outlined text-[1.125rem]">north_east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Atelier Spotlight: The Art of Sartorial Perfection */}
      <section className="w-full bg-primary-container text-on-primary py-space-xl relative overflow-hidden">
        <div className="absolute -right-40 top-0 w-96 h-96 rounded-full bg-secondary-fixed/5 filter blur-3xl pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            {/* Visual Mosaic Left */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-space-sm">
              <div className="relative rounded-xl overflow-hidden h-80 shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-h-0_KyDYDXNqxkI2FcrWUyd1zv7EifqHqGHXu7Y_ObJkOx9R4tgnMvFNoidPTGp8IER3-7ucoPByLonqzaIYk_JCDn1Sn7Q2tej4rZrereQoD6PzMiVhGThtYTe-8cGIrQxgcN-RD1ODISXs36ldh5HTJ18tmxP2xsglDRdVUZnJpl907AA_jPeZUebD9kO3Xmr0zVjolAkkLBtjGDNCeZCSMt3J63Mm9gDzjgU3"
                  alt="Tailor drafting architectural silhouette"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden h-80 mt-8 shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzcJU-yL3a5vaokzuGOMYrWBFPNqOTYzQlCLWs0ULBa8QLtul1oCcRXqWNP9ai2urBWi2-RzRXQqtWXVGu3aWDVTrG0sp63MRoPFf4ysiDOzm3iV8j5aK0flZSOZilZJ0UEjXea1SSrEW_3IuszPAZqSCEIoKRprxSWGmOc8H-H-XllKCa3usz93gUQqn_imX2PMzJ5ahYqTTsS9QPPg8S72_I_8RYD6-_DpSy_gmo"
                  alt="Hand needle stitching macro detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Narrative Right */}
            <div className="lg:col-span-6 flex flex-col gap-space-md lg:pl-space-lg">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[2px] bg-secondary-fixed"></span>
                <span className="font-label-caps text-label-caps uppercase text-secondary-fixed tracking-widest">
                  Bespoke Heritage
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg uppercase text-on-primary tracking-wide leading-tight">
                The Art of Sartorial Perfection
              </h2>
              <blockquote className="font-body-lg text-body-lg text-surface-container-high italic leading-relaxed pl-space-sm border-l-2 border-secondary-fixed/60">
                “True elegance is not about drawing attention, it is about being impossible to forget. At RICHU, every seam is calculated with mathematical poise and sculpted for the man who moves nations.”
              </blockquote>
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed-dim border border-secondary-fixed/40">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvzXxo075Y9pb_fpqdMNPopAlwKr8oOMPInPy2caRzECg4MeD36EFBtDlmzBsz8SXrju-XnFx6laE5mtBgFEObvbTwRSpAfOdizftFaJQAwTtS4iwcqaa5qr4pd2IACEMqccpMHkLxu21RTZJevuoEocv4Jgc4UJh6R9OhaRRVVAZ2zJXalU8g25KuLOvg6-F8zONKiL9OUBO35UhAQXCXryBluGgv5gWRdqLARFlp"
                    alt="Matteo Santoro"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm font-semibold text-on-primary">Matteo Santoro</p>
                  <p className="font-body-sm text-body-sm text-secondary-fixed tracking-wider uppercase text-xs">
                    Head of Bespoke Tailoring, Milan
                  </p>
                </div>
              </div>

              {/* Craft Telemetry */}
              <div className="grid grid-cols-3 gap-space-sm py-space-sm">
                <div className="p-space-sm bg-surface-container-lowest/5 backdrop-blur rounded-lg">
                  <span className="font-display text-headline-md font-bold text-secondary-fixed">48+</span>
                  <p className="font-body-sm text-[0.75rem] text-primary-fixed-dim uppercase tracking-wider mt-1">
                    Hours Hand Labor
                  </p>
                </div>
                <div className="p-space-sm bg-surface-container-lowest/5 backdrop-blur rounded-lg">
                  <span className="font-display text-headline-md font-bold text-secondary-fixed">180s</span>
                  <p className="font-body-sm text-[0.75rem] text-primary-fixed-dim uppercase tracking-wider mt-1">
                    Wool Micron Count
                  </p>
                </div>
                <div className="p-space-sm bg-surface-container-lowest/5 backdrop-blur rounded-lg">
                  <span className="font-display text-headline-md font-bold text-secondary-fixed">3</span>
                  <p className="font-body-sm text-[0.75rem] text-primary-fixed-dim uppercase tracking-wider mt-1">
                    Personal Fittings
                  </p>
                </div>
              </div>

              <div className="pt-space-xs">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-space-lg py-3.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase tracking-widest rounded transition-all hover:bg-secondary-fixed-dim shadow-md font-bold"
                >
                  <span className="material-symbols-outlined text-[1rem]">calendar_today</span>
                  <span>Reserve Atelier Drop</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voices of Distinction / Client Testimonials */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">
              Discerning Clientele
            </span>
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-1">
              Voices of Distinction
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Trusted by captains of industry, global creative directors, and gentlemen of uncompromising standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-space-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[1.125rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                  “The cut of the double-breasted tuxedo is architectural mastery. It commands rooms in Zurich and Geneva effortlessly without screaming for validation.”
                </p>
              </div>
              <div className="pt-space-md flex items-center gap-space-sm border-t border-surface-container-low mt-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-bold text-xs">
                  JV
                </div>
                <div>
                  <p className="font-headline-sm text-sm font-bold text-on-surface">Julian Vance-Moreau</p>
                  <p className="font-body-sm text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
                    Managing Partner, Geneva
                  </p>
                </div>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-space-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[1.125rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                  “RICHU understands proportions like no modern fashion house. The cashmere overcoat moves with liquid grace, and the concierge delivery was flawless.”
                </p>
              </div>
              <div className="pt-space-md flex items-center gap-space-sm border-t border-surface-container-low mt-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div>
                  <p className="font-headline-sm text-sm font-bold text-on-surface">Lord Alistair Sterling</p>
                  <p className="font-body-sm text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
                    Art Director, Mayfair London
                  </p>
                </div>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-space-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[1.125rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                  “The Milan fitting session was an unforgettable experience. Four fittings later, it feels less like clothing and more like a second skin engineered for power.”
                </p>
              </div>
              <div className="pt-space-md flex items-center gap-space-sm border-t border-surface-container-low mt-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-bold text-xs">
                  KT
                </div>
                <div>
                  <p className="font-headline-sm text-sm font-bold text-on-surface">Kaelen Thorne</p>
                  <p className="font-body-sm text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
                    Venture Principal, New York
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
