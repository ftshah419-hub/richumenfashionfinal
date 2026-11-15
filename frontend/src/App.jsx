import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Account from "./pages/account/Account";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Reviews from "./pages/admin/Reviews";
import AuditLogs from "./pages/admin/AuditLogs";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
            {!isAdminRoute && <Navbar />}
            <main className={isAdminRoute ? "flex-grow" : "flex-grow pt-28"}>
              <Routes>
                {/* Storefront Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:identifier" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Customer Routes */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

                {/* Complete Protected Admin Panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                </Route>
              </Routes>
            </main>
            {!isAdminRoute && <Footer />}
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}