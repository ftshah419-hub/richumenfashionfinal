import { useEffect, useState } from "react";
import {
  Star,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import {
  getAdminReviews,
  deleteReview
} from "../../services/adminService";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("");

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews({
        rating: ratingFilter,
        page,
        limit: 15
      });
      setReviews(res.reviews || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load customer reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [ratingFilter, page]);

  const handleDeleteReview = async (review) => {
    if (!window.confirm(`Are you sure you wish to moderate and remove this review? This action is recorded in audit logs.`)) {
      return;
    }

    try {
      await deleteReview(review._id);
      showToast("Review moderated and removed successfully");
      loadReviews();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete review", "error");
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast.message && (
        <div className={`admin-toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast({ message: "", type: "" })} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-eyebrow">
            <span>Client Sentiment &amp; Feedback</span>
            <span>•</span>
            <span>Moderation</span>
          </div>
          <h1 className="page-title">Review Moderation</h1>
          <p className="page-description">
            Inspect feedback submitted by patrons, verify authentic purchase provenance, and moderate inappropriate or non-compliant content.
          </p>
        </div>

        <button onClick={loadReviews} className="btn-secondary-richu">
          <RefreshCw size={14} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="select-richu"
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars — Sublime</option>
            <option value="4">4 Stars — Excellent</option>
            <option value="3">3 Stars — Moderate</option>
            <option value="2">2 Stars — Sub-par</option>
            <option value="1">1 Star — Critical</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Patron Testimonials ({total})</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 15) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Patron</th>
                <th>Garment</th>
                <th>Rating</th>
                <th>Testimonial Comment</th>
                <th>Purchase Provenance</th>
                <th>Submitted On</th>
                <th style={{ textAlign: "right" }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Retrieving feedback archive...</span>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No reviews matching criteria found.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: "700", color: "#0D1B2A" }}>{r.user?.name || "Anonymous Patron"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{r.user?.email || "—"}</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: "600", color: "#0D1B2A", maxWidth: "180px" }}>
                        {r.product?.name || "Unknown Garment"}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r.rating ? "#D4AF37" : "none"}
                            color={i < r.rating ? "#D4AF37" : "#CBD5E1"}
                          />
                        ))}
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", marginLeft: "4px", color: "#0D1B2A" }}>
                          {r.rating}.0
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.8125rem", color: "#334155", maxWidth: "340px", lineHeight: "1.4" }}>
                        "{r.comment || "No written review text provided."}"
                      </div>
                    </td>

                    <td>
                      {r.isVerifiedPurchase ? (
                        <span className="status-pill status-active">
                          <CheckCircle size={12} /> Verified Buyer
                        </span>
                      ) : (
                        <span className="status-pill status-placed">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                        {new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteReview(r)}
                        className="btn-danger-richu"
                        style={{ padding: "6px 12px" }}
                        title="Moderate and remove review"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
