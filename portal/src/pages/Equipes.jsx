import { useEffect, useState } from 'react'
import { equipesApi, usersApi } from '../api'

const EMPTY_FORM = { nom: '', responsable: '', description: '' }

export default function Equipes() {
  const [equipes, setEquipes]     = useState([])
  const [users, setUsers]         = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [formData, setFormData]   = useState(EMPTY_FORM)
  const [deleting, setDeleting]   = useState(null)

  const loadAll = async () => {
    try {
      const [eRes, uRes] = await Promise.all([equipesApi.getAll(), usersApi.getAll()])
      setEquipes(eRes.data || [])
      setUsers(uRes.data || [])
    } catch(e) { console.error(e) }
  }

  useEffect(() => { loadAll() }, [])

  const getMemberCount = (equipeId) => users.filter(u => u.equipeId === equipeId).length

  const openCreate = () => {
    setEditTarget(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (eq) => {
    setEditTarget(eq)
    setFormData({ nom: eq.nom, responsable: eq.responsable || '', description: eq.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editTarget) {
        await equipesApi.update(editTarget.id, formData)
      } else {
        await equipesApi.create(formData)
      }
      setShowModal(false)
      loadAll()
    } catch (err) {
      const data = err?.response?.data
      alert('Erreur : ' + (data?.message || data?.error || JSON.stringify(data) || err.message))
    }
  }

  const handleDelete = async (eq) => {
    const count = getMemberCount(eq.id)
    if (count > 0) {
      alert(`Impossible : ${count} utilisateur(s) sont encore assignés à "${eq.nom}".`)
      return
    }
    if (!window.confirm(`Supprimer l'équipe "${eq.nom}" ?`)) return
    setDeleting(eq.id)
    try {
      await equipesApi.delete(eq.id)
      loadAll()
    } catch (err) {
      alert('Erreur suppression : ' + (err?.response?.data?.message || err.message))
    } finally { setDeleting(null) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Équipes</h1>
          <p className="page-subtitle">Gestion des équipes techniques (MS3)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Créer une Équipe</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Responsable</th>
              <th>Description</th>
              <th>Membres</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipes.map(eq => (
              <tr key={eq.id}>
                <td><span className="id-badge">#{eq.id}</span></td>
                <td style={{ fontWeight: 700 }}>{eq.nom}</td>
                <td style={{ color: '#64748b' }}>{eq.responsable || '-'}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {eq.description || '-'}
                </td>
                <td>
                  <span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>
                    {getMemberCount(eq.id)} membre{getMemberCount(eq.id) !== 1 ? 's' : ''}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', marginRight: 8 }}
                    onClick={() => openEdit(eq)}>Modifier</button>
                  <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                    disabled={deleting === eq.id} onClick={() => handleDelete(eq)}>
                    {deleting === eq.id ? '...' : 'Suppr.'}
                  </button>
                </td>
              </tr>
            ))}
            {equipes.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucune équipe trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editTarget ? 'Modifier l\'équipe' : 'Nouvelle Équipe'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nom de l'équipe <span style={{ color: 'red' }}>*</span></label>
                <input className="form-control" required value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Responsable</label>
                <input className="form-control" value={formData.responsable}
                  placeholder="Nom du responsable"
                  onChange={e => setFormData({ ...formData, responsable: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={formData.description}
                  placeholder="Domaine d'intervention..."
                  onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editTarget ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
