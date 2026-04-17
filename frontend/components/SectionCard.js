export default function SectionCard({ title, icon, color, children, badge, description }) {
  return (
    <div className="rds-card"style={{ '--section-color': color }}>
      <div className="rds-card" style={{ '--section-color': color }}>
        <div
          className="section-icon-wrap"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <span>{icon}</span>
        </div>

        <div className="section-header-text">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>

        {badge && (
          <span
            className="section-badge"
            style={{
              background: `${color}12`,
              color: color,
              border: `1px solid ${color}25`
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

