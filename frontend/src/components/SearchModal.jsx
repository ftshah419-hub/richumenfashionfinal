import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as productService from "../services/productService";

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ search: searchTerm, limit: 6 });
        if (res.success && res.products) {
          setResults(res.products);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectProduct = (product) => {
    onClose();
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    onClose();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-primary-container/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface-container-lowest border border-secondary-fixed/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-surface-container-highest flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-2xl">search</span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bespoke suits, cashmere, leather, overcoats..."
            className="flex-1 bg-transparent text-on-surface font-body-md text-base focus:outline-none placeholder:text-on-surface-variant"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="font-label-caps text-xs text-secondary hover:text-on-surface uppercase tracking-wider pl-2 border-l border-surface-container-highest"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-on-surface-variant font-body-sm">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin mr-2"></span>
              Consulting the atelier archives...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="font-label-caps text-[0.625rem] text-secondary uppercase tracking-widest px-2 mb-1">
                Atelier Catalog Matches ({results.length})
              </p>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"}
                    alt={product.name}
                    className="w-12 h-16 object-cover rounded bg-surface-container"
                  />
                  <div className="flex-1">
                    <p className="font-label-caps text-[0.5625rem] text-on-surface-variant uppercase tracking-wider">
                      {product.category?.name || "RICHU Atelier"}
                    </p>
                    <h4 className="font-headline-sm text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                      {product.name}
                    </h4>
                    <p className="font-price-md text-xs font-bold text-secondary mt-0.5">
                      ${product.price?.toLocaleString()}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-sm">
                    arrow_forward
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-surface-container-high text-center">
                <button
                  onClick={handleViewAll}
                  className="font-label-caps text-xs text-secondary hover:text-on-surface uppercase tracking-widest"
                >
                  View All Search Results &rarr;
                </button>
              </div>
            </div>
          ) : searchTerm.trim() ? (
            <div className="py-8 text-center text-on-surface-variant font-body-sm">
              No bespoke garments found matching "{searchTerm}".
            </div>
          ) : (
            <div className="py-6 text-center text-on-surface-variant font-body-sm">
              <p className="font-label-caps text-xs uppercase tracking-widest text-secondary mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Double-Breasted Suit", "Cashmere Overcoat", "Silk Evening Shirt", "Monkstrap", "Velvet Tuxedo"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSearchTerm(term)}
                      className="px-3 py-1 bg-surface-container text-xs rounded-full hover:bg-surface-container-high transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
