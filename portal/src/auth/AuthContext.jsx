import { useState } from 'react'
import { AuthContext } from './AuthContextCore'

// ─── Hardcoded fallback users ─────────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: 0, nom: 'Admin', email: 'admin@gmail.com', role: 'ADMIN' },
  { id: 2, nom: 'Technicien Demo', email: 'technician@gmail.com', role: 'TECHNICIEN' },
  { id: 3, nom: 'Alae (Technicien)', email: 'alae@example.com', role: 'TECHNICIEN' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portal_user')) } catch { return null }
  })

  async function login(email, fetchedUsers = []) {
    // 1. Try real users from backend
    const allUsers = [...fetchedUsers, ...DEFAULT_USERS]
    const found = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!found) throw new Error('Aucun utilisateur trouvé avec cet email.')
    localStorage.setItem('portal_user', JSON.stringify(found))
    setUser(found)
    return found
  }

  function logout() {
    localStorage.removeItem('portal_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
