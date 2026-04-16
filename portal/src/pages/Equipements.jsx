import { useState, useEffect } from 'react'
import { equipementsApi, categoriesApi, notificationsApi } from '../api'

const FALLBACK_CATEGORIES = [
  { id: 1, nom: 'Réseau',           description: 'Équipements réseau : switches, routeurs, points d\'accès' },
  { id: 2, nom: 'Serveur',          description: 'Serveurs physiques et virtuels' },
  { id: 3, nom: 'Poste de travail', description: 'Ordinateurs de bureau et laptops' },
  { id: 4, nom: 'Imprimante',       description: 'Imprimantes et scanners' },
]

export default function Equipements() {
  const [equipements, setEquipements] = useState([])
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form State — field names match EquipementDto (camelCase)
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    localisation: '',
    adresseIp: '',
    statut: 'OPERATIONNEL',
    dateInstallation: '',
    categorieId: ''
  })
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eqRes, catRes] = await Promise.allSettled([
        equipementsApi.getAll(),
        categoriesApi.getAll()
      ])
      if (eqRes.status === 'fulfilled') setEquipements(eqRes.value.data || eqRes.value)
      if (catRes.status === 'fulfilled') {
        const live = catRes.value.data || catRes.value
        if (live && live.length > 0) setCategories(live)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des équipements:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (eq) => {
    if (eq.categorie?.nom) return eq.categorie.nom
    if (eq.categorieId) {
      const cat = categories.find(c => c.id === eq.categorieId)
      return cat ? cat.nom : `Catégorie #${eq.categorieId}`
    }
    return '-'
  }

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'OPERATIONNEL': return <span className="badge badge-vert">Opérationnel</span>
      case 'EN_PANNE': return <span className="badge badge-rouge">En Panne</span>
      case 'MAINTENANCE': return <span className="badge badge-orange">Maintenance</span>
      default: return <span className="badge badge-gris">{statut}</span>
    }
  }

  const openCreate = () => {
    setEditTarget(null)
    setFormData({ nom: '', type: '', localisation: '', adresseIp: '', statut: 'OPERATIONNEL', dateInstallation: '', categorieId: '' })
    setShowModal(true)
  }

  const openEdit = (eq) => {
    setEditTarget(eq)
    setFormData({
      nom: eq.nom || '',
      type: eq.type || '',
      localisation: eq.localisation || '',
      adresseIp: eq.adresseIp || '',
      statut: eq.statut || 'OPERATIONNEL',
      dateInstallation: eq.dateInstallation || '',
      categorieId: eq.categorie?.id || eq.categorieId || ''
    })
    setShowModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        nom: formData.nom,
        type: formData.type,
        localisation: formData.localisation,
        adresseIp: formData.adresseIp || null,
        statut: formData.statut,
        dateInstallation: formData.dateInstallation || null,
        categorieId: parseInt(formData.categorieId, 10)
      }
      
      if (editTarget) {
        await equipementsApi.update(editTarget.id, payload)
      } else {
        await equipementsApi.create(payload)

        // Notification (Only trigger on creation)
        if (payload.statut === 'EN_PANNE') {
          try {
            await notificationsApi.create({
              type_notification: "Equipement",
              objet_notification: "Équipement en Panne",
              message_notification: `L'équipement "${payload.nom}" a été déclaré EN PANNE.`,
              statut: "EN_PANNE"
            })
          } catch (err) {
            console.error("Erreur notification équipement:", err)
          }
        }
      }

      setShowModal(false)
      loadData()
    } catch (err) {
      const data = err?.response?.data
      let msg = err.message
      if (data) {
        if (typeof data === 'string') msg = data
        else if (data.message) msg = data.message
        else if (data.error) msg = data.error + (data.details ? ' — ' + JSON.stringify(data.details) : '')
        else msg = JSON.stringify(data)
      }
      alert('Erreur MS4 : ' + msg)
      console.error(err)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parc d'Équipements</h1>
          <p className="page-subtitle">Gestion de l'inventaire matériel et logiciel</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Ajouter un Équipement
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des données via MS4...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Localisation</th>
                <th>Adresse IP</th>
                <th>Catégorie</th>
                <th>Installation</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aucun équipement disponible.
                  </td>
                </tr>
              ) : (
                equipements.map(eq => (
                  <tr key={eq.id}>
                    <td><span className="id-badge">#{eq.id}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{eq.nom}</td>
                    <td>{eq.type || '-'}</td>
                    <td>{eq.localisation || '-'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{eq.adresseIp || '-'}</td>
                    <td>{getCategoryName(eq)}</td>
                    <td>{eq.dateInstallation || '-'}</td>
                    <td>{getStatusBadge(eq.statut)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        onClick={() => openEdit(eq)}>Modifier</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CRÉATION / ÉDITION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editTarget ? 'Modifier l\'Équipement' : 'Nouvel Équipement'}</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nom <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.nom}
                    onChange={e => setFormData({...formData, nom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Type <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Localisation <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={formData.localisation}
                    onChange={e => setFormData({...formData, localisation: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Adresse IP</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="ex: 192.168.1.10"
                    pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$"
                    title="Format: xxx.xxx.xxx.xxx (ex: 192.168.1.10)"
                    value={formData.adresseIp}
                    onChange={e => setFormData({...formData, adresseIp: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Date Installation</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.dateInstallation}
                    onChange={e => setFormData({...formData, dateInstallation: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie <span style={{ color: 'red' }}>*</span></label>
                  <select 
                    className="form-control" 
                    required
                    value={formData.categorieId}
                    onChange={e => setFormData({...formData, categorieId: e.target.value})}
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select 
                    className="form-control" 
                    value={formData.statut}
                    onChange={e => setFormData({...formData, statut: e.target.value})}
                  >
                    <option value="OPERATIONNEL">Opérationnel</option>
                    <option value="EN_PANNE">En Panne</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editTarget ? 'Enregistrer les modifications' : 'Créer l\'équipement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
