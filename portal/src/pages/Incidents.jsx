import { useEffect, useState } from 'react'
import { incidentsApi, equipementsApi } from '../api'
import { useAuth } from '../auth/useAuth'

const CATEGORIES = ['RESEAU', 'SERVEUR', 'LOGICIEL', 'MATERIEL', 'SECURITE', 'BASE_DE_DONNEES', 'AUTRE']
const PRIORITES  = ['FAIBLE', 'MOYENNE', 'HAUTE', 'CRITIQUE']

const STATUT_BADGE = {
  EN_PANNE:  { bg: '#fee2e2', color: '#dc2626', label: 'EN PANNE' },
  EN_COURS:  { bg: '#dbeafe', color: '#1d4ed8', label: 'EN COURS' },
  RESOLU:    { bg: '#dcfce7', color: '#15803d', label: 'RÉSOLU' },
  CLOTURE:   { bg: '#f1f5f9', color: '#64748b', label: 'CLÔTURÉ' },
}

function StatutBadge({ statut }) {
  const s = STATUT_BADGE[statut] || { bg: '#f1f5f9', color: '#64748b', label: statut }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: s.bg,
      color: s.color,
    }}>{s.label}</span>
  )
}

export default function Incidents() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [enPanneEquipements, setEnPanneEquipements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    titre: '', description: '', equipementId: '',
    categorie: 'MATERIEL', priorite: 'MOYENNE'
  })

  const loadData = () => incidentsApi.getAll().then(res => {
    if (Array.isArray(res.data)) setData(res.data)
  }).catch(console.error)

  const loadEquipementsPannes = () => {
    equipementsApi.getByStatut('EN_PANNE').then(res => {
      setEnPanneEquipements(Array.isArray(res.data) ? res.data : [])
    }).catch(() => setEnPanneEquipements([]))
  }

  useEffect(() => {
    loadData()
    loadEquipementsPannes()
  }, [])

  const openModal = () => {
    loadEquipementsPannes() // refresh list each time modal opens
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await incidentsApi.create({
        ...formData,
        equipementId: Number(formData.equipementId) || null,
        demandeurId: user.id,
        statut: 'EN_PANNE'
      })
      setShowModal(false)
      setFormData({ titre: '', description: '', equipementId: '', categorie: 'MATERIEL', priorite: 'MOYENNE' })
      loadData()
    } catch (err) {
      const data = err?.response?.data
      let msg = err.message
      if (data) {
        if (typeof data === 'string') msg = data
        else if (data.message) msg = data.message
        else if (data.details) msg = JSON.stringify(data.details, null, 2)
        else msg = JSON.stringify(data)
      }
      alert('Erreur : ' + msg)
    } finally {
      setSubmitting(false)
    }
  }

  const activeIncidentEqIds = new Set(
    data
      .filter(inc => inc.statut === 'EN_PANNE' || inc.statut === 'EN_COURS')
      .map(inc => inc.equipementId)
      .filter(id => id != null)
  )
  const availableEquipements = enPanneEquipements.filter(eq => !activeIncidentEqIds.has(eq.id))

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incidents</h1>
          <p className="page-subtitle">Suivi et déclaration des pannes (MS1)</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Déclarer un Incident
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Équipement</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {data.map(i => (
              <tr key={i.id}>
                <td><span className="id-badge">#{i.id}</span></td>
                <td style={{ fontWeight: 600 }}>{i.titre}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{i.categorie || '-'}</td>
                <td><PrioriteBadge priorite={i.priorite} /></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>#{i.equipementId || '-'}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {i.dateCreation ? new Date(i.dateCreation).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td><StatutBadge statut={i.statut} /></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Aucun incident trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL DÉCLARATION ─────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>Déclarer un Incident</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Titre */}
              <div className="form-group">
                <label>Titre de la panne <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="ex: Surchauffe serveur principal..."
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  className="form-control"
                  required
                  rows={3}
                  placeholder="Décrivez le problème en détail..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Équipement EN_PANNE dropdown */}
              <div className="form-group">
                <label>
                  Équipement concerné
                  <span style={{ marginLeft: 8, fontSize: '0.74rem', color: '#94a3b8', fontWeight: 400 }}>
                    (sans incident actif)
                  </span>
                </label>
                <select
                  className="form-control"
                  value={formData.equipementId}
                  onChange={e => setFormData({ ...formData, equipementId: e.target.value })}
                >
                  <option value="">— Sélectionner un équipement —</option>
                  {availableEquipements.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      #{eq.id} · {eq.nom} ({eq.localisation || 'Localisation inconnue'})
                    </option>
                  ))}
                  {availableEquipements.length === 0 && (
                    <option disabled>Aucun équipement disponible (déjà sous incident)</option>
                  )}
                </select>
              </div>

              {/* Catégorie + Priorité */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    className="form-control"
                    value={formData.categorie}
                    onChange={e => setFormData({ ...formData, categorie: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorité</label>
                  <select
                    className="form-control"
                    value={formData.priorite}
                    onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                  >
                    {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Envoi...' : 'Créer l\'incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PrioriteBadge({ priorite }) {
  const map = {
    CRITIQUE: { bg: '#fef2f2', color: '#b91c1c' },
    HAUTE:    { bg: '#fff7ed', color: '#c2410c' },
    MOYENNE:  { bg: '#fefce8', color: '#a16207' },
    FAIBLE:   { bg: '#f0fdf4', color: '#15803d' },
  }
  const s = map[priorite] || { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color,
    }}>{priorite || '-'}</span>
  )
}
