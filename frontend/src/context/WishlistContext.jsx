import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as wishlistService from "../services/wishlistService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [], totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch (err) {
      console.error("Wishlist refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    const res = await wishlistService.toggleWishlist(productId);
    if (res.success && res.data) {
      setWishlist(res.data);
    }
    return res;
  };

  const removeFromWishlist = async (productId) => {
    const res = await wishlistService.removeFromWishlist(productId);
    if (res.success && res.data) {
      setWishlist(res.data);
    }
    return res;
  };

  const isInWishlist = (productId) => {
    if (!wishlist.products) return false;
    return wishlist.products.some(
      (p) => (p._id || p).toString() === productId.toString()
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.products?.length || 0,
        loading,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
