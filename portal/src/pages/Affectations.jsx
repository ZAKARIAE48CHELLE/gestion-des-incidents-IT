import { useEffect, useState } from 'react'
import { affectationsApi, usersApi, incidentsApi, equipesApi, notificationsApi } from '../api'
import StatusPill from '../components/StatusPill'

export default function Affectations() {
  const [data, setData] = useState([])
  const [users, setUsers] = useState([])
  const [equipes, setEquipes] = useState([])
  const [incidents, setIncidents] = useState([])
  const [formData, setFormData] = useState({ incidentId: '', technicienId: '', equipeId: '' })
  const [selectedAff, setSelectedAff] = useState(null)
  const [activeTab, setActiveTab] = useState('current')

  const loadAll = () => {
    affectationsApi.getAll()
      .then(res => { if (Array.isArray(res.data)) setData(res.data.sort((a,b)=>b.id-a.id)) })
      .catch(console.error)
    
    usersApi.getAll()
      .then(res => { if (Array.isArray(res.data)) setUsers(res.data) })
      .catch(console.error)
      
    if (equipesApi) {
      equipesApi.getAll()
        .then(res => { if (Array.isArray(res.data)) setEquipes(res.data) })
        .catch(console.error)
    }
      
    affectationsApi.getIncidentsToAssign()
      .then(res => { if (Array.isArray(res.data)) setIncidents(res.data) })
      .catch(console.error)
  }

  useEffect(() => { loadAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        incidentId: Number(formData.incidentId),
        technicienId: Number(formData.technicienId),
        equipeId: formData.equipeId ? Number(formData.equipeId) : null
      }
      await affectationsApi.create(payload)
      
      try {
        await notificationsApi.create({
          incident_id: payload.incidentId,
          technician_id: payload.technicienId,
          type_notification: "technician",
          objet_notification: "Assignation Technicien",
          message_notification: `Vous avez été affecté à l'incident #${payload.incidentId}`,
          statut: "ASSIGNATION"
        })
      } catch (err) {
        console.error("Erreur notification technicien:", err)
      }

      setFormData({ incidentId: '', technicienId: '', equipeId: '' })
      loadAll() // refresh
    } catch (err) {
      alert("Erreur lors de l'affectation : " + err.message)
    }
  }

  async function setStatus(id, newStatus, e) {
    if (e) e.stopPropagation()
    try {
      await affectationsApi.updateStatut(id, newStatus)
      loadAll()
      if (selectedAff && selectedAff.id === id) {
        setSelectedAff(prev => ({...prev, statut: newStatus}))
      }
    } catch (e) { alert(e.message) }
  }

  async function handleCloture(id, e) {
    if (e) e.stopPropagation()
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

  // Filter technicians based on the selected equipeId
  const availableTechnicians = users.filter(u => 
    u.role === 'TECHNICIEN' && 
    (formData.equipeId ? (u.equipeId === Number(formData.equipeId)) : false)
  )

  const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u.nom }), {})
  const equipeMap = equipes.reduce((acc, e) => ({ ...acc, [e.id]: e.nom }), {})

  const equipmentHistory = selectedAff?.equipementId 
    ? data.filter(a => a.equipementId === selectedAff.equipementId && a.id !== selectedAff.id).sort((a,b)=>b.id-a.id)
    : []

  return (
    <div>
      <div className="page-header"><h2>Toutes les Affectations</h2></div>
      
      {/* Creation form */}
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Nouvelle affectation</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sélectionner la Panne (MS1)</label>
            <select className="form-control" required value={formData.incidentId} onChange={e => setFormData({...formData, incidentId: e.target.value})}>
              <option value="">Sélectionnez un incident en panne...</option>
              {incidents.map(i => <option key={i.id} value={i.id}>[MS1-{i.id}] {i.titre}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>1. Équipe</label>
            <select className="form-control" 
                    required 
                    value={formData.equipeId} 
                    onChange={e => setFormData({...formData, equipeId: e.target.value, technicienId: ''})}>
              <option value="">Sélectionnez l'équipe</option>
              {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom} {eq.responsable ? `(Resp: ${eq.responsable})` : ''}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>2. Technicien</label>
            <select className="form-control" style={{ opacity: !formData.equipeId ? 0.5 : 1 }} 
                    required 
                    disabled={!formData.equipeId}
                    value={formData.technicienId} 
                    onChange={e => setFormData({...formData, technicienId: e.target.value})}>
              <option value="">{formData.equipeId ? 'Sélectionner un technicien' : 'Choisissez une équipe d\'abord'}</option>
              {availableTechnicians.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '9px 18px' }}>Créer</button>
        </form>
      </div>

      <div className="table-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Incident</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Équipement</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Technicien</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Équipe</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Date Affectation</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#7f8c8d', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Action / Clôture</th>
            </tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr 
                key={a.id} 
                className="hover-row" 
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => { setSelectedAff(a); setActiveTab('current'); }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#a5b4fc' }}>#{a.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#f1f5f9' }}>{a.incidentTitre || 'Panne N°'+a.incidentId}</td>
                <td style={{ padding: '16px 24px' }}>{a.equipementId ? 'Eqp-'+a.equipementId : '-'}</td>
                <td style={{ padding: '16px 24px' }}>{userMap[a.technicienId] || 'Tech-'+a.technicienId}</td>
                <td style={{ padding: '16px 24px' }}>{equipeMap[a.equipeId] || (a.equipeId ? 'Eq-'+a.equipeId : '-')}</td>
                <td style={{ padding: '16px 24px', color: '#7f8c8d' }}>{new Date(a.dateAffectation).toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}><StatusPill statut={a.statut} /></td>
                <td style={{ padding: '16px 24px', display: 'flex', gap: '8px', minHeight: '38px', alignItems: 'center' }}>
                  {a.statut === 'EN_ATTENTE' && <button style={{fontSize:'0.72rem', padding:'5px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontWeight:700, boxShadow:'0 3px 10px rgba(99,102,241,0.3)'}} onClick={(e) => setStatus(a.id, 'EN_COURS', e)}>▶ Démarrer</button>}
                  {a.statut === 'EN_COURS' && (
                    <>
                      <button style={{fontSize:'0.72rem', padding:'5px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#22c55e,#06b6d4)', color:'#fff', fontWeight:700, boxShadow:'0 3px 10px rgba(34,197,94,0.3)'}} onClick={(e) => setStatus(a.id, 'RESOLU', e)}>✓ Résoudre</button>
                      <button style={{fontSize:'0.72rem', padding:'5px 12px', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.4)', cursor:'pointer', background:'transparent', color:'#f87171', fontWeight:700}} onClick={(e) => setStatus(a.id, 'BLOQUE', e)}>⛔ Bloquer</button>
                    </>
                  )}
                  {a.statut === 'BLOQUE' && <button style={{fontSize:'0.72rem', padding:'5px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', fontWeight:700, boxShadow:'0 3px 10px rgba(245,158,11,0.3)'}} onClick={(e) => setStatus(a.id, 'EN_COURS', e)}>↻ Reprendre</button>}
                  {a.statut === 'RESOLU' && <button style={{fontSize:'0.72rem', padding:'5px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#22c55e,#10b981)', color:'#fff', fontWeight:700, boxShadow:'0 3px 10px rgba(34,197,94,0.3)'}} onClick={(e) => handleCloture(a.id, e)}>🔒 Clôturer</button>}
                  {a.statut === 'CLOTURE' && <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>{a.noteCloture || 'Sans note'}</span>}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding: '40px', color: '#7f8c8d'}}>Aucune affectation trouvée</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Admin Modal Détails & Historique */}
      {selectedAff && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#1e293b', padding: '0', borderRadius: '16px', width: '60vw', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(148,163,184,0.12)' }}>
            
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>Détails de l'Affectation #{selectedAff.id}</h2>
              <button onClick={() => setSelectedAff(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '24px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              
              {/* Tab Nav */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('current')} style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'current' ? '#f1f5f9' : '#64748b', borderBottom: activeTab === 'current' ? '2px solid #6366f1' : 'none' }}>
                  Détails de l'Affectation
                </button>
                <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'history' ? '#f1f5f9' : '#64748b', borderBottom: activeTab === 'history' ? '2px solid #6366f1' : 'none' }}>
                  Historique d'Équipement
                </button>
              </div>

              {/* Tab Content 1: Current */}
              {activeTab === 'current' && (
                <div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Statut:</span>
                    <span><StatusPill statut={selectedAff.statut} /></span>
                  </div>
                  <hr style={{ border: 0, borderTop: '1px solid rgba(148,163,184,0.1)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Incident MS1:</span>
                    <span style={{ fontWeight: 500, color: '#f1f5f9' }}>#{selectedAff.incidentId}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Titre (Panne):</span>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{selectedAff.incidentTitre || 'Panne N°'+selectedAff.incidentId}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Équipement ID:</span>
                    <span style={{ fontWeight: 500, color: '#f1f5f9' }}>{selectedAff.equipementId ? 'Eqp-' + selectedAff.equipementId : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', marginBottom: '6px' }}>Description détaillée:</span>
                    <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.1)', whiteSpace: 'pre-wrap', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {selectedAff.description || '-'}
                    </div>
                  </div>
                  <hr style={{ border: 0, borderTop: '1px solid rgba(148,163,184,0.1)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Technicien:</span>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{userMap[selectedAff.technicienId] || 'Tech-' + selectedAff.technicienId}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Équipe (MS3):</span>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{selectedAff.equipeId ? 'Eq-' + selectedAff.equipeId : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Date Affectation:</span>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{new Date(selectedAff.dateAffectation).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Date Fin:</span>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{selectedAff.dateFin ? new Date(selectedAff.dateFin).toLocaleString() : '-'}</span>
                  </div>
                  {selectedAff.noteCloture && (
                    <div style={{ display: 'flex', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#7f8c8d', width: '160px' }}>Note Clôture:</span>
                      <div style={{ background: 'rgba(245,158,11,0.12)', padding: '8px 12px', borderRadius: '8px', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>{selectedAff.noteCloture}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: History */}
              {activeTab === 'history' && (
                <div>
                  {!selectedAff.equipementId && <div style={{ fontSize: '0.85rem', color: '#7f8c8d', fontStyle: 'italic' }}>Aucun équipement lié.</div>}
                  {selectedAff.equipementId && equipmentHistory.length === 0 && <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', padding: '16px', background: '#111827', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.1)' }}>Première intervention enregistrée sur cet équipement.</div>}
                  
                  {equipmentHistory.length > 0 && (
                    <div style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.1)' }}>
                      <div style={{ background: 'rgba(99,102,241,0.1)', padding: '6px 12px', borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: '0.85rem', color: '#a5b4fc' }}>
                        Historique des Pannes (Eqp-{selectedAff.equipementId})
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent', border: '1px solid rgba(148,163,184,0.1)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                        <tbody>
                          {equipmentHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.8rem', color: '#a5b4fc' }}>#{h.id}</td>
                              <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>{h.incidentTitre || 'Panne N°' + h.incidentId}</td>
                              <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#7f8c8d' }}>{new Date(h.dateAffectation).toLocaleDateString()}</td>
                              <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>{userMap[h.technicienId] || 'Tech-' + h.technicienId}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                <StatusPill statut={h.statut} style={{ fontSize: '0.6rem', padding: '2px 8px' }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
