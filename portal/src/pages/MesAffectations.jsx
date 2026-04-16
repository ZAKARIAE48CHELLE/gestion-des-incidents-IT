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

  return (
    <div>
      <div className="page-header"><h2>Mes Affectations</h2></div>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {data.map(a => (
          <div key={a.id} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#3498db', marginRight: '10px' }}>#{a.id}</span>
                <strong style={{ fontSize: '1.05rem' }}>{a.incidentTitre || 'Incident sans titre'}</strong>
              </div>
              <StatusPill statut={a.statut} />
            </div>

            {a.description && <div style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>{a.description}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Assigné le : {new Date(a.dateAffectation).toLocaleString()}
                {a.dateFin && <><br/>Terminé le : {new Date(a.dateFin).toLocaleString()}</>}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{borderColor: '#6366f1', color: '#6366f1'}} onClick={() => setSelectedAff(a)}>ℹ️ Détails & Historique</button>
                {a.statut === 'EN_ATTENTE' && <button className="btn btn-outline" onClick={() => setStatus(a.id, 'EN_COURS')}>Démarrer</button>}
                {a.statut === 'EN_COURS' && (
                  <>
                    <button className="btn btn-outline" onClick={() => setStatus(a.id, 'RESOLU')}>Résoudre</button>
                    <button className="btn btn-outline" style={{borderColor: '#e74c3c', color: '#e74c3c'}} onClick={() => setStatus(a.id, 'BLOQUE')}>Bloquer</button>
                  </>
                )}
                {a.statut === 'BLOQUE' && <button className="btn btn-outline" onClick={() => setStatus(a.id, 'EN_COURS')}>Reprendre</button>}
                {a.statut === 'RESOLU' && <button className="btn" style={{background: '#166534'}} onClick={() => handleCloture(a.id)}>Clôturer</button>}
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Aucune affectation à votre charge pour le moment.</div>}
      </div>

      {/* Modal Détails & Historique */}
      {selectedAff && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Détails Affectation #{selectedAff.id}</h3>
              <StatusPill statut={selectedAff.statut} />
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#475569' }}>Informations de l'incident</h4>
                <p style={{ margin: '0 0 8px 0' }}><strong>Titre :</strong> {selectedAff.incidentTitre}</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}><strong>Description :</strong> {selectedAff.description}</p>
                <p style={{ margin: '0 0 0 0', fontSize: '0.85rem' }}><strong>Équipement ID :</strong> {selectedAff.equipementId || 'Non spécifié'}</p>
              </div>

              {selectedAff.statut === 'CLOTURE' && selectedAff.noteCloture && (
                <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#065f46' }}>Note de clôture</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>{selectedAff.noteCloture}</p>
                </div>
              )}

              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '12px' }}>
                Historique de l'équipement (ID: {selectedAff.equipementId || '?'})
              </h4>
              
              {!selectedAff.equipementId && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Aucun équipement lié à cet incident.</p>}
              
              {selectedAff.equipementId && equipmentHistory.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Aucune ancienne affectation pour cet équipement.</p>
              )}

              {equipmentHistory.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {equipmentHistory.map(hist => (
                    <li key={hist.id} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Affectation #{hist.id}</span>
                        <StatusPill statut={hist.statut} />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date : {new Date(hist.dateAffectation).toLocaleDateString()}</div>
                      {hist.noteCloture && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', fontStyle: 'italic' }}>"{hist.noteCloture}"</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
              <button className="btn" style={{ background: '#64748b' }} onClick={() => setSelectedAff(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
