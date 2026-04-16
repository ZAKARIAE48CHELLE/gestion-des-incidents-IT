import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PrivateRoute } from './auth/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Affectations from './pages/Affectations'
import MesAffectations from './pages/MesAffectations'
import Notifications from './pages/Notifications'
import Users from './pages/users'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/" element={<PrivateRoute roles={['ADMIN']}><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="affectations" element={<Affectations />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* Technicien Routes */}
          <Route path="/" element={<PrivateRoute roles={['TECHNICIEN']}><Layout /></PrivateRoute>}>
            <Route path="mes-affectations" element={<MesAffectations />} />
          </Route>

          {/* Shared Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="/unauthorized" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>Accès non autorisé</h2><a href="/login">Retour au login</a></div>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
