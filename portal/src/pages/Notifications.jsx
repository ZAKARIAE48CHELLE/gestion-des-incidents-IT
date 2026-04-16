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
        notifs = notifs.filter(n => n.technicienId === user.id || n.acteurId === user.id || n.destinataireId === user.id)
      }
      setData(notifs)
    }).catch(console.error)
  }, [user])

  return (
    <div>
      <div className="page-header"><h2>Notifications</h2></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((n, index) => (
          <div key={n.id ?? `${n.type || 'notification'}-${n.dateCreation || index}`} style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', borderLeft: '4px solid #3498db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#1e3046' }}>{n.type || 'Information'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                {n.dateCreation ? new Date(n.dateCreation).toLocaleString() : 'Récemment'}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>{n.message || `Notification concernant l'incident #${n.incidentId}`}</div>
          </div>
        ))}
        {data.length === 0 && <div style={{ color: '#7f8c8d' }}>Aucune notification.</div>}
      </div>
    </div>
  )
}
