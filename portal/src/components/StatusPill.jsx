const STATUS_MAP = {
  EN_ATTENTE: { label: 'En attente', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.25)' },
  EN_COURS:   { label: 'En cours',   color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)',  border: 'rgba(59, 130, 246, 0.25)' },
  RESOLU:     { label: 'Résolu',     color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)',   border: 'rgba(34, 197, 94, 0.25)' },
  BLOQUE:     { label: 'Bloqué',     color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)',   border: 'rgba(239, 68, 68, 0.25)' },
  CLOTURE:    { label: 'Clôturé',    color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.2)' },
}

export default function StatusPill({ statut, style }) {
  const s = STATUS_MAP[statut] || { label: statut, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 50,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      ...style,
    }}>
      {s.label}
    </span>
  )
}
