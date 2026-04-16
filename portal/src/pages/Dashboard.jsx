import { useEffect, useState } from 'react'
import { affectationsApi, incidentsApi } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({ affectations: [], incidents: [] })
  
  useEffect(() => {
    Promise.all([
      affectationsApi.getAll().catch(()=>({data:[]})),
      incidentsApi.getAll().catch(()=>({data:[]}))
    ]).then(([affRes, incRes]) => {
      setStats({ affectations: affRes.data, incidents: incRes.data })
    })
  }, [])

  const arr = stats.affectations
  const active = arr.filter(a => a.statut === 'EN_COURS').length
  const blocked = arr.filter(a => a.statut === 'BLOQUE').length
  const closed = arr.filter(a => a.statut === 'CLOTURE').length
  const pending = arr.filter(a => a.statut === 'EN_ATTENTE').length

  return (
    <div>
      <h2 className="page-header">Dashboard</h2>
      
      <div className="stat-grid">
        <StatCard title="Pannes MS1" val={stats.incidents.length} c="#405cf5" />
        <StatCard title="Affectations" val={arr.length} c="#0284c7" />
        <StatCard title="En attente" val={pending} c="#d97706" />
        <StatCard title="En cours" val={active} c="#0ea5a4" />
        <StatCard title="Bloquées" val={blocked} c="#e11d48" />
        <StatCard title="Clôturées" val={closed} c="#667085" />
      </div>

    </div>
  )
}

function StatCard({ title, val, c }) {
  return (
    <div className="stat-card" style={{ '--stat-color': c }}>
      <div className="stat-card__label">{title}</div>
      <div className="stat-card__value">{val}</div>
    </div>
  )
}
