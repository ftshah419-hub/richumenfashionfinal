import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import * as userService from "../services/userService";
import * as orderService from "../services/orderService";

export default function Profile() {
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get("tab") || "wishlist";

  const [addresses, setAddresses] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Profile Edit State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "HOME",
    isDefault: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }

    async function loadData() {
      try {
        const [addrRes, ordersRes] = await Promise.all([
          userService.getAddresses(),
          orderService.getUserOrders()
        ]);

        if (addrRes.success && addrRes.data) {
          setAddresses(addrRes.data);
        }

        if (ordersRes.success && ordersRes.data) {
          setOrdersCount(ordersRes.data.length);
          const spent = ordersRes.data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          setTotalSpent(spent);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg("");
      await userService.updateProfile({ name, phone });
      await refreshProfile();
      setProfileMsg("Profile updated successfully");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingAddressId) {
        res = await userService.updateAddress(editingAddressId, addressForm);
      } else {
        res = await userService.addAddress(addressForm);
      }
      if (res.success && res.data) {
        setAddresses(res.data);
        setShowAddressModal(false);
        setEditingAddressId(null);
        setAddressForm({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          addressType: "HOME",
          isDefault: false
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Remove this residence from your private portfolio?")) return;
    try {
      const res = await userService.deleteAddress(addressId);
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await userService.setDefaultAddress(addressId);
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      alert("Failed to set default address");
    }
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType || "HOME",
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  const handleMoveToBag = async (product) => {
    const defaultVariant = (product.variants || []).find((v) => v.stock > 0) || product.variants?.[0];
    if (defaultVariant) {
      await addToCart(product._id, defaultVariant._id, 1);
      await removeFromWishlist(product._id);
      navigate("/cart");
    } else {
      navigate(`/product/${product.slug || product._id}`);
    }
  };

  const wishlistProducts = wishlist.products || [];

  return (
    <div className="flex flex-col w-full">
      {/* Profile Banner */}
      <section className="relative w-full bg-primary-container text-on-primary overflow-hidden shadow-xl border-b border-tertiary-fixed-dim/20">
        <div className="relative max-w-[1440px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
            {/* Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-secondary to-secondary-fixed flex items-center justify-center font-bold text-2xl text-on-secondary-fixed shadow-md">
                  {user?.name?.slice(0, 2).toUpperCase() || "EV"}
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs shadow">
                  ★
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-caps text-label-caps uppercase text-tertiary-fixed tracking-[0.2em] bg-surface-container-highest/20 px-2.5 py-1 rounded-full backdrop-blur-sm text-[0.625rem]">
                    Atelier Circle — Tier IV Permanent Sovereign Member
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold tracking-tight text-on-primary mt-1">
                  {user?.name}
                </h1>
                <p className="text-xs text-primary-fixed-dim">
                  {user?.email} • Tel: {user?.phone || "Private Line"}
                </p>
              </div>
            </div>

            {/* Telemetry */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto bg-surface-container-highest/10 backdrop-blur-md p-4 rounded-xl border border-secondary-fixed/20">
              <div className="flex flex-col px-3 py-1">
                <span className="font-label-caps uppercase text-tertiary-fixed tracking-widest text-[0.625rem]">
                  Commissions
                </span>
                <span className="font-headline-md text-xl font-bold text-on-primary mt-0.5">
                  {ordersCount}
                </span>
                <span className="text-[0.6875rem] text-primary-fixed-dim">Finished</span>
              </div>
              <div className="flex flex-col px-3 py-1 bg-surface-container-highest/20 rounded-lg">
                <span className="font-label-caps uppercase text-secondary-fixed tracking-widest text-[0.625rem]">
                  Lifetime Asset
                </span>
                <span className="font-headline-md text-xl font-bold text-secondary-fixed mt-0.5">
                  ${totalSpent.toLocaleString()}
                </span>
                <span className="text-[0.6875rem] text-primary-fixed-dim">Haute Invest</span>
              </div>
              <div className="flex flex-col px-3 py-1">
                <span className="font-label-caps uppercase text-tertiary-fixed tracking-widest text-[0.625rem]">
                  Vault Saved
                </span>
                <span className="font-headline-md text-xl font-bold text-on-primary mt-0.5">
                  {wishlistProducts.length}
                </span>
                <span className="text-[0.6875rem] text-primary-fixed-dim">Treasures</span>
              </div>
            </div>
          </div>

          {/* Atelier Tabbed Rail */}
          <div className="flex items-center gap-2 mt-space-lg overflow-x-auto pb-2">
            {[
              { id: "wishlist", label: `Sartorial Wishlist (${wishlistProducts.length})`, icon: "favorite" },
              { id: "profile", label: "Profile & Telemetry", icon: "person" },
              { id: "residences", label: `Saved Residences (${addresses.length})`, icon: "home_pin" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`px-space-md py-2.5 rounded-full font-label-caps text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-secondary-fixed text-on-secondary-fixed shadow-[0_0_15px_rgba(254,214,91,0.3)] font-bold"
                    : "text-on-primary-container hover:text-on-primary hover:bg-surface-container-highest/15"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Canvas Content */}
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin py-space-xl w-full">
        {/* TAB 1: WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-space-sm border-b border-surface-container-high">
              <div>
                <span className="font-label-caps text-xs uppercase text-secondary tracking-[0.2em] font-bold">
                  Curated Chamber
                </span>
                <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface mt-1">
                  Sartorial Wishlist Treasures
                </h2>
                <p className="text-xs text-on-surface-variant max-w-xl mt-1">
                  Reserved hand-cut garments awaiting seasonal allocation, priority fitting, or transfer to your private atelier delivery box.
                </p>
              </div>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-surface-container-high shadow-sm">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
                  favorite_border
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wider">
                  Your Salon Vault is Empty
                </h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-2 mb-6">
                  Save pieces to your vault for private viewing and priority allocation before seasonal archival releases.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-all font-bold"
                >
                  <span>Discover Curations</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {wishlistProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-surface-container-high"
                  >
                    <Link to={`/product/${prod.slug || prod._id}`} className="block relative aspect-[3/4] overflow-hidden bg-surface-container">
                      <img
                        src={prod.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWishlist(prod._id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 text-error flex items-center justify-center hover:bg-surface-container-lowest transition-colors shadow-sm"
                        title="Remove from vault"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </Link>

                    <div className="p-space-sm flex flex-col flex-grow justify-between gap-3">
                      <div>
                        <span className="font-label-caps text-[0.625rem] text-on-surface-variant uppercase tracking-wider block">
                          {prod.category?.name || "RICHU Atelier"}
                        </span>
                        <Link to={`/product/${prod.slug || prod._id}`}>
                          <h4 className="font-headline-sm text-sm font-semibold text-on-surface hover:text-secondary transition-colors line-clamp-1 mt-0.5">
                            {prod.name}
                          </h4>
                        </Link>
                        <p className="font-price-md text-sm font-bold text-secondary mt-1">
                          ${prod.price?.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveToBag(prod)}
                        className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-colors font-bold flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <div className="max-w-2xl bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Atelier Patron Credentials
            </h3>

            {profileMsg && (
              <div className="p-3 bg-secondary-fixed/20 text-secondary text-xs rounded mb-4 font-medium">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Full Name / Title:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low p-2.5 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Primary Email (Read-Only Sovereign ID):
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-surface-container-highest p-2.5 rounded border border-surface-container-high text-on-surface-variant cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Direct Concierge Contact / Mobile:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container-low p-2.5 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded transition-all font-bold disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Update Credentials"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: RESIDENCES (ADDRESSES) */}
        {activeTab === "residences" && (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface uppercase tracking-wider">
                  Registered Sovereign Residences ({addresses.length})
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Designate primary domiciles for bespoke courier deliveries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    fullName: user?.name || "",
                    phone: user?.phone || "",
                    street: "",
                    city: "",
                    state: "",
                    pincode: "",
                    addressType: "HOME",
                    isDefault: addresses.length === 0
                  });
                  setShowAddressModal(true);
                }}
                className="px-4 py-2 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-wider rounded font-bold transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Residence</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-space-md rounded-xl border flex flex-col justify-between shadow-sm relative ${
                    addr.isDefault
                      ? "bg-surface-container-lowest border-secondary ring-1 ring-secondary"
                      : "bg-surface-container-lowest border-surface-container-high"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-label-caps text-xs uppercase font-bold text-on-surface">
                        {addr.addressType || "HOME"}
                      </span>
                      {addr.isDefault ? (
                        <span className="px-2 py-0.5 rounded bg-secondary-fixed/50 text-on-secondary-fixed text-[0.625rem] font-bold uppercase">
                          Default Domicile
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          className="text-[0.625rem] font-label-caps uppercase text-secondary hover:underline"
                        >
                          Make Default
                        </button>
                      )}
                    </div>
                    <p className="font-headline-sm text-sm font-bold text-on-surface mt-2">
                      {addr.fullName}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 font-mono">
                      Tel: {addr.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-surface-container-low text-xs">
                    <button
                      onClick={() => openEditAddress(addr)}
                      className="text-secondary hover:underline font-label-caps uppercase text-[0.6875rem]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-error hover:opacity-80 font-label-caps uppercase text-[0.6875rem]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-secondary-fixed/40 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                {editingAddressId ? "Modify Residence" : "Register New Residence"}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Full Name / Title:
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    Phone / Concierge:
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    Residence Classification:
                  </label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  >
                    <option value="HOME">HOME / RESIDENCE</option>
                    <option value="WORK">OFFICE / EMBASSY</option>
                    <option value="OTHER">PRIVATE ATELIER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Street Address:
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    City:
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    State / Region:
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    Postal Code:
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-secondary"
                />
                <span className="text-on-surface">Set as Primary Default Domicile</span>
              </label>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface uppercase font-label-caps"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps uppercase rounded font-bold"
                >
                  Save Residence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
