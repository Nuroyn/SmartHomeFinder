import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmModal from "../components/ConfirmModal";
import {
  approveProperty,
  fetchAdminProperties,
  rejectProperty,
  togglePublish,
  deletePropertyAdmin,
} from "../api/propertyService";
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateUserRole,
  fetchAdminTransactions,
  fetchAuditLogs,
} from "../api/adminService";
import { formatPrice } from "../utils/formatPrice";
import "../styles/adminDashboard.css";

const TABS = [
  { key: "properties", label: "Properties" },
  { key: "users", label: "Users" },
  { key: "transactions", label: "Transactions" },
  { key: "auditLog", label: "Audit Log" },
];

const mapUrl = (p) => {
  const query = p.verify_location || p.location || "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// ═══════════════════════════════════════════════
//  Stat Cards
// ═══════════════════════════════════════════════
const StatsBar = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Users", value: stats.totalUsers },
    { label: "Properties", value: stats.totalProperties },
    { label: "Published", value: stats.publishedProperties },
    { label: "Pending", value: stats.pendingApprovals },
    { label: "Transactions", value: stats.totalTransactions },
    { label: "Revenue", value: formatPrice(stats.totalRevenue) },
  ];

  return (
    <section className="admin-stats" aria-label="Platform statistics">
      {items.map((s) => (
        <div className="stat-card" key={s.label}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  );
};

// ═══════════════════════════════════════════════
//  Properties Tab (original logic, styled)
// ═══════════════════════════════════════════════
const PropertiesTab = () => {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;
  const [modal, setModal] = useState({ open: false, action: null, propertyId: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProperties({ page, limit, search });
      setProperties(data.properties || []);
      setPages(data.pages || 1);
    } catch {
      setError("Could not load properties.");
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => { load(); }, [load]);

  const executeAction = async () => {
    const { action, propertyId } = modal;
    setModal({ open: false, action: null, propertyId: null });
    const prev = properties;
    try {
      if (action === "approve") {
        setProperties((l) => l.map((p) => (p.id === propertyId ? { ...p, is_approved: true } : p)));
        await approveProperty(propertyId);
      } else if (action === "reject") {
        setProperties((l) => l.map((p) => (p.id === propertyId ? { ...p, is_approved: false } : p)));
        await rejectProperty(propertyId);
      } else if (action === "toggle") {
        setProperties((l) => l.map((p) => (p.id === propertyId ? { ...p, is_published: !p.is_published } : p)));
        const updated = await togglePublish(propertyId);
        setProperties((l) => l.map((p) => (p.id === propertyId ? updated : p)));
      } else if (action === "delete") {
        setProperties((l) => l.filter((p) => p.id !== propertyId));
        await deletePropertyAdmin(propertyId);
      }
    } catch {
      setError("Could not complete action.");
      setProperties(prev);
    }
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <label htmlFor="prop-search" className="sr-only">Search properties</label>
          <input id="prop-search" placeholder="Search name, location, or owner email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span className="admin-page-info">Page {page} / {pages}</span>
      </div>

      {error && <div role="alert" style={{ color: "#a00", background: "#fee", padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p role="status" aria-live="polite">Loading properties…</p>
      ) : properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div>
          {properties.map((p) => (
            <div className="admin-property-item" key={p.id}>
              <div>
                <strong>{p.name}</strong> — {p.location} — {formatPrice(p.price)}
                <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                  {p.images && p.images.length > 0 && (
                    <img src={p.images[0]} alt={`Thumbnail of ${p.name || "property"}`} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                  )}
                  {p.video_url && <video src={p.video_url} style={{ width: 120, height: 70 }} controls={false} />}
                </div>
                <div className="admin-meta">Owner: {p.landlord_email || p.landlord_id}</div>
                {p.landlord_phone && <div className="admin-meta">Phone: {p.landlord_phone}</div>}
                <div className="admin-meta">
                  Approved: <span className={p.is_approved ? "badge badge-green" : "badge badge-red"}>{p.is_approved ? "Yes" : "No"}</span>{" "}
                  Published: <span className={p.is_published ? "badge badge-green" : "badge badge-red"}>{p.is_published ? "Yes" : "No"}</span>
                </div>
                <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={mapUrl(p)} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.name || "property"} on Google Maps (opens in new tab)`} style={{ fontSize: 12 }}>View location</a>
                  {(p.property_doc || p.propertyDoc) && (
                    <a href={p.property_doc || p.propertyDoc} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>View document</a>
                  )}
                </div>
              </div>
              <div className="admin-property-actions">
                <button className="btn-approve" onClick={() => setModal({ open: true, action: "approve", propertyId: p.id })} aria-label={`Approve ${p.name}`}>Approve</button>
                <button className="btn-reject" onClick={() => setModal({ open: true, action: "reject", propertyId: p.id })} aria-label={`Reject ${p.name}`}>Reject</button>
                <button className="btn-publish" onClick={() => setModal({ open: true, action: "toggle", propertyId: p.id })} aria-label={`${p.is_published ? "Unpublish" : "Publish"} ${p.name}`}>{p.is_published ? "Unpublish" : "Publish"}</button>
                <button className="btn-delete" onClick={() => setModal({ open: true, action: "delete", propertyId: p.id })} aria-label={`Delete ${p.name}`}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} setPage={setPage} />

      <ConfirmModal
        open={modal.open}
        title={modal.action === "approve" ? "Approve Property" : modal.action === "reject" ? "Reject Property" : modal.action === "toggle" ? "Toggle Publish" : "Delete Property"}
        message={modal.action === "delete" ? "Delete this property and its media? This cannot be undone." : `${modal.action === "approve" ? "Approve" : modal.action === "reject" ? "Reject" : "Toggle publish for"} this property?`}
        confirmLabel={modal.action === "delete" ? "Delete" : "Confirm"}
        onConfirm={executeAction}
        onCancel={() => setModal({ open: false, action: null, propertyId: null })}
      />
    </>
  );
};

// ═══════════════════════════════════════════════
//  Users Tab
// ═══════════════════════════════════════════════
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ page, search, role: roleFilter });
      setUsers(data.users || []);
      setPages(data.pages || 1);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
    } catch {
      setError("Could not update role.");
    }
  };

  const roleBadge = (role) => {
    const cls = role === "admin" ? "badge-blue" : role === "landlord" ? "badge-yellow" : "badge-gray";
    return <span className={`badge ${cls}`}>{role}</span>;
  };

  return (
    <>
      <div className="admin-toolbar">
        <div style={{ display: "flex", gap: 8 }}>
          <label htmlFor="user-search" className="sr-only">Search users</label>
          <input id="user-search" placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <label htmlFor="role-filter" className="sr-only">Filter by role</label>
          <select id="role-filter" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <span className="admin-page-info">Page {page} / {pages}</span>
      </div>

      {error && <div role="alert" style={{ color: "#a00", background: "#fee", padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p role="status" aria-live="polite">Loading users…</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <label htmlFor={`role-${u.id}`} className="sr-only">Change role for {u.full_name}</label>
                    <select id={`role-${u.id}`} className="role-select" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} setPage={setPage} />
    </>
  );
};

// ═══════════════════════════════════════════════
//  Transactions Tab
// ═══════════════════════════════════════════════
const TransactionsTab = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTransactions({ page, status: statusFilter, paymentStatus: paymentFilter });
      setTxns(data.transactions || []);
      setPages(data.pages || 1);
    } catch {
      setError("Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => { load(); }, [load]);

  const payBadge = (s) => {
    const cls = s === "success" ? "badge-green" : s === "failed" ? "badge-red" : "badge-yellow";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  return (
    <>
      <div className="admin-toolbar">
        <div style={{ display: "flex", gap: 8 }}>
          <label htmlFor="tx-status" className="sr-only">Filter by status</label>
          <select id="tx-status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <label htmlFor="tx-payment" className="sr-only">Filter by payment</label>
          <select id="tx-payment" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
            <option value="">All payments</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <span className="admin-page-info">Page {page} / {pages}</span>
      </div>

      {error && <div role="alert" style={{ color: "#a00", background: "#fee", padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p role="status" aria-live="polite">Loading transactions…</p>
      ) : txns.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Platform Fee</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{t.property_name || "—"}</td>
                  <td>{t.buyer_name || t.buyer_email || "—"}</td>
                  <td>{t.seller_name || t.seller_email || "—"}</td>
                  <td>{formatPrice(t.property_price)}</td>
                  <td>{formatPrice(t.total_platform_fee)}</td>
                  <td>{payBadge(t.payment_status)}</td>
                  <td><span className={`badge ${t.status === "completed" ? "badge-green" : "badge-yellow"}`}>{t.status}</span></td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} setPage={setPage} />
    </>
  );
};

// ═══════════════════════════════════════════════
//  Audit Log Tab
// ═══════════════════════════════════════════════
const AuditLogTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs({ page, action: actionFilter });
      setLogs(data.logs || []);
      setPages(data.pages || 1);
    } catch {
      setError("Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const actionBadge = (a) => {
    const cls = a === "approve" ? "badge-green" : a === "reject" ? "badge-red" : a === "toggle_publish" ? "badge-blue" : "badge-gray";
    return <span className={`badge ${cls}`}>{a}</span>;
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <label htmlFor="audit-action" className="sr-only">Filter by action</label>
          <select id="audit-action" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="">All actions</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="toggle_publish">Toggle Publish</option>
          </select>
        </div>
        <span className="admin-page-info">Page {page} / {pages}</span>
      </div>

      {error && <div role="alert" style={{ color: "#a00", background: "#fee", padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p role="status" aria-live="polite">Loading audit logs…</p>
      ) : logs.length === 0 ? (
        <p>No audit entries found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Property</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.admin_name || l.admin_email || l.admin_id}</td>
                  <td>{actionBadge(l.action)}</td>
                  <td>{l.property_name || l.property_id || "—"}</td>
                  <td style={{ maxWidth: 200, wordBreak: "break-word" }}>{l.details ? JSON.stringify(l.details) : "—"}</td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} setPage={setPage} />
    </>
  );
};

// ═══════════════════════════════════════════════
//  Shared Pagination
// ═══════════════════════════════════════════════
const Pagination = ({ page, pages, setPage }) => (
  <nav className="admin-pagination" aria-label="Pagination">
    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">Prev</button>
    <span style={{ padding: "6px 10px", lineHeight: "24px" }} aria-live="polite">{page} / {pages}</span>
    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} aria-label="Next page">Next</button>
  </nav>
);

// ═══════════════════════════════════════════════
//  Main Admin Dashboard
// ═══════════════════════════════════════════════
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <>
      <Navbar />
      <main id="main-content" style={{ paddingTop: 80, minHeight: "60vh" }}>
        <div className="admin-wrap">
          <h1>Admin Dashboard</h1>

          <StatsBar />

          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                aria-controls={`panel-${t.key}`}
                id={`tab-${t.key}`}
                className={`admin-tab${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === "properties" && <PropertiesTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "transactions" && <TransactionsTab />}
            {activeTab === "auditLog" && <AuditLogTab />}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
