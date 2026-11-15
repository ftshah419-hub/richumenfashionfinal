import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "New Arrivals", path: "/shop?sort=newest" },
    { label: "My Orders", path: "/orders", authRequired: true }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-container shadow-[0_10px_30px_-10px_rgba(8,17,27,0.3)]">
        {/* VIP Announcement Ribbon */}
        <div className="w-full bg-primary-container py-space-xs text-center border-b border-tertiary-fixed-dim/20">
          <p className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-widest text-[0.625rem] sm:text-label-caps">
            Complimentary Worldwide Express Delivery on orders over $500 • Code: BEYOND | Concierge VIP Support
          </p>
        </div>

        {/* Main Navbar */}
        <div className="h-20 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-space-md">
            <Link to="/" className="flex items-center gap-space-sm">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm tracking-tighter">
                R
              </span>
              <span className="font-headline-sm text-headline-sm font-bold tracking-[0.2em] uppercase text-on-primary">
                RICHU
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-space-lg">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`font-label-caps text-label-caps uppercase transition-colors duration-200 relative py-space-xs after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-tertiary-fixed after:transition-all ${
                    isActive
                      ? "text-tertiary-fixed after:w-full"
                      : "text-on-primary hover:text-tertiary-fixed after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-space-md">
            {/* Search Trigger */}
            <button
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="text-on-primary hover:text-tertiary-fixed transition-colors p-space-xs flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[1.25rem]">search</span>
            </button>

            {/* Wishlist Icon */}
            <Link
              to={isAuthenticated ? "/profile?tab=wishlist" : "/login"}
              aria-label="Wishlist"
              className="relative text-on-primary hover:text-tertiary-fixed transition-colors p-space-xs flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[1.25rem]">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 rounded-full bg-secondary text-on-secondary font-label-caps text-[0.5625rem] flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative text-on-primary hover:text-tertiary-fixed transition-colors p-space-xs flex items-center justify-center group"
            >
              <span className="material-symbols-outlined text-[1.375rem] transition-transform duration-300 group-hover:scale-110">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-[0.5625rem] flex items-center justify-center font-bold ring-1 ring-primary-container">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Menu */}
            <div className="relative flex items-center pl-space-xs border-l border-tertiary-fixed-dim/20">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-on-primary hover:text-tertiary-fixed transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-tertiary-fixed-dim/40 flex items-center justify-center text-xs font-bold text-on-surface">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="hidden md:inline font-label-caps text-[0.6875rem] tracking-wider uppercase text-on-primary max-w-[120px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-primary-container border border-secondary-fixed/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-tertiary-fixed-dim/20">
                        <p className="font-label-caps text-[0.625rem] uppercase text-secondary-fixed tracking-wider">
                          Sovereign Patron
                        </p>
                        <p className="font-headline-sm text-sm font-semibold text-on-primary truncate">
                          {user?.name}
                        </p>
                        <p className="font-body-sm text-[0.6875rem] text-primary-fixed-dim truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-on-primary hover:bg-surface-container-highest/20 hover:text-secondary-fixed font-label-caps uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">person</span>
                        Atelier Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-on-primary hover:bg-surface-container-highest/20 hover:text-secondary-fixed font-label-caps uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">package_2</span>
                        My Commissions / Orders
                      </Link>

                      <Link
                        to="/profile?tab=residences"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-on-primary hover:bg-surface-container-highest/20 hover:text-secondary-fixed font-label-caps uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">home_pin</span>
                        Saved Residences
                      </Link>

                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-secondary-fixed hover:bg-surface-container-highest/20 font-label-caps uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                          Admin Atelier
                        </Link>
                      )}

                      <div className="border-t border-tertiary-fixed-dim/20 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-error hover:bg-surface-container-highest/20 font-label-caps uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="font-label-caps text-label-caps uppercase text-on-primary hover:text-tertiary-fixed tracking-wider py-1 px-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-block font-label-caps text-label-caps uppercase bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim py-1.5 px-3 rounded tracking-wider transition-colors"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
