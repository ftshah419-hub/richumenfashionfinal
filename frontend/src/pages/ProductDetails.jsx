import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import * as productService from "../services/productService";
import * as reviewService from "../services/reviewService";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Reviews State
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0, ratingDistribution: {} });
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState("reviews"); // "specs", "fit", "reviews"

  useEffect(() => {
    async function loadProductAndReviews() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await productService.getProductByIdOrSlug(identifier);
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);

          // Select first available variant with stock, or first variant
          const defaultVariant = (prod.variants || []).find((v) => v.stock > 0) || prod.variants?.[0] || null;
          setSelectedVariant(defaultVariant);

          // Fetch reviews
          const reviewsRes = await reviewService.getProductReviews(prod._id);
          if (reviewsRes.success && reviewsRes.data) {
            setReviewsData(reviewsRes.data);
          }

          // Fetch related products
          const relatedRes = await productService.getFeaturedProducts(4);
          if (relatedRes.success && relatedRes.data) {
            setRelatedProducts(relatedRes.data.filter((p) => p._id !== prod._id));
          }
        }
      } catch (err) {
        console.error("Product load error:", err);
        setErrorMsg(err.response?.data?.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    loadProductAndReviews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [identifier]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selectedVariant) {
      setErrorMsg("Please select a size/variant");
      return;
    }

    if (selectedVariant.stock < quantity) {
      setErrorMsg(`Only ${selectedVariant.stock} units available in stock`);
      return;
    }

    try {
      setAddingToCart(true);
      setErrorMsg("");
      await addToCart(product._id, selectedVariant._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      console.error("Add to cart error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to add to bag");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewSuccessMsg("");
      await reviewService.submitReview({
        productId: product._id,
        rating: newRating,
        comment: newComment
      });

      setNewComment("");
      setReviewSuccessMsg("Your review has been verified and published to the atelier.");

      // Refresh reviews
      const reviewsRes = await reviewService.getProductReviews(product._id);
      if (reviewsRes.success && reviewsRes.data) {
        setReviewsData(reviewsRes.data);
      }
    } catch (err) {
      console.error("Review submit error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="w-10 h-10 rounded-full border-2 border-secondary border-t-transparent animate-spin mb-4"></span>
        <p className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">
          Preparing Atelier Showroom...
        </p>
      </div>
    );
  }

  if (errorMsg && !product) {
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto py-24 text-center px-4">
        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
          Garment Not Found
        </h2>
        <p className="text-on-surface-variant mt-2 mb-6">{errorMsg}</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-colors"
        >
          Return to Collection
        </Link>
      </div>
    );
  }

  const images = product?.images?.length ? product.images : [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDYDDo8MVMK2kXAM9h8RVRAzp7ac3V7Vjt1loiCsGF2tFL6uVW2RqeOEMKYU9Or6WRQbW776xgP2TZgravGml_7agsR8uIZw-lSgHnuuL-iLDDiXYAf1Yekk0Qkfa3z-5TgDsWGqbtbkH5WobMhjmqDcS3LcuwcLGkQ1a6A4lo11qCG7Ywi8GmYMOUYrTYwkKEqK33HQs4kDVXSF_WS2xLrLAHB6fCI4qy1r5iIbJ1F"
  ];

  const currentPrice = selectedVariant?.priceOverride || product?.price || 0;
  const isFavorited = isInWishlist(product?._id);

  return (
    <div className="flex flex-col w-full">
      {/* Top Ribbon & Breadcrumb */}
      <section className="w-full bg-surface-container-low/70 py-space-xs border-b border-surface-container-high">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex flex-wrap items-center justify-between gap-y-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[0.625rem]">
            <Link to="/" className="hover:text-tertiary transition-colors">Home</Link>
            <span className="text-tertiary-fixed-dim">/</span>
            <Link to="/shop" className="hover:text-tertiary transition-colors">Shop</Link>
            <span className="text-tertiary-fixed-dim">/</span>
            <span className="text-on-surface font-semibold truncate max-w-xs">{product?.name}</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed font-label-caps text-[0.5625rem] tracking-widest uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Salon Private Drop • Limited Allocation
            </span>
          </div>
        </div>
      </section>

      {/* Main Exhibition Stage */}
      <section className="w-full py-space-md lg:py-space-lg">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start">
            {/* Left: Gallery & Main Stage */}
            <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-space-md">
              {/* Thumbnail Bar */}
              <div className="flex lg:flex-col gap-space-xs overflow-x-auto lg:overflow-visible shrink-0 pb-2 lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`gallery-thumb group relative w-16 h-24 lg:w-20 lg:h-28 rounded overflow-hidden shadow-sm transition-all focus:outline-none border ${
                      selectedImage === idx
                        ? "border-secondary-fixed ring-2 ring-secondary-fixed/50"
                        : "border-surface-container-high opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Stage Display */}
              <div className="relative flex-1 w-full bg-surface-container rounded-xl overflow-hidden shadow-xl aspect-[3/4] max-h-[780px]">
                <img
                  src={images[selectedImage]}
                  alt={product?.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/85 backdrop-blur-md text-tertiary-fixed font-label-caps text-label-caps uppercase tracking-widest shadow-md">
                    <span className="material-symbols-outlined text-[0.875rem]">verified</span>
                    Savile Row Master Bespoke
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface/90 backdrop-blur-sm text-on-surface font-label-caps text-[0.5625rem] uppercase tracking-widest shadow-sm">
                    Super 180s Merino • Biella Italy
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Specifications & Transaction Matrix */}
            <div className="lg:col-span-5 flex flex-col pt-space-xs">
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-secondary font-bold">
                  {product?.brand || "RICHU Atelier"}
                </span>
                <span className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant">
                  SKU: {selectedVariant?.sku || "RCH-ATELIER"}
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
                {product?.name}
              </h1>

              {/* Ratings Summary */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-secondary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-sm"
                      style={star <= Math.round(reviewsData.averageRating) ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="font-headline-sm text-xs font-bold text-on-surface">
                  {reviewsData.averageRating || 5.0}
                </span>
                <span className="text-on-surface-variant text-xs">
                  ({reviewsData.totalReviews} Dispatches)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="font-price-lg text-2xl font-bold text-secondary">
                  ${currentPrice?.toLocaleString()}
                </span>
                <span className="font-label-caps text-xs uppercase text-on-surface-variant tracking-wider">
                  Bespoke Hand-Finished Fit
                </span>
              </div>

              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {product?.description}
              </p>

              {/* Variant / Size Selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-xs uppercase tracking-wider text-on-surface font-bold">
                    Select Sizing:
                  </span>
                  <span className="text-xs text-secondary hover:underline cursor-pointer">
                    Sartorial Size Guide
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product?.variants || []).map((v) => {
                    const isSelected = selectedVariant?._id === v._id;
                    const inStock = v.stock > 0;
                    return (
                      <button
                        key={v._id}
                        type="button"
                        disabled={!inStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`min-w-12 h-10 px-3 rounded flex items-center justify-center font-bold text-xs border transition-all ${
                          isSelected
                            ? "bg-primary-container text-secondary-fixed border-secondary-fixed ring-2 ring-secondary-fixed/40 shadow-sm"
                            : inStock
                            ? "bg-surface-container-low text-on-surface border-surface-container-high hover:border-secondary"
                            : "bg-surface-container-highest text-on-surface-variant/40 border-dashed border-outline-variant cursor-not-allowed line-through"
                        }`}
                      >
                        {v.size} ({v.color})
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="font-body-sm text-xs mt-2 text-on-surface-variant flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedVariant.stock > 3 ? "bg-green-600" : selectedVariant.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-red-600"
                      }`}
                    ></span>
                    <span>
                      {selectedVariant.stock > 3
                        ? `Bolt Allocated: ${selectedVariant.stock} pieces in Milan Atelier`
                        : selectedVariant.stock > 0
                        ? `Urgent: Only ${selectedVariant.stock} pieces remaining`
                        : "Currently Allocated / Out of Stock"}
                    </span>
                  </p>
                )}
              </div>

              {/* Quantity Control & Actions */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center bg-surface-container-low rounded border border-surface-container-high px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-on-surface hover:text-secondary"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-on-surface">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-on-surface hover:text-secondary"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    {addedToCart ? "done" : "shopping_bag"}
                  </span>
                  <span>
                    {addingToCart
                      ? "Allocating Bolt..."
                      : addedToCart
                      ? "Allocated to Bag"
                      : "Add to Atelier Bag"}
                  </span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product?._id)}
                  className={`w-12 h-12 rounded border flex items-center justify-center transition-colors shadow-sm ${
                    isFavorited
                      ? "bg-secondary text-on-secondary border-secondary"
                      : "bg-surface-container-low border-surface-container-high text-on-surface hover:text-error"
                  }`}
                  title="Save to Salon Vault"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 p-2 bg-error-container text-error text-xs rounded">
                  {errorMsg}
                </div>
              )}

              {/* Guarantees Accordion */}
              <div className="mt-8 border-t border-surface-container-high pt-4 flex flex-col gap-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">straighten</span>
                  <span>Bespoke Hand-Canvas Construction with Milanese Milan finish</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">local_shipping</span>
                  <span>Complimentary White Glove Express Courier on orders over $500</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">published_with_changes</span>
                  <span>Guaranteed Sartorial Fit or Complimentary Re-Cut Atelier Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section: Specs, Size Guide, Reviews */}
      <section className="w-full bg-surface-container-lowest py-space-xl border-t border-surface-container-high">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          {/* Tab Buttons */}
          <div className="flex items-center gap-4 border-b border-surface-container-high pb-3 mb-8">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`font-label-caps text-xs uppercase tracking-widest pb-3 relative transition-colors ${
                activeTab === "reviews"
                  ? "text-secondary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Patron Reviews &amp; Dispatches ({reviewsData.totalReviews})
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`font-label-caps text-xs uppercase tracking-widest pb-3 relative transition-colors ${
                activeTab === "specs"
                  ? "text-secondary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Fabric &amp; Architecture
            </button>
            <button
              onClick={() => setActiveTab("fit")}
              className={`font-label-caps text-xs uppercase tracking-widest pb-3 relative transition-colors ${
                activeTab === "fit"
                  ? "text-secondary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Atelier Sizing Guide
            </button>
          </div>

          {/* TAB 1: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              {/* Reviews Summary Left */}
              <div className="lg:col-span-4 bg-surface-container-low p-space-md rounded-xl">
                <span className="font-label-caps text-[0.625rem] text-secondary uppercase tracking-widest block mb-1">
                  Atelier Client Satisfaction
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold text-on-surface">
                    {reviewsData.averageRating || 5.0}
                  </span>
                  <span className="text-on-surface-variant text-sm">out of 5.0</span>
                </div>

                <div className="flex items-center text-secondary my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-lg"
                      style={star <= Math.round(reviewsData.averageRating || 5) ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Based on {reviewsData.totalReviews} verified private commissions
                </p>

                {/* Rating Distribution */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-high">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsData.ratingDistribution?.[stars] || 0;
                    const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : stars === 5 ? 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right">{stars}</span>
                        <span className="material-symbols-outlined text-[0.875rem] text-secondary">star</span>
                        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-on-surface-variant">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Form Trigger */}
                <div className="mt-6 pt-4 border-t border-surface-container-high">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface mb-2">
                    Submit Patron Review
                  </h4>
                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                      <div>
                        <label className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant block mb-1">
                          Rating Score:
                        </label>
                        <div className="flex items-center gap-1 text-secondary">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none"
                            >
                              <span
                                className="material-symbols-outlined text-2xl hover:scale-110 transition-transform"
                                style={star <= newRating ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                star
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant block mb-1">
                          Written Dispatch:
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Detail your fitting experience, fabric drape, and sartorial impact..."
                          className="w-full bg-surface-container-lowest p-2 rounded border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-secondary"
                        />
                      </div>

                      {reviewSuccessMsg && (
                        <p className="text-xs text-secondary font-medium">{reviewSuccessMsg}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="py-2 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-colors font-bold disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting..." : "Publish Review"}
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs text-on-surface-variant">
                      <Link to="/login" className="text-secondary font-bold underline">
                        Login
                      </Link>{" "}
                      to leave a verified patron dispatch.
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List Right */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {reviewsData.reviews?.length > 0 ? (
                  reviewsData.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-space-md bg-surface-container-low rounded-xl border border-surface-container-high"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-sm font-bold text-on-surface">
                            {rev.user?.name || "Distinguished Patron"}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed font-label-caps text-[0.5625rem] tracking-wider uppercase font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[0.75rem]">verified</span>
                              Verified Commission
                            </span>
                          )}
                        </div>
                        <span className="text-[0.6875rem] text-on-surface-variant">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center text-secondary mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="material-symbols-outlined text-sm"
                            style={star <= rev.rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            star
                          </span>
                        ))}
                      </div>

                      <p className="font-body-md text-sm text-on-surface italic leading-relaxed">
                        “{rev.comment}”
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
                    <p className="font-body-md text-sm">
                      Be the first distinguished patron to submit a review for this archival specimen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPECS */}
          {activeTab === "specs" && (
            <div className="max-w-3xl flex flex-col gap-4 text-sm text-on-surface">
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
                <div>
                  <span className="font-label-caps text-xs uppercase text-on-surface-variant block">Weft &amp; Warp</span>
                  <span className="font-semibold text-on-surface">Super 180s Wool &amp; Mulberry Silk</span>
                </div>
                <div>
                  <span className="font-label-caps text-xs uppercase text-on-surface-variant block">Weaving Origin</span>
                  <span className="font-semibold text-on-surface">Biella &amp; Lake Como, Italy</span>
                </div>
                <div>
                  <span className="font-label-caps text-xs uppercase text-on-surface-variant block">Lapel Architecture</span>
                  <span className="font-semibold text-on-surface">Hand-Padded Peak Lapel with Milanese Stitch</span>
                </div>
                <div>
                  <span className="font-label-caps text-xs uppercase text-on-surface-variant block">Hardware</span>
                  <span className="font-semibold text-on-surface">Genuine Hand-Carved Water Buffalo Horn</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIT */}
          {activeTab === "fit" && (
            <div className="max-w-3xl overflow-x-auto">
              <table className="w-full text-xs text-left text-on-surface border border-surface-container-high rounded-xl overflow-hidden">
                <thead className="bg-primary-container text-on-primary font-label-caps uppercase">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest (Inches)</th>
                    <th className="p-3">Waist (Inches)</th>
                    <th className="p-3">Sleeve Length</th>
                    <th className="p-3">Shoulder Breadth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  <tr><td className="p-3 font-bold">S (38R)</td><td className="p-3">38"</td><td className="p-3">32"</td><td className="p-3">33.5"</td><td className="p-3">17.5"</td></tr>
                  <tr><td className="p-3 font-bold">M (40R)</td><td className="p-3">40"</td><td className="p-3">34"</td><td className="p-3">34.0"</td><td className="p-3">18.0"</td></tr>
                  <tr><td className="p-3 font-bold">L (42R)</td><td className="p-3">42"</td><td className="p-3">36"</td><td className="p-3">34.5"</td><td className="p-3">18.5"</td></tr>
                  <tr><td className="p-3 font-bold">XL (44R)</td><td className="p-3">44"</td><td className="p-3">38"</td><td className="p-3">35.0"</td><td className="p-3">19.0"</td></tr>
                  <tr><td className="p-3 font-bold">XXL (46R)</td><td className="p-3">46"</td><td className="p-3">40"</td><td className="p-3">35.5"</td><td className="p-3">19.5"</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Complete The Look / Related Products */}
      {relatedProducts.length > 0 && (
        <section className="w-full bg-surface py-space-xl">
          <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-1">
              Curated Harmonies
            </span>
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mb-8">
              Complete The Look
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
