import { useEffect, useState } from 'react'
import { usersApi } from '../api'

export default function Users() {
  const [data, setData] = useState([])

  useEffect(() => {
    usersApi.getAll().then(res => setData(res.data)).catch(console.error)
  }, [])

  return (
    <div>
      <div className="page-header"><h2>Utilisateurs (MS3)</h2></div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Spécialité</th>
              <th>Rôle</th>
              <th>Équipe</th>
            </tr>
          </thead>
          <tbody>
            {data.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td style={{fontWeight: 600}}>{u.nom}</td>
                <td>{u.email}</td>
                <td>{u.specialite || '-'}</td>
                <td><span style={{fontSize: '0.7rem', fontWeight: 600, color: '#3498db'}}>{u.role}</span></td>
                <td>{u.equipeId ? `Equipe ${u.equipeId}` : '-'}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding: '30px'}}>Aucun utilisateur trouvé</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
