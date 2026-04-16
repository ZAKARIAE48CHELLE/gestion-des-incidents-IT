import { useEffect, useState } from 'react'
import { incidentsApi } from '../api'
import { useAuth } from '../auth/useAuth'

export default function Incidents() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ titre: '', description: '', equipementId: '', categorie: 'MATERIEL', priorite: 'MOYENNE' })

  const loadData = () => incidentsApi.getAll().then(res => {
    if (Array.isArray(res.data)) setData(res.data)
  }).catch(console.error)

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      if(err.response && err.response.data && err.response.data.details) {
        alert("Erreur de l'API : " + JSON.stringify(err.response.data.details, null, 2))
      } else {
        alert("Erreur: " + err.message)
      }
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Incidents (MS1)</h2>
        <button className="btn" onClick={() => setShowModal(true)}>+ Déclarer un Incident</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Description</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {data.map(i => (
              <tr key={i.id}>
                <td>#{i.id}</td>
                <td>{i.titre}</td>
                <td style={{fontSize: '0.8rem', color: '#777'}}>{i.description}</td>
                <td>{i.heureCreation ? new Date(i.heureCreation).toLocaleDateString() : '-'}</td>
                <td><span style={{fontSize: '0.7rem', padding: '2px 8px', background: '#eee', borderRadius: 4}}>{i.statut}</span></td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding: '30px'}}>Aucun incident trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginBottom: '16px' }}>Nouvel Incident</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Titre de la panne</label>
                <input required style={{ padding: '8px' }} value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Surchauffe serveur..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                <textarea required style={{ padding: '8px', minHeight: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails du problème..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID Équipement</label>
                <input type="number" style={{ padding: '8px' }} value={formData.equipementId} onChange={e => setFormData({...formData, equipementId: e.target.value})} placeholder="Ex: 9" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn" style={{ background: '#ccc' }} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
