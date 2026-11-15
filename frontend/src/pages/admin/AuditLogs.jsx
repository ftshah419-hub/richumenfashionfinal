import { useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  Clock,
  User,
  X,
  Filter
} from "lucide-react";
import { getAdminAuditLogs } from "../../services/adminService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [targetFilter, setTargetFilter] = useState("");

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogs({
        targetType: targetFilter,
        page,
        limit: 25
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [targetFilter, page]);

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
            <span>Governance &amp; Accountability</span>
            <span>•</span>
            <span>Immutable Trail</span>
          </div>
          <h1 className="page-title">Admin Activity Audit Logs</h1>
          <p className="page-description">
            Complete traceability of administrative interventions: garment creations, stock updates, category revisions, and status updates.
          </p>
        </div>

        <button onClick={loadLogs} className="btn-secondary-richu">
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="select-richu"
            value={targetFilter}
            onChange={(e) => {
              setTargetFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Operational Targets</option>
            <option value="PRODUCT">Garment Products</option>
            <option value="CATEGORY">Disciplines &amp; Categories</option>
            <option value="ORDER">Client Orders &amp; Commissions</option>
            <option value="INVENTORY">Vault Inventory Adjustments</option>
            <option value="USER">Patron Accounts</option>
            <option value="REVIEW">Sentiment Reviews</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Audit Ledger ({total} Records)</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 25) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Identifier</th>
                <th>Domain / Target</th>
                <th>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Loading ledger...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No administrative audit logs match current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#475569" }}>
                        <Clock size={12} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#0D1B2A",
                            color: "#D4AF37",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}
                        >
                          {log.admin?.name ? log.admin.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0D1B2A", fontSize: "0.8125rem" }}>
                            {log.admin?.name || "System Executive"}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#64748B" }}>
                            {log.admin?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "700",
                          fontSize: "0.75rem",
                          padding: "3px 8px",
                          backgroundColor: "#F1F5F9",
                          borderRadius: "4px",
                          color: "#0F172A",
                          border: "1px solid #E2E8F0"
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <span className="status-pill status-info">{log.targetType}</span>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.8125rem", color: "#334155", maxWidth: "480px" }}>
                        {log.details || "No supplementary details."}
                      </div>
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
