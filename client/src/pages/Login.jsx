import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const res = await axios.post('https://smart-energy-app-production.up.railway.app/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      if (res.data.user.role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>

      <div style={{ position: 'fixed', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
      </div>

      {!showForm ? (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 480, padding: '60px 0 40px' }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '4px 16px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
            EST. 2025
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 10vw, 72px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 10, textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
            Smart<span style={{ color: 'rgba(255,255,255,0.45)' }}>Energy</span>
          </h1>

          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>
            MONITOR · ANALYZE · SAVE
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>Your Power. Your Control.</p>

          <div style={{ width: 36, height: 1, background: 'rgba(255,255,255,0.25)', margin: '0 auto 32px' }} />

          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 18 }}>WHO ARE YOU?</p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '👤', title: 'Consumer', sub: 'Manage your bills & complaints' },
              { icon: '🔧', title: 'Admin', sub: 'Manage & resolve complaints' },
            ].map(card => (
              <div key={card.title} onClick={() => setShowForm(true)}
                className="glass"
                style={{ width: 'clamp(140px, 40vw, 196px)', padding: '28px 18px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease', borderRadius: 20 }}
              >
                <p style={{ fontSize: 26, marginBottom: 12 }}>{card.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{card.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 26, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      ) : (
        <div className="glass-strong fade-in" style={{ width: '100%', maxWidth: 400, padding: 'clamp(24px, 6vw, 40px) clamp(20px, 6vw, 36px)' }}>
          <button onClick={() => setShowForm(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontSize: 13, cursor: 'pointer', marginBottom: 20, fontFamily: 'Inter, sans-serif', padding: 0 }}>
            ← Back
          </button>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 26 }}>Access your energy dashboard</p>

          {error && (
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 15px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
            {[{ label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' }, { label: 'Password', key: 'password', type: 'password', ph: '••••••••' }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{f.label}</label>
                <input className="neu-input" type={f.type} placeholder={f.ph} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleSubmit}>Sign in</button>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Trusted · Secure · Available 24/7
        </p>
      </div>
    </div>
  )
}

export default Login