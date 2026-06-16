import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [noteInputs, setNoteInputs] = useState({})
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaints(res.data)
    } catch {
      console.log('Failed to fetch complaints')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchComplaints()
  }, [])

  const handleUpdate = async (id, status) => {
    setUpdatingId(id)
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, {
        status,
        adminNote: noteInputs[id] || ''
      }, { headers: { Authorization: `Bearer ${token}` } })
      fetchComplaints()
    } catch {
      console.log('Update failed')
    }
    setUpdatingId(null)
  }

  const typeLabels = {
    billing_error: 'Billing Error',
    wrong_reading: 'Wrong Meter Reading',
    outage: 'Power Outage',
    other: 'Other Issue'
  }

  const typeIcons = {
    billing_error: '💳',
    wrong_reading: '📊',
    outage: '🔌',
    other: '📝'
  }

  const statusOptions = ['pending', 'in_review', 'resolved']

  const filtered = filterStatus === 'all'
    ? complaints
    : complaints.filter(c => c.status === filterStatus)

  const counts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    in_review: complaints.filter(c => c.status === 'in_review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Navbar */}
      <nav className="bw-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginLeft: 8 }}>Admin Panel</span>
        </div>
        <button
          onClick={() => { localStorage.clear(); navigate('/login') }}
          style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Logout
        </button>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 36px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Logged in as Admin,</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>{user?.name} 🔧</h1>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Total', key: 'all', icon: '📋' },
            { label: 'Pending', key: 'pending', icon: '🕐' },
            { label: 'In Review', key: 'in_review', icon: '🔍' },
            { label: 'Resolved', key: 'resolved', icon: '✅' },
          ].map(s => (
            <div
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className="glass"
              style={{
                padding: '20px 22px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filterStatus === s.key ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                background: filterStatus === s.key ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</p>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{counts[s.key]}</p>
            </div>
          ))}
        </div>

        {/* Complaints list */}
        <div className="glass" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {filterStatus === 'all' ? 'All Complaints' : `${filterStatus.replace('_', ' ')} complaints`}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>🎉</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>No complaints in this category!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(c => (
                <div key={c._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 24px' }}>

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {typeIcons[c.type]}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{typeLabels[c.type]}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                          👤 {c.user?.name} · {c.user?.email} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`tag-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 18 }}>{c.description}</p>

                  {/* Existing admin note */}
                  {c.adminNote && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>Previous Admin Note</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{c.adminNote}</p>
                    </div>
                  )}

                  {/* Admin response input */}
                  <textarea
                    placeholder="Write a response note to the user (optional)..."
                    value={noteInputs[c._id] || ''}
                    onChange={e => setNoteInputs(prev => ({ ...prev, [c._id]: e.target.value }))}
                    className="neu-input"
                    rows={2}
                    style={{ resize: 'none', marginBottom: 14, fontSize: 13 }}
                  />

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {statusOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => handleUpdate(c._id, s)}
                        disabled={updatingId === c._id || c.status === s}
                        style={{
                          padding: '9px 18px',
                          borderRadius: 10,
                          border: c.status === s ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.1)',
                          background: c.status === s ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                          color: c.status === s ? '#fff' : 'rgba(255,255,255,0.45)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: c.status === s ? 'default' : 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          opacity: updatingId === c._id ? 0.5 : 1,
                        }}
                      >
                        {updatingId === c._id ? 'Updating...' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard