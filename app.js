import { supabase } from './config.js'

// ─── DOM Elements ────────────────────────────────────────────
const form         = document.getElementById('rsvp-form')
const submitBtn    = document.getElementById('submit-btn')
const btnText      = submitBtn.querySelector('.btn-text')
const btnLoading   = submitBtn.querySelector('.btn-loading')
const thankyou     = document.getElementById('thankyou')
const thankyouName = document.getElementById('thankyou-name')
const guestCountEl = document.getElementById('guest-count')
const confettiBox  = document.getElementById('confetti-container')

// ─── Mobile Nav Toggle ───────────────────────────────────────
const navToggle = document.getElementById('nav-toggle')
const navLinks  = document.querySelector('.nav-links')

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open')
})

// Close mobile nav when a link is clicked
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'))
})

// ─── Form Submission ─────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()

  const fullName     = form.full_name.value.trim()
  const email        = form.email?.value.trim() || null
  const coming       = form.coming?.value
  const guestCount   = parseInt(guestCountEl.value, 10) || 1
  const songRequest  = form.song_request?.value.trim() || null
  const comment      = form.comment.value.trim() || null

  // ─── Validation ──────────────────────────────────────────
  let valid = true

  if (!fullName) {
    showError(form.full_name, 'Please enter your name')
    valid = false
  }
  if (!coming) {
    showError(document.getElementById('radio-group'), 'Please select one')
    valid = false
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(form.email, 'Please enter a valid email')
    valid = false
  }

  if (!valid) return

  // ─── Loading state ───────────────────────────────────────
  submitBtn.disabled = true
  btnText.hidden     = true
  btnLoading.hidden  = false

  const { error } = await supabase
    .from('rsvps')
    .insert({
      full_name:    fullName,
      email,
      is_coming:    coming === 'yes',
      guest_count:  guestCount,
      song_request: songRequest,
      comment
    })

  if (error) {
    console.error(error)
    submitBtn.disabled = false
    btnText.hidden     = false
    btnLoading.hidden  = true
    showError(submitBtn, 'Something went wrong. Please try again.')
    return
  }

  // ─── Success ─────────────────────────────────────────────
  form.hidden = true
  thankyouName.textContent = fullName.split(' ')[0]
  thankyou.hidden = false

  if (coming === 'yes') {
    launchConfetti()
  }
})

// ─── Inline Validation Helpers ───────────────────────────────
function showError (el, msg) {
  shake(el)
  const parent = el.closest('.field') || el.parentElement
  const existing = parent.querySelector('.field-error')
  if (existing) existing.remove()

  const errEl = document.createElement('p')
  errEl.className = 'field-error'
  errEl.textContent = msg
  parent.appendChild(errEl)
}

function clearErrors () {
  document.querySelectorAll('.field-error').forEach(el => el.remove())
}

function shake (el) {
  el.style.animation = 'none'
  void el.offsetWidth
  el.style.animation = 'shake 0.4s ease'
  el.addEventListener('animationend', () => el.style.animation = '', { once: true })
}

// ─── Confetti ────────────────────────────────────────────────
function launchConfetti () {
  const colors = ['#9c7a4e', '#c19a5b', '#d4c5a9', '#3a6b4a', '#e8d5b7', '#f0ebe3']
  const count = 60

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = Math.random() * 100 + '%'
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.width  = (Math.random() * 8 + 5) + 'px'
    piece.style.height = (Math.random() * 10 + 6) + 'px'
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's'
    piece.style.animationDelay = (Math.random() * 1.5) + 's'
    piece.style.opacity = Math.random() * 0.7 + 0.3
    confettiBox.appendChild(piece)
    piece.addEventListener('animationend', () => piece.remove())
  }
}
