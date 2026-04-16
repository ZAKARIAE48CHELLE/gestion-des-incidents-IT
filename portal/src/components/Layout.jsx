import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import styles from './Layout.module.css'

const ADMIN_MENU = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/incidents',    icon: '🔥', label: 'Incidents' },
  { to: '/affectations', icon: '🎯', label: 'Affectations' },
  { to: '/equipements',  icon: '🖥️', label: 'Équipements' },
  { to: '/equipes',      icon: '👥', label: 'Équipes' },
  { to: '/utilisateurs', icon: '👤', label: 'Utilisateurs' },
  { to: '/notifications',icon: '🔔', label: 'Notifications' },
]

const TECH_MENU = [
  { to: '/mes-affectations', icon: '🎯', label: 'Mes Affectations' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const menu = user?.role === 'ADMIN' ? ADMIN_MENU : TECH_MENU
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() { logout(); nav('/login') }

  function handleNavClick() {
    setSidebarOpen(false)
  }

  return (
    <div className={styles.shell}>
      {/* Mobile hamburger toggle */}
      <button
        className={styles.menuToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>IT</span>
            <span className={styles.brandText}>
              <span className={styles.brandKicker}>Operations</span>
              <span>Incident Portal</span>
            </span>
          </div>
          <nav>
            {menu.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.userBadge}>
            <span className={styles.roleTag}>{user?.role}</span>
            <span className={styles.userName}>{user?.nom}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>
      <main className={styles.content}><Outlet /></main>
    </div>
  )
}
