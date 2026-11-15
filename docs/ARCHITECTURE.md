# RICHU Architecture

## Request flow
React page → REST API → Express route → middleware → controller → service → Mongoose model → MongoDB Atlas.

## Backend responsibilities
- Routes: map HTTP methods and URLs to controllers.
- Middleware: authenticate JWTs, authorize roles, validate requests.
- Controllers: translate HTTP requests into service calls and responses.
- Services: business rules, workflows and orchestration.
- Models: Mongoose schemas, validation and persistence.

## Frontend responsibilities
- Pages: route-level screens.
- Components: reusable UI.
- Services: API calls.
- Context: shared auth/cart/wishlist state.
- Layouts: customer, admin and authentication shells.

## Security notes
- Public registration always creates role=customer.
- Admin privileges must be provisioned securely.
- Never trust prices, roles, stock or payment success supplied by the browser.
- Verify Razorpay signatures on the backend.
- Use transactions/atomic inventory updates for checkout.
- Use HttpOnly secure cookies for production authentication sessions.
