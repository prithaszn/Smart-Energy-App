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
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      if (res.data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>

      {/* Logo top left */}
      <div style={{ position: 'fixed', top: 28, left: 36, display: 'flex', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 14px rgba(255,255,255,0.2)' }}>⚡</div>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Smart Energy</span>
      </div>

      {!showForm ? (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* Badge */}
          <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 18px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 28 }}>
            EST. 2025
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 72, fontWeight: 800, color: '#fff', letterSpacing: '-2.5px', lineHeight: 1.02, marginBottom: 12, textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
            Smart<span style={{ color: 'rgba(255,255,255,0.45)' }}>Energy</span>
          </h1>

          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '3.5px', textTransform: 'uppercase', marginBottom: 10 }}>
            MONITOR · ANALYZE · SAVE
          </p>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 56, letterSpacing: '0.5px' }}>
            Your Power. Your Control.
          </p>

          {/* Divider */}
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.25)', margin: '0 auto 40px' }} />

          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 22 }}>
            WHO ARE YOU?
          </p>

          {/* Role cards */}
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '👤', title: 'Consumer', sub: 'Manage your bills & complaints' },
              { icon: '🔧', title: 'Admin', sub: 'Manage & resolve complaints' },
            ].map(card => (
              <div key={card.title} onClick={() => setShowForm(true)}
                className="glass"
                style={{ width: 196, padding: '34px 22px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease', borderRadius: 20 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
              >
                <p style={{ fontSize: 30, marginBottom: 14 }}>{card.icon}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{card.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 30, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      ) : (
        /* Login form */
        <div className="glass-strong fade-in" style={{ width: '100%', maxWidth: 400, padding: '40px 36px' }}>
          <button onClick={() => setShowForm(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontSize: 13, cursor: 'pointer', marginBottom: 22, fontFamily: 'Inter, sans-serif', padding: 0 }}>
            ← Back
          </button>

          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>Sign in</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 28 }}>Access your energy dashboard</p>

          {error && (
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 15px', marginBottom: 18, fontSize: 13, color: '#fca5a5' }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {[{ label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' }, { label: 'Password', key: 'password', type: 'password', ph: '••••••••' }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{f.label}</label>
                <input className="neu-input" type={f.type} placeholder={f.ph} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleSubmit}>Sign in</button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 22, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Trusted Platform &nbsp;·&nbsp; Secure &nbsp;·&nbsp; Available 24/7
        </p>
      </div>
    </div>
  )
}

export default Login