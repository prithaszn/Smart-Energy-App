import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Dashboard() {
  const [bills, setBills] = useState([])
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ month: '', year: '', unitsConsumed: '', amountDue: '' })
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [tips, setTips] = useState([])
  const [tipsLoading, setTipsLoading] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [billAnalyses, setBillAnalyses] = useState({})
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const fetchBills = async () => {
    try {
      const res = await axios.get('https://smart-energy-app-production.up.railway.app/api/bills/my', { headers: { Authorization: `Bearer ${token}` } })
      setBills(res.data)
    } catch {}
  }

  useEffect(() => { fetchBills() }, [])

  const handleUpload = async () => {
    if (!file) return setMessage('⚠️ Please select a file')
    setUploading(true)
    const formData = new FormData()
    formData.append('bill', file)
    formData.append('month', form.month)
    formData.append('year', form.year)
    formData.append('unitsConsumed', form.unitsConsumed)
    formData.append('amountDue', form.amountDue)
    try {
      await axios.post('https://smart-energy-app-production.up.railway.app/api/bills/upload', formData, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('✅ Bill uploaded successfully')
      setFile(null)
      fetchBills()
    } catch {
      setMessage('❌ Upload failed')
    }
    setUploading(false)
  }

  const handleGetTips = async () => {
    setTipsLoading(true)
    setShowTips(true)
    setTips([])
    try {
      const res = await axios.post('https://smart-energy-app-production.up.railway.app/api/tips', {
        totalUnits: bills.reduce((a, b) => a + b.unitsConsumed, 0),
        totalAmount: bills.reduce((a, b) => a + b.amountDue, 0),
        billCount: bills.length,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setTips(res.data.tips)
    } catch {
      setTips(['❌ Could not fetch tips. Try again later.'])
    }
    setTipsLoading(false)
  }

  const handleAnalyze = async (bill) => {
    setAnalyzingId(bill._id)
    try {
      const res = await axios.post(`https://smart-energy-app-production.up.railway.app/api/analyze/${bill._id}`, {
        filePath: bill.filePath,
        unitsConsumed: bill.unitsConsumed,
        amountDue: bill.amountDue,
        month: bill.month,
        year: bill.year,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setBillAnalyses(prev => ({ ...prev, [bill._id]: res.data }))
    } catch {
      setBillAnalyses(prev => ({ ...prev, [bill._id]: { status: 'warning', summary: 'Could not analyze this bill.', issues: [], recommendation: 'Try again later.' } }))
    }
    setAnalyzingId(null)
  }

  const totalUnits = bills.reduce((a, b) => a + b.unitsConsumed, 0)
  const totalAmount = bills.reduce((a, b) => a + b.amountDue, 0)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <nav className="bw-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Smart Energy</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/complaint" style={{ textDecoration: 'none' }}><button className="btn-secondary">Complaint</button></Link>
          <Link to="/my-complaints" style={{ textDecoration: 'none' }}><button className="btn-secondary">My Complaints</button></Link>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 36px)' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Good to see you,</p>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>{user?.name} 👋</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Bills', value: bills.length, unit: '', icon: '📄' },
            { label: 'Total Units', value: totalUnits, unit: ' kWh', icon: '⚡' },
            { label: 'Total Spent', value: `₹${totalAmount.toLocaleString()}`, unit: '', icon: '💰' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</p>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <p style={{ fontSize: 'clamp(20px, 5vw, 30px)', fontWeight: 800, color: '#fff' }}>{s.value}{s.unit}</p>
            </div>
          ))}
        </div>

        {/* Upload + Bills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>

          {/* Upload */}
          <div className="glass" style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Upload New Bill</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>Add your monthly electricity bill</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                { ph: 'Month (e.g. June)', key: 'month', type: 'text' },
                { ph: 'Year', key: 'year', type: 'number' },
                { ph: 'Units (kWh)', key: 'unitsConsumed', type: 'number' },
                { ph: 'Amount (₹)', key: 'amountDue', type: 'number' },
              ].map(f => (
                <input key={f.key} className="neu-input" style={{ fontSize: 12, padding: '10px 12px' }} placeholder={f.ph} type={f.type}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: 14, cursor: 'pointer' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, marginBottom: 4 }}>📎</p>
                <p style={{ fontSize: 12, color: file ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: file ? 600 : 400 }}>
                  {file ? file.name : 'Click to choose PDF or Image'}
                </p>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </label>

            <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Bill'}
            </button>
            {message && <p style={{ marginTop: 10, fontSize: 12, color: message.includes('✅') ? '#86efac' : '#fca5a5' }}>{message}</p>}
          </div>

          {/* Bills List */}
          <div className="glass" style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>My Bills</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>{bills.length} bill{bills.length !== 1 ? 's' : ''} on record</p>

            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>📭</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>No bills yet — upload your first one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
                {bills.map(bill => (
                  <div key={bill._id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{bill.month} {bill.year}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{bill.unitsConsumed} kWh</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>₹{bill.amountDue}</p>
                        <button
                          onClick={() => handleAnalyze(bill)}
                          disabled={analyzingId === bill._id}
                          style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                          {analyzingId === bill._id ? '🔍 Scanning...' : '🔍 Scan'}
                        </button>
                      </div>
                    </div>

                    {/* Analysis Result */}
                    {billAnalyses[bill._id] && (
                      <div className="fade-in" style={{
                        marginTop: 12,
                        background: billAnalyses[bill._id].status === 'ok'
                          ? 'rgba(134,239,172,0.07)'
                          : billAnalyses[bill._id].status === 'invalid'
                          ? 'rgba(251,191,36,0.07)'
                          : 'rgba(252,165,165,0.07)',
                        border: `1px solid ${
                          billAnalyses[bill._id].status === 'ok'
                            ? 'rgba(134,239,172,0.2)'
                            : billAnalyses[bill._id].status === 'invalid'
                            ? 'rgba(251,191,36,0.25)'
                            : 'rgba(252,165,165,0.2)'
                        }`,
                        borderRadius: 10,
                        padding: '12px 14px'
                      }}>
                        <p style={{
                          fontSize: 12, fontWeight: 700, marginBottom: 5,
                          color: billAnalyses[bill._id].status === 'ok'
                            ? '#86efac'
                            : billAnalyses[bill._id].status === 'invalid'
                            ? '#fde68a'
                            : '#fca5a5'
                        }}>
                          {billAnalyses[bill._id].status === 'ok'
                            ? '✅ Bill looks correct'
                            : billAnalyses[bill._id].status === 'invalid'
                            ? '⚠️ Invalid bill — please upload an electricity bill'
                            : '🚨 Potential issue detected'}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                          {billAnalyses[bill._id].summary}
                        </p>
                        {billAnalyses[bill._id].issues?.length > 0 && (
                          <ul style={{ paddingLeft: 16, marginTop: 6 }}>
                            {billAnalyses[bill._id].issues.map((issue, i) => (
                              <li key={i} style={{ fontSize: 11, color: '#fca5a5', marginBottom: 3, lineHeight: 1.5 }}>{issue}</li>
                            ))}
                          </ul>
                        )}
                        {billAnalyses[bill._id].status !== 'invalid' && (
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: 6 }}>
                            💡 {billAnalyses[bill._id].recommendation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Tips */}
        <div className="glass" style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: showTips ? 20 : 0, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>✨ AI Energy Tips</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                {bills.length === 0 ? 'Upload at least one bill to get tips' : 'Personalized tips based on your usage'}
              </p>
            </div>
            <button
              onClick={handleGetTips}
              disabled={bills.length === 0 || tipsLoading}
              style={{ padding: '10px 20px', borderRadius: 12, background: bills.length === 0 ? 'rgba(255,255,255,0.05)' : '#fff', color: bills.length === 0 ? 'rgba(255,255,255,0.25)' : '#0a0a0a', border: 'none', fontSize: 13, fontWeight: 700, cursor: bills.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
              {tipsLoading ? '✨ Thinking...' : '✨ Get Tips'}
            </button>
          </div>

          {showTips && (
            <div className="fade-in">
              {tipsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px', height: 70 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {tips.map((tip, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Tip {i + 1}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard