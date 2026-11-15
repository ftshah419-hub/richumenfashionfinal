import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as orderService from "../services/orderService";
import { useAuth } from "../context/AuthContext";

export default function MyOrders() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const justPlaced = searchParams.get("success") === "true";
  const newOrderId = searchParams.get("orderId");

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await orderService.getUserOrders();
        if (res.success && res.data) {
          setOrders(res.data);
          if (newOrderId) {
            setSelectedOrderId(newOrderId);
          } else if (res.data.length > 0) {
            setSelectedOrderId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated, newOrderId]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you wish to cancel this bespoke commission? Inventory will be released.")) {
      return;
    }
    try {
      setCancelling(true);
      setActionMsg("");
      const res = await orderService.cancelOrder(orderId, "Customer requested cancellation");
      if (res.success && res.data) {
        setActionMsg("Commission successfully cancelled and inventory restored.");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "CANCELLED" } : o))
        );
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      setActionMsg(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">
          package_2
        </span>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase tracking-wide">
          Sartorial Orders &amp; Tracking
        </h2>
        <p className="text-on-surface-variant max-w-md mt-2 mb-6">
          Please log in to your distinguished patron account to track live commissions and wardrobe provenance.
        </p>
        <Link
          to="/login"
          className="px-8 py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const selectedOrder = orders.find((o) => o._id === selectedOrderId) || orders[0] || null;

  // Progression milestones definition
  const milestones = [
    { key: "PLACED", label: "Commission Placed", icon: "edit_note" },
    { key: "CONFIRMED", label: "Atelier Verified", icon: "verified" },
    { key: "PROCESSING", label: "Master Tailoring", icon: "straighten" },
    { key: "SHIPPED", label: "Consignment Dispatched", icon: "flight_takeoff" },
    { key: "OUT_FOR_DELIVERY", label: "White Glove Transit", icon: "local_shipping" },
    { key: "DELIVERED", label: "Residence Handover", icon: "task_alt" }
  ];

  const getMilestoneIndex = (status) => {
    switch (status) {
      case "PLACED": return 0;
      case "CONFIRMED": return 1;
      case "PROCESSING": return 2;
      case "SHIPPED": return 3;
      case "OUT_FOR_DELIVERY": return 4;
      case "DELIVERED": return 5;
      default: return 0;
    }
  };

  const currentMilestoneIndex = selectedOrder ? getMilestoneIndex(selectedOrder.orderStatus) : 0;
  const isCancelled = selectedOrder?.orderStatus === "CANCELLED";

  return (
    <div className="flex flex-col w-full">
      {/* Header Banner */}
      <section className="relative w-full bg-primary-container text-on-primary py-space-lg px-margin-mobile lg:px-margin border-b border-tertiary-fixed-dim/20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-secondary-fixed tracking-widest">
                Client Wardrobe &amp; Provenance
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
              <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim tracking-wider">
                Private Portfolio
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg uppercase text-on-primary tracking-tight font-bold">
              Orders &amp; Sartorial Tracking
            </h1>
          </div>

          {selectedOrder && (
            <div className="flex items-center gap-space-sm bg-surface-container-highest/20 px-space-md py-space-xs rounded-full border border-secondary-fixed/30 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-fixed"></span>
              </span>
              <p className="font-body-sm text-on-primary">
                Active Commission: <span className="font-semibold text-secondary-fixed">#{selectedOrder._id.slice(-8).toUpperCase()}</span> ({selectedOrder.orderStatus})
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Success Notification Banner */}
      {justPlaced && (
        <div className="w-full bg-secondary-fixed/20 border-b border-secondary-fixed py-3 px-margin-mobile text-center">
          <p className="font-label-caps text-xs uppercase tracking-widest text-secondary font-bold">
            ✓ Sovereign Commission Authorized. Your bespoke allocation is secured in our atelier.
          </p>
        </div>
      )}

      {actionMsg && (
        <div className="w-full bg-primary-container text-secondary-fixed py-2.5 px-margin-mobile text-center text-xs font-medium">
          {actionMsg}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto w-full px-margin-mobile lg:px-margin py-space-lg">
        {loading ? (
          <div className="py-24 text-center text-on-surface-variant">
            <span className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin inline-block mr-3"></span>
            <p className="font-label-caps text-xs uppercase tracking-widest mt-3">
              Consulting Diplomatic Carrier Logs...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-surface-container-high shadow-sm my-8">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
              package_2
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wider">
              No Commissions Found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-2 mb-6">
              You have not placed any orders yet. Discover our latest fall/winter atelier drop.
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
            {/* Left: Orders Archive Selector (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="font-label-caps text-xs uppercase tracking-wider text-secondary font-bold">
                Commissions Archive ({orders.length})
              </span>
              {orders.map((order) => {
                const isSelected = order._id === selectedOrderId;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-surface-container-lowest border-secondary ring-1 ring-secondary shadow-md"
                        : "bg-surface-container-low border-surface-container-high hover:border-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-[0.6875rem] uppercase text-on-surface font-bold">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${
                          order.orderStatus === "CANCELLED"
                            ? "bg-error-container text-error"
                            : order.orderStatus === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-secondary-fixed/50 text-on-secondary-fixed"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-secondary">
                        ${order.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[0.6875rem] text-on-surface-variant mt-1">
                      {order.items?.length || 0} garment{order.items?.length > 1 ? "s" : ""} • {order.paymentMethod} ({order.paymentStatus})
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Order Live Telemetry & Details (8 cols) */}
            {selectedOrder && (
              <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-lg p-space-md lg:p-space-lg border border-surface-container-high relative overflow-hidden flex flex-col gap-space-md">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary-fixed to-transparent"></div>

                {/* Order Top Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-container-low rounded-lg gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-xs uppercase text-on-surface font-bold">
                        Commission: #{selectedOrder._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase ${
                          isCancelled
                            ? "bg-error-container text-error"
                            : "bg-secondary-fixed text-on-secondary-fixed"
                        }`}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[0.625rem] font-label-caps uppercase text-on-surface-variant block">
                        Total Valuation
                      </span>
                      <span className="font-price-lg text-xl font-bold text-secondary">
                        ${selectedOrder.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    {["PLACED", "CONFIRMED"].includes(selectedOrder.orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder._id)}
                        disabled={cancelling}
                        className="px-3 py-1.5 bg-error-container text-error hover:bg-error hover:text-on-error rounded font-label-caps text-xs uppercase tracking-wider transition-colors font-bold disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestone Progress Tracker */}
                {!isCancelled ? (
                  <div className="py-4 border-b border-surface-container-high">
                    <h3 className="font-label-caps text-xs uppercase tracking-widest text-on-surface font-bold mb-4">
                      Sartorial Progression Milestones
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {milestones.map((m, idx) => {
                        const isPast = idx < currentMilestoneIndex;
                        const isCurrent = idx === currentMilestoneIndex;
                        return (
                          <div
                            key={m.key}
                            className={`flex flex-col items-center text-center p-2 rounded-lg ${
                              isCurrent
                                ? "bg-secondary-fixed/20 border border-secondary"
                                : isPast
                                ? "bg-surface-container-low"
                                : "opacity-40"
                            }`}
                          >
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-sm font-bold ${
                                isCurrent
                                  ? "bg-secondary text-on-secondary ring-2 ring-secondary/40 animate-pulse"
                                  : isPast
                                  ? "bg-primary-container text-secondary-fixed"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {isPast ? "check" : m.icon}
                              </span>
                            </span>
                            <span className="font-label-caps text-[0.625rem] uppercase font-bold text-on-surface">
                              {m.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error font-medium">
                    This commission has been cancelled. Inventory was restored to the Milan atelier.
                  </div>
                )}

                {/* Consignment Items Snapshot */}
                <div>
                  <h3 className="font-label-caps text-xs uppercase tracking-widest text-on-surface font-bold mb-3">
                    Consignment Manifest ({selectedOrder.items?.length || 0} Garments)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-surface-container-high"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded bg-surface-container flex items-center justify-center font-bold text-secondary text-sm border border-surface-container-high">
                            R
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                              {item.productName}
                            </h4>
                            <p className="text-xs text-on-surface-variant">
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-price-md text-sm font-bold text-secondary block">
                            ${item.totalPrice?.toLocaleString()}
                          </span>
                          <span className="text-[0.6875rem] text-on-surface-variant">
                            ${item.unitPrice?.toLocaleString()} each
                          </span>
                          {selectedOrder.orderStatus === "DELIVERED" && (
                            <Link
                              to={`/product/${item.product}`}
                              className="text-[0.6875rem] text-secondary hover:underline font-bold block mt-1"
                            >
                              Write Review &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domicile & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs border-t border-surface-container-high text-xs">
                  <div className="bg-surface-container-low p-4 rounded-lg">
                    <span className="font-label-caps uppercase text-secondary font-bold block mb-1">
                      Consignment Domicile (Shipping Address)
                    </span>
                    <p className="font-bold text-on-surface">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                      {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </p>
                    <p className="text-on-surface-variant mt-1 font-mono">
                      Tel: {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="font-label-caps uppercase text-secondary font-bold block mb-1">
                        Settlement &amp; Verification
                      </span>
                      <p className="text-on-surface">
                        Method: <strong className="uppercase">{selectedOrder.paymentMethod}</strong>
                      </p>
                      <p className="text-on-surface mt-0.5">
                        Status: <strong className="uppercase">{selectedOrder.paymentStatus}</strong>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-surface-container-high flex justify-between items-center text-xs mt-2">
                      <span className="text-on-surface-variant">Subtotal: ${selectedOrder.subtotal?.toLocaleString()}</span>
                      <span className="text-on-surface-variant">Courier: ${selectedOrder.shippingCharge?.toLocaleString()}</span>
                      <span className="font-bold text-secondary">Total: ${selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
