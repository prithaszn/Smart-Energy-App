import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function ComplaintForm() {
  const [form, setForm] = useState({ type: 'billing_error', description: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.description.trim()) return setMessage('⚠️ Please describe your complaint')
    setLoading(true)
    try {
      await axios.post('https://smart-energy-app-production.up.railway.app/api/complaints', form, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('✅ Complaint filed! Redirecting...')
      setTimeout(() => navigate('/my-complaints'), 1500)
    } catch {
      setMessage('❌ Failed to submit')
    }
    setLoading(false)
  }

  const types = [
    { value: 'billing_error', label: 'Billing Error', icon: '💳' },
    { value: 'wrong_reading', label: 'Wrong Reading', icon: '📊' },
    { value: 'outage', label: 'Power Outage', icon: '🔌' },
    { value: 'other', label: 'Other Issue', icon: '📝' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="bw-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}><button className="btn-secondary">← Dashboard</button></Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div className="glass-strong fade-in" style={{ width: '100%', maxWidth: 520, padding: 'clamp(24px, 5vw, 40px)' }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>File a Complaint</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 28 }}>We'll look into it and get back to you</p>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Complaint Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {types.map(t => (
                <div key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                  style={{ padding: '14px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', border: form.type === t.value ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)', background: form.type === t.value ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 20, marginBottom: 5 }}>{t.icon}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: form.type === t.value ? '#fff' : 'rgba(255,255,255,0.5)' }}>{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Description</label>
            <textarea className="neu-input" placeholder="Describe your issue in detail..." rows={5} style={{ resize: 'none' }}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          {message && <p style={{ marginTop: 12, fontSize: 13, color: message.includes('✅') ? '#86efac' : '#fca5a5' }}>{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default ComplaintForm