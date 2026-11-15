import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    shippingCharge: 0,
    finalTotal: 0
  });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalItems: 0, subtotal: 0, shippingCharge: 0, finalTotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Cart refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, variantId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    const res = await cartService.addToCart(productId, variantId, quantity);
    if (res.success && res.data) {
      setCart(res.data);
    }
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartService.updateCartItem(itemId, quantity);
    if (res.success && res.data) {
      setCart(res.data);
    }
    return res;
  };

  const removeFromCart = async (itemId) => {
    const res = await cartService.removeCartItem(itemId);
    if (res.success && res.data) {
      setCart(res.data);
    }
    return res;
  };

  const clearCart = async () => {
    const res = await cartService.clearCart();
    if (res.success && res.data) {
      setCart(res.data);
    }
    return res;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.totalItems || 0,
        subtotal: cart.subtotal || 0,
        shippingCharge: cart.shippingCharge || 0,
        finalTotal: cart.finalTotal || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
