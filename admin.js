import { supabase } from './config.js'

// ─── DOM Elements ────────────────────────────────────────────
const loginScreen   = document.getElementById('login-screen')
const dashboard     = document.getElementById('dashboard')
const loginFormWrap = document.getElementById('login-form-wrap')
const loginSent     = document.getElementById('login-sent')
const magicBtn      = document.getElementById('magic-link-btn')
const emailInput    = document.getElementById('admin-email')
const loginError    = document.getElementById('login-error')
const logoutBtn     = document.getElementById('logout-btn')
const tbody         = document.getElementById('rsvp-tbody')
const dashDate      = document.getElementById('dash-date')
const searchInput   = document.getElementById('search-input')
const exportBtn     = document.getElementById('export-btn')
const darkmodeBtn   = document.getElementById('darkmode-btn')
const modalRoot     = document.getElementById('modal-root')

let allRsvps = []
let currentFilter = 'all'
let searchQuery = ''
let debounceTimer = null

// ─── Dark Mode ───────────────────────────────────────────────
const savedTheme = localStorage.getItem('wedding-admin-theme')
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark')
  darkmodeBtn.textContent = '☀️'
}

darkmodeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  if (isDark) {
    document.documentElement.removeAttribute('data-theme')
    darkmodeBtn.textContent = '🌙'
    localStorage.setItem('wedding-admin-theme', 'light')
  } else {
    document.documentElement.setAttribute('data-theme', 'dark')
    darkmodeBtn.textContent = '☀️'
    localStorage.setItem('wedding-admin-theme', 'dark')
  }
})

// ─── On load — check if already logged in ────────────────────
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  showDashboard()
} else {
  loginScreen.hidden = false
}

// ─── Magic link ──────────────────────────────────────────────
magicBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  if (!email) { emailInput.focus(); return }

  magicBtn.disabled = true
  magicBtn.textContent = 'Sending…'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href }
  })

  if (error) {
    loginError.textContent = error.message
    loginError.hidden = false
    magicBtn.disabled = false
    magicBtn.textContent = 'Send magic link'
  } else {
    loginFormWrap.hidden = true
    loginSent.hidden = false
  }
})

// ─── Handle magic link redirect ──────────────────────────────
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showDashboard()
})

// ─── Logout ──────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
  location.reload()
})

// ─── Show dashboard ──────────────────────────────────────────
async function showDashboard () {
  loginScreen.hidden = true
  dashboard.hidden   = false
  dashDate.textContent = `Last refreshed: ${new Date().toLocaleString()}`
  await loadRsvps()
  subscribeRealtime()
}

// ─── Load RSVPs ──────────────────────────────────────────────
async function loadRsvps () {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-loading">Error loading data.</td></tr>`
    return
  }

  allRsvps = data
  renderTable()
  renderStats()
}

// ─── Real-time subscription (debounced) ──────────────────────
function subscribeRealtime () {
  supabase
    .channel('rsvps-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
      // Debounce rapid updates
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        loadRsvps()
        dashDate.textContent = `Last updated: ${new Date().toLocaleString()}`
      }, 300)
    })
    .subscribe()
}

// ─── Stats ───────────────────────────────────────────────────
function renderStats () {
  const total   = allRsvps.length
  const yes     = allRsvps.filter(r => r.is_coming).length
  const no      = total - yes
  const guests  = allRsvps.filter(r => r.is_coming).reduce((sum, r) => sum + (r.guest_count || 1), 0)
  const comment = allRsvps.filter(r => r.comment).length

  document.getElementById('stat-total').textContent   = total
  document.getElementById('stat-guests').textContent  = guests
  document.getElementById('stat-yes').textContent     = yes
  document.getElementById('stat-no').textContent      = no
  document.getElementById('stat-comment').textContent = comment
}

// ─── Table Rendering ─────────────────────────────────────────
function renderTable () {
  const filtered = allRsvps.filter(r => {
    // Filter
    if (currentFilter === 'yes')     return r.is_coming
    if (currentFilter === 'no')      return !r.is_coming
    if (currentFilter === 'comment') return !!r.comment
    return true
  }).filter(r => {
    // Search
    if (!searchQuery) return true
    const name = (r.full_name || r.name || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-loading">No results.</td></tr>`
    return
  }

  tbody.innerHTML = filtered.map((r, i) => `
    <tr>
      <td class="row-num">${i + 1}</td>
      <td>
        <strong style="font-weight:400">${esc(r.full_name || r.name || '')}</strong>
        ${r.phone ? `<br><span style="font-size:0.75rem;color:var(--muted)">${esc(r.phone)}</span>` : ''}
      </td>
      <td style="text-align:center">${r.guest_count || 1}</td>
      <td>
        <span class="badge ${r.is_coming ? 'badge-yes' : 'badge-no'}">
          ${r.is_coming ? '✓ Yes' : '✗ No'}
        </span>
      </td>
      <td>${r.dietary_needs ? `<span style="font-size:0.82rem">${esc(r.dietary_needs)}</span>` : '<span class="no-note">—</span>'}</td>
      <td>${r.song_request ? `<span style="font-size:0.82rem;font-style:italic">🎵 ${esc(r.song_request)}</span>` : '<span class="no-note">—</span>'}</td>
      <td>
        ${r.comment
          ? `<span class="note-text">${esc(r.comment)}</span>`
          : `<span class="no-note">—</span>`}
      </td>
      <td class="date-cell">${formatDate(r.created_at)}</td>
      <td><button class="btn-delete" data-id="${r.id}" title="Delete this RSVP">✕</button></td>
    </tr>
  `).join('')

  // Attach delete handlers
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.id))
  })
}

// ─── Search ──────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim()
  renderTable()
})

// ─── Filter buttons ──────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentFilter = btn.dataset.filter
    renderTable()
  })
})

// ─── Delete with confirmation modal ─────────────────────────
function confirmDelete (id) {
  const rsvp = allRsvps.find(r => r.id === id)
  const name = rsvp ? esc(rsvp.full_name || rsvp.name || 'this guest') : 'this guest'

  modalRoot.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-card">
        <h3>Delete RSVP?</h3>
        <p>Are you sure you want to delete the reply from <strong>${name}</strong>? This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" id="modal-cancel">Cancel</button>
          <button class="btn-modal-confirm" id="modal-confirm">Delete</button>
        </div>
      </div>
    </div>
  `

  document.getElementById('modal-cancel').addEventListener('click', () => {
    modalRoot.innerHTML = ''
  })

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) modalRoot.innerHTML = ''
  })

  document.getElementById('modal-confirm').addEventListener('click', async () => {
    const confirmBtn = document.getElementById('modal-confirm')
    confirmBtn.disabled = true
    confirmBtn.textContent = 'Deleting…'

    const { error } = await supabase.from('rsvps').delete().eq('id', id)

    if (error) {
      console.error(error)
      confirmBtn.textContent = 'Error!'
      setTimeout(() => { modalRoot.innerHTML = '' }, 1500)
      return
    }

    modalRoot.innerHTML = ''
    await loadRsvps()
  })
}

// ─── CSV Export ──────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  if (allRsvps.length === 0) return

  const headers = ['Name', 'Phone', 'Email', 'Attending', 'Guests', 'Dietary', 'Song Request', 'Note', 'Date']
  const rows = allRsvps.map(r => [
    r.full_name || r.name || '',
    r.phone || '',
    r.email || '',
    r.is_coming ? 'Yes' : 'No',
    r.guest_count || 1,
    r.dietary_needs || '',
    r.song_request || '',
    r.comment || '',
    formatDate(r.created_at)
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `wedding-rsvps-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
})

// ─── Helpers ─────────────────────────────────────────────────
function esc (str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate (iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
