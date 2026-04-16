import { useEffect, useState } from 'react'
import { notificationsApi } from '../api'
import { useAuth } from '../auth/useAuth'

export default function Notifications() {
  const { user } = useAuth()
  const [data, setData] = useState([])

  useEffect(() => {
    notificationsApi.getAll().then(res => {
      if (!Array.isArray(res.data)) return;
      let notifs = res.data || []
      
      // If NOT admin, only show notifications intended for this user
      if (user.role !== 'ADMIN') {
        notifs = notifs.filter(n => n.technician_id === user.id)
      } else {
        // Admins see everything, but you might want to filter out purely technician stuff if desired
        // For now, Admins see all
      }
      
      // Sort by date descending
      notifs.sort((a, b) => new Date(b.dateAction) - new Date(a.dateAction))
      
      setData(notifs)
    }).catch(console.error)
  }, [user])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Historique des événements du système</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((n, index) => (
          <div key={n.id ?? index} style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '12px', borderLeft: n.type_notification === 'Equipement' ? '4px solid #ef4444' : '4px solid #6366f1', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', border: '1px solid rgba(148,163,184,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#f1f5f9' }}>
                {n.objet_notification || n.type_notification || 'Information Système'}
                {n.incident_id && <span style={{ marginLeft: '8px', color: '#64748b', fontWeight: 'normal' }}>Incident #{n.incident_id}</span>}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {n.dateAction ? new Date(n.dateAction).toLocaleString('fr-FR') : 'Récemment'}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              {n.message_notification || (n.incident_id ? `Mise à jour concernant l'incident #${n.incident_id}` : 'Nouvel événement enregistré')}
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Aucune notification récente.
          </div>
        )}
      </div>
    </div>
  )
}
