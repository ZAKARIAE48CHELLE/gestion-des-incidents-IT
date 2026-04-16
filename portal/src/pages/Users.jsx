import { useEffect, useState } from 'react'
import { usersApi, equipesApi } from '../api'

const ROLES = ['ADMIN', 'TECHNICIEN']

const EMPTY_FORM = { nom: '', email: '', role: 'TECHNICIEN', equipeId: '' }

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span className="badge" style={{
      background: isAdmin ? '#ede9fe' : '#dbeafe',
      color: isAdmin ? '#6d28d9' : '#1d4ed8',
    }}>{role}</span>
  )
}

export default function Users() {
  const [users, setUsers]       = useState([])
  const [equipes, setEquipes]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = create, object = edit
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [deleting, setDeleting] = useState(null)

  const loadAll = async () => {
    try {
      const [uRes, eRes] = await Promise.all([usersApi.getAll(), equipesApi.getAll()])
      setUsers(uRes.data || [])
      setEquipes(eRes.data || [])
    } catch(e) { console.error(e) }
  }

  useEffect(() => { loadAll() }, [])

  const getEquipeName = (id) => {
    const eq = equipes.find(e => e.id === id)
    return eq ? eq.nom : (id ? `Équipe #${id}` : '-')
  }

  const openCreate = () => {
    setEditTarget(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditTarget(u)
    setFormData({ nom: u.nom, email: u.email, role: u.role, equipeId: u.equipeId || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...formData, equipeId: formData.equipeId ? Number(formData.equipeId) : null }
    try {
      if (editTarget) {
        await usersApi.update(editTarget.id, payload)
      } else {
        await usersApi.create(payload)
      }
      setShowModal(false)
      loadAll()
    } catch (err) {
      const data = err?.response?.data
      alert('Erreur : ' + (data?.message || data?.error || JSON.stringify(data) || err.message))
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Supprimer l'utilisateur "${u.nom}" ?`)) return
    setDeleting(u.id)
    try {
      await usersApi.delete(u.id)
      loadAll()
    } catch (err) {
      alert('Erreur suppression : ' + (err?.response?.data?.message || err.message))
    } finally { setDeleting(null) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Gestion des techniciens et administrateurs (MS3)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Équipe</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><span className="id-badge">#{u.id}</span></td>
                <td style={{ fontWeight: 600 }}>{u.nom}</td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td>{getEquipeName(u.equipeId)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', marginRight: 8 }}
                    onClick={() => openEdit(u)}>Modifier</button>
                  <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                    disabled={deleting === u.id} onClick={() => handleDelete(u)}>
                    {deleting === u.id ? '...' : 'Suppr.'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editTarget ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nom <span style={{ color: 'red' }}>*</span></label>
                <input className="form-control" required value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email <span style={{ color: 'red' }}>*</span></label>
                <input className="form-control" type="email" required value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Rôle <span style={{ color: 'red' }}>*</span></label>
                  <select className="form-control" required value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Équipe</label>
                  <select className="form-control" value={formData.equipeId}
                    onChange={e => setFormData({ ...formData, equipeId: e.target.value })}>
                    <option value="">— Aucune —</option>
                    {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
                  </select>
                </div>
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
