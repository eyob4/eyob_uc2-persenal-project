const TARGET_LABEL = { all: "Everyone", students: "Students", teachers: "Teachers", parents: "Parents" };
const TARGET_COLOR = { all: "#4f7ef8", students: "#10b981", teachers: "#8b5cf6", parents: "#f59e0b" };

export default function AnnouncementCard({ announcement, onDelete }) {
  const { title, message, targetRole, createdBy, createdAt } = announcement;
  const color = TARGET_COLOR[targetRole] || "#4f7ef8";

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{title}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
            {createdBy?.name || "Admin"} · {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="badge" style={{ background: color + "20", color }}>
            {TARGET_LABEL[targetRole] || targetRole}
          </span>
          {onDelete && (
            <button onClick={() => onDelete(announcement._id)} className="btn btn-danger" style={{ padding: "3px 9px", fontSize: 11 }}>
              Delete
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}
