import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { usersApi } from '../api'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let fetchedUsers = []
      try { 
        const res = await usersApi.getAll()
        fetchedUsers = Array.isArray(res.data) ? res.data : []
      } catch {
        fetchedUsers = []
      }
      const user = await login(email.trim(), fetchedUsers)
      nav(user.role === 'ADMIN' ? '/dashboard' : '/mes-affectations', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛡️</span>
          <h1>Gestion des Incidents IT</h1>
          <p>Portail unifié de gestion</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className={styles.defaults}>
          <span>Comptes de démonstration :</span>
          <code onClick={() => setEmail('admin@gmail.com')}>admin@gmail.com</code>
          <code onClick={() => setEmail('technician@gmail.com')}>technician@gmail.com</code>
        </div>
      </div>
    </div>
  )
}
