import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ComplaintForm from './pages/ComplaintForm'
import ComplaintStatus from './pages/ComplaintStatus'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/complaint" element={
          <PrivateRoute><ComplaintForm /></PrivateRoute>
        } />
        <Route path="/my-complaints" element={
          <PrivateRoute><ComplaintStatus /></PrivateRoute>
        } />
      </Routes>
    </Layout>
  )
}

export default App