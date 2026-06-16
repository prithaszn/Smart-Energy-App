import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function ComplaintStatus() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('https://smart-energy-app-production.up.railway.app/api/complaints/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setComplaints(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const typeLabels = { billing_error: 'Billing Error', wrong_reading: 'Wrong Meter Reading', outage: 'Power Outage', other: 'Other Issue' }
  const typeIcons = { billing_error: '💳', wrong_reading: '📊', outage: '🔌', other: '📝' }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <nav className="bw-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}><button className="btn-secondary">← Dashboard</button></Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 36px)' }}>
        <h1 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', marginBottom: 6 }}>My Complaints</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} filed</p>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading...</p>
        ) : complaints.length === 0 ? (
          <div className="glass" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 14 }}>🎉</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>No complaints filed</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Everything seems to be working fine!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complaints.map(c => (
              <div key={c._id} className="glass" style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{typeIcons[c.type]}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{typeLabels[c.type]}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`tag-${c.status}`}>{c.status.replace('_', ' ')}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{c.description}</p>
                {c.adminNote && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>Admin Response</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{c.adminNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintStatus