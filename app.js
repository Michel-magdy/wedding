import { supabase } from './config.js'

// ─── i18n Translation System ─────────────────────────────────
const translations = {
  en: {
    hero_label: 'Reservation',
    hero_title: 'Kindly Respond',
    hero_subtitle: 'We are so looking forward to celebrating our special day with you.<br />Please let us know your plans by the <strong> August 1st </strong>.',
    venue_church: 'Church',
    venue_hall: 'Wedding Hall',
    btn_map: 'Map',
    label_name: 'Full Name',
    placeholder_name: 'As written on invitation',
    label_email: 'Email Address',
    placeholder_email: 'For confirmation details',
    label_attend: 'Will you attend?',
    radio_accept: 'Joyfully Accept',
    radio_decline: 'Regretfully Decline',
    label_guests: 'Number of Guests',
    guest_1: '1 Guest',
    guest_2: '2 Guests',
    guest_3: '3 Guests',
    guest_4: '4 Guests',
    guest_5: '5 Guests',
    guest_6: '6+ Guests',
    label_song: 'Song Request',
    placeholder_song: 'What song gets you on the dance floor?',
    label_wishes: 'Well Wishes',
    placeholder_wishes: 'Share a note with the couple...',
    btn_submit: 'Confirm Attendance',
    btn_sending: 'Sending…',
    form_note: 'A confirmation email will be sent to the address provided.',
    thankyou_msg: 'Your reply has been received.<br />We can\'t wait to celebrate with you.',
    footer_contact: 'For any enquiries, reach us at <a href="mailto:sandra.2025@gmail.com">sandra.@gmail.com</a>',
    lang_toggle: 'عربي',
    error_name: 'Please enter your name',
    error_attend: 'Please select one',
    error_email: 'Please enter a valid email',
    error_general: 'Something went wrong. Please try again.',
  },
  ar: {
    hero_label: 'الحجز',
    hero_title: 'نرجو الرد',
    hero_subtitle: 'نحن نتطلع بشوق للاحتفال بيومنا المميز معكم.<br />يرجى إعلامنا بخططكم قبل <strong> ١ أغسطس </strong>.',
    venue_church: 'الكنيسة',
    venue_hall: 'قاعة الأفراح',
    btn_map: 'خريطة',
    label_name: 'الاسم الكامل',
    placeholder_name: 'كما هو مكتوب في الدعوة',
    label_email: 'البريد الإلكتروني',
    placeholder_email: 'لتفاصيل التأكيد',
    label_attend: 'هل ستحضر؟',
    radio_accept: 'أقبل بكل سرور',
    radio_decline: 'أعتذر بأسف',
    label_guests: 'عدد الضيوف',
    guest_1: 'ضيف واحد',
    guest_2: 'ضيفان',
    guest_3: '٣ ضيوف',
    guest_4: '٤ ضيوف',
    guest_5: '٥ ضيوف',
    guest_6: '+٦ ضيوف',
    label_song: 'طلب أغنية',
    placeholder_song: 'أي أغنية تجعلك ترقص؟',
    label_wishes: 'أمنيات طيبة',
    placeholder_wishes: 'شاركوا العروسين رسالة...',
    btn_submit: 'تأكيد الحضور',
    btn_sending: 'جاري الإرسال…',
    form_note: 'سيتم إرسال بريد تأكيد إلى العنوان المقدم.',
    thankyou_msg: 'تم استلام ردكم.<br />نحن نتطلع للاحتفال معكم.',
    footer_contact: 'لأي استفسار، تواصلوا معنا على <a href="mailto:sandra.2025@gmail.com">sandra.@gmail.com</a>',
    lang_toggle: 'English',
    error_name: 'يرجى إدخال اسمك',
    error_attend: 'يرجى اختيار أحد الخيارات',
    error_email: 'يرجى إدخال بريد إلكتروني صحيح',
    error_general: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  }
}

let currentLang = localStorage.getItem('wedding-lang') || 'en'

function applyLang (lang) {
  currentLang = lang
  const dict = translations[lang]
  const html = document.documentElement

  // Set direction and lang attribute
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  html.setAttribute('lang', lang)

  // Update toggle button text
  const toggleText = document.getElementById('lang-toggle-text')
  if (toggleText) toggleText.textContent = dict.lang_toggle

  // Translate all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key]
    }
  })

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder')
    if (dict[key] !== undefined) {
      el.placeholder = dict[key]
    }
  })

  // Persist preference
  localStorage.setItem('wedding-lang', lang)
}

// Apply saved language on load
applyLang(currentLang)

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

// ─── Language Toggle ─────────────────────────────────────────
const langToggle = document.getElementById('lang-toggle')
langToggle?.addEventListener('click', () => {
  const newLang = currentLang === 'en' ? 'ar' : 'en'
  applyLang(newLang)
  // Re-render dates with new locale from cache
  if (cachedWeddingData) renderWeddingDetails(cachedWeddingData)
})

// ─── Venue Details (dynamic from Supabase) ───────────────────
const churchDateEl    = document.getElementById('church-date')
const churchNameEl    = document.getElementById('church-name')
const churchAddressEl = document.getElementById('church-address')
const churchMapsBtn   = document.getElementById('church-maps-btn')

const hallDateEl    = document.getElementById('hall-date')
const hallNameEl    = document.getElementById('hall-name')
const hallAddressEl = document.getElementById('hall-address')
const hallMapsBtn   = document.getElementById('hall-maps-btn')

let cachedWeddingData = null

function formatEventDate (iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const locale = currentLang === 'ar' ? 'ar-EG' : 'en-US'
  const date = d.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

function renderWeddingDetails (data) {
  // Church
  churchDateEl.textContent    = formatEventDate(data.church_date)
  churchNameEl.textContent    = data.church_name    || '—'
  churchAddressEl.textContent = data.church_address || ''
  if (data.church_maps_url) {
    churchMapsBtn.href   = data.church_maps_url
    churchMapsBtn.hidden = false
  }

  // Hall
  hallDateEl.textContent    = formatEventDate(data.hall_date)
  hallNameEl.textContent    = data.hall_name    || '—'
  hallAddressEl.textContent = data.hall_address || ''
  if (data.hall_maps_url) {
    hallMapsBtn.href   = data.hall_maps_url
    hallMapsBtn.hidden = false
  }
}

async function loadWeddingDetails () {
  const { data, error } = await supabase
    .from('wedding_settings')
    .select('*')
    .limit(1)
    .single()

  if (error || !data) return

  cachedWeddingData = data
  renderWeddingDetails(data)
}

loadWeddingDetails()

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
    showError(form.full_name, translations[currentLang].error_name)
    valid = false
  }
  if (!coming) {
    showError(document.getElementById('radio-group'), translations[currentLang].error_attend)
    valid = false
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(form.email, translations[currentLang].error_email)
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
    showError(submitBtn, translations[currentLang].error_general)
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
