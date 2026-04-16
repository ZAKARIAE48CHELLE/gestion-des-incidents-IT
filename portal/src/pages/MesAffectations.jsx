import { useEffect, useState } from 'react'
import { affectationsApi } from '../api'
import { useAuth } from '../auth/useAuth'
import StatusPill from '../components/StatusPill'

export default function MesAffectations() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [allAffectations, setAllAffectations] = useState([])
  const [selectedAff, setSelectedAff] = useState(null)

  const loadAll = () => {
    affectationsApi.getAll().then(res => {
      if (!Array.isArray(res.data)) return;
      setAllAffectations(res.data)
      const myAff = res.data.filter(a => a.technicienId === user.id)
      setData(myAff.sort((a,b)=>b.id-a.id))
    }).catch(console.error)
  }

  useEffect(loadAll, [user.id])

  async function setStatus(id, newStatus) {
    try {
      await affectationsApi.updateStatut(id, newStatus)
      loadAll()
      if (selectedAff && selectedAff.id === id) {
        setSelectedAff(prev => ({...prev, statut: newStatus}))
      }
    } catch (e) { alert(e.message) }
  }

  async function handleCloture(id) {
    const note = prompt("Entrez une note de clôture (optionnelle):")
    if (note === null) return
    try {
      const now = new Date().toISOString().slice(0,16)+":00"
      await affectationsApi.cloturer(id, {
        noteCloture: note.trim() || null,
        dateFin: now
      })
      loadAll()
      if (selectedAff && selectedAff.id === id) {
        setSelectedAff(prev => ({...prev, statut: 'CLOTURE', noteCloture: note.trim(), dateFin: now}))
      }
    } catch (e) { alert(e.message) }
  }

  // Equipment History derived from all affectations
  const equipmentHistory = selectedAff?.equipementId 
    ? allAffectations.filter(a => a.equipementId === selectedAff.equipementId && a.id !== selectedAff.id).sort((a,b)=>b.id-a.id)
    : []

  /* ─── Button Styles ───────────────────────────────────────── */
  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  }
  const btnStart = { ...btnBase, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }
  const btnResolve = { ...btnBase, background: 'linear-gradient(135deg, #22c55e, #06b6d4)', color: '#fff', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }
  const btnBlock = { ...btnBase, background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
  const btnResume = { ...btnBase, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }
  const btnClose = { ...btnBase, background: 'linear-gradient(135deg, #22c55e, #10b981)', color: '#fff', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }
  const btnDetails = { ...btnBase, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }

  return (
    <div>
      <div className="page-header"><h2>Mes Affectations</h2></div>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {data.map(a => (
          <div key={a.id} style={{
            background: '#1e293b',
            borderRadius: '14px',
            padding: '22px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(148,163,184,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#a5b4fc', marginRight: '10px', fontFamily: 'monospace' }}>#{a.id}</span>
                <strong style={{ fontSize: '1.05rem', color: '#f1f5f9' }}>{a.incidentTitre || 'Incident sans titre'}</strong>
              </div>
              <StatusPill statut={a.statut} />
            </div>

            {a.description && (
              <div style={{
                fontSize: '0.85rem',
                color: '#cbd5e1',
                background: '#111827',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148,163,184,0.08)',
                lineHeight: 1.5,
              }}>
                {a.description}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Assigné le : {new Date(a.dateAffectation).toLocaleString()}
                {a.dateFin && <><br/>Terminé le : {new Date(a.dateFin).toLocaleString()}</>}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button style={btnDetails} onClick={() => setSelectedAff(a)}>📋 Détails & Historique</button>
                {a.statut === 'EN_ATTENTE' && <button style={btnStart} onClick={() => setStatus(a.id, 'EN_COURS')}>▶ Démarrer</button>}
                {a.statut === 'EN_COURS' && (
                  <>
                    <button style={btnResolve} onClick={() => setStatus(a.id, 'RESOLU')}>✓ Résoudre</button>
                    <button style={btnBlock} onClick={() => setStatus(a.id, 'BLOQUE')}>⛔ Bloquer</button>
                  </>
                )}
                {a.statut === 'BLOQUE' && <button style={btnResume} onClick={() => setStatus(a.id, 'EN_COURS')}>↻ Reprendre</button>}
                {a.statut === 'RESOLU' && <button style={btnClose} onClick={() => handleCloture(a.id)}>🔒 Clôturer</button>}
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Aucune affectation à votre charge pour le moment.
          </div>
        )}
      </div>

      {/* Modal Détails & Historique */}
      {selectedAff && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.12)',
            padding: '28px',
            borderRadius: '16px',
            width: '620px',
            maxWidth: '95vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <h3 style={{ margin: 0, color: '#f1f5f9' }}>Détails Affectation #{selectedAff.id}</h3>
              <StatusPill statut={selectedAff.statut} />
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '6px', flex: 1 }}>
              <div style={{
                background: '#111827',
                padding: '18px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid rgba(148,163,184,0.08)',
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Informations de l'incident</h4>
                <p style={{ margin: '0 0 8px 0', color: '#f1f5f9' }}><strong>Titre :</strong> {selectedAff.incidentTitre}</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Description :</strong> {selectedAff.description}</p>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Équipement ID :</strong> {selectedAff.equipementId || 'Non spécifié'}</p>
              </div>

              {selectedAff.statut === 'CLOTURE' && selectedAff.noteCloture && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #22c55e',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#4ade80' }}>Note de clôture</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#86efac' }}>{selectedAff.noteCloture}</p>
                </div>
              )}

              <h4 style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '10px', marginBottom: '14px', color: '#f1f5f9', fontSize: '0.95rem' }}>
                Historique de l'équipement (ID: {selectedAff.equipementId || '?'})
              </h4>
              
              {!selectedAff.equipementId && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucun équipement lié à cet incident.</p>}
              
              {selectedAff.equipementId && equipmentHistory.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Aucune ancienne affectation pour cet équipement.</p>
              )}

              {equipmentHistory.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {equipmentHistory.map(hist => (
                    <li key={hist.id} style={{
                      background: '#111827',
                      border: '1px solid rgba(148,163,184,0.1)',
                      padding: '14px',
                      borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>Affectation #{hist.id}</span>
                        <StatusPill statut={hist.statut} />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date : {new Date(hist.dateAffectation).toLocaleDateString()}</div>
                      {hist.noteCloture && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>"{hist.noteCloture}"</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
              <button style={{ ...btnBase, background: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }} onClick={() => setSelectedAff(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
