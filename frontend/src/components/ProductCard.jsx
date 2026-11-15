import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product, badge = "" }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const availableVariant = (product.variants || []).find((v) => v.stock > 0);
    if (!availableVariant) {
      navigate(`/product/${product.slug || product._id}`);
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, availableVariant._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Quick add failed:", err);
      navigate(`/product/${product.slug || product._id}`);
    } finally {
      setAdding(false);
    }
  };

  const displayImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.slug || product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-surface-container">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge */}
        {badge ? (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase tracking-widest shadow-sm">
            {badge}
          </div>
        ) : product.brand ? (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-primary-container/85 backdrop-blur-sm text-tertiary-fixed font-label-caps text-[0.5625rem] uppercase tracking-wider">
            {product.brand}
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label="Add to Wishlist"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-colors shadow-sm ${
            isFavorited
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container-lowest/80 text-on-surface hover:text-error hover:bg-surface-container-lowest"
          }`}
        >
          <span
            className="material-symbols-outlined text-[1.125rem]"
            style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
        </button>

        {/* Slide-Up Quick Add Button */}
        <div className="absolute inset-x-3 bottom-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding}
            className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-label-caps uppercase tracking-widest rounded shadow-md flex items-center justify-center gap-2 transition-colors font-bold"
          >
            <span className="material-symbols-outlined text-[1rem]">
              {added ? "check" : "shopping_bag"}
            </span>
            <span>{adding ? "Allocating..." : added ? "Added to Bag" : "Quick Add to Bag"}</span>
          </button>
        </div>
      </Link>

      <div className="p-space-sm flex flex-col flex-grow justify-between gap-2">
        <Link to={`/product/${product.slug || product._id}`}>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block">
            {product.category?.name || "Bespoke Collection"}
          </span>
          <h3 className="font-headline-sm text-sm font-semibold text-on-surface mt-0.5 group-hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2 border-t border-surface-container-low">
          <span className="font-price-lg text-price-lg text-secondary font-bold">
            ${product.price?.toLocaleString()}
          </span>
          <span className="font-body-sm text-[0.6875rem] text-on-surface-variant uppercase tracking-wider">
            {product.variants?.length ? `${product.variants.length} Sizes` : "Tailored Cut"}
          </span>
        </div>
      </div>
    </div>
  );
}
