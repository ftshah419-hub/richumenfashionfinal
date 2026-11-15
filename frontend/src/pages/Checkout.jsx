import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import * as userService from "../services/userService";
import * as orderService from "../services/orderService";
import * as paymentService from "../services/paymentService";

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY"); // "RAZORPAY" | "COD"
  const [deliverySpeed, setDeliverySpeed] = useState("white_glove"); // "white_glove" | "standard"
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // New Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
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

    async function loadAddresses() {
      try {
        const res = await userService.getAddresses();
        if (res.success && res.data) {
          setAddresses(res.data);
          const def = res.data.find((a) => a.isDefault) || res.data[0];
          if (def) setSelectedAddressId(def._id);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    }
    loadAddresses();
  }, [isAuthenticated, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.addAddress(newAddress);
      if (res.success && res.data) {
        setAddresses(res.data);
        const added = res.data[res.data.length - 1];
        if (added) setSelectedAddressId(added._id);
        setShowAddressModal(false);
        setNewAddress({
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
      setErrorMsg(err.response?.data?.message || "Failed to add address.");
    }
  };

  const handlePlaceOrder = async () => {
    setErrorMsg("");

    if (!selectedAddressId) {
      setErrorMsg("Please select or add a delivery residence before placing your order.");
      return;
    }

    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) {
      setErrorMsg("Selected address not found.");
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setErrorMsg("Your bag is empty.");
      navigate("/cart");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create order on backend with snapshot & live price verification
      const orderRes = await orderService.createOrder({
        shippingAddress: {
          fullName: selectedAddr.fullName,
          phone: selectedAddr.phone,
          street: selectedAddr.street,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode
        },
        paymentMethod
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Order placement failed.");
      }

      const createdOrder = orderRes.data;

      // 2. Handle Payment Flow
      if (paymentMethod === "COD") {
        await refreshCart();
        navigate(`/orders?success=true&orderId=${createdOrder._id}`);
        return;
      }

      // Online payment via Razorpay Test Mode
      const rzpRes = await paymentService.createRazorpayOrder(createdOrder._id);
      if (!rzpRes.success || !rzpRes.data) {
        throw new Error("Failed to initiate Razorpay checkout.");
      }

      const { razorpayOrderId, amount, currency, keyId } = rzpRes.data;

      // Check if Razorpay SDK is loaded
      if (typeof window.Razorpay === "undefined") {
        // Fallback test verification if offline or mock test mode
        console.warn("Razorpay SDK not loaded in window. Simulating test verification.");
        const verifyRes = await paymentService.verifyPayment({
          orderId: createdOrder._id,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: "test_signature"
        });
        if (verifyRes.success) {
          await refreshCart();
          navigate(`/orders?success=true&orderId=${createdOrder._id}`);
          return;
        }
      }

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_U0MAI2LGF7IR7z",
        amount: amount,
        currency: currency || "INR",
        name: "RICHU Men's Fashion",
        description: `Bespoke Order #${createdOrder._id.slice(-6)}`,
        order_id: razorpayOrderId.startsWith("order_test_") ? undefined : razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: selectedAddr.phone
        },
        theme: {
          color: "#0f1c2c"
        },
        handler: async function (response) {
          try {
            // BACKEND VERIFICATION: Never trust frontend alone!
            const verifyRes = await paymentService.verifyPayment({
              orderId: createdOrder._id,
              razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature || "test_signature"
            });

            if (verifyRes.success) {
              await refreshCart();
              navigate(`/orders?success=true&orderId=${createdOrder._id}`);
            } else {
              setErrorMsg("Payment signature verification failed.");
            }
          } catch (vErr) {
            console.error("Verification error:", vErr);
            setErrorMsg("Payment verification failed on the server.");
          }
        },
        modal: {
          ondismiss: async function () {
            await paymentService.recordPaymentFailure({
              orderId: createdOrder._id,
              reason: "Patron dismissed checkout modal",
              razorpayOrderId
            });
            setErrorMsg("Payment was cancelled. You can retry from your orders page.");
            setIsProcessing(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", async function (response) {
        await paymentService.recordPaymentFailure({
          orderId: createdOrder._id,
          reason: response.error?.description || "Payment failed",
          razorpayOrderId,
          razorpayPaymentId: response.error?.metadata?.payment_id
        });
        setErrorMsg(`Payment failed: ${response.error?.description || "Transaction rejected"}`);
        setIsProcessing(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Order error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to place order.");
      setIsProcessing(false);
    }
  };

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const shippingCharge = cart.shippingCharge || 0;
  const totalAmount = cart.finalTotal || subtotal + shippingCharge;

  return (
    <div className="flex flex-col w-full">
      {/* Top Stepper Ribbon */}
      <section className="w-full bg-surface-container-low py-space-md border-b border-surface-container-high">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-1">
              Secure Sovereign Checkout
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-wide font-bold">
              Client Settlement &amp; Logistics
            </h1>
          </div>

          {/* Stepper Progress */}
          <nav aria-label="Checkout Progress">
            <ol className="flex items-center gap-space-xs sm:gap-space-sm text-xs">
              <li className="flex items-center gap-2 text-secondary font-bold">
                <span className="w-6 h-6 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center text-[0.625rem]">
                  ✓
                </span>
                <span className="font-label-caps uppercase">1. Bag</span>
              </li>
              <li className="w-6 h-[1px] bg-secondary-fixed"></li>
              <li className="flex items-center gap-2 text-on-surface font-bold">
                <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[0.625rem]">
                  2
                </span>
                <span className="font-label-caps uppercase">2. Settlement</span>
              </li>
              <li className="w-6 h-[1px] bg-outline-variant/40"></li>
              <li className="flex items-center gap-2 text-on-surface-variant">
                <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[0.625rem]">
                  3
                </span>
                <span className="font-label-caps uppercase">3. Delivery</span>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Main Dual-Column Canvas */}
      <section className="w-full py-space-lg lg:py-space-xl">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-lg items-start">
            {/* Left Forms (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {/* Patron Identity Card */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
                <div className="flex items-center gap-space-sm pl-2">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-sm">
                    {user?.name?.slice(0, 2).toUpperCase() || "EV"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        {user?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-caps text-[0.5625rem] font-bold uppercase tracking-wider">
                        Sovereign Patron
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {user?.email} • Verified Account
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Residence Selection */}
              <div className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-lg shadow-sm border border-surface-container-high">
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-xl">location_city</span>
                    <h2 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                      Select Delivery Residence
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="font-label-caps text-xs text-secondary hover:text-on-surface tracking-widest flex items-center gap-1 font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> New Residence
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="p-6 text-center bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
                    <p className="text-xs text-on-surface-variant mb-3">
                      No delivery residences registered yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-2 bg-primary-container text-on-primary font-label-caps text-xs uppercase tracking-wider rounded"
                    >
                      + Add Primary Residence
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <label
                          key={addr._id}
                          className={`relative flex flex-col p-space-md rounded-lg cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-secondary-fixed/10 border-secondary ring-1 ring-secondary"
                              : "bg-surface-container-low border-surface-container-high hover:border-secondary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="sr-only"
                          />
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.625rem] ${
                                  isSelected ? "bg-secondary text-on-secondary" : "border border-outline-variant"
                                }`}
                              >
                                {isSelected && "✓"}
                              </span>
                              <span className="font-label-caps text-xs uppercase text-on-surface font-bold">
                                {addr.addressType || "Residence"}
                              </span>
                            </div>
                            {addr.isDefault && (
                              <span className="text-[0.5625rem] font-bold text-secondary uppercase bg-secondary-fixed/30 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-headline-sm text-sm font-semibold text-on-surface mt-2">
                            {addr.fullName}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1 font-mono">
                            Tel: {addr.phone}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delivery Courier Selection */}
              <div className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-lg shadow-sm border border-surface-container-high">
                <div className="flex items-center gap-2 mb-space-md">
                  <span className="material-symbols-outlined text-secondary text-xl">flight_takeoff</span>
                  <h2 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                    Courier &amp; White Glove Logistics
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  <label
                    onClick={() => setDeliverySpeed("white_glove")}
                    className={`p-space-md rounded-lg cursor-pointer border flex flex-col justify-between ${
                      deliverySpeed === "white_glove"
                        ? "bg-secondary-fixed/10 border-secondary ring-1 ring-secondary"
                        : "bg-surface-container-low border-surface-container-high"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-xs font-bold text-on-surface uppercase">
                          Diplomatic White Glove
                        </span>
                        <span className="text-xs font-bold text-secondary">
                          {shippingCharge === 0 ? "FREE" : `$${shippingCharge}`}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Hand-carried in protective velvet suiting trunks with personalized fitting appointment.
                      </p>
                    </div>
                    <span className="font-label-caps text-[0.625rem] uppercase text-secondary font-bold mt-3">
                      Estimated 24-48 Hours
                    </span>
                  </label>

                  <label
                    onClick={() => setDeliverySpeed("standard")}
                    className={`p-space-md rounded-lg cursor-pointer border flex flex-col justify-between ${
                      deliverySpeed === "standard"
                        ? "bg-secondary-fixed/10 border-secondary ring-1 ring-secondary"
                        : "bg-surface-container-low border-surface-container-high"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-xs font-bold text-on-surface uppercase">
                          Standard Diplomatic Courier
                        </span>
                        <span className="text-xs font-bold text-on-surface">Standard</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Secured tracked consignment via DHL Sovereign Diplomatic Service.
                      </p>
                    </div>
                    <span className="font-label-caps text-[0.625rem] uppercase text-on-surface-variant font-bold mt-3">
                      Estimated 3-4 Business Days
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-lg shadow-sm border border-surface-container-high">
                <div className="flex items-center gap-2 mb-space-md">
                  <span className="material-symbols-outlined text-secondary text-xl">account_balance_wallet</span>
                  <h2 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                    Sovereign Payment Method
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  <label
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`p-space-md rounded-lg cursor-pointer border flex items-center justify-between ${
                      paymentMethod === "RAZORPAY"
                        ? "bg-secondary-fixed/10 border-secondary ring-1 ring-secondary"
                        : "bg-surface-container-low border-surface-container-high"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.625rem] ${
                          paymentMethod === "RAZORPAY" ? "bg-secondary text-on-secondary" : "border border-outline-variant"
                        }`}
                      >
                        {paymentMethod === "RAZORPAY" && "✓"}
                      </span>
                      <div>
                        <p className="font-headline-sm text-sm font-bold text-on-surface">
                          Razorpay Test Mode (Cards, UPI, Netbanking)
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Instant confirmation, verified server-side with HMAC-SHA256 signature.
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">credit_card</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-space-md rounded-lg cursor-pointer border flex items-center justify-between ${
                      paymentMethod === "COD"
                        ? "bg-secondary-fixed/10 border-secondary ring-1 ring-secondary"
                        : "bg-surface-container-low border-surface-container-high"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.625rem] ${
                          paymentMethod === "COD" ? "bg-secondary text-on-secondary" : "border border-outline-variant"
                        }`}
                      >
                        {paymentMethod === "COD" && "✓"}
                      </span>
                      <div>
                        <p className="font-headline-sm text-sm font-bold text-on-surface">
                          Cash On Delivery (COD)
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Settlement upon White Glove Courier handover at residence.
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review (5 cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-space-md sticky top-28">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface uppercase tracking-wider border-b border-surface-container-high pb-2">
                Garment Allocation ({items.length})
              </h2>

              {/* Items List Snapshot */}
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 py-2 border-b border-surface-container-low">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-16 object-cover rounded bg-surface-container flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-headline-sm text-xs font-bold text-on-surface line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-[0.6875rem] text-on-surface-variant">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="font-price-md text-xs font-bold text-secondary mt-0.5">
                        ${item.itemTotal?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="flex flex-col gap-2 pt-2 text-xs">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-on-surface">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>White Glove Courier:</span>
                  <span className="font-semibold text-on-surface">
                    {shippingCharge === 0 ? "Complimentary" : `$${shippingCharge}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-surface-container-high flex items-baseline justify-between text-sm">
                  <span className="font-bold text-on-surface uppercase">Total Settlement:</span>
                  <span className="font-price-lg text-xl font-bold text-secondary">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error-container text-error text-xs rounded border border-error/20">
                  {errorMsg}
                </div>
              )}

              {/* Authorize & Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></span>
                    <span>Securing Allocation...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize &amp; Place Order</span>
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </>
                )}
              </button>

              <p className="text-[0.625rem] text-on-surface-variant text-center uppercase tracking-wider">
                By authorizing, you confirm adherence to RICHU Sovereign Bespoke terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-secondary-fixed/40 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                Register New Residence
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                  Full Name / Title:
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="e.g. Lord Edward Vance"
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
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="+44 20 7946 0912"
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
                    Residence Type:
                  </label>
                  <select
                    value={newAddress.addressType}
                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
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
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="14 Grosvenor Square, Mayfair"
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
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="London"
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
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Greater London"
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
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    placeholder="W1K 6LG"
                    className="w-full bg-surface-container-low p-2 rounded border border-surface-container-high focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="accent-secondary"
                />
                <span className="text-on-surface">Designate as Primary Sovereign Residence</span>
              </label>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface uppercase font-label-caps tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps uppercase tracking-wider rounded font-bold"
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
