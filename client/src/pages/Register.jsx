import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      navigate('/login')
    } catch {
      setError('Registration failed. Email may already exist.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ position: 'fixed', top: 28, left: 36, display: 'flex', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
      </div>

      <div className="glass-strong fade-in" style={{ width: '100%', maxWidth: 420, padding: '48px 40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', marginBottom: 6 }}>Create account</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 32 }}>Start managing your energy today</p>

        {error && (
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 15px', marginBottom: 18, fontSize: 13, color: '#fca5a5' }}>{error}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', ph: 'Pritha Ghosh' },
            { label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', ph: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{f.label}</label>
              <input className="neu-input" type={f.type} placeholder={f.ph} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Account Type</label>
            <select className="neu-input" onChange={e => setForm({ ...form, role: e.target.value })} style={{ cursor: 'pointer' }}>
              <option value="user" style={{ background: '#1a1a1a' }}>Consumer</option>
              <option value="admin" style={{ background: '#1a1a1a' }}>Admin</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 28 }}>Create account</button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register