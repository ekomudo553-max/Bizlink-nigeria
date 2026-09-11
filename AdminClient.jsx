'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({businesses:0,pending:0,users:0,reviews:0})
  const [businesses, setBusinesses] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    setLoading(true)
    setError('')
    const { data:{user} } = await supabase.auth.getUser()
    if (!user) { window.location.href='/login'; return }
    setUser(user)

    const { data:profile } = await supabase.from('profiles').select('role').eq('id',user.id).single()
    if (profile?.role !== 'admin') { window.location.href='/'; return }

    const [b,p,u,r,br,ur,rr] = await Promise.all([
      supabase.from('businesses').select('*',{count:'exact',head:true}),
      supabase.from('businesses').select('*',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('profiles').select('*',{count:'exact',head:true}),
      supabase.from('reviews').select('*',{count:'exact',head:true}),
      supabase.from('businesses').select('*').order('created_at',{ascending:false}).limit(100),
      supabase.from('profiles').select('id,email,full_name,role,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('reviews').select('*').order('created_at',{ascending:false}).limit(100)
    ])

    setStats({businesses:b.count||0,pending:p.count||0,users:u.count||0,reviews:r.count||0})
    setBusinesses(br.data||[])
    setUsers(ur.data||[])
    setReviews(rr.data||[])
    setLoading(false)
  }

  async function businessStatus(id,status) {
    const supabase = createClient()
    setMessage(''); setError('')
    const {error} = await supabase.from('businesses').update({status}).eq('id',id)
    if (error) setError(error.message)
    else { setMessage(`Business marked ${status}.`); await load() }
  }

  async function userRole(id,role) {
    const supabase = createClient()
    if (id === user?.id && role !== 'admin') {
      setError('You cannot remove your own administrator role.')
      return
    }
    const {error} = await supabase.from('profiles').update({role, updated_at: new Date().toISOString()}).eq('id',id)
    if (error) setError(error.message)
    else { setMessage('User role updated.'); await load() }
  }

  async function deleteReview(id) {
    const supabase = createClient()
    if (!confirm('Delete this review permanently?')) return
    const {error} = await supabase.from('reviews').delete().eq('id',id)
    if (error) setError(error.message)
    else { setMessage('Review deleted.'); await load() }
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href='/login'
  }

  if (loading) return <main style={styles.center}>Loading BizLink Admin...</main>

  return (
    <main style={styles.shell}>
      <aside style={styles.sidebar}>
        <h2>BizLink</h2>
        <span style={styles.badge}>ADMIN</span>
        <nav style={styles.nav}>
          {['overview','businesses','users','reviews'].map(x =>
            <button key={x} onClick={()=>setTab(x)} style={tab===x?styles.active:styles.navBtn}>
              {x === 'overview' ? '📊' : x === 'businesses' ? '🏢' : x === 'users' ? '👥' : '⭐'} {x[0].toUpperCase()+x.slice(1)}
            </button>
          )}
        </nav>
        <button onClick={logout} style={styles.logout}>Sign out</button>
      </aside>

      <section style={styles.content}>
        <header style={styles.header}>
          <div><h1>{tab[0].toUpperCase()+tab.slice(1)}</h1><p>{user?.email}</p></div>
          <button onClick={load} style={styles.refresh}>↻ Refresh</button>
        </header>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {tab === 'overview' && <>
          <div style={styles.grid}>
            <Stat title="Businesses" value={stats.businesses} icon="🏢"/>
            <Stat title="Pending" value={stats.pending} icon="⏳"/>
            <Stat title="Users" value={stats.users} icon="👥"/>
            <Stat title="Reviews" value={stats.reviews} icon="⭐"/>
          </div>
          <section style={styles.panel}>
            <h2>Pending Businesses</h2>
            <BusinessTable rows={businesses.filter(x=>x.status==='pending')} onStatus={businessStatus}/>
          </section>
        </>}

        {tab === 'businesses' && <section style={styles.panel}>
          <h2>Business Management</h2>
          <BusinessTable rows={businesses} onStatus={businessStatus}/>
        </section>}

        {tab === 'users' && <section style={styles.panel}>
          <h2>User Management</h2>
          <div style={styles.wrap}><table style={styles.table}><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Joined</th></tr></thead><tbody>
            {users.map(u=><tr key={u.id}><td>{u.email||'—'}</td><td>{u.full_name||'—'}</td><td>
              <select value={u.role} onChange={e=>userRole(u.id,e.target.value)} style={styles.select}>
                <option value="customer">customer</option><option value="owner">owner</option><option value="admin">admin</option>
              </select>
            </td><td>{date(u.created_at)}</td></tr>)}
          </tbody></table></div>
        </section>}

        {tab === 'reviews' && <section style={styles.panel}>
          <h2>Review Moderation</h2>
          <div style={styles.wrap}><table style={styles.table}><thead><tr><th>Business</th><th>Rating</th><th>Review</th><th>Date</th><th>Action</th></tr></thead><tbody>
            {reviews.map(r=><tr key={r.id}><td>{r.business_id||'—'}</td><td>{r.rating||'—'}</td><td>{r.comment||r.content||'—'}</td><td>{date(r.created_at)}</td><td><button style={styles.danger} onClick={()=>deleteReview(r.id)}>Delete</button></td></tr>)}
          </tbody></table></div>
        </section>}
      </section>
    </main>
  )
}

function Stat({title,value,icon}) {
  return <div style={styles.stat}><span>{icon}</span><div><small>{title}</small><strong>{value}</strong></div></div>
}

function BusinessTable({rows,onStatus}) {
  return <div style={styles.wrap}><table style={styles.table}><thead><tr><th>Business</th><th>Status</th><th>Owner</th><th>Created</th><th>Actions</th></tr></thead><tbody>
    {rows.map(b=><tr key={b.id}><td><strong>{b.name||b.business_name||'Unnamed'}</strong></td><td><span style={styles.status}>{b.status||'unknown'}</span></td><td>{b.owner_id||b.user_id||'—'}</td><td>{date(b.created_at)}</td><td>
      {b.status!=='approved' && <button style={styles.approve} onClick={()=>onStatus(b.id,'approved')}>Approve</button>}
      {b.status!=='rejected' && <button style={styles.danger} onClick={()=>onStatus(b.id,'rejected')}>Reject</button>}
      {b.status!=='pending' && <button style={styles.secondary} onClick={()=>onStatus(b.id,'pending')}>Pending</button>}
    </td></tr>)}
    {!rows.length && <tr><td colSpan="5" style={styles.empty}>No records found.</td></tr>}
  </tbody></table></div>
}

function date(x) { return x ? new Date(x).toLocaleDateString() : '—' }

const styles = {
  shell:{minHeight:'100vh',display:'flex',background:'#f5f7fa',fontFamily:'Arial,sans-serif'},
  sidebar:{width:235,minHeight:'100vh',background:'#111827',color:'#fff',padding:24,boxSizing:'border-box',display:'flex',flexDirection:'column',position:'sticky',top:0},
  nav:{display:'grid',gap:7,marginTop:30},
  navBtn:{textAlign:'left',padding:12,border:0,borderRadius:9,background:'transparent',color:'#d1d5db',cursor:'pointer'},
  active:{textAlign:'left',padding:12,border:0,borderRadius:9,background:'#374151',color:'#fff',fontWeight:700,cursor:'pointer'},
  badge:{display:'inline-block',padding:'5px 8px',background:'#374151',borderRadius:6,fontSize:11,fontWeight:800},
  logout:{marginTop:'auto',padding:12,border:'1px solid #4b5563',borderRadius:9,background:'transparent',color:'#fff',cursor:'pointer'},
  content:{flex:1,minWidth:0,padding:30},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25},
  headerH1:{margin:0}, refresh:{padding:'10px 15px',border:'1px solid #d0d5dd',borderRadius:9,background:'#fff',cursor:'pointer'},
  grid:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:16,marginBottom:24},
  stat:{background:'#fff',padding:20,borderRadius:14,display:'flex',gap:14,alignItems:'center',boxShadow:'0 1px 3px rgba(0,0,0,.06)'},
  statSpan:{fontSize:20}, statSmall:{color:'#667085'}, statStrong:{display:'block',fontSize:28},
  panel:{background:'#fff',padding:22,borderRadius:14,boxShadow:'0 1px 3px rgba(0,0,0,.06)'},
  wrap:{overflowX:'auto'}, table:{width:'100%',borderCollapse:'collapse',fontSize:14},
  select:{padding:7,border:'1px solid #d0d5dd',borderRadius:7}, status:{padding:'5px 8px',borderRadius:7,background:'#f2f4f7'},
  approve:{marginRight:5,padding:'7px 9px',border:0,borderRadius:7,background:'#d1fadf',color:'#05603a',cursor:'pointer'},
  danger:{marginRight:5,padding:'7px 9px',border:0,borderRadius:7,background:'#fee4e2',color:'#b42318',cursor:'pointer'},
  secondary:{padding:'7px 9px',border:0,borderRadius:7,background:'#eaecf0',color:'#344054',cursor:'pointer'},
  success:{padding:12,marginBottom:18,borderRadius:9,background:'#ecfdf3',color:'#027a48'},
  error:{padding:12,marginBottom:18,borderRadius:9,background:'#fee4e2',color:'#b42318'},
  empty:{textAlign:'center',padding:30,color:'#667085'}, center:{minHeight:'100vh',display:'grid',placeItems:'center'}
}
