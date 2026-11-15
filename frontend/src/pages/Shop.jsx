import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridColumns, setGridColumns] = useState(4); // 3 or 4

  // Filter states
  const categoryParam = searchParams.get("category") || "";
  const sizeParam = searchParams.get("size") || "";
  const colorParam = searchParams.get("color") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const searchParam = searchParams.get("search") || "";
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await productService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const query = {
          sort: sortParam,
          category: categoryParam || undefined,
          size: sizeParam || undefined,
          color: colorParam || undefined,
          search: searchParam || undefined,
          maxPrice: maxPrice < 5000 ? maxPrice : undefined,
          limit: 50
        };
        const res = await productService.getProducts(query);
        if (res.success && res.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [categoryParam, sizeParam, colorParam, sortParam, searchParam, maxPrice]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMaxPrice(5000);
  };

  const hasActiveFilters = Boolean(
    categoryParam || sizeParam || colorParam || searchParam || maxPrice < 5000
  );

  return (
    <div className="flex flex-col w-full">
      {/* Top Editorial Banner */}
      <section className="relative w-full bg-primary-container text-on-primary py-space-lg px-margin-mobile lg:px-margin overflow-hidden shadow-md">
        <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col gap-space-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-primary-container font-label-caps text-label-caps uppercase tracking-widest text-[0.625rem]">
            <Link to="/" className="hover:text-tertiary-fixed transition-colors">Home</Link>
            <span className="text-tertiary-fixed-dim/40">/</span>
            <span className="text-tertiary-fixed">Haute Menswear Collections</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-[0.25em] block mb-space-xs">
                Atelier Curated Edition
              </span>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-primary tracking-tight">
                Men's Haute Sartorial Collection
              </h1>
            </div>
            <div className="flex items-center gap-space-sm bg-surface-container-highest/10 px-space-md py-space-xs rounded-full backdrop-blur-md border border-secondary-fixed/20">
              <span className="material-symbols-outlined text-secondary-fixed text-lg">hotel_class</span>
              <span className="font-body-sm text-body-sm text-surface-container-lowest font-medium tracking-wide">
                Showing {products.length} exclusive pieces
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Shopping Canvas */}
      <div className="max-w-[1440px] mx-auto w-full px-margin-mobile lg:px-margin py-space-lg">
        {/* Top Active Refinements & Sorting Bar */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-sm mb-space-lg shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md border border-surface-container-high">
          {/* Active Chips */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant mr-space-xs tracking-wider">
              Active Refinements:
            </span>

            {categoryParam && (
              <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface text-body-sm font-medium">
                <span>Category: {categoryParam}</span>
                <button onClick={() => updateParam("category", "")} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[0.875rem]">close</span>
                </button>
              </div>
            )}

            {sizeParam && (
              <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface text-body-sm font-medium">
                <span>Size: {sizeParam}</span>
                <button onClick={() => updateParam("size", "")} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[0.875rem]">close</span>
                </button>
              </div>
            )}

            {colorParam && (
              <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface text-body-sm font-medium">
                <span>Color: {colorParam}</span>
                <button onClick={() => updateParam("color", "")} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[0.875rem]">close</span>
                </button>
              </div>
            )}

            {searchParam && (
              <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface text-body-sm font-medium">
                <span>Search: "{searchParam}"</span>
                <button onClick={() => updateParam("search", "")} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[0.875rem]">close</span>
                </button>
              </div>
            )}

            {maxPrice < 5000 && (
              <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface text-body-sm font-medium">
                <span>Max: ${maxPrice}</span>
                <button onClick={() => setMaxPrice(5000)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[0.875rem]">close</span>
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="font-label-caps text-label-caps uppercase text-secondary hover:text-secondary-fixed-dim transition-colors ml-space-xs tracking-widest font-bold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sorter & View Density Controls */}
          <div className="flex items-center gap-space-md w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-space-xs">
              <label htmlFor="catalog-sort" className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider hidden sm:inline">
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="catalog-sort"
                  value={sortParam}
                  onChange={(e) => updateParam("sort", e.target.value)}
                  className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-space-lg rounded-lg focus:outline-none cursor-pointer border border-surface-container-high"
                >
                  <option value="newest">Newest Atelier Drops</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[1.125rem]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Density Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setGridColumns(3)}
                className={`p-1.5 rounded flex items-center justify-center transition-all ${
                  gridColumns === 3 ? "bg-surface-container-lowest shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                }`}
                title="3-Column Editorial Grid"
              >
                <span className="material-symbols-outlined text-[1.25rem]">view_module</span>
              </button>
              <button
                onClick={() => setGridColumns(4)}
                className={`p-1.5 rounded flex items-center justify-center transition-all ${
                  gridColumns === 4 ? "bg-surface-container-lowest shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                }`}
                title="4-Column Density Grid"
              >
                <span className="material-symbols-outlined text-[1.25rem]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-lg items-start">
          {/* LEFT FILTER SIDEBAR */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high sticky top-28">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-xl">tune</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Filters</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="font-label-caps text-label-caps uppercase text-secondary hover:text-on-surface transition-colors tracking-widest"
              >
                Reset
              </button>
            </div>

            {/* Categories Accordion */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-caps text-[0.6875rem] uppercase text-on-surface-variant tracking-wider font-bold mb-1">
                Collections
              </span>
              <button
                onClick={() => updateParam("category", "")}
                className={`text-left text-xs py-1.5 px-2 rounded transition-colors ${
                  !categoryParam ? "bg-primary-container text-secondary-fixed font-bold" : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                All Collections
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => updateParam("category", cat.slug || cat._id)}
                  className={`text-left text-xs py-1.5 px-2 rounded transition-colors truncate ${
                    categoryParam === (cat.slug || cat._id)
                      ? "bg-primary-container text-secondary-fixed font-bold"
                      : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Size Filter */}
            <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-high">
              <span className="font-label-caps text-[0.6875rem] uppercase text-on-surface-variant tracking-wider font-bold mb-1">
                Size Sizing
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["S", "M", "L", "XL", "XXL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => updateParam("size", sizeParam === sz ? "" : sz)}
                    className={`w-9 h-9 rounded text-xs font-bold transition-all flex items-center justify-center border ${
                      sizeParam === sz
                        ? "bg-primary-container text-secondary-fixed border-secondary-fixed shadow-sm"
                        : "bg-surface-container-low text-on-surface border-surface-container-high hover:border-secondary"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatch Filter */}
            <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-high">
              <span className="font-label-caps text-[0.6875rem] uppercase text-on-surface-variant tracking-wider font-bold mb-1">
                Atelier Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Navy", hex: "#0D1B2A" },
                  { name: "Black", hex: "#000000" },
                  { name: "Champagne", hex: "#ffe088" },
                  { name: "Camel", hex: "#bbab6d" },
                  { name: "White", hex: "#ffffff" },
                  { name: "Espresso", hex: "#3e2723" }
                ].map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateParam("color", colorParam === color.name ? "" : color.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                      colorParam === color.name
                        ? "border-secondary bg-secondary-fixed/20 text-on-surface font-bold"
                        : "border-surface-container-high bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    ></span>
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[0.6875rem] uppercase text-on-surface-variant tracking-wider font-bold">
                  Price Valuation
                </span>
                <span className="font-price-md text-xs font-bold text-secondary">
                  Up to ${maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>
          </aside>

          {/* RIGHT PRODUCTS GRID */}
          <main className="lg:col-span-9 flex flex-col">
            {loading ? (
              <div className="py-24 text-center text-on-surface-variant">
                <span className="inline-block w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin mr-3"></span>
                <p className="font-label-caps text-xs uppercase tracking-widest mt-3">
                  Retrieving Atelier Curations...
                </p>
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  gridColumns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
                } gap-gutter`}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-surface-container-high shadow-sm">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
                  content_cut
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wider">
                  No Atelier Pieces Found
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-2">
                  No bespoke garments currently match your selected filters. Try broadening your criteria or resetting your parameters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-2.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-all font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
