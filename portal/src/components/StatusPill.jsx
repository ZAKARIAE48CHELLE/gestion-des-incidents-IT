const STATUS_MAP = {
  EN_ATTENTE: { label: 'En attente', color: '#854d0e', bg: '#fef08a' },
  EN_COURS:   { label: 'En cours',   color: '#1e40af', bg: '#bfdbfe' },
  RESOLU:     { label: 'Résolu',     color: '#166534', bg: '#bbf7d0' },
  BLOQUE:     { label: 'Bloqué',     color: '#991b1b', bg: '#fecaca' },
  CLOTURE:    { label: 'Clôturé',    color: '#475569', bg: '#e2e8f0' },
}

export default function StatusPill({ statut, style }) {
  const s = STATUS_MAP[statut] || { label: statut, color: '#333', bg: '#eee' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 50,
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: s.color,
      background: s.bg,
      border: '1px solid rgba(255,255,255,0.58)',
      ...style,
    }}>
      {s.label}
    </span>
  )
}
