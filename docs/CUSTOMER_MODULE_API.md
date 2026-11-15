# RICHU – Men's Fashion: Customer / User Module API Documentation & Guide

## Architecture Overview
The Customer / User Module is designed with **MVC + Service Layer** architecture, integrating with the shared authentication middleware and database models:
- **Routes (`backend/src/routes/`)**: Declares REST endpoints, HTTP methods, and attaches middleware (`protect`).
- **Controllers (`backend/src/controllers/`)**: Handles request parameters, parses user context from `req.user`, and sends standard JSON envelopes (`{ success: true, ... }`).
- **Services (`backend/src/services/`)**: Implements core business logic, atomic stock validation, HMAC signature checks, live price verification, and Mongoose operations.
- **Models (`backend/src/models/`)**: Reuses shared Mongoose schemas without duplication.

---

## 1. Product Browsing & Catalog Endpoints

### 1.1 List Active Products
- **Endpoint**: `GET /api/products`
- **Authentication**: Public
- **Query Parameters**:
  - `search` (string): Keyword matching product name, description, or brand.
  - `category` (string): Category ID or slug (e.g. `bespoke-suiting-tuxedos`).
  - `size` (string): Variant size filter (`S`, `M`, `L`, `XL`, `XXL`).
  - `color` (string): Color filter (e.g. `Navy`, `Black`, `Champagne`).
  - `minPrice`, `maxPrice` (number): Price range filter.
  - `sort` (string): `newest` (default), `price_asc`, `price_desc`, `name_asc`.
  - `page` (number): Page number (default: 1).
  - `limit` (number): Items per page (default: 20).
- **Response `200 OK`**:
```json
{
  "success": true,
  "products": [
    {
      "_id": "67375a02e604f8...",
      "name": "Midnight Navy Double-Breasted Suit",
      "slug": "midnight-navy-double-breasted-suit",
      "description": "Tailored double-breasted suit from pure Super 150s Merino wool...",
      "category": {
        "_id": "67375a00e604f8...",
        "name": "Bespoke Suiting & Tuxedos",
        "slug": "bespoke-suiting-tuxedos"
      },
      "brand": "RICHU Atelier",
      "price": 2850,
      "images": ["https://..."],
      "variants": [
        {
          "size": "M",
          "color": "Midnight Navy",
          "sku": "RCH-MNS-M",
          "stock": 12,
          "_id": "67375a02e604f9..."
        }
      ],
      "isActive": true
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 1.2 Featured Products (Homepage Spotlight)
- **Endpoint**: `GET /api/products/featured`
- **Authentication**: Public
- **Query Parameters**: `limit` (default: 8)
- **Response `200 OK`**: Returns curated top products.

### 1.3 New Seasonal Arrivals
- **Endpoint**: `GET /api/products/new-arrivals`
- **Authentication**: Public
- **Query Parameters**: `limit` (default: 8)
- **Response `200 OK`**: Returns newest active additions.

### 1.4 Product Details by Slug or ID
- **Endpoint**: `GET /api/products/:identifier`
- **Authentication**: Public
- **URL Parameter**: `identifier` (either MongoDB `_id` or unique `slug`)
- **Response `200 OK`**: Returns single product with populated category and aggregate review metrics (`averageRating`, `reviewCount`).

---

## 2. Category Endpoints

### 2.1 List All Active Categories
- **Endpoint**: `GET /api/categories`
- **Authentication**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "67375a00e604f8...",
      "name": "Bespoke Suiting & Tuxedos",
      "slug": "bespoke-suiting-tuxedos",
      "description": "Hand-padded lapels and full-canvas drape...",
      "image": "https://...",
      "isActive": true
    }
  ]
}
```

---

## 3. Shopping Cart Endpoints

> All Cart endpoints require `Authorization: Bearer <token>`.

### 3.1 Get Current User Cart
- **Endpoint**: `GET /api/cart`
- **Response `200 OK`**: Live prices, stock validation, subtotal, and complimentary shipping eligibility.
```json
{
  "success": true,
  "data": {
    "_id": "67375b11e604fa...",
    "user": "67375a00e604f1...",
    "items": [
      {
        "_id": "67375b12e604fb...",
        "productId": "67375a02e604f8...",
        "productName": "Midnight Navy Double-Breasted Suit",
        "slug": "midnight-navy-double-breasted-suit",
        "image": "https://...",
        "variantId": "67375a02e604f9...",
        "size": "M",
        "color": "Midnight Navy",
        "sku": "RCH-MNS-M",
        "stock": 12,
        "inStock": true,
        "unitPrice": 2850,
        "quantity": 1,
        "itemTotal": 2850
      }
    ],
    "totalItems": 1,
    "subtotal": 2850,
    "shippingCharge": 0,
    "freeShippingThreshold": 500,
    "freeShippingUnlocked": true,
    "finalTotal": 2850
  }
}
```

### 3.2 Add Item to Cart
- **Endpoint**: `POST /api/cart/items`
- **Request Body**:
```json
{
  "productId": "67375a02e604f8...",
  "variantId": "67375a02e604f9...",
  "quantity": 1
}
```
- **Business Rule**: Re-validates active status and variant stock. If quantity exceeds stock, returns `400 Bad Request`.

### 3.3 Update Item Quantity
- **Endpoint**: `PUT /api/cart/items/:itemId`
- **Request Body**: `{ "quantity": 2 }`

### 3.4 Remove Item from Cart
- **Endpoint**: `DELETE /api/cart/items/:itemId`

### 3.5 Clear Entire Cart
- **Endpoint**: `DELETE /api/cart`

---

## 4. Wishlist Endpoints

> All Wishlist endpoints require `Authorization: Bearer <token>`.

### 4.1 Get User Wishlist
- **Endpoint**: `GET /api/wishlist`
- **Response `200 OK`**: Populated active saved products with category info.

### 4.2 Toggle Product in Wishlist
- **Endpoint**: `POST /api/wishlist/toggle`
- **Request Body**: `{ "productId": "67375a02e604f8..." }`
- **Response `200 OK`**: `{ "success": true, "data": { ..., "added": true } }`

### 4.3 Remove Product from Wishlist
- **Endpoint**: `DELETE /api/wishlist/:productId`

---

## 5. User Profile & Delivery Addresses

> All User endpoints require `Authorization: Bearer <token>`.

### 5.1 Get Customer Profile
- **Endpoint**: `GET /api/users/profile`
- **Response `200 OK`**: User identity, role, account status, and registered delivery addresses.

### 5.2 Update Customer Profile
- **Endpoint**: `PUT /api/users/profile`
- **Request Body**: `{ "name": "Lord Edward Vance", "phone": "+44 20 7946 0912" }`

### 5.3 Get Saved Residences (Addresses)
- **Endpoint**: `GET /api/users/addresses`

### 5.4 Add Delivery Residence
- **Endpoint**: `POST /api/users/addresses`
- **Request Body**:
```json
{
  "fullName": "Lord Edward Vance",
  "phone": "+44 20 7946 0912",
  "street": "14 Grosvenor Square, Mayfair",
  "city": "London",
  "state": "Greater London",
  "pincode": "W1K 6LG",
  "addressType": "HOME",
  "isDefault": true
}
```

### 5.5 Update Delivery Residence
- **Endpoint**: `PUT /api/users/addresses/:addressId`

### 5.6 Delete Residence
- **Endpoint**: `DELETE /api/users/addresses/:addressId`

### 5.7 Set Default Residence
- **Endpoint**: `PATCH /api/users/addresses/:addressId/default`

---

## 6. Checkout & Order Management Endpoints

> All Order endpoints require `Authorization: Bearer <token>`.

### 6.1 Create Order (Checkout Placement)
- **Endpoint**: `POST /api/orders`
- **Request Body**:
```json
{
  "shippingAddress": {
    "fullName": "Lord Edward Vance",
    "phone": "+44 20 7946 0912",
    "street": "14 Grosvenor Square, Mayfair",
    "city": "London",
    "state": "Greater London",
    "pincode": "W1K 6LG"
  },
  "paymentMethod": "RAZORPAY"
}
```
- **Security & Business Rules**:
  - Live price fetching: Never trusts price parameters from client.
  - Stock validation & atomic decrement: Checks `stock >= quantity` and decrements in MongoDB.
  - Item and Address snapshots: Stores exact name, size, color, unit price, total price, and address snapshot so subsequent catalog edits do not distort historical orders.
  - Cart clearing: Automatically clears user's cart on order creation.

### 6.2 Get Customer Order History
- **Endpoint**: `GET /api/orders`
- **Response `200 OK`**: Returns all orders placed by the current customer sorted newest first.

### 6.3 Get Specific Order Details
- **Endpoint**: `GET /api/orders/:orderId`
- **Response `200 OK`**: Detailed manifest, shipping address snapshot, tracking milestones, and payment telemetry.

### 6.4 Cancel Order
- **Endpoint**: `POST /api/orders/:orderId/cancel`
- **Request Body**: `{ "reason": "Customer cancellation" }`
- **Business Rule**: Cancellation permitted only when `orderStatus` is `PLACED` or `CONFIRMED`. Restores variant stock to the database automatically.

---

## 7. Payment Verification & Razorpay Endpoints

> All Payment endpoints require `Authorization: Bearer <token>`.

### 7.1 Create Razorpay Order
- **Endpoint**: `POST /api/payments/create-razorpay-order`
- **Request Body**: `{ "orderId": "67375c30e604fc..." }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "orderId": "67375c30e604fc...",
    "razorpayOrderId": "order_test_98412",
    "amount": 285000,
    "currency": "INR",
    "keyId": "rzp_test_U0MAI2LGF7IR7z"
  }
}
```

### 7.2 Verify Payment Signature (Server-Side)
- **Endpoint**: `POST /api/payments/verify`
- **Request Body**:
```json
{
  "orderId": "67375c30e604fc...",
  "razorpayOrderId": "order_test_98412",
  "razorpayPaymentId": "pay_test_45678",
  "razorpaySignature": "ffce56ad5b520905..."
}
```
- **Security Rule**:
  - Computes `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET)`.
  - Rejects fraudulent submissions.
  - Upon valid signature: updates `order.paymentStatus = "PAID"`, `order.orderStatus = "CONFIRMED"`, and sets `payment.status = "SUCCESS"`.

### 7.3 Record Payment Failure
- **Endpoint**: `POST /api/payments/failure`
- **Request Body**: `{ "orderId": "...", "reason": "Patron closed modal", "razorpayOrderId": "..." }`

---

## 8. Product Reviews Endpoints

### 8.1 Get Reviews for Product
- **Endpoint**: `GET /api/reviews/product/:productId`
- **Authentication**: Public
- **Response `200 OK`**: Reviews list, average rating, star distribution (1 to 5), and verified purchase indicator.

### 8.2 Submit Rating & Review
- **Endpoint**: `POST /api/reviews`
- **Authentication**: Required (`protect`)
- **Request Body**:
```json
{
  "productId": "67375a02e604f8...",
  "rating": 5,
  "comment": "The cut of the double-breasted tuxedo is architectural mastery."
}
```
- **Verified Purchase Rule**: Automatically inspects customer's past orders for this product. If order is found and not cancelled, flags review as `isVerifiedPurchase = true`.

---

## 9. Testing Instructions

### Quick Route & Architecture Verification
Run the automated verification suite:
```bash
node backend/src/tests/verifyRoutes.js
```
Expected output:
- All 35 active endpoints mapped and registered.
- All 8 Mongoose models validated.
- All 8 service modules validated.
- Razorpay HMAC-SHA256 signature verification validated.

### Seeding Luxury Catalog
Populate MongoDB Atlas with demo products, categories, reviews, and customer credentials:
```bash
node backend/src/utils/seedData.js
```

### Starting Development Servers
**Backend:**
```bash
cd backend
npm run dev
# Starts API on http://localhost:5001
```

**Frontend:**
```bash
cd frontend
npm run dev
# Starts Vite on http://localhost:5173
```
