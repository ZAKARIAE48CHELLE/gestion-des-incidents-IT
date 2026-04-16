import { useEffect, useState } from 'react'
import { affectationsApi, incidentsApi, equipementsApi, usersApi, equipesApi } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      incidentsApi.getAll(),
      affectationsApi.getAll(),
      equipementsApi.getStats(),
      usersApi.getAll(),
      equipesApi.getAll()
    ]).then(([incRes, affRes, eqStatsRes, usrRes, eqpRes]) => {
      setData({
        incidents: incRes.status === 'fulfilled' ? (incRes.value.data || []) : [],
        affectations: affRes.status === 'fulfilled' ? (affRes.value.data || []) : [],
        equipStats: eqStatsRes.status === 'fulfilled' ? (eqStatsRes.value.data || {}) : {},
        users: usrRes.status === 'fulfilled' ? (usrRes.value.data || []) : [],
        equipes: eqpRes.status === 'fulfilled' ? (eqpRes.value.data || []) : []
      })
    })
  }, [])

  if (!data) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Calculate some derived metrics
  const inc = data.incidents
  const unresolvedIncidents = inc.filter(i => i.statut !== 'RESOLU' && i.statut !== 'CLOTURE').length
  
  const aff = data.affectations
  const pendingAff = aff.filter(a => a.statut === 'EN_ATTENTE').length
  const activeAff = aff.filter(a => a.statut === 'EN_COURS').length
  
  const eq = data.equipStats
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de Bord</h1>
          <p className="page-subtitle">Vue d'ensemble du système d'information de l'entreprise</p>
        </div>
      </div>
      
      {/* ─── KPI ROW 1: ENTITIES ────────────────────────────────────────────── */}
      <h3 style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '1rem', marginTop: '1rem' }}>Ressources SI</h3>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KpiCard title="Utilisateurs" val={data.users.length} icon="👥" color="#3b82f6" />
        <KpiCard title="Équipes" val={data.equipes.length} icon="🏢" color="#8b5cf6" />
        <KpiCard title="Équipements" val={eq.totalEquipements || 0} icon="💻" color="#10b981" />
        <KpiCard title="Catégories" val={eq.totalCategories || 0} icon="🏷️" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        
        {/* ─── SANTÉ DES ÉQUIPEMENTS (MS4) ────────────────────────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Santé des Équipements</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>MS4</span>
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>Opérationnels ({eq.operationnels || 0})</span>
            <span style={{ fontWeight: 700 }}>{eq.pourcentageOperationnel || 0}%</span>
          </div>
          <ProgressBar percent={eq.pourcentageOperationnel || 0} color="#22c55e" />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
            <span style={{ color: '#f87171', fontWeight: 600 }}>En Panne ({eq.enPanne || 0})</span>
            <span style={{ fontWeight: 700 }}>{eq.pourcentageEnPanne || 0}%</span>
          </div>
          <ProgressBar percent={eq.pourcentageEnPanne || 0} color="#ef4444" />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>En Maintenance ({eq.enMaintenance || 0})</span>
            <span style={{ fontWeight: 700 }}>{eq.pourcentageMaintenance || 0}%</span>
          </div>
          <ProgressBar percent={eq.pourcentageMaintenance || 0} color="#f59e0b" />
        </div>

        {/* ─── PIPELINE INCIDENTS (MS1 & MS2) ─────────────────────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Suivi des Pannes</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>MS1 & MS2</span>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
            
            <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{unresolvedIncidents}</span>
              <span style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Incidents non résolus</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <MiniStatCard label="Affectations Attente" val={pendingAff} bg="rgba(245,158,11,0.1)" color="#fbbf24" />
              <MiniStatCard label="Interventions en cours" val={activeAff} bg="rgba(34,197,94,0.1)" color="#4ade80" />
              <MiniStatCard label="Total Traités" val={aff.length} bg="rgba(148,163,184,0.08)" color="#94a3b8" />
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

function KpiCard({ title, val, icon, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '2rem', padding: '0.5rem', background: `${color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{val}</div>
      </div>
    </div>
  )
}

function MiniStatCard({ label, val, bg, color }) {
  return (
    <div style={{ background: bg, borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${color}30` }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: color }}>{label}</span>
      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: color }}>{val}</span>
    </div>
  )
}

function ProgressBar({ percent, color }) {
  return (
    <div style={{ height: '8px', background: 'rgba(148,163,184,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ 
        width: `${percent}%`, 
        height: '100%', 
        background: color, 
        borderRadius: '999px',
        transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
      }} />
    </div>
  )
}
