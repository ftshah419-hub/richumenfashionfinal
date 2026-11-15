import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading, refreshCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Timer countdown simulation
  const [timeLeft, setTimeLeft] = useState(1182); // ~19m 42s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleMoveToWishlist = async (item) => {
    await toggleWishlist(item.productId);
    await removeFromCart(item._id);
  };

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "BEYOND") {
      setPromoApplied(true);
      setPromoDiscount(100);
    } else {
      alert("Invalid promotion code. Try 'BEYOND'");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">
          shopping_bag
        </span>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase tracking-wide">
          Your Atelier Bag
        </h2>
        <p className="text-on-surface-variant max-w-md mt-2 mb-6">
          Please log in to your distinguished patron account to access your reserved wardrobe and private commissions.
        </p>
        <Link
          to="/login"
          className="px-8 py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold"
        >
          Sign In to Access Bag
        </Link>
      </div>
    );
  }

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const shippingCharge = cart.shippingCharge || 0;
  const finalTotal = Math.max(0, subtotal + shippingCharge - promoDiscount);

  return (
    <div className="flex flex-col w-full">
      {/* Top Hold Timer Ribbon */}
      <div className="w-full bg-surface-container-high py-space-xs px-margin-mobile lg:px-margin border-b border-surface-container-highest">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-base">verified</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-semibold text-xs">
              Complimentary White Glove Courier Unlocked ($500+ Order)
            </span>
          </div>
          <div className="flex items-center gap-space-sm text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-body-sm text-on-surface-variant">Fabric Hold Timer:</span>
            <span className="font-headline-sm text-sm text-on-surface font-bold tracking-widest text-secondary" id="reservation-timer">
              {formatTimer(timeLeft)}
            </span>
            <span className="font-body-sm text-on-surface-variant hidden sm:inline">
              to guarantee rare bolt allocation
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-margin-mobile lg:px-margin py-space-lg">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
          <div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary mb-space-xs font-bold">
              Haute Sartorial Selection
            </p>
            <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface font-bold tracking-tight">
              Your Atelier Bag
            </h1>
          </div>
          <div className="flex items-center gap-space-md text-xs">
            <span className="font-body-sm text-on-surface-variant">
              {cart.totalItems || 0} Tailored Creations Reserved
            </span>
            <Link
              to="/shop"
              className="font-label-caps text-label-caps uppercase text-secondary hover:text-on-surface transition-colors flex items-center gap-space-xs font-bold"
            >
              <span>Continue Discovering</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-surface-container-high shadow-sm my-8">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
              shopping_bag
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wider">
              Your Atelier Bag is Empty
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-2 mb-6">
              You currently have no pieces reserved. Explore our Savile Row bespoke suits, Mongolian cashmere, and handcrafted Italian footwear.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-all font-bold"
            >
              <span>Explore The Collection</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-lg items-start">
            {/* Bag Items Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-space-md">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container-high"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
                  <div className="flex flex-col sm:flex-row gap-space-md items-start">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-44 h-56 flex-shrink-0 bg-surface-container-low rounded-lg overflow-hidden relative">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"}
                        alt={item.productName}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-primary-container/90 backdrop-blur-sm text-tertiary-fixed font-label-caps text-[0.625rem] px-2 py-1 rounded">
                        {item.size}
                      </span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 w-full flex flex-col justify-between self-stretch">
                      <div>
                        <div className="flex items-start justify-between gap-space-xs">
                          <div>
                            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-1">
                              Bespoke Item
                            </span>
                            <Link to={`/product/${item.slug || item.productId}`}>
                              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface hover:text-secondary transition-colors">
                                {item.productName}
                              </h3>
                            </Link>
                          </div>
                          <div className="text-right">
                            <span className="font-price-lg text-price-lg text-secondary font-bold">
                              ${item.itemTotal?.toLocaleString()}
                            </span>
                            <span className="block font-body-sm text-[0.6875rem] text-on-surface-variant">
                              ${item.unitPrice?.toLocaleString()} each
                            </span>
                          </div>
                        </div>

                        {/* Specs Pill Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mt-space-sm py-space-xs px-space-sm bg-surface-container-low rounded text-xs">
                          <div>
                            <span className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant block">
                              Sizing Cut
                            </span>
                            <span className="font-semibold text-on-surface">{item.size}</span>
                          </div>
                          <div>
                            <span className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant block">
                              Color Pallet
                            </span>
                            <span className="font-semibold text-on-surface">{item.color}</span>
                          </div>
                          <div>
                            <span className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant block">
                              Stock Status
                            </span>
                            <span className="font-semibold text-green-700">
                              {item.inStock ? "Verified Available" : "Limited"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-xs border-t border-surface-container-low">
                        <div className="flex items-center bg-surface-container-low rounded px-2 py-1 gap-space-sm border border-surface-container-high">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-on-surface hover:text-secondary font-bold text-sm bg-surface-container-lowest rounded transition-colors disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="font-price-md text-sm w-6 text-center font-bold text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center text-on-surface hover:text-secondary font-bold text-sm bg-surface-container-lowest rounded transition-colors disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-space-md text-xs">
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="font-label-caps text-[0.6875rem] uppercase text-on-surface-variant hover:text-secondary flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">bookmark</span>
                            <span>Save to Salon Vault</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id)}
                            className="font-label-caps text-[0.6875rem] uppercase text-error hover:opacity-80 flex items-center gap-1 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>Release</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-space-md sticky top-28">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface uppercase tracking-wider border-b border-surface-container-high pb-2">
                Sartorial Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Garments Subtotal:</span>
                  <span className="font-semibold text-on-surface">${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Diplomatic White Glove Courier:</span>
                  <span className="font-semibold text-on-surface">
                    {shippingCharge === 0 ? (
                      <span className="text-green-700 uppercase font-bold text-xs">Complimentary</span>
                    ) : (
                      `$${shippingCharge}`
                    )}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex items-center justify-between text-secondary">
                    <span>VIP Privilege Code (BEYOND):</span>
                    <span className="font-bold">-${promoDiscount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-surface-container-high flex items-baseline justify-between">
                  <span className="font-label-caps uppercase text-on-surface font-bold">
                    Total Valuation:
                  </span>
                  <span className="font-price-lg text-2xl font-bold text-secondary">
                    ${finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={applyPromo} className="flex gap-2 pt-2 border-t border-surface-container-high">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Code: BEYOND"
                  className="flex-1 bg-surface-container-low px-3 py-2 text-xs rounded border border-surface-container-high focus:outline-none focus:border-secondary uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed text-xs font-label-caps uppercase rounded font-bold"
                >
                  Apply
                </button>
              </form>

              {/* Proceed to Checkout CTA */}
              <Link
                to="/checkout"
                className="w-full py-4 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all text-center font-bold flex items-center justify-center gap-2"
              >
                <span>Proceed to Sovereign Checkout</span>
                <span className="material-symbols-outlined text-sm">lock</span>
              </Link>

              {/* Security Badges */}
              <div className="flex flex-col gap-2 pt-2 text-[0.6875rem] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">security</span>
                  <span>256-Bit Encrypted Sovereign Payment Processing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  <span>Backend HMAC-SHA256 Signature Verification</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
