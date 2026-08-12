/* E-Jurnal PKL Rimba Bahari - frontend tanpa proses build */
const cfg = window.APP_CONFIG || {};
const sb = (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
  : null;

const PHOTO_BUCKET = 'journal-photos';
const MAX_JOURNAL_PHOTOS = 3;
const MAX_ATTENDANCE_PHOTOS = 2;
const ATTENDANCE_TIMEZONE = 'Asia/Jakarta';
const MAX_INPUT_PHOTO_SIZE = 10 * 1024 * 1024;
const REMOVABLE_JOURNAL_STATUSES = ['draft', 'revision', 'rejected'];

const pageDescriptions = {
  dashboard: 'Ringkasan aktivitas dan perkembangan PKL',
  users: 'Kelola akun dan hak akses pengguna',
  registrations: 'Pendaftaran mandiri dan verifikasi siswa',
  students: 'Data penempatan dan pembimbing siswa',
  'guided-students': 'Daftar lengkap siswa yang menjadi bimbingan Anda',
  'guided-journals': 'Seluruh jurnal harian siswa yang menjadi bimbingan Anda',
  journals: 'Monitoring, dokumentasi, dan validasi jurnal',
  'my-journal': 'Catat kegiatan, pembelajaran, dan dokumentasi PKL',
  attendance: 'Rekap kehadiran selama pelaksanaan PKL',
  'my-attendance': 'Catat kehadiran dan waktu kegiatan Anda',
  reports: 'Rekap data dan laporan kegiatan PKL',
};

const navIcons = {
  dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"/></svg>',
  registrations: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm6 11H6v-.8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.8Z"/></svg>',
  students: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 10 5-10 5L2 8l10-5Zm6 8.5V16l-6 3-6-3v-4.5l6 3 6-3ZM20 10v7h2v-8l-2 1Z"/></svg>',
  'guided-students': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 9.5V17l6 3 6-3v-4.5l-6 3-6-3Z"/><path d="M4 19h7v2H4z"/></svg>',
  'guided-journals': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2Zm8 1.5V8h4.5L14 3.5ZM8 12v2h8v-2H8Zm0 4v2h8v-2H8Z"/></svg>',
  journals: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2Zm8 1.5V8h4.5L14 3.5ZM8 12v2h8v-2H8Zm0 4v2h8v-2H8Z"/></svg>',
  'my-journal': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2Zm8 1.5V8h4.5L14 3.5ZM8 12v2h8v-2H8Zm0 4v2h8v-2H8Z"/></svg>',
  attendance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11Zm-7-2 5-5-1.41-1.41L12 15.17l-1.59-1.58L9 15l3 3Z"/></svg>',
  'my-attendance': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11Zm-7-2 5-5-1.41-1.41L12 15.17l-1.59-1.58L9 15l3 3Z"/></svg>',
  reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2Zm2-2V9h3v8H6Zm5 0V3h3v14h-3Zm5 0v-6h3v6h-3Z"/></svg>',
};
const state = {
  session: null,
  profile: null,
  page: 'dashboard',
  students: [],
  journals: [],
  attendance: [],
  deletionRequests: [],
  deletionFeatureReady: true,
  dashboardJournalFilter: 'all',
  journalStudentFilter: null,
  studentJournalAlerts: { approved: 0, revision: 0, rejected: 0, items: [] },
  reportJournals: [],
};

const $ = (selector) => document.querySelector(selector);
const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));
const roles = {
  admin: 'Administrator',
  student: 'Siswa',
  teacher: 'Guru Pembimbing',
  field_supervisor: 'Pembimbing Lapangan',
};
const stages = [
  'Perencanaan dan persiapan', 'Persemaian', 'Penanaman',
  'Pemeliharaan hutan', 'Perlindungan hutan',
  'Inventarisasi dan monitoring', 'Pemanfaatan hutan',
  'Pengelolaan wisata alam', 'Rehabilitasi hutan',
  'Administrasi dan pelaporan', 'Pemberdayaan masyarakat',
  'Pengukuran dan pemetaan', 'Pengelolaan hasil hutan',
  'Keselamatan dan kesehatan kerja', 'Kegiatan lainnya',
];
const menus = {
  admin: [
    ['dashboard', 'Dashboard'], ['users', 'Akun Pengguna'],
    ['registrations', 'Pendaftaran Siswa'], ['students', 'Data Siswa'],
    ['journals', 'Semua Jurnal'], ['attendance', 'Presensi'],
    ['reports', 'Laporan'],
  ],
  student: [
    ['dashboard', 'Dashboard'], ['my-journal', 'Jurnal Harian'],
    ['my-attendance', 'Presensi Saya'], ['reports', 'Laporan Saya'],
  ],
  teacher: [
    ['dashboard', 'Dashboard'], ['guided-students', 'Siswa Bimbingan'],
    ['journals', 'Monitoring Jurnal'], ['guided-journals', 'Semua Jurnal Bimbingan'],
    ['attendance', 'Kehadiran Siswa'], ['reports', 'Cetak Laporan'],
  ],
  field_supervisor: [
    ['dashboard', 'Dashboard'], ['journals', 'Validasi Jurnal'],
    ['attendance', 'Validasi Presensi'], ['reports', 'Penilaian & Laporan'],
  ],
};

function readableMessage(value, fallback = 'Terjadi kesalahan. Silakan coba kembali.') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value instanceof Error) return readableMessage(value.message, fallback);
  if (value && typeof value === 'object') {
    const candidates = [value.message, value.error_description, value.details, value.hint, value.error];
    for (const candidate of candidates) {
      const text = readableMessage(candidate, '');
      if (text) return text;
    }
    try {
      const serialized = JSON.stringify(value);
      if (serialized && serialized !== '{}') return serialized;
    } catch {}
  }
  return fallback;
}

function toast(message, duration = 3200) {
  const element = $('#toast');
  element.textContent = readableMessage(message);
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), duration);
}

function statusBadge(status) {
  const map = {
    draft: ['Draf', 'gray'], submitted: ['Menunggu validasi', 'yellow'],
    approved: ['Disetujui', 'green'], revision: ['Perlu diperbaiki', 'red'],
    rejected: ['Ditolak', 'red'], pending: ['Menunggu verifikasi', 'yellow'],
  };
  const item = map[status] || [status || '-', 'gray'];
  return `<span class="badge ${item[1]}">${esc(item[0])}</span>`;
}

function userStatusBadge(profile) {
  if (profile.registration_status === 'pending') return statusBadge('pending');
  return profile.is_active
    ? '<span class="badge green">Aktif</span>'
    : '<span class="badge red">Nonaktif</span>';
}

function requireConfig() {
  if (sb) return true;
  $('#loginForm').insertAdjacentHTML('beforebegin',
    '<div class="demo-note error-note"><strong>Belum dikonfigurasi.</strong> Isi <code>config.js</code> dengan URL dan publishable key Supabase.</div>');
  return false;
}

async function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

  const registrationToken = new URLSearchParams(location.search).get('register');
  if (registrationToken === 'student' || registrationToken === 'public') {
    await showPublicStudentRegistrationView();
    return;
  }
  if (registrationToken) {
    await showRegistrationView(registrationToken);
    return;
  }

  if (!requireConfig()) return;
  const { data: { session } } = await sb.auth.getSession();
  if (session) await enterApp(session);
  sb.auth.onAuthStateChange(async (_event, newSession) => {
    state.session = newSession || null;
    if (newSession && !state.profile) await enterApp(newSession);
    if (!newSession) showLogin();
  });
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!sb) return;
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Memeriksa...';
  try {
    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return toast(`Login gagal: ${error.message}`);
    await enterApp(data.session);
  } finally {
    button.disabled = false;
    button.textContent = 'Masuk';
  }
});

$('#logoutBtn').addEventListener('click', () => sb.auth.signOut());
$('#menuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

async function enterApp(session) {
  state.session = session;
  const { data, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  if (error || !data) {
    toast('Profil pengguna belum tersedia. Hubungi administrator.');
    await sb.auth.signOut();
    return;
  }

  if (data.registration_status === 'pending' || data.is_active === false) {
    toast(data.registration_status === 'pending'
      ? 'Pendaftaran Anda masih menunggu verifikasi administrator.'
      : 'Akun Anda belum aktif. Hubungi administrator.', 5000);
    await sb.auth.signOut();
    return;
  }

  state.profile = data;
  $('#loginView').classList.add('hidden');
  $('#registerView').classList.add('hidden');
  $('#publicRegisterView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  $('#userInfo').textContent = `${data.full_name} • ${roles[data.role] || data.role}`;
  const initials = data.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  if ($('#sidebarUserInitials')) $('#sidebarUserInitials').textContent = initials || 'U';
  if ($('#sidebarUserName')) $('#sidebarUserName').textContent = data.full_name;
  if ($('#sidebarUserRole')) $('#sidebarUserRole').textContent = roles[data.role] || data.role;
  if ($('#topbarDate')) $('#topbarDate').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  if (data.role === 'student') await loadStudentJournalAlerts();
  renderNav();
  await navigate('dashboard');
}

function showLogin() {
  state.session = null;
  state.profile = null;
  $('#appView').classList.add('hidden');
  $('#registerView').classList.add('hidden');
  $('#publicRegisterView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}

function renderNav() {
  const items = menus[state.profile.role] || menus.student;
  $('#navMenu').innerHTML = items.map(([id, label]) => {
    const rejectedCount = state.profile.role === 'student' && id === 'my-journal'
      ? Number(state.studentJournalAlerts?.rejected || 0)
      : 0;
    const alertBadge = rejectedCount
      ? `<span class="nav-alert-badge" title="${rejectedCount} jurnal ditolak">${rejectedCount > 99 ? '99+' : rejectedCount}</span>`
      : '';
    return `<button class="nav-btn ${state.page === id ? 'active' : ''}" data-page="${id}"><span class="nav-icon">${navIcons[id] || ''}</span><span class="nav-label">${label}</span>${alertBadge}</button>`;
  }).join('');
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.onclick = () => {
      const targetPage = button.dataset.page;
      if (['journals', 'my-journal', 'guided-journals'].includes(targetPage)) {
        state.dashboardJournalFilter = 'all';
        state.journalStudentFilter = null;
      }
      navigate(targetPage);
    };
  });
}

async function navigate(page) {
  state.page = page;
  document.querySelector('.sidebar').classList.remove('open');
  renderNav();
  const label = (menus[state.profile.role] || []).find((item) => item[0] === page)?.[1] || 'Dashboard';
  $('#pageTitle').textContent = label;
  if ($('#pageEyebrow')) $('#pageEyebrow').textContent = pageDescriptions[page] || 'Ruang kerja E-Jurnal PKL';
  $('#content').innerHTML = '<div class="loading-card"><span class="loading-spinner"></span><div><strong>Memuat data</strong><small>Menyiapkan halaman Anda...</small></div></div>';
  try {
    if (page === 'dashboard') await renderDashboard();
    else if (page === 'users') await renderUsers();
    else if (page === 'registrations') await renderRegistrations();
    else if (page === 'students') await renderStudents();
    else if (page === 'guided-students') await renderGuidedStudents();
    else if (page === 'journals' || page === 'my-journal' || page === 'guided-journals') await renderJournals();
    else if (page === 'attendance' || page === 'my-attendance') await renderAttendance();
    else await renderReports();
  } catch (error) {
    console.error(error);
    $('#content').innerHTML = `<div class="card"><strong>Terjadi kesalahan:</strong> ${esc(error.message)}</div>`;
  }
}

async function loadStudentJournalAlerts() {
  if (!sb || state.profile?.role !== 'student') {
    state.studentJournalAlerts = { approved: 0, revision: 0, rejected: 0, items: [] };
    return state.studentJournalAlerts;
  }
  const { data, error } = await sb.from('daily_journals')
    .select('id,journal_date,activity_title,status,supervisor_note,validated_at')
    .eq('student_id', state.profile.id)
    .in('status', ['approved', 'revision', 'rejected'])
    .order('validated_at', { ascending: false, nullsFirst: false });
  if (error) {
    console.warn('Notifikasi jurnal tidak dapat dimuat:', error);
    return state.studentJournalAlerts;
  }
  const items = data || [];
  state.studentJournalAlerts = {
    approved: items.filter((item) => item.status === 'approved').length,
    revision: items.filter((item) => item.status === 'revision').length,
    rejected: items.filter((item) => item.status === 'rejected').length,
    items,
  };
  return state.studentJournalAlerts;
}

function renderStudentJournalNotifications() {
  const alerts = state.studentJournalAlerts || { approved: 0, revision: 0, rejected: 0, items: [] };
  const cards = [
    { status: 'approved', label: 'Disetujui', count: alerts.approved, icon: '✓', description: 'Jurnal telah diterima pembimbing.' },
    { status: 'revision', label: 'Perlu Perbaikan', count: alerts.revision, icon: '!', description: 'Buka jurnal dan perbaiki sesuai catatan.' },
    { status: 'rejected', label: 'Ditolak', count: alerts.rejected, icon: '×', description: 'Periksa alasan penolakan dari pembimbing.' },
  ];
  const latest = (alerts.items || []).slice(0, 5);
  return `<section class="student-notification-panel">
    <div class="student-notification-heading"><div><span class="section-kicker">PEMBARUAN JURNAL</span><h3>Notifikasi Status Jurnal</h3><p>Klik notifikasi untuk membuka jurnal sesuai statusnya.</p></div><span class="notification-live-dot">● Aktif</span></div>
    <div class="student-status-notification-grid">${cards.map((card) => `<button type="button" class="student-status-notification status-${card.status}" data-status="${card.status}"><span class="notification-status-icon">${card.icon}</span><span class="notification-status-copy"><small>${card.label}</small><strong>${card.count}</strong><p>${card.description}</p></span><span class="notification-arrow">→</span></button>`).join('')}</div>
    <div class="student-notification-feed">${latest.length ? latest.map((item) => `<button type="button" class="notification-feed-item status-${item.status}" data-status="${item.status}"><span class="notification-feed-mark"></span><span><strong>${esc(item.activity_title || 'Jurnal Harian')}</strong><small>${esc(formatAttendanceDate(item.journal_date))} · ${esc(statusBadgeText(item.status))}</small>${item.supervisor_note ? `<p>${esc(item.supervisor_note)}</p>` : ''}</span><span>→</span></button>`).join('') : '<div class="notification-empty"><span>✓</span><p>Belum ada pembaruan status jurnal.</p></div>'}</div>
  </section>`;
}

function statusBadgeText(status) {
  return ({ approved: 'Disetujui', revision: 'Perlu diperbaiki', rejected: 'Ditolak', submitted: 'Menunggu validasi', draft: 'Draf' })[status] || status || '-';
}

async function renderDashboard() {
  const role = state.profile.role;
  if (role === 'student') await loadStudentJournalAlerts();
  let journalQuery = sb.from('daily_journals').select('id,status', { count: 'exact' });
  let attendanceQuery = sb.from('attendance').select('id', { count: 'exact' });
  if (role === 'student') {
    journalQuery = journalQuery.eq('student_id', state.profile.id);
    attendanceQuery = attendanceQuery.eq('student_id', state.profile.id);
  }
  const [journals, attendance] = await Promise.all([journalQuery, attendanceQuery]);
  if (journals.error) throw journals.error;
  if (attendance.error) throw attendance.error;
  const rows = journals.data || [];
  const total = journals.count ?? rows.length;
  const approved = rows.filter((item) => item.status === 'approved').length;
  const pending = rows.filter((item) => item.status === 'submitted').length;
  const revision = rows.filter((item) => item.status === 'revision').length;
  const progress = Math.min(100, Math.round((approved / 40) * 100));
  const firstName = esc((state.profile.full_name || 'Pengguna').split(/\s+/)[0]);
  const roleCopy = {
    admin: ['Pusat Kendali Administrasi', 'Kelola pengguna, pendaftaran, jurnal, dan laporan PKL dalam satu ruang kerja.'],
    student: ['Ruang Belajar Lapangan', 'Dokumentasikan aktivitas, keterampilan, dan pengalaman PKL Anda setiap hari.'],
    teacher: ['Monitoring Pembelajaran PKL', 'Pantau perkembangan siswa dan berikan umpan balik yang membangun.'],
    field_supervisor: ['Validasi Kegiatan Lapangan', 'Pastikan kegiatan dan dokumentasi siswa sesuai kondisi di lapangan.'],
  }[role] || ['E-Jurnal PKL', 'Kelola kegiatan PKL secara tertib, transparan, dan terdokumentasi.'];
  const quickAction = role === 'student'
    ? '<button class="btn hero-primary" id="quickJournal">＋ Tulis Jurnal Hari Ini</button><button class="btn hero-secondary" id="quickAttendance">✓ Isi Presensi</button>'
    : role === 'admin'
      ? '<button class="btn hero-primary" id="quickRegistration">Buka Pendaftaran Siswa</button><button class="btn hero-secondary" id="quickUsers">Kelola Pengguna</button>'
      : role === 'teacher'
        ? '<button class="btn hero-primary" id="quickGuidedStudents">Lihat Siswa Bimbingan</button><button class="btn hero-secondary" id="quickMonitoring">Buka Monitoring Jurnal</button>'
        : '<button class="btn hero-primary" id="quickMonitoring">Buka Monitoring Jurnal</button>';

  $('#content').innerHTML = `<section class="welcome-hero">
    <div class="hero-copy"><span class="hero-kicker">${esc(roleCopy[0])}</span><h2>Selamat datang, ${firstName}.</h2><p>${esc(roleCopy[1])}</p><div class="hero-actions">${quickAction}</div></div>
    <div class="hero-visual"><div class="hero-ring"></div><img src="/assets/logo-sekolah.png" onerror="this.onerror=null;this.src='/assets/logo-sekolah.svg'" alt="Logo sekolah"><span>SMK Kehutanan<br>Rimba Bahari</span></div>
  </section>
  <section class="metric-grid" aria-label="Akses cepat rekap dashboard">
    <button type="button" class="metric-card dashboard-link-card" id="metricTotalJournals" aria-label="Buka seluruh rekap jurnal"><span class="metric-icon forest">${navIcons.journals}</span><div><small>Total Jurnal</small><strong>${total}</strong><p>Catatan kegiatan tersimpan</p><span class="metric-open-hint">Buka rekap jurnal</span></div></button>
    <button type="button" class="metric-card dashboard-link-card" id="metricApprovedJournals" aria-label="Buka rekap jurnal yang disetujui"><span class="metric-icon success">✓</span><div><small>Disetujui</small><strong>${approved}</strong><p>Jurnal tervalidasi</p><span class="metric-open-hint">Lihat jurnal disetujui</span></div></button>
    <button type="button" class="metric-card dashboard-link-card" id="metricPendingJournals" aria-label="Buka rekap jurnal yang menunggu validasi"><span class="metric-icon warning">⌛</span><div><small>Menunggu</small><strong>${pending}</strong><p>Perlu validasi pembimbing</p><span class="metric-open-hint">Lihat jurnal menunggu</span></div></button>
    <button type="button" class="metric-card dashboard-link-card" id="metricAttendance" aria-label="Buka rekap presensi"><span class="metric-icon blue">${navIcons.attendance}</span><div><small>Presensi</small><strong>${attendance.count || 0}</strong><p>Data kehadiran tercatat</p><span class="metric-open-hint">Buka rekap presensi</span></div></button>
  </section>
  ${role === 'student' ? renderStudentJournalNotifications() : ''}
  <section class="dashboard-layout">
    <article class="card progress-card"><div class="card-heading"><div><span class="section-kicker">TARGET PEMBELAJARAN</span><h3>Progres PKL 40 Hari</h3></div><strong class="progress-number">${progress}%</strong></div><div class="progress progress-large"><span style="width:${progress}%"></span></div><div class="progress-meta"><span>${approved} jurnal disetujui</span><span>${Math.max(0, 40 - approved)} jurnal menuju target</span></div></article>
    <article class="card insight-card"><span class="insight-symbol">✦</span><div><span class="section-kicker">PENGINGAT HARI INI</span><h3>Belajar dari pengalaman nyata</h3><p>Tulis kegiatan secara spesifik, tambahkan foto dokumentasi, serta jelaskan keterampilan yang Anda peroleh.</p>${revision ? `<span class="attention-note">${revision} jurnal perlu diperbaiki</span>` : '<span class="success-note">Data Anda tersusun dengan baik</span>'}</div></article>
  </section>`;

  $('#quickJournal')?.addEventListener('click', () => navigate('my-journal'));
  $('#quickAttendance')?.addEventListener('click', () => navigate('my-attendance'));
  $('#quickRegistration')?.addEventListener('click', () => navigate('registrations'));
  $('#quickUsers')?.addEventListener('click', () => navigate('users'));
  $('#quickGuidedStudents')?.addEventListener('click', () => navigate('guided-students'));
  $('#quickMonitoring')?.addEventListener('click', () => navigate('journals'));

  const journalPage = role === 'student' ? 'my-journal' : 'journals';
  const attendancePage = role === 'student' ? 'my-attendance' : 'attendance';
  const openJournalRecap = (filter = 'all') => {
    state.dashboardJournalFilter = filter;
    state.journalStudentFilter = null;
    navigate(journalPage);
  };
  $('#metricTotalJournals')?.addEventListener('click', () => openJournalRecap('all'));
  $('#metricApprovedJournals')?.addEventListener('click', () => openJournalRecap('approved'));
  $('#metricPendingJournals')?.addEventListener('click', () => openJournalRecap('submitted'));
  $('#metricAttendance')?.addEventListener('click', () => navigate(attendancePage));
  document.querySelectorAll('.student-status-notification, .notification-feed-item').forEach((button) => {
    button.addEventListener('click', () => openJournalRecap(button.dataset.status || 'all'));
  });
}

async function renderUsers() {
  if (state.profile.role !== 'admin') return navigate('dashboard');
  const { data, error } = await sb.from('profiles')
    .select('id,full_name,email,role,is_active,registration_status,created_at')
    .order('full_name');
  if (error) throw error;

  const users = data || [];
  const userCounts = {
    total: users.length,
    student: users.filter((item) => item.role === 'student').length,
    teacher: users.filter((item) => item.role === 'teacher').length,
    field_supervisor: users.filter((item) => item.role === 'field_supervisor').length,
    admin: users.filter((item) => item.role === 'admin').length,
  };

  $('#content').innerHTML = `<div class="section-head"><div><span class="section-kicker">MANAJEMEN PENGGUNA</span><h3>Akun Pengguna</h3><p>Administrator dapat mengelola akun, membantu pengguna yang lupa password dengan membuat password sementara baru, serta menghapus langsung akun nonadministrator.</p></div><button class="btn primary" id="addUserBtn">Tambah Akun</button></div>
    <div class="account-summary-grid" aria-label="Ringkasan jumlah akun pengguna">
      <button type="button" class="account-summary-card total active" data-role-summary="" aria-label="Tampilkan semua akun">
        <span class="account-summary-icon">${navIcons.users}</span><span><small>Total Akun</small><strong>${userCounts.total}</strong><em>Seluruh pengguna terdaftar</em></span>
      </button>
      <button type="button" class="account-summary-card student" data-role-summary="student" aria-label="Tampilkan akun siswa">
        <span class="account-summary-icon">S</span><span><small>Siswa</small><strong>${userCounts.student}</strong><em>Akun peserta didik</em></span>
      </button>
      <button type="button" class="account-summary-card teacher" data-role-summary="teacher" aria-label="Tampilkan akun guru pembimbing">
        <span class="account-summary-icon">G</span><span><small>Guru Pembimbing</small><strong>${userCounts.teacher}</strong><em>Akun pembimbing sekolah</em></span>
      </button>
      <button type="button" class="account-summary-card supervisor" data-role-summary="field_supervisor" aria-label="Tampilkan akun pembimbing lapangan">
        <span class="account-summary-icon">PL</span><span><small>Pembimbing Lapangan</small><strong>${userCounts.field_supervisor}</strong><em>Akun pembimbing lokasi PKL</em></span>
      </button>
      <button type="button" class="account-summary-card admin" data-role-summary="admin" aria-label="Tampilkan akun administrator">
        <span class="account-summary-icon">A</span><span><small>Administrator</small><strong>${userCounts.admin}</strong><em>Akun pengelola sistem</em></span>
      </button>
    </div>
    <div class="info-strip password-security-note"><strong>Keamanan password.</strong> Password lama pengguna tidak dapat dilihat. Jika pengguna lupa password, administrator dapat membuat password sementara baru lalu menyalinnya untuk diberikan langsung kepada pengguna.</div><div class="info-strip account-delete-direct-note"><strong>Penghapusan langsung oleh administrator.</strong> Alasan wajib diisi dan tindakan tidak dapat dibatalkan. Akun administrator tetap dilindungi.</div>
    <div class="toolbar user-toolbar"><input id="userSearch" placeholder="Cari nama atau email..."><select id="roleFilter"><option value="">Semua peran</option><option value="student">Siswa</option><option value="teacher">Guru</option><option value="field_supervisor">Pembimbing lapangan</option><option value="admin">Administrator</option></select></div>
    <div class="user-list-caption"><span id="userListCount">Menampilkan ${users.length} akun</span><small>Nomor urut menyesuaikan hasil pencarian dan filter.</small></div>
    <div class="table-wrap user-table-wrap"><table><thead><tr><th class="number-column">No.</th><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Tindakan</th></tr></thead><tbody id="userRows"></tbody></table></div>`;

  const draw = () => {
    const query = $('#userSearch').value.toLowerCase();
    const role = $('#roleFilter').value;
    const filteredUsers = users.filter((item) =>
      (!role || item.role === role) && `${item.full_name} ${item.email}`.toLowerCase().includes(query));

    $('#userRows').innerHTML = filteredUsers.map((item, index) => {
      const deletionAction = item.role === 'admin'
        ? '<span class="protected-account">Dilindungi</span>'
        : `<button class="btn danger delete-user" data-id="${item.id}">Hapus Akun</button>`;
      return `<tr><td class="row-number">${index + 1}</td><td>${esc(item.full_name)}</td><td>${esc(item.email)}</td><td>${esc(roles[item.role] || item.role)}</td><td>${userStatusBadge(item)}</td><td><div class="actions"><button class="btn warn reset-pass" data-id="${item.id}" data-name="${esc(item.full_name)}" data-email="${esc(item.email)}">Bantuan Password</button><button class="btn secondary edit-profile" data-id="${item.id}">Edit</button>${deletionAction}</div></td></tr>`;
    }).join('') || '<tr><td colspan="6" class="empty">Tidak ada data yang sesuai dengan pencarian atau filter.</td></tr>';

    const filterLabel = role ? (roles[role] || role) : 'semua peran';
    $('#userListCount').textContent = `Menampilkan ${filteredUsers.length} dari ${users.length} akun · ${filterLabel}`;
    document.querySelectorAll('.account-summary-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.roleSummary === role);
    });
    bindUserActions(users);
  };

  $('#userSearch').oninput = draw;
  $('#roleFilter').onchange = draw;
  document.querySelectorAll('.account-summary-card').forEach((card) => {
    card.onclick = () => {
      $('#roleFilter').value = card.dataset.roleSummary || '';
      draw();
    };
  });
  $('#addUserBtn').onclick = () => openUserModal();
  draw();
}

function bindUserActions(data) {
  document.querySelectorAll('.reset-pass').forEach((button) => {
    button.onclick = () => openResetModal(button.dataset.id, button.dataset.name, button.dataset.email);
  });
  document.querySelectorAll('.edit-profile').forEach((button) => {
    button.onclick = () => openEditProfile(data.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.delete-user').forEach((button) => {
    button.onclick = () => openDeleteUserModal(data.find((item) => item.id === button.dataset.id));
  });
}

function openDeleteUserModal(profile) {
  if (!profile || profile.role === 'admin') {
    return toast('Akun administrator dilindungi dan tidak dapat dihapus.');
  }

  modal('Hapus Akun Pengguna', `<div class="approval-warning teacher">
    <strong>Administrator akan mengeksekusi penghapusan langsung.</strong>
    <p>Akun autentikasi, profil, dan data terkait akan dihapus permanen tanpa tahap pengajuan tambahan. Tindakan ini tidak dapat dibatalkan.</p>
  </div>
  <div class="card account-delete-summary">
    <p><strong>Nama:</strong> ${esc(profile.full_name)}</p>
    <p><strong>Email:</strong> ${esc(profile.email)}</p>
    <p><strong>Peran:</strong> ${esc(roles[profile.role] || profile.role)}</p>
  </div>
  <form id="deleteUserForm" class="form-stack">
    <label>Alasan penghapusan akun
      <textarea name="reason" minlength="10" maxlength="1000" required placeholder="Contoh: akun dibuat ganda, siswa sudah pindah sekolah, atau data pengguna tidak lagi digunakan"></textarea>
    </label>
    <p class="form-help">Minimal 10 karakter. Alasan dicatat sebagai audit administrator.</p>
    <label>Ketik <strong>HAPUS</strong> untuk mengonfirmasi
      <input name="confirmation" autocomplete="off" placeholder="HAPUS" required>
    </label>
    <div class="actions">
      <button type="submit" class="btn danger" id="deleteUserSubmit">Hapus Akun Permanen</button>
      <button type="button" class="btn secondary modal-close">Batal</button>
    </div>
    <p class="form-help" id="deleteUserStatus" aria-live="polite"></p>
  </form>`);

  $('#deleteUserForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const reason = String(fields.reason || '').trim();
    const confirmation = String(fields.confirmation || '').trim();
    if (reason.length < 10) return toast('Alasan penghapusan minimal 10 karakter.');
    if (confirmation !== 'HAPUS') return toast('Ketik HAPUS dengan huruf kapital untuk melanjutkan.');

    const button = $('#deleteUserSubmit');
    const status = $('#deleteUserStatus');
    button.disabled = true;
    button.textContent = 'Menghapus akun...';
    status.textContent = 'Membersihkan akun dan data terkait. Mohon tunggu.';

    try {
      const result = await api('/api/delete-user', {
        user_id: profile.id,
        confirmation: 'HAPUS',
        reason,
      }, { timeout: 45000 });
      if (result.error) {
        status.textContent = result.error;
        return toast(`Gagal: ${result.error}`);
      }
      closeModal();
      toast(result.warning || result.message || 'Akun berhasil dihapus permanen.');
      await renderUsers();
    } finally {
      if (document.body.contains(button)) {
        button.disabled = false;
        button.textContent = 'Hapus Akun Permanen';
      }
    }
  };
}

function openUserModal() {
  modal('Tambah Akun Pengguna', `<form id="userForm" class="form-grid">
    <label>Nama lengkap<input name="full_name" minlength="2" autocomplete="name" required></label>
    <label>Email<input name="email" type="email" autocomplete="email" required></label>
    <label>Peran<select name="role" required><option value="student">Siswa</option><option value="teacher">Guru pembimbing</option><option value="field_supervisor">Pembimbing lapangan</option><option value="admin">Administrator</option></select></label>
    <label>Password awal<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>
    <label class="wide">Nomor HP<input name="phone" inputmode="tel" autocomplete="tel"></label>
    <div class="wide actions"><button type="submit" class="btn primary" id="createUserSubmit">Buat Akun</button><button type="button" class="btn secondary modal-close">Batal</button></div>
    <p class="wide form-help" id="createUserStatus" aria-live="polite"></p>
  </form>`);
  $('#userForm').onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const button = $('#createUserSubmit');
    const status = $('#createUserStatus');
    button.disabled = true;
    button.textContent = 'Membuat akun...';
    status.textContent = 'Menghubungi server. Mohon jangan tutup halaman.';
    try {
      const fields = Object.fromEntries(new FormData(form));
      fields.email = String(fields.email || '').trim().toLowerCase();
      fields.full_name = String(fields.full_name || '').trim();
      const result = await api('/api/create-user', fields);
      if (result.error) {
        status.textContent = result.error;
        return toast(`Gagal: ${result.error}`);
      }
      closeModal();
      toast('Akun berhasil dibuat');
      await renderUsers();
    } finally {
      if (document.body.contains(button)) {
        button.disabled = false;
        button.textContent = 'Buat Akun';
      }
    }
  };
}

function generateTemporaryPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%';
  const all = upper + lower + digits + symbols;
  const randomIndex = (max) => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  };
  const chars = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    digits[randomIndex(digits.length)],
    symbols[randomIndex(symbols.length)],
  ];
  while (chars.length < Math.max(8, length)) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function copyTextValue(value, input) {
  try {
    await navigator.clipboard.writeText(value);
    toast('Password sementara disalin.');
  } catch {
    if (input) {
      input.focus();
      input.select();
      document.execCommand('copy');
      toast('Password sementara disalin.');
    }
  }
}

function showTemporaryPasswordResult({ name, email, password }) {
  modal('Password Sementara Berhasil Dibuat', `<div class="temporary-password-result">
    <div class="approval-warning teacher"><strong>Password lama tidak ditampilkan.</strong><p>Sistem telah mengganti password akun dengan password sementara baru di bawah ini. Password ini tidak disimpan di profil pengguna.</p></div>
    <div class="card account-delete-summary"><p><strong>Nama:</strong> ${esc(name)}</p><p><strong>Email:</strong> ${esc(email || '-')}</p></div>
    <label class="temporary-password-field">Password sementara
      <div class="temporary-password-copy-row"><input id="temporaryPasswordValue" value="${esc(password)}" readonly><button type="button" class="btn primary" id="copyTemporaryPassword">Salin Password</button></div>
    </label>
    <p class="form-help">Berikan password ini langsung kepada pengguna melalui jalur yang aman. Setelah modal ditutup, aplikasi tidak menyediakan daftar password untuk dibuka kembali.</p>
    <div class="actions"><button type="button" class="btn secondary modal-close">Selesai</button></div>
  </div>`);
  const input = $('#temporaryPasswordValue');
  $('#copyTemporaryPassword').onclick = () => copyTextValue(password, input);
  setTimeout(() => { input?.focus(); input?.select(); }, 50);
}

function openResetModal(id, name, email = '') {
  const initialPassword = generateTemporaryPassword();
  modal('Bantuan Password Pengguna', `<div class="approval-warning teacher"><strong>Password lama tidak dapat dilihat.</strong><p>Untuk membantu pengguna yang lupa password, buat password sementara baru. Setelah reset berhasil, password sementara akan ditampilkan satu kali agar dapat disalin.</p></div>
    <div class="card account-delete-summary"><p><strong>Nama:</strong> ${esc(name)}</p><p><strong>Email:</strong> ${esc(email || '-')}</p></div>
    <form id="resetForm" class="form-stack">
      <label>Password sementara baru
        <div class="temporary-password-copy-row"><input id="newTemporaryPassword" name="new_password" type="text" minlength="8" autocomplete="new-password" value="${esc(initialPassword)}" required><button type="button" class="btn secondary" id="regenerateTemporaryPassword">Buat Acak</button></div>
      </label>
      <label>Ulangi password<input name="confirm" type="text" minlength="8" autocomplete="new-password" value="${esc(initialPassword)}" required></label>
      <p class="form-help">Minimal 8 karakter. Anda dapat memakai password acak yang dibuat sistem atau menggantinya dengan password sementara lain.</p>
      <div class="actions"><button class="btn warn" id="resetPasswordSubmit">Reset & Tampilkan Password</button><button type="button" class="btn secondary modal-close">Batal</button></div>
      <p class="form-help" id="resetPasswordStatus" aria-live="polite"></p>
    </form>`);

  $('#regenerateTemporaryPassword').onclick = () => {
    const password = generateTemporaryPassword();
    $('#newTemporaryPassword').value = password;
    $('#resetForm [name="confirm"]').value = password;
  };

  $('#resetForm').onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    if (fields.new_password !== fields.confirm) return toast('Konfirmasi password tidak sama');
    const button = $('#resetPasswordSubmit');
    const status = $('#resetPasswordStatus');
    button.disabled = true;
    button.textContent = 'Mereset password...';
    status.textContent = 'Memperbarui password pengguna melalui server.';
    try {
      const result = await api('/api/reset-password', { user_id: id, new_password: fields.new_password });
      if (result.error) {
        status.textContent = result.error;
        return toast(result.error);
      }
      const password = String(fields.new_password);
      showTemporaryPasswordResult({ name, email, password });
      toast('Password pengguna berhasil direset.');
    } finally {
      if (document.body.contains(button)) {
        button.disabled = false;
        button.textContent = 'Reset & Tampilkan Password';
      }
    }
  };
}

function openEditProfile(profile) {
  modal('Edit Profil', `<form id="profileForm" class="form-grid"><label>Nama lengkap<input name="full_name" value="${esc(profile.full_name)}" required></label><label>Email<input value="${esc(profile.email)}" disabled></label><label>Peran<select name="role"><option value="student" ${profile.role === 'student' ? 'selected' : ''}>Siswa</option><option value="teacher" ${profile.role === 'teacher' ? 'selected' : ''}>Guru</option><option value="field_supervisor" ${profile.role === 'field_supervisor' ? 'selected' : ''}>Pembimbing lapangan</option><option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>Administrator</option></select></label><label>Status<select name="is_active"><option value="true" ${profile.is_active ? 'selected' : ''}>Aktif</option><option value="false" ${!profile.is_active ? 'selected' : ''}>Nonaktif</option></select></label><div class="wide actions"><button class="btn primary">Simpan</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);
  $('#profileForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.is_active = fields.is_active === 'true';
    if (fields.is_active && profile.registration_status === 'pending') {
      fields.registration_status = 'approved';
      fields.approved_at = new Date().toISOString();
      fields.approved_by = state.profile.id;
    }
    const { error } = await sb.from('profiles').update(fields).eq('id', profile.id);
    if (error) return toast(error.message);
    closeModal();
    toast('Profil diperbarui');
    await renderUsers();
  };
}

async function renderRegistrations() {
  if (state.profile.role !== 'admin') return navigate('dashboard');
  const [inviteResult, pendingResult] = await Promise.all([
    sb.from('student_registration_invites')
      .select('id,full_name,nis,class_name,status,expires_at,created_at,used_at')
      .order('created_at', { ascending: false }),
    sb.from('profiles')
      .select('id,full_name,email,phone,created_at,registration_status,is_active')
      .eq('role', 'student')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false }),
  ]);
  if (inviteResult.error) throw inviteResult.error;
  if (pendingResult.error) throw pendingResult.error;

  const invites = inviteResult.data || [];
  const pending = pendingResult.data || [];
  const pendingIds = pending.map((item) => item.id);
  let details = [];
  if (pendingIds.length) {
    const detailResult = await sb.from('student_details')
      .select('id,nis,class_name,internship_place,start_date,end_date')
      .in('id', pendingIds);
    if (detailResult.error) throw detailResult.error;
    details = detailResult.data || [];
  }
  const detailById = new Map(details.map((item) => [item.id, item]));
  const publicRegistrationLink = `${location.origin}/?register=student`;
  const pendingRows = pending.map((item) => {
    const detail = detailById.get(item.id) || {};
    return `<tr><td><strong>${esc(item.full_name)}</strong><small class="table-subtext">${esc(item.email)}</small></td><td>${esc(detail.nis || '-')}</td><td>${esc(detail.class_name || '-')}</td><td>${esc(detail.internship_place || 'Belum ditentukan')}</td><td>${esc(item.phone || '-')}</td><td>${esc(formatDateTime(item.created_at))}</td><td><button class="btn primary approve-registration" data-id="${item.id}" data-name="${esc(item.full_name)}">Verifikasi & Aktifkan</button></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Tidak ada pendaftaran yang menunggu.</td></tr>';

  $('#content').innerHTML = `<div class="section-head"><div><span class="section-kicker">PENERIMAAN AKUN SISWA</span><h3>Pendaftaran Mandiri Siswa</h3><p class="muted">Siswa mengisi data sendiri melalui satu link umum. Administrator cukup mencocokkan NISN, nama, dan kelas sebelum mengaktifkan akun.</p></div></div>
    <div class="public-link-panel">
      <div class="public-link-icon">↗</div>
      <div class="public-link-copy"><span class="section-kicker">LINK PENDAFTARAN UMUM</span><h4>Bagikan satu link ini kepada seluruh siswa</h4><p>Link tidak kedaluwarsa dan dapat dipasang di grup kelas, website sekolah, atau papan informasi digital.</p><div class="copy-box"><input id="publicRegistrationLink" readonly value="${esc(publicRegistrationLink)}"><button id="copyPublicRegistrationLink" class="btn primary">Salin Link</button><a class="btn secondary inline-link" href="${esc(publicRegistrationLink)}" target="_blank" rel="noopener">Buka Form</a></div></div>
    </div>
    <div class="card"><div class="panel-title"><div><h3>Menunggu Verifikasi (${pending.length})</h3><p>Pastikan siswa masih aktif berdasarkan data sekolah sebelum menekan tombol verifikasi.</p></div></div><div class="table-wrap"><table><thead><tr><th>Nama & Email</th><th>NISN</th><th>Kelas</th><th>Tempat PKL</th><th>Nomor HP</th><th>Tanggal Daftar</th><th>Tindakan</th></tr></thead><tbody>${pendingRows}</tbody></table></div></div>
    <details class="optional-invite-panel mt-16"><summary>Link khusus per siswa (opsional)</summary><div class="optional-invite-body"><div class="section-head compact"><div><h4>Undangan khusus</h4><p class="muted">Gunakan hanya bila sekolah ingin menyiapkan data siswa terlebih dahulu.</p></div><button class="btn secondary" id="createInviteBtn">Buat Link Khusus</button></div><div class="table-wrap"><table><thead><tr><th>Nama Siswa</th><th>NISN</th><th>Kelas</th><th>Status Link</th><th>Kedaluwarsa</th></tr></thead><tbody>${invites.map((item) => `<tr><td>${esc(item.full_name)}</td><td>${esc(item.nis)}</td><td>${esc(item.class_name)}</td><td>${inviteStatusBadge(item)}</td><td>${esc(formatDateTime(item.expires_at))}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Belum ada link khusus.</td></tr>'}</tbody></table></div></div></details>`;

  $('#copyPublicRegistrationLink').onclick = async () => {
    try {
      await navigator.clipboard.writeText(publicRegistrationLink);
      toast('Link pendaftaran umum berhasil disalin.');
    } catch {
      $('#publicRegistrationLink').select();
      document.execCommand('copy');
      toast('Link pendaftaran umum berhasil disalin.');
    }
  };
  $('#createInviteBtn')?.addEventListener('click', () => openInviteModal());
  document.querySelectorAll('.approve-registration').forEach((button) => {
    button.onclick = async () => {
      if (!confirm(`Apakah ${button.dataset.name} sudah dipastikan sebagai siswa aktif sekolah?\n\nPilih OK untuk mengaktifkan akunnya.`)) return;
      button.disabled = true;
      button.textContent = 'Memverifikasi...';
      const result = await api('/api/verify-registration', { user_id: button.dataset.id });
      if (result.error) {
        button.disabled = false;
        button.textContent = 'Verifikasi & Aktifkan';
        return toast(result.error);
      }
      toast('Akun siswa berhasil diverifikasi dan diaktifkan.');
      await renderRegistrations();
    };
  });
}

function inviteStatusBadge(invite) {
  const expired = invite.expires_at && new Date(invite.expires_at).getTime() < Date.now();
  if (invite.status === 'used') return '<span class="badge green">Sudah digunakan</span>';
  if (invite.status === 'revoked') return '<span class="badge red">Dibatalkan</span>';
  if (expired) return '<span class="badge red">Kedaluwarsa</span>';
  if (invite.status === 'processing') return '<span class="badge yellow">Sedang diproses</span>';
  return '<span class="badge gray">Belum digunakan</span>';
}

async function openInviteModal() {
  const [{ data: teachers }, { data: supervisors }] = await Promise.all([
    sb.from('profiles').select('id,full_name').eq('role', 'teacher').eq('is_active', true).order('full_name'),
    sb.from('profiles').select('id,full_name').eq('role', 'field_supervisor').eq('is_active', true).order('full_name'),
  ]);
  modal('Buat Link Pendaftaran Siswa', `<form id="inviteForm" class="form-grid">
    <label>Nama lengkap siswa<input name="full_name" minlength="2" required></label>
    <label>NISN<input name="nis" inputmode="numeric" required placeholder="Nomor Induk Siswa Nasional"></label>
    <label>Kelas<input name="class_name" value="XI" required></label>
    <label>Tempat PKL/KPH/BKPH/RPH<input name="internship_place" required></label>
    <label>Guru pembimbing<select name="teacher_id"><option value="">Belum ditentukan</option>${(teachers || []).map((item) => `<option value="${item.id}">${esc(item.full_name)}</option>`).join('')}</select></label>
    <label>Pembimbing lapangan<select name="field_supervisor_id"><option value="">Belum ditentukan</option>${(supervisors || []).map((item) => `<option value="${item.id}">${esc(item.full_name)}</option>`).join('')}</select></label>
    <label>Tanggal mulai<input name="start_date" type="date"></label>
    <label>Tanggal selesai<input name="end_date" type="date"></label>
    <label>Berlaku selama<select name="valid_days"><option value="7">7 hari</option><option value="14" selected>14 hari</option><option value="30">30 hari</option></select></label>
    <div class="wide actions"><button class="btn primary" id="inviteSubmit">Buat Link</button><button type="button" class="btn secondary modal-close">Batal</button></div>
    <p id="inviteStatus" class="wide form-help"></p>
  </form>`);

  $('#inviteForm').onsubmit = async (event) => {
    event.preventDefault();
    const button = $('#inviteSubmit');
    button.disabled = true;
    button.textContent = 'Membuat link...';
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const result = await api('/api/create-registration-link', fields);
    if (result.error) {
      button.disabled = false;
      button.textContent = 'Buat Link';
      $('#inviteStatus').textContent = result.error;
      return toast(result.error);
    }
    const link = `${location.origin}/?register=${encodeURIComponent(result.token)}`;
    modalReplace('Link Pendaftaran Siap', `<p>Kirim link berikut hanya kepada <strong>${esc(fields.full_name)}</strong>. Link berlaku sampai ${esc(formatDateTime(result.expires_at))}.</p>
      <div class="copy-box"><input id="registrationLink" readonly value="${esc(link)}"><button id="copyRegistrationLink" class="btn primary">Salin Link</button></div>
      <p class="form-help">Link hanya ditampilkan sekarang. Bila hilang, buat link baru.</p>
      <div class="actions"><button type="button" class="btn secondary modal-close">Selesai</button></div>`);
    $('#copyRegistrationLink').onclick = async () => {
      try {
        await navigator.clipboard.writeText(link);
        toast('Link berhasil disalin');
      } catch {
        $('#registrationLink').select();
        document.execCommand('copy');
        toast('Link berhasil disalin');
      }
    };
  };
}

async function showPublicStudentRegistrationView() {
  $('#loginView').classList.add('hidden');
  $('#registerView').classList.add('hidden');
  $('#appView').classList.add('hidden');
  $('#publicRegisterView').classList.remove('hidden');

  const form = $('#publicStudentRegistrationForm');
  form.onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    if (fields.password !== fields.confirm_password) return toast('Konfirmasi password tidak sama.');
    if (fields.active_student_confirmed !== 'true') return toast('Centang pernyataan siswa aktif terlebih dahulu.');

    const button = $('#publicRegistrationSubmit');
    button.disabled = true;
    button.textContent = 'Mengirim pendaftaran...';
    $('#publicRegistrationStatus').textContent = 'Data sedang diperiksa dan akun menunggu dibuat.';

    const result = await publicApi('/api/register-public-student', {
      full_name: fields.full_name,
      nis: fields.nis,
      class_name: fields.class_name,
      internship_place: fields.internship_place,
      email: fields.email,
      phone: fields.phone,
      password: fields.password,
      active_student_confirmed: true,
      website: fields.website,
    });
    if (result.error) {
      button.disabled = false;
      button.textContent = 'Kirim Pendaftaran';
      $('#publicRegistrationStatus').textContent = result.error;
      return toast(result.error, 5000);
    }

    $('#publicRegistrationCard').innerHTML = `<div class="registration-success"><div class="success-mark">✓</div><div class="brand-block"><h1>Pendaftaran Terkirim</h1><p>Data Anda sudah masuk ke administrator sekolah. Akun belum dapat digunakan sebelum NISN, nama, dan kelas diverifikasi sebagai siswa aktif.</p></div><div class="success-summary"><span><strong>Nama</strong>${esc(fields.full_name)}</span><span><strong>NISN</strong>${esc(fields.nis)}</span><span><strong>Kelas</strong>${esc(fields.class_name)}</span></div><a class="btn primary inline-link" href="/">Kembali ke Halaman Login</a></div>`;
  };
}

async function showRegistrationView(token) {
  $('#loginView').classList.add('hidden');
  $('#appView').classList.add('hidden');
  $('#publicRegisterView').classList.add('hidden');
  $('#registerView').classList.remove('hidden');
  const info = await publicApi('/api/register-student', { action: 'info', token });
  if (info.error) {
    $('#registrationCard').innerHTML = `<div class="brand-block"><img src="/assets/logo-sekolah.png" onerror="this.onerror=null;this.src='/assets/logo-sekolah.svg'" alt="Logo sekolah" class="logo"><h1>Link Tidak Dapat Digunakan</h1><p>${esc(info.error)}</p><a class="btn secondary inline-link" href="/">Kembali ke halaman login</a></div>`;
    return;
  }

  $('#registrationStudentName').textContent = info.invite.full_name;
  $('#registrationStudentMeta').textContent = `${info.invite.nis} • ${info.invite.class_name} • ${info.invite.internship_place}`;
  $('#studentRegistrationForm').classList.remove('hidden');
  $('#studentRegistrationForm').onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    if (fields.password !== fields.confirm_password) return toast('Konfirmasi password tidak sama.');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Mendaftarkan...';
    $('#registrationStatus').textContent = 'Membuat akun dan mengirim permohonan verifikasi.';
    const result = await publicApi('/api/register-student', {
      action: 'register', token,
      email: fields.email, phone: fields.phone,
      password: fields.password,
    });
    if (result.error) {
      button.disabled = false;
      button.textContent = 'Daftar Sekarang';
      $('#registrationStatus').textContent = result.error;
      return toast(result.error);
    }
    $('#registrationCard').innerHTML = `<div class="brand-block"><img src="/assets/logo-sekolah.png" onerror="this.onerror=null;this.src='/assets/logo-sekolah.svg'" alt="Logo sekolah" class="logo"><h1>Pendaftaran Berhasil</h1><p>Akun Anda sudah dibuat dan sedang menunggu verifikasi administrator. Anda dapat login setelah administrator mengaktifkan akun.</p><a class="btn primary inline-link" href="/">Kembali ke halaman login</a></div>`;
  };
}

async function renderGuidedStudents() {
  if (state.profile.role !== 'teacher') return navigate('dashboard');

  const { data: studentRows, error: studentError } = await sb.from('student_details')
    .select('*,profiles!student_details_id_fkey(full_name,email,is_active),field_supervisor:profiles!student_details_field_supervisor_id_fkey(full_name)')
    .eq('teacher_id', state.profile.id)
    .order('nis');
  if (studentError) throw studentError;

  const guidedStudents = studentRows || [];
  const studentIds = guidedStudents.map((student) => student.id);
  let journals = [];
  let attendance = [];

  if (studentIds.length) {
    const [journalResult, attendanceResult] = await Promise.all([
      sb.from('daily_journals')
        .select('id,student_id,journal_date,status,activity_title')
        .in('student_id', studentIds)
        .order('journal_date', { ascending: false }),
      sb.from('attendance')
        .select('id,student_id,attendance_date,presence_status')
        .in('student_id', studentIds)
        .order('attendance_date', { ascending: false }),
    ]);
    if (journalResult.error) throw journalResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    journals = journalResult.data || [];
    attendance = attendanceResult.data || [];
  }

  const journalStats = new Map();
  journals.forEach((journal) => {
    const current = journalStats.get(journal.student_id) || {
      total: 0, submitted: 0, approved: 0, revision: 0, latestDate: null, latestTitle: '',
    };
    current.total += 1;
    if (journal.status === 'submitted') current.submitted += 1;
    if (journal.status === 'approved') current.approved += 1;
    if (journal.status === 'revision') current.revision += 1;
    if (!current.latestDate || journal.journal_date > current.latestDate) {
      current.latestDate = journal.journal_date;
      current.latestTitle = journal.activity_title || '';
    }
    journalStats.set(journal.student_id, current);
  });

  const attendanceStats = new Map();
  attendance.forEach((item) => {
    const current = attendanceStats.get(item.student_id) || { total: 0, present: 0, latestDate: null };
    current.total += 1;
    if (String(item.presence_status || '').toLowerCase() === 'hadir') current.present += 1;
    if (!current.latestDate || item.attendance_date > current.latestDate) current.latestDate = item.attendance_date;
    attendanceStats.set(item.student_id, current);
  });

  const rows = guidedStudents.map((student) => ({
    ...student,
    journalStat: journalStats.get(student.id) || { total: 0, submitted: 0, approved: 0, revision: 0, latestDate: null, latestTitle: '' },
    attendanceStat: attendanceStats.get(student.id) || { total: 0, present: 0, latestDate: null },
  }));

  const withJournal = rows.filter((student) => student.journalStat.total > 0).length;
  const withoutJournal = rows.length - withJournal;
  const pendingValidation = rows.reduce((sum, student) => sum + student.journalStat.submitted, 0);

  $('#content').innerHTML = `<div class="page-intro guided-student-intro"><div><span class="section-kicker">MONITORING SISWA BIMBINGAN</span><h3>Siswa Bimbingan Saya</h3><p>Daftar ini tetap menampilkan seluruh siswa yang ditugaskan kepada Anda, termasuk siswa yang belum pernah mengisi jurnal.</p></div><button type="button" class="btn primary btn-emphasis" id="openAllGuidedJournals">Buka Monitoring Jurnal</button></div>
    <div class="guided-summary-grid">
      <article><span>Total bimbingan</span><strong>${rows.length}</strong><small>Seluruh siswa yang ditugaskan</small></article>
      <article class="has-journal"><span>Sudah mengisi</span><strong>${withJournal}</strong><small>Memiliki minimal satu jurnal</small></article>
      <article class="no-journal"><span>Belum mengisi</span><strong>${withoutJournal}</strong><small>Belum memiliki jurnal sama sekali</small></article>
      <article class="pending-journal"><span>Menunggu validasi</span><strong>${pendingValidation}</strong><small>Jurnal yang perlu diperiksa</small></article>
    </div>
    <div class="data-panel guided-student-panel">
      <div class="panel-title"><div><h4>Daftar Siswa Bimbingan</h4><p id="guidedStudentResultInfo">Menampilkan ${rows.length} siswa.</p></div><button type="button" class="btn secondary" id="resetGuidedStudentFilters">Reset Filter</button></div>
      <div class="guided-student-toolbar">
        <label class="guided-search-field"><span>Cari siswa</span><input id="guidedStudentSearch" type="search" placeholder="Nama, NISN, kelas, atau tempat PKL..."></label>
        <label><span>Status jurnal</span><select id="guidedJournalStatus"><option value="">Semua status</option><option value="with">Sudah mengisi jurnal</option><option value="without">Belum mengisi jurnal</option><option value="pending">Menunggu validasi</option><option value="revision">Perlu perbaikan</option></select></label>
        <label><span>Urutkan</span><select id="guidedStudentSort"><option value="name-asc">Nama A–Z</option><option value="nis-asc">NISN terkecil</option><option value="journal-desc">Jurnal terbanyak</option><option value="journal-asc">Jurnal paling sedikit</option><option value="latest-desc">Jurnal terbaru</option></select></label>
      </div>
      <div class="guided-monitor-note"><span>ℹ</span><p>Siswa muncul berdasarkan penetapan <strong>Guru Pembimbing</strong> pada menu Data Siswa. Siswa tanpa jurnal tetap ditampilkan dengan status <strong>Belum Mengisi Jurnal</strong>.</p></div>
      <div class="table-wrap"><table class="guided-student-table"><thead><tr><th>No.</th><th>NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Tempat PKL</th><th>Pembimbing Lapangan</th><th>Jurnal</th><th>Jurnal Terakhir</th><th>Presensi</th><th>Status</th><th>Tindakan</th></tr></thead><tbody id="guidedStudentRows"></tbody></table></div>
    </div>`;

  const compareText = (a, b) => String(a || '').localeCompare(String(b || ''), 'id', { sensitivity: 'base', numeric: true });
  const drawGuidedStudents = () => {
    const query = ($('#guidedStudentSearch').value || '').trim().toLowerCase();
    const status = $('#guidedJournalStatus').value;
    const sort = $('#guidedStudentSort').value;

    const visible = rows.filter((student) => {
      const searchText = `${student.nis || ''} ${student.profiles?.full_name || ''} ${student.profiles?.email || ''} ${student.class_name || ''} ${student.internship_place || ''}`.toLowerCase();
      const matchesStatus = !status
        || (status === 'with' && student.journalStat.total > 0)
        || (status === 'without' && student.journalStat.total === 0)
        || (status === 'pending' && student.journalStat.submitted > 0)
        || (status === 'revision' && student.journalStat.revision > 0);
      return (!query || searchText.includes(query)) && matchesStatus;
    });

    const sorters = {
      'name-asc': (a, b) => compareText(a.profiles?.full_name, b.profiles?.full_name),
      'nis-asc': (a, b) => compareText(a.nis, b.nis),
      'journal-desc': (a, b) => b.journalStat.total - a.journalStat.total || compareText(a.profiles?.full_name, b.profiles?.full_name),
      'journal-asc': (a, b) => a.journalStat.total - b.journalStat.total || compareText(a.profiles?.full_name, b.profiles?.full_name),
      'latest-desc': (a, b) => compareText(b.journalStat.latestDate || '', a.journalStat.latestDate || '') || compareText(a.profiles?.full_name, b.profiles?.full_name),
    };
    visible.sort(sorters[sort] || sorters['name-asc']);

    $('#guidedStudentRows').innerHTML = visible.map((student, index) => {
      const journalStatus = student.journalStat.total === 0
        ? '<span class="guided-status no-entry">Belum Mengisi Jurnal</span>'
        : student.journalStat.submitted > 0
          ? `<span class="guided-status pending">${student.journalStat.submitted} Menunggu Validasi</span>`
          : student.journalStat.revision > 0
            ? `<span class="guided-status revision">${student.journalStat.revision} Perlu Perbaikan</span>`
            : '<span class="guided-status active">Aktif Mengisi</span>';
      const lastJournal = student.journalStat.latestDate
        ? `<strong class="guided-last-date">${esc(formatAttendanceDate(student.journalStat.latestDate))}</strong><small>${esc(student.journalStat.latestTitle || '-')}</small>`
        : '<span class="muted">Belum ada jurnal</span>';
      return `<tr><td><span class="row-number">${index + 1}</span></td><td><strong>${esc(student.nis || '-')}</strong></td><td><strong class="student-name-cell">${esc(student.profiles?.full_name || '-')}</strong><small>${esc(student.profiles?.email || '')}</small></td><td>${esc(student.class_name || '-')}</td><td><span class="placement-cell">${esc(student.internship_place || '-')}</span></td><td>${student.field_supervisor?.full_name ? esc(student.field_supervisor.full_name) : '<span class="assignment-empty">Belum ditetapkan</span>'}</td><td><div class="journal-count-cell"><strong>${student.journalStat.total}</strong><small>${student.journalStat.approved} disetujui</small></div></td><td><div class="guided-last-journal">${lastJournal}</div></td><td><div class="attendance-count-cell"><strong>${student.attendanceStat.total}</strong><small>${student.attendanceStat.present} hadir</small></div></td><td>${journalStatus}</td><td><button type="button" class="btn secondary monitor-guided-student" data-id="${student.id}" data-name="${esc(student.profiles?.full_name || 'Siswa')}">Monitor Jurnal</button></td></tr>`;
    }).join('') || '<tr><td colspan="11" class="empty"><div class="empty-state"><span>⌕</span><strong>Siswa bimbingan tidak ditemukan</strong><p>Ubah pencarian atau reset filter untuk menampilkan data lainnya.</p></div></td></tr>';

    $('#guidedStudentResultInfo').textContent = `Menampilkan ${visible.length} dari ${rows.length} siswa bimbingan.`;
    document.querySelectorAll('.monitor-guided-student').forEach((button) => {
      button.onclick = () => {
        state.dashboardJournalFilter = 'all';
        state.journalStudentFilter = { id: button.dataset.id, name: button.dataset.name };
        navigate('guided-journals');
      };
    });
  };

  $('#guidedStudentSearch').addEventListener('input', drawGuidedStudents);
  $('#guidedJournalStatus').addEventListener('change', drawGuidedStudents);
  $('#guidedStudentSort').addEventListener('change', drawGuidedStudents);
  $('#resetGuidedStudentFilters').onclick = () => {
    $('#guidedStudentSearch').value = '';
    $('#guidedJournalStatus').value = '';
    $('#guidedStudentSort').value = 'name-asc';
    drawGuidedStudents();
  };
  $('#openAllGuidedJournals').onclick = () => {
    state.dashboardJournalFilter = 'all';
    state.journalStudentFilter = null;
    navigate('guided-journals');
  };
  drawGuidedStudents();
}

async function renderStudents() {
  if (state.profile.role !== 'admin') return navigate('dashboard');
  const { data, error } = await sb.from('student_details')
    .select('*,profiles!student_details_id_fkey(full_name,email),teacher:profiles!student_details_teacher_id_fkey(full_name),field_supervisor:profiles!student_details_field_supervisor_id_fkey(full_name)')
    .order('nis');
  if (error) throw error;
  state.students = data || [];

  const places = [...new Set(state.students.map((student) => String(student.internship_place || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
  const teachers = [...new Map(state.students
    .filter((student) => student.teacher_id && student.teacher?.full_name)
    .map((student) => [student.teacher_id, student.teacher.full_name])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'id', { sensitivity: 'base' }));
  const supervisors = [...new Map(state.students
    .filter((student) => student.field_supervisor_id && student.field_supervisor?.full_name)
    .map((student) => [student.field_supervisor_id, student.field_supervisor.full_name])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'id', { sensitivity: 'base' }));

  $('#content').innerHTML = `<div class="page-intro student-data-intro"><div><span class="section-kicker">MONITORING PENEMPATAN PKL</span><h3>Data Siswa</h3><p>Gunakan pencarian, filter, dan pengurutan untuk memantau penempatan serta pembimbing setiap siswa.</p></div><button class="btn primary btn-emphasis" id="addStudentBtn">＋ Tambah Data Siswa</button></div>
    <div class="student-monitor-summary">
      <article><span>Total siswa</span><strong>${state.students.length}</strong><small>Data siswa terdaftar</small></article>
      <article><span>Tempat PKL</span><strong>${places.length}</strong><small>Lokasi penempatan</small></article>
      <article><span>Guru pembimbing</span><strong>${teachers.length}</strong><small>Guru yang ditugaskan</small></article>
      <article><span>Pembimbing lapangan</span><strong>${supervisors.length}</strong><small>Pembimbing yang ditugaskan</small></article>
    </div>
    <div class="data-panel student-monitor-panel">
      <div class="panel-title"><div><h4>Daftar dan Penempatan Siswa</h4><p id="studentResultInfo">Menampilkan ${state.students.length} siswa.</p></div><button type="button" class="btn secondary" id="resetStudentFilters">Reset Filter</button></div>
      <div class="student-monitor-toolbar">
        <label class="student-search-field"><span>Cari siswa</span><input id="studentSearch" type="search" placeholder="Nama, NISN, atau kelas..."></label>
        <label><span>Tempat PKL</span><select id="studentPlaceFilter"><option value="">Semua tempat PKL</option>${places.map((place) => `<option value="${esc(place)}">${esc(place)}</option>`).join('')}</select></label>
        <label><span>Guru Pembimbing</span><select id="studentTeacherFilter"><option value="">Semua guru</option><option value="__unassigned__">Belum ditetapkan</option>${teachers.map(([id, name]) => `<option value="${esc(id)}">${esc(name)}</option>`).join('')}</select></label>
        <label><span>Pembimbing Lapangan</span><select id="studentSupervisorFilter"><option value="">Semua pembimbing</option><option value="__unassigned__">Belum ditetapkan</option>${supervisors.map(([id, name]) => `<option value="${esc(id)}">${esc(name)}</option>`).join('')}</select></label>
        <label><span>Urutkan</span><select id="studentSort"><option value="nis-asc">NISN terkecil</option><option value="nis-desc">NISN terbesar</option><option value="name-asc">Nama A–Z</option><option value="name-desc">Nama Z–A</option><option value="place-asc">Tempat PKL A–Z</option><option value="teacher-asc">Guru A–Z</option><option value="supervisor-asc">Pembimbing Lapangan A–Z</option></select></label>
      </div>
      <div class="active-filter-summary" id="studentActiveFilters"></div>
      <div class="table-wrap"><table class="student-monitor-table"><thead><tr><th>No.</th><th>NISN</th><th>Nama</th><th>Kelas</th><th>Tempat PKL</th><th>Guru</th><th>Pembimbing Lapangan</th><th>Tindakan</th></tr></thead><tbody id="studentRows"></tbody></table></div>
    </div>`;

  const compareText = (a, b) => String(a || '').localeCompare(String(b || ''), 'id', { sensitivity: 'base', numeric: true });
  const matchesAssignment = (selected, id) => !selected || (selected === '__unassigned__' ? !id : id === selected);
  const drawStudents = () => {
    const query = ($('#studentSearch').value || '').trim().toLowerCase();
    const place = $('#studentPlaceFilter').value;
    const teacher = $('#studentTeacherFilter').value;
    const supervisor = $('#studentSupervisorFilter').value;
    const sort = $('#studentSort').value;

    const visible = state.students.filter((student) => {
      const searchText = `${student.nis || ''} ${student.profiles?.full_name || ''} ${student.profiles?.email || ''} ${student.class_name || ''}`.toLowerCase();
      return (!query || searchText.includes(query))
        && (!place || student.internship_place === place)
        && matchesAssignment(teacher, student.teacher_id)
        && matchesAssignment(supervisor, student.field_supervisor_id);
    });

    const sorters = {
      'nis-asc': (a, b) => compareText(a.nis, b.nis),
      'nis-desc': (a, b) => compareText(b.nis, a.nis),
      'name-asc': (a, b) => compareText(a.profiles?.full_name, b.profiles?.full_name),
      'name-desc': (a, b) => compareText(b.profiles?.full_name, a.profiles?.full_name),
      'place-asc': (a, b) => compareText(a.internship_place, b.internship_place) || compareText(a.profiles?.full_name, b.profiles?.full_name),
      'teacher-asc': (a, b) => compareText(a.teacher?.full_name || 'ZZZ', b.teacher?.full_name || 'ZZZ') || compareText(a.profiles?.full_name, b.profiles?.full_name),
      'supervisor-asc': (a, b) => compareText(a.field_supervisor?.full_name || 'ZZZ', b.field_supervisor?.full_name || 'ZZZ') || compareText(a.profiles?.full_name, b.profiles?.full_name),
    };
    visible.sort(sorters[sort] || sorters['nis-asc']);

    $('#studentRows').innerHTML = visible.map((student, index) => `<tr><td><span class="row-number">${index + 1}</span></td><td><strong>${esc(student.nis)}</strong></td><td><strong class="student-name-cell">${esc(student.profiles?.full_name || '-')}</strong><small>${esc(student.profiles?.email || '')}</small></td><td>${esc(student.class_name)}</td><td><span class="placement-cell">${esc(student.internship_place || '-')}</span></td><td>${student.teacher?.full_name ? esc(student.teacher.full_name) : '<span class="assignment-empty">Belum ditetapkan</span>'}</td><td>${student.field_supervisor?.full_name ? esc(student.field_supervisor.full_name) : '<span class="assignment-empty">Belum ditetapkan</span>'}</td><td><button class="btn secondary edit-student" data-id="${student.id}">Edit</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty"><div class="empty-state"><span>⌕</span><strong>Data siswa tidak ditemukan</strong><p>Ubah pencarian atau reset filter untuk menampilkan data lainnya.</p></div></td></tr>';

    $('#studentResultInfo').textContent = `Menampilkan ${visible.length} dari ${state.students.length} siswa.`;
    const filterLabels = [];
    if (query) filterLabels.push(`Pencarian: “${query}”`);
    if (place) filterLabels.push(`Tempat PKL: ${place}`);
    if (teacher) filterLabels.push(teacher === '__unassigned__' ? 'Guru belum ditetapkan' : `Guru: ${teachers.find(([id]) => id === teacher)?.[1] || '-'}`);
    if (supervisor) filterLabels.push(supervisor === '__unassigned__' ? 'Pembimbing lapangan belum ditetapkan' : `Pembimbing: ${supervisors.find(([id]) => id === supervisor)?.[1] || '-'}`);
    $('#studentActiveFilters').innerHTML = filterLabels.length
      ? `<span>Filter aktif</span>${filterLabels.map((label) => `<strong>${esc(label)}</strong>`).join('')}`
      : '<span>Menampilkan seluruh data siswa</span>';

    document.querySelectorAll('.edit-student').forEach((button) => {
      button.onclick = () => openStudentModal(state.students.find((item) => item.id === button.dataset.id));
    });
  };

  ['studentSearch', 'studentPlaceFilter', 'studentTeacherFilter', 'studentSupervisorFilter', 'studentSort'].forEach((id) => {
    const element = $(`#${id}`);
    element.addEventListener(id === 'studentSearch' ? 'input' : 'change', drawStudents);
  });
  $('#resetStudentFilters').onclick = () => {
    $('#studentSearch').value = '';
    $('#studentPlaceFilter').value = '';
    $('#studentTeacherFilter').value = '';
    $('#studentSupervisorFilter').value = '';
    $('#studentSort').value = 'nis-asc';
    drawStudents();
  };
  $('#addStudentBtn').onclick = () => openStudentModal();
  drawStudents();
}

async function openStudentModal(existing = null) {
  const [{ data: students }, { data: teachers }, { data: supervisors }] = await Promise.all([
    sb.from('profiles').select('id,full_name,email').eq('role', 'student').eq('is_active', true),
    sb.from('profiles').select('id,full_name').eq('role', 'teacher').eq('is_active', true),
    sb.from('profiles').select('id,full_name').eq('role', 'field_supervisor').eq('is_active', true),
  ]);
  modal(existing ? 'Edit Data Siswa' : 'Tambah Data Siswa', `<form id="studentForm" class="form-grid"><label>Akun siswa<select name="id" required><option value="">Pilih siswa</option>${(students || []).map((item) => `<option value="${item.id}" ${existing?.id === item.id ? 'selected' : ''}>${esc(item.full_name)} - ${esc(item.email)}</option>`).join('')}</select></label><label>NISN<input name="nis" inputmode="numeric" value="${esc(existing?.nis || '')}" required placeholder="Nomor Induk Siswa Nasional"></label><label>Kelas<input name="class_name" value="${esc(existing?.class_name || 'XI')}" required></label><label>Tempat PKL/KPH/BKPH/RPH<input name="internship_place" value="${esc(existing?.internship_place || '')}" required></label><label>Guru pembimbing<select name="teacher_id"><option value="">Pilih guru</option>${(teachers || []).map((item) => `<option value="${item.id}" ${existing?.teacher_id === item.id ? 'selected' : ''}>${esc(item.full_name)}</option>`).join('')}</select></label><label>Pembimbing lapangan<select name="field_supervisor_id"><option value="">Pilih pembimbing</option>${(supervisors || []).map((item) => `<option value="${item.id}" ${existing?.field_supervisor_id === item.id ? 'selected' : ''}>${esc(item.full_name)}</option>`).join('')}</select></label><label>Tanggal mulai<input name="start_date" type="date" value="${existing?.start_date || ''}"></label><label>Tanggal selesai<input name="end_date" type="date" value="${existing?.end_date || ''}"></label><div class="wide actions"><button class="btn primary">Simpan</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);
  $('#studentForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.teacher_id = fields.teacher_id || null;
    fields.field_supervisor_id = fields.field_supervisor_id || null;
    fields.start_date = fields.start_date || null;
    fields.end_date = fields.end_date || null;
    const { error } = await sb.from('student_details').upsert(fields, { onConflict: 'id' });
    if (error) return toast(error.message);
    closeModal();
    toast('Data siswa disimpan');
    await renderStudents();
  };
}

async function loadJournalDeletionRequests() {
  if (!['student', 'teacher', 'admin'].includes(state.profile.role)) {
    state.deletionRequests = [];
    state.deletionFeatureReady = true;
    return;
  }

  let query = sb.from('journal_deletion_requests')
    .select('*,student:profiles!journal_deletion_requests_student_id_fkey(full_name),reviewer:profiles!journal_deletion_requests_reviewed_by_fkey(full_name)')
    .order('requested_at', { ascending: false });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  if (state.profile.role === 'teacher') query = query.eq('teacher_id', state.profile.id);

  const { data, error } = await query;
  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (error.code === '42P01' || message.includes('journal_deletion_requests')) {
      state.deletionRequests = [];
      state.deletionFeatureReady = false;
      return;
    }
    throw error;
  }
  state.deletionRequests = data || [];
  state.deletionFeatureReady = true;
}

function deletionStatusBadge(status) {
  const map = {
    pending: ['Menunggu guru', 'yellow'],
    approved: ['Disetujui & dihapus', 'green'],
    rejected: ['Ditolak guru', 'red'],
    canceled: ['Dibatalkan', 'gray'],
  };
  const item = map[status] || [status || '-', 'gray'];
  return `<span class="badge ${item[1]}">${esc(item[0])}</span>`;
}

function latestDeletionRequest(journalId) {
  return state.deletionRequests.find((item) => item.journal_id === journalId) || null;
}

function renderStudentDeletionHistory() {
  if (state.profile.role !== 'student' || !state.deletionRequests.length) return '';
  const rows = state.deletionRequests.slice(0, 10).map((request) => `<tr>
    <td>${esc(request.journal_date || '-')}</td>
    <td><strong>${esc(request.activity_title || '-')}</strong></td>
    <td><span class="reason-preview">${esc(request.reason || '-')}</span></td>
    <td>${deletionStatusBadge(request.status)}</td>
    <td>${esc(request.review_note || '-')}</td>
    <td>${formatDateTime(request.requested_at)}</td>
  </tr>`).join('');
  return `<div class="data-panel deletion-history-panel">
    <div class="panel-title"><div><h4>Riwayat Permintaan Penghapusan</h4><p>Permintaan jurnal final tercatat sebagai arsip dan tidak dihapus tanpa persetujuan guru pembimbing.</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Tanggal Jurnal</th><th>Kegiatan</th><th>Alasan Siswa</th><th>Status</th><th>Catatan Guru</th><th>Diajukan</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

function renderTeacherDeletionPanel() {
  if (state.profile.role !== 'teacher') return '';
  const pending = state.deletionRequests.filter((item) => item.status === 'pending');
  const history = state.deletionRequests.filter((item) => item.status !== 'pending').slice(0, 8);
  const pendingRows = pending.map((request) => `<tr>
    <td>${esc(request.student?.full_name || '-')}</td>
    <td>${esc(request.journal_date || '-')}</td>
    <td><strong>${esc(request.activity_title || '-')}</strong></td>
    <td><span class="reason-preview">${esc(request.reason || '-')}</span></td>
    <td>${formatDateTime(request.requested_at)}</td>
    <td><button class="btn warn review-delete-request" data-id="${request.id}">Tinjau Permintaan</button></td>
  </tr>`).join('') || '<tr><td colspan="6" class="empty">Tidak ada permintaan penghapusan yang menunggu.</td></tr>';
  const historyRows = history.map((request) => `<tr>
    <td>${esc(request.student?.full_name || '-')}</td><td>${esc(request.activity_title || '-')}</td><td>${deletionStatusBadge(request.status)}</td><td>${esc(request.review_note || '-')}</td><td>${formatDateTime(request.reviewed_at)}</td>
  </tr>`).join('') || '<tr><td colspan="5" class="empty">Belum ada riwayat keputusan.</td></tr>';

  return `<div class="deletion-review-grid">
    <div class="data-panel deletion-request-panel">
      <div class="panel-title"><div><span class="section-kicker">PERSETUJUAN GURU</span><h4>Permintaan Penghapusan Jurnal (${pending.length})</h4><p>Jurnal yang telah disetujui hanya terhapus setelah guru pembimbing memeriksa alasan siswa.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Siswa</th><th>Tanggal</th><th>Kegiatan</th><th>Alasan</th><th>Diajukan</th><th>Tindakan</th></tr></thead><tbody>${pendingRows}</tbody></table></div>
    </div>
    <div class="data-panel deletion-history-panel">
      <div class="panel-title"><div><h4>Riwayat Keputusan</h4><p>Arsip persetujuan dan penolakan penghapusan jurnal.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Siswa</th><th>Kegiatan</th><th>Status</th><th>Catatan Guru</th><th>Diproses</th></tr></thead><tbody>${historyRows}</tbody></table></div>
    </div>
  </div>`;
}

async function renderJournals() {
  let query = sb.from('daily_journals')
    .select('*,student:profiles!daily_journals_student_id_fkey(full_name),validator:profiles!daily_journals_validated_by_fkey(full_name)')
    .order('journal_date', { ascending: false });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  if (state.profile.role === 'teacher') {
    const guidedResult = await sb.from('student_details').select('id').eq('teacher_id', state.profile.id);
    if (guidedResult.error) throw guidedResult.error;
    const guidedIds = (guidedResult.data || []).map((item) => item.id);
    if (!guidedIds.length) {
      await loadJournalDeletionRequests();
      state.journals = [];
    } else {
      query = query.in('student_id', guidedIds);
      const [{ data, error }] = await Promise.all([query, loadJournalDeletionRequests()]);
      if (error) throw error;
      state.journals = data || [];
    }
  } else {
    const [{ data, error }] = await Promise.all([query, loadJournalDeletionRequests()]);
    if (error) throw error;
    state.journals = data || [];
  }
  const canAdd = state.profile.role === 'student';
  const canAdminDelete = state.profile.role === 'admin';
  const draftCount = state.journals.filter((item) => item.status === 'draft').length;
  const pendingCount = state.journals.filter((item) => item.status === 'submitted').length;
  const approvedCount = state.journals.filter((item) => item.status === 'approved').length;
  const revisionCount = state.journals.filter((item) => item.status === 'revision').length;
  const rejectedCount = state.journals.filter((item) => item.status === 'rejected').length;
  const pendingDeletionCount = state.deletionRequests.filter((item) => item.status === 'pending').length;
  const featureWarning = !state.deletionFeatureReady
    ? '<div class="feature-warning"><strong>Fitur persetujuan penghapusan belum aktif.</strong> Jalankan SQL <code>enable-approved-journal-deletion.sql</code> di Supabase.</div>'
    : '';
  const journalFilter = state.dashboardJournalFilter || 'all';
  const journalFilterLabels = {
    all: 'Semua jurnal',
    draft: 'Jurnal draf',
    submitted: 'Jurnal menunggu validasi',
    approved: 'Jurnal disetujui',
    revision: 'Jurnal perlu perbaikan',
    rejected: 'Jurnal ditolak',
    pending_deletion: 'Jurnal menunggu penghapusan',
  };
  let visibleJournals = journalFilter === 'all'
    ? state.journals
    : journalFilter === 'pending_deletion'
      ? state.journals.filter((item) => {
          const deletionRequest = latestDeletionRequest(item.id);
          return deletionRequest && deletionRequest.status === 'pending';
        })
      : state.journals.filter((item) => item.status === journalFilter);
  if (state.journalStudentFilter?.id) {
    visibleJournals = visibleJournals.filter((item) => item.student_id === state.journalStudentFilter.id);
  }
  const activeJournalFilters = [];
  if (state.journalStudentFilter?.id) activeJournalFilters.push(`Siswa: ${state.journalStudentFilter.name}`);
  if (journalFilter !== 'all') activeJournalFilters.push(journalFilterLabels[journalFilter] || 'Rekap jurnal');
  const activeFilterBar = activeJournalFilters.length
    ? `<div class="dashboard-filter-bar"><div><span>Filter jurnal aktif</span><strong>${esc(activeJournalFilters.join(' · '))}</strong><small>${visibleJournals.length} data ditemukan</small></div><button type="button" class="btn secondary" id="clearDashboardJournalFilter">Tampilkan Semua Jurnal</button></div>`
    : '';

  const journalSummaryCards = [
    { key: 'all', count: state.journals.length, label: 'Semua jurnal', icon: '▤' },
    { key: 'draft', count: draftCount, label: 'Draf', icon: '✎' },
    { key: 'submitted', count: pendingCount, label: 'Menunggu', icon: '⌛' },
    { key: 'approved', count: approvedCount, label: 'Disetujui', icon: '✓' },
    { key: 'revision', count: revisionCount, label: 'Perlu perbaikan', icon: '!' },
    { key: 'rejected', count: rejectedCount, label: 'Ditolak', icon: '×' },
    ...(canAdd ? [{ key: 'pending_deletion', count: pendingDeletionCount, label: 'Menunggu hapus', icon: '⌫' }] : []),
  ];

  const journalStudents = [...new Map(state.journals.map((item) => [item.student_id, item.student?.full_name || 'Siswa'])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'id'));
  const teacherJournalToolbar = state.profile.role === 'teacher'
    ? `<section class="data-panel guided-journal-toolbar"><label><span>Pilih siswa bimbingan</span><select id="guidedJournalStudentFilter"><option value="">Semua siswa bimbingan</option>${journalStudents.map(([id, name]) => `<option value="${esc(id)}" ${state.journalStudentFilter?.id === id ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label><div><strong>${state.journals.length}</strong><span>jurnal siswa bimbingan tersedia</span></div></section>`
    : '';
  const journalPageTitle = state.page === 'guided-journals'
    ? 'Semua Jurnal Siswa Bimbingan'
    : canAdd ? 'Jurnal Harian Saya' : 'Daftar Jurnal Siswa';

  $('#content').innerHTML = `<div class="page-intro"><div><span class="section-kicker">DOKUMENTASI PEMBELAJARAN</span><h3>${journalPageTitle}</h3><p>${canAdd ? 'Catat kegiatan, hasil belajar, kendala, refleksi, dan foto dokumentasi kegiatan PKL.' : 'Pantau catatan kegiatan dan perkembangan pembelajaran siswa selama PKL.'}</p></div>${canAdd ? '<button class="btn primary btn-emphasis" id="addJournalBtn">＋ Isi Jurnal Baru</button>' : ''}</div>
    ${featureWarning}
    ${teacherJournalToolbar}
    ${activeFilterBar}
    <div class="journal-summary clickable-summary">${journalSummaryCards.map((card) => `<button type="button" class="dashboard-link-card journal-filter-card status-${card.key} ${journalFilter === card.key ? 'is-active' : ''}" data-journal-filter="${card.key}" aria-label="Tampilkan ${card.label}" aria-pressed="${journalFilter === card.key}"><span class="journal-card-icon" aria-hidden="true">${card.icon}</span><span class="journal-card-copy"><strong>${card.count}</strong><span>${card.label}</span></span><span class="journal-card-active-label">Aktif</span></button>`).join('')}</div>
    ${renderTeacherDeletionPanel()}
    <div class="data-panel"><div class="panel-title"><div><h4>Riwayat Jurnal</h4><p>Jurnal terbaru ditampilkan paling atas.</p></div>${canAdd ? '<span class="policy-note">Draf/revisi dapat dihapus langsung. Jurnal disetujui memerlukan konfirmasi guru.</span>' : ''}</div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Foto</th><th>Tahapan</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>${visibleJournals.map((journal) => {
      const canModify = canAdd && ['draft', 'revision'].includes(journal.status);
      const canDelete = canAdd && REMOVABLE_JOURNAL_STATUSES.includes(journal.status);
      const deletionRequest = canAdd ? latestDeletionRequest(journal.id) : null;
      const canRequestApprovedDeletion = canAdd && journal.status === 'approved' && state.deletionFeatureReady && (!deletionRequest || deletionRequest.status === 'rejected' || deletionRequest.status === 'canceled');
      const requestButtonLabel = deletionRequest?.status === 'rejected' ? 'Ajukan Ulang Hapus' : 'Ajukan Hapus';
      const requestState = deletionRequest?.status === 'pending'
        ? '<span class="mini-status pending">Menunggu konfirmasi guru</span>'
        : deletionRequest?.status === 'rejected'
          ? '<span class="mini-status rejected">Permintaan sebelumnya ditolak</span>'
          : '';
      return `<tr><td><span class="date-cell">${esc(journal.journal_date)}</span></td><td>${esc(journal.student?.full_name || state.profile.full_name)}</td><td><strong class="activity-title">${esc(journal.activity_title)}</strong><small class="activity-location">${esc(journal.location || '-')}</small>${requestState}</td><td>${(journal.photo_paths || []).length ? `<span class="photo-count">▣ ${journal.photo_paths.length}</span>` : '<span class="muted">—</span>'}</td><td><span class="stage-text">${esc((journal.activity_stages || []).join(', ') || '-')}</span></td><td>${statusBadge(journal.status)}</td><td><div class="actions">${canModify ? `<button class="btn secondary edit-journal" data-id="${journal.id}">Edit</button>` : ''}${!canAdd && journal.status === 'submitted' ? `<button class="btn primary validate-journal" data-id="${journal.id}">Validasi</button>` : ''}<button class="btn secondary view-journal" data-id="${journal.id}">Lihat</button>${canDelete ? `<button class="btn danger delete-journal" data-id="${journal.id}">Hapus</button>` : ''}${canAdminDelete ? `<button class="btn danger admin-delete-journal" data-id="${journal.id}">Hapus Jurnal</button>` : ''}${canRequestApprovedDeletion ? `<button class="btn warn request-delete-journal" data-id="${journal.id}">${requestButtonLabel}</button>` : ''}</div></td></tr>`;
    }).join('') || `<tr><td colspan="7" class="empty"><div class="empty-state"><span>▤</span><strong>${journalFilter === 'all' ? 'Belum ada jurnal' : 'Tidak ada jurnal pada rekap ini'}</strong><p>${journalFilter === 'all' ? 'Mulai dokumentasikan kegiatan PKL Anda.' : 'Gunakan tombol Tampilkan Semua Jurnal untuk kembali ke seluruh data.'}</p></div></td></tr>`}</tbody></table></div></div>
    ${renderStudentDeletionHistory()}`;
  $('#clearDashboardJournalFilter')?.addEventListener('click', async () => {
    state.dashboardJournalFilter = 'all';
    state.journalStudentFilter = null;
    await renderJournals();
  });
  $('#guidedJournalStudentFilter')?.addEventListener('change', async (event) => {
    const id = event.target.value;
    const name = event.target.selectedOptions?.[0]?.textContent || '';
    state.journalStudentFilter = id ? { id, name } : null;
    await renderJournals();
  });
  document.querySelectorAll('.journal-filter-card').forEach((button) => {
    button.addEventListener('click', async () => {
      state.dashboardJournalFilter = button.dataset.journalFilter || 'all';
      await renderJournals();
    });
  });
  if (canAdd) $('#addJournalBtn').onclick = () => openJournalModal();
  document.querySelectorAll('.edit-journal').forEach((button) => {
    button.onclick = () => openJournalModal(state.journals.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.validate-journal').forEach((button) => {
    button.onclick = () => openValidation(state.journals.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.view-journal').forEach((button) => {
    button.onclick = () => viewJournal(state.journals.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.delete-journal').forEach((button) => {
    button.onclick = () => deleteJournal(state.journals.find((item) => item.id === button.dataset.id), button);
  });
  document.querySelectorAll('.admin-delete-journal').forEach((button) => {
    button.onclick = () => openAdminDeleteJournalModal(state.journals.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.request-delete-journal').forEach((button) => {
    button.onclick = () => openDeletionRequestModal(state.journals.find((item) => item.id === button.dataset.id));
  });
  document.querySelectorAll('.review-delete-request').forEach((button) => {
    button.onclick = () => openDeletionReviewModal(state.deletionRequests.find((item) => item.id === button.dataset.id));
  });
}

function openDeletionRequestModal(journal) {
  if (!journal || state.profile.role !== 'student' || journal.student_id !== state.profile.id || journal.status !== 'approved') {
    return toast('Jurnal ini tidak dapat diajukan untuk dihapus.');
  }
  modal('Ajukan Penghapusan Jurnal', `<div class="approval-warning"><strong>Jurnal ini sudah disetujui.</strong><p>Jurnal tidak langsung dihapus. Guru pembimbing akan meninjau alasan Anda terlebih dahulu.</p></div>
    <div class="request-journal-summary"><span>${esc(journal.journal_date)}</span><strong>${esc(journal.activity_title)}</strong><p>${esc(journal.description || '-')}</p></div>
    <form id="deletionRequestForm" class="form-stack">
      <label>Alasan penghapusan jurnal<textarea name="reason" minlength="10" maxlength="1000" required placeholder="Jelaskan kesalahan atau alasan jurnal perlu dihapus, minimal 10 karakter."></textarea></label>
      <p class="form-help">Alasan ini akan dibaca dan menjadi arsip keputusan guru pembimbing.</p>
      <div class="actions"><button class="btn warn" id="submitDeletionRequest">Kirim Permintaan</button><button type="button" class="btn secondary modal-close">Batal</button></div>
    </form>`);
  $('#deletionRequestForm').onsubmit = async (event) => {
    event.preventDefault();
    const button = $('#submitDeletionRequest');
    const reason = String(new FormData(event.currentTarget).get('reason') || '').trim();
    if (reason.length < 10) return toast('Alasan penghapusan minimal 10 karakter.');
    button.disabled = true;
    button.textContent = 'Mengirim...';
    const result = await api('/api/request-journal-deletion', { journal_id: journal.id, reason });
    if (result.error) {
      button.disabled = false;
      button.textContent = 'Kirim Permintaan';
      return toast(result.error, 5000);
    }
    closeModal();
    toast('Permintaan penghapusan dikirim kepada guru pembimbing.');
    await renderJournals();
  };
}

function openDeletionReviewModal(request) {
  if (!request || state.profile.role !== 'teacher' || request.status !== 'pending') {
    return toast('Permintaan ini tidak dapat diproses.');
  }
  modal('Konfirmasi Penghapusan Jurnal', `<div class="approval-warning teacher"><strong>Keputusan guru pembimbing</strong><p>Jika disetujui, jurnal dan foto dokumentasinya akan dihapus permanen. Riwayat permintaan tetap tersimpan.</p></div>
    <div class="review-request-detail">
      <div><span>Siswa</span><strong>${esc(request.student?.full_name || '-')}</strong></div>
      <div><span>Tanggal jurnal</span><strong>${esc(request.journal_date || '-')}</strong></div>
      <div class="wide"><span>Kegiatan</span><strong>${esc(request.activity_title || '-')}</strong></div>
      <div class="wide reason-box"><span>Alasan siswa</span><p>${esc(request.reason || '-')}</p></div>
    </div>
    <form id="deletionReviewForm" class="form-stack">
      <label>Catatan/pertimbangan guru<textarea name="review_note" minlength="5" maxlength="1000" required placeholder="Tuliskan dasar persetujuan atau alasan penolakan."></textarea></label>
      <div class="actions"><button type="button" class="btn danger deletion-decision" data-decision="approved">Konfirmasi & Hapus</button><button type="button" class="btn warn deletion-decision" data-decision="rejected">Tolak Permintaan</button><button type="button" class="btn secondary modal-close">Batal</button></div>
    </form>`);
  document.querySelectorAll('.deletion-decision').forEach((button) => {
    button.onclick = async () => {
      const reviewNote = String(new FormData($('#deletionReviewForm')).get('review_note') || '').trim();
      if (reviewNote.length < 5) return toast('Catatan guru minimal 5 karakter.');
      const decision = button.dataset.decision;
      if (decision === 'approved' && !window.confirm('Yakin menyetujui? Jurnal dan seluruh foto dokumentasinya akan dihapus permanen.')) return;
      document.querySelectorAll('.deletion-decision').forEach((item) => { item.disabled = true; });
      button.textContent = decision === 'approved' ? 'Menghapus...' : 'Memproses...';
      const result = await api('/api/review-journal-deletion', {
        request_id: request.id,
        decision,
        review_note: reviewNote,
      }, { timeout: 30000 });
      if (result.error) {
        document.querySelectorAll('.deletion-decision').forEach((item) => { item.disabled = false; });
        button.textContent = decision === 'approved' ? 'Konfirmasi & Hapus' : 'Tolak Permintaan';
        return toast(result.error, 5000);
      }
      closeModal();
      toast(decision === 'approved' ? 'Penghapusan disetujui dan jurnal telah dihapus.' : 'Permintaan penghapusan ditolak.');
      if (result.warning) toast(result.warning, 6000);
      await renderJournals();
    };
  });
}


function openAdminDeleteJournalModal(journal) {
  if (!journal || state.profile.role !== 'admin') {
    return toast('Hanya administrator yang dapat menghapus jurnal dari menu ini.');
  }
  const reasonOptions = [
    ['duplicate', 'Data jurnal duplikat'],
    ['wrong_entry', 'Kesalahan tanggal atau isi jurnal'],
    ['test_data', 'Data uji/dummy'],
    ['student_request', 'Permintaan siswa'],
    ['teacher_request', 'Permintaan guru pembimbing'],
    ['inappropriate', 'Isi tidak sesuai ketentuan sekolah'],
    ['other', 'Alasan lainnya'],
  ];
  modal('Hapus Jurnal oleh Administrator', `<div class="admin-delete-warning"><strong>Penghapusan berlaku untuk semua status jurnal.</strong><p>Jurnal berstatus draf, menunggu, disetujui, perlu perbaikan, maupun ditolak dapat dihapus. Jurnal dan foto dokumentasinya akan dihapus permanen.</p></div>
    <div class="admin-delete-journal-summary">
      <div><span>Siswa</span><strong>${esc(journal.student?.full_name || '-')}</strong></div>
      <div><span>Tanggal</span><strong>${esc(journal.journal_date || '-')}</strong></div>
      <div><span>Status</span><strong>${statusBadge(journal.status)}</strong></div>
      <div class="wide"><span>Kegiatan</span><strong>${esc(journal.activity_title || '-')}</strong></div>
    </div>
    <form id="adminDeleteJournalForm" class="form-stack">
      <label>Alasan penghapusan<select name="reason_code" required><option value="">Pilih alasan penghapusan</option>${reasonOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
      <label>Catatan administrator<textarea name="reason_detail" minlength="10" maxlength="1000" required placeholder="Jelaskan alasan penghapusan minimal 10 karakter."></textarea></label>
      <label class="danger-confirm-choice"><input type="checkbox" name="delete_confirmation" value="yes" required><span>Saya memahami bahwa jurnal dan seluruh foto dokumentasinya akan dihapus permanen.</span></label>
      <label>Ketik <strong>HAPUS</strong> untuk konfirmasi<input name="confirmation" autocomplete="off" required placeholder="HAPUS"></label>
      <div class="actions"><button class="btn danger" id="confirmAdminDeleteJournal">Hapus Jurnal Permanen</button><button type="button" class="btn secondary modal-close">Batal</button></div>
    </form>`);

  $('#adminDeleteJournalForm').onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const reasonCode = String(values.reason_code || '').trim();
    const reasonDetail = String(values.reason_detail || '').trim();
    const confirmation = String(values.confirmation || '').trim();
    if (!reasonCode) return toast('Pilih alasan penghapusan terlebih dahulu.');
    if (reasonDetail.length < 10) return toast('Catatan administrator minimal 10 karakter.');
    if (values.delete_confirmation !== 'yes') return toast('Centang persetujuan penghapusan permanen.');
    if (confirmation !== 'HAPUS') return toast('Ketik HAPUS dengan huruf kapital untuk melanjutkan.');

    const button = $('#confirmAdminDeleteJournal');
    button.disabled = true;
    button.textContent = 'Menghapus...';
    const result = await api('/api/admin-delete-journal', {
      journal_id: journal.id,
      reason_code: reasonCode,
      reason_detail: reasonDetail,
      confirmation,
    }, { timeout: 30000 });
    if (result.error) {
      button.disabled = false;
      button.textContent = 'Hapus Jurnal Permanen';
      return toast(result.error, 6000);
    }
    closeModal();
    toast('Jurnal berhasil dihapus oleh administrator.');
    if (result.warning) toast(result.warning, 6000);
    await renderJournals();
  };
}

async function deleteJournal(journal, button) {
  if (!journal || state.profile.role !== 'student' || journal.student_id !== state.profile.id) {
    return toast('Jurnal ini tidak dapat dihapus.');
  }
  if (!REMOVABLE_JOURNAL_STATUSES.includes(journal.status)) {
    return toast('Hanya jurnal draf, revisi, atau ditolak yang dapat dihapus.');
  }
  const confirmed = window.confirm(`Hapus jurnal "${journal.activity_title}"?\n\nJurnal dan foto dokumentasinya akan dihapus permanen.`);
  if (!confirmed) return;

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = 'Menghapus...';
  const paths = [...(journal.photo_paths || [])];
  try {
    const { data, error } = await sb.from('daily_journals')
      .delete()
      .eq('id', journal.id)
      .eq('student_id', state.profile.id)
      .in('status', REMOVABLE_JOURNAL_STATUSES)
      .select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('Jurnal tidak terhapus. Jalankan SQL izin hapus jurnal terlebih dahulu.');
    if (paths.length) {
      const { error: storageError } = await sb.storage.from(PHOTO_BUCKET).remove(paths);
      if (storageError) console.warn('Jurnal terhapus, tetapi pembersihan foto gagal:', storageError);
    }
    toast('Jurnal berhasil dihapus.');
    await renderJournals();
  } catch (error) {
    console.error(error);
    button.disabled = false;
    button.textContent = originalText;
    toast(error.message, 5000);
  }
}

async function openJournalModal(journal = null) {
  const checks = stages.map((stage) => `<label class="check-item"><input type="checkbox" name="stages" value="${esc(stage)}" ${(journal?.activity_stages || []).includes(stage) ? 'checked' : ''}>${esc(stage)}</label>`).join('');
  const existingPaths = [...(journal?.photo_paths || [])];
  let keptPaths = [...existingPaths];
  let selectedFiles = [];
  const existingUrls = await signedPhotoUrls(existingPaths);

  modal(journal ? 'Edit Jurnal' : 'Isi Jurnal Harian', `<form id="journalForm" class="form-grid"><label>Tanggal<input name="journal_date" type="date" value="${journal?.journal_date || new Date().toISOString().slice(0, 10)}" required></label><label>Jam kegiatan<input name="work_hours" type="number" min="1" max="12" value="${journal?.work_hours || 7}"></label><label>Lokasi<input name="location" value="${esc(journal?.location || '')}" required></label><label>Cuaca<input name="weather" value="${esc(journal?.weather || '')}"></label><label class="wide">Judul kegiatan<input name="activity_title" value="${esc(journal?.activity_title || '')}" required></label><label class="wide">Uraian kegiatan<textarea id="journalDescription" name="description" required minlength="50" aria-describedby="journalDescriptionHelp journalDescriptionCounter">${esc(journal?.description || '')}</textarea><div class="field-assist"><span id="journalDescriptionHelp" class="form-help description-help">Tuliskan uraian kegiatan minimal 50 karakter agar jurnal dapat disimpan atau dikirim.</span><span id="journalDescriptionCounter" class="character-counter">0/50 karakter</span></div></label><div class="wide"><strong>Tahapan Kegiatan</strong><div class="check-grid">${checks}</div></div><label class="wide">Pengetahuan/keterampilan<textarea name="learning">${esc(journal?.learning || '')}</textarea></label><label class="wide">Kendala dan solusi<textarea name="obstacles">${esc(journal?.obstacles || '')}</textarea></label><label class="wide">Refleksi<textarea name="reflection">${esc(journal?.reflection || '')}</textarea></label>
    <div class="wide photo-field"><strong>Dokumentasi Foto (maksimal ${MAX_JOURNAL_PHOTOS})</strong><p class="form-help">Gunakan kamera belakang HP atau pilih foto dari galeri. Foto akan dikompresi sebelum diunggah.</p><div class="photo-actions"><label class="btn secondary file-button">📷 Ambil Foto<input id="cameraPhotoInput" type="file" accept="image/*" capture="environment" hidden></label><label class="btn secondary file-button">🖼 Pilih dari Galeri<input id="galleryPhotoInput" type="file" accept="image/*" multiple hidden></label></div><div id="photoPreview" class="photo-grid"></div><p id="photoStatus" class="form-help"></p></div>
    <div class="wide actions"><button type="button" id="saveDraft" class="btn secondary">Simpan Draf</button><button class="btn primary" id="submitJournal">Kirim ke Pembimbing</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);

  const drawPhotos = () => {
    const preview = $('#photoPreview');
    const existingItems = keptPaths.map((path) => {
      const url = existingUrls[path];
      return `<div class="photo-preview-item">${url ? `<img src="${esc(url)}" alt="Foto jurnal">` : '<div class="photo-placeholder">Foto</div>'}<button type="button" class="photo-remove" data-existing="${esc(path)}" aria-label="Hapus foto">×</button></div>`;
    }).join('');
    const selectedItems = selectedFiles.map((item, index) => `<div class="photo-preview-item"><img src="${esc(item.previewUrl)}" alt="Foto baru"><button type="button" class="photo-remove" data-new="${index}" aria-label="Hapus foto">×</button></div>`).join('');
    preview.innerHTML = existingItems + selectedItems || '<div class="photo-empty">Belum ada foto.</div>';
    preview.querySelectorAll('[data-existing]').forEach((button) => {
      button.onclick = () => {
        keptPaths = keptPaths.filter((path) => path !== button.dataset.existing);
        drawPhotos();
      };
    });
    preview.querySelectorAll('[data-new]').forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.new);
        URL.revokeObjectURL(selectedFiles[index].previewUrl);
        selectedFiles.splice(index, 1);
        drawPhotos();
      };
    });
  };

  const addFiles = (fileList) => {
    const incoming = [...fileList];
    const available = MAX_JOURNAL_PHOTOS - keptPaths.length - selectedFiles.length;
    if (available <= 0) return toast(`Maksimal ${MAX_JOURNAL_PHOTOS} foto.`);
    for (const file of incoming.slice(0, available)) {
      if (!file.type.startsWith('image/')) {
        toast('Hanya file gambar yang diperbolehkan. Gunakan JPG atau PNG.');
        continue;
      }
      if (file.size > MAX_INPUT_PHOTO_SIZE) {
        toast(`Foto ${file.name} terlalu besar. Maksimal 10 MB.`);
        continue;
      }
      selectedFiles.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    if (incoming.length > available) toast(`Hanya ${available} foto tambahan yang dapat dipilih.`);
    drawPhotos();
  };

  $('#cameraPhotoInput').onchange = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };
  $('#galleryPhotoInput').onchange = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };
  drawPhotos();

  const descriptionInput = $('#journalDescription');
  const descriptionCounter = $('#journalDescriptionCounter');
  const descriptionHelp = $('#journalDescriptionHelp');
  const saveDraftButton = $('#saveDraft');
  const submitJournalButton = $('#submitJournal');
  const MIN_DESCRIPTION_LENGTH = 50;

  const updateDescriptionValidation = (showMessage = false) => {
    const descriptionLength = descriptionInput.value.trim().length;
    const isValid = descriptionLength >= MIN_DESCRIPTION_LENGTH;
    descriptionCounter.textContent = `${descriptionLength}/${MIN_DESCRIPTION_LENGTH} karakter`;
    descriptionCounter.classList.toggle('is-valid', isValid);
    descriptionCounter.classList.toggle('is-invalid', !isValid);
    descriptionHelp.classList.toggle('is-valid', isValid);
    descriptionHelp.classList.toggle('is-invalid', showMessage && !isValid);
    descriptionInput.classList.toggle('input-valid', isValid);
    descriptionInput.classList.toggle('input-invalid', showMessage && !isValid);
    descriptionInput.setCustomValidity(isValid ? '' : `Uraian kegiatan wajib diisi minimal ${MIN_DESCRIPTION_LENGTH} karakter.`);
    saveDraftButton.disabled = !isValid;
    submitJournalButton.disabled = !isValid;
    return isValid;
  };

  descriptionInput.addEventListener('input', () => updateDescriptionValidation(false));
  descriptionInput.addEventListener('blur', () => updateDescriptionValidation(true));
  updateDescriptionValidation(false);

  const save = async (status) => {
    const form = $('#journalForm');
    if (!updateDescriptionValidation(true)) {
      descriptionInput.focus();
      descriptionInput.reportValidity();
      toast('Uraian kegiatan minimal 50 karakter sebelum jurnal dapat disimpan atau dikirim.', 4500);
      return;
    }
    if (!form.reportValidity()) return;
    const submitButton = status === 'draft' ? $('#saveDraft') : $('#submitJournal');
    const otherButton = status === 'draft' ? $('#submitJournal') : $('#saveDraft');
    submitButton.disabled = true;
    otherButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = selectedFiles.length ? 'Mengunggah foto...' : 'Menyimpan...';
    $('#photoStatus').textContent = selectedFiles.length ? 'Mengompresi dan mengunggah foto. Mohon tunggu.' : '';
    const uploadedPaths = [];
    try {
      for (const selected of selectedFiles) {
        const blob = await compressImage(selected.file);
        const path = `${state.profile.id}/${new Date().toISOString().slice(0, 10)}/${randomId()}.jpg`;
        const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, {
          contentType: 'image/jpeg', cacheControl: '3600', upsert: false,
        });
        if (error) throw new Error(`Foto gagal diunggah: ${error.message}`);
        uploadedPaths.push(path);
      }

      const formData = new FormData(form);
      const row = {
        student_id: state.profile.id,
        journal_date: formData.get('journal_date'),
        work_hours: Number(formData.get('work_hours') || 0),
        location: formData.get('location'), weather: formData.get('weather'),
        activity_title: formData.get('activity_title'),
        description: String(formData.get('description') || '').trim(),
        activity_stages: formData.getAll('stages'),
        learning: formData.get('learning'), obstacles: formData.get('obstacles'),
        reflection: formData.get('reflection'), status,
        photo_paths: [...keptPaths, ...uploadedPaths],
      };
      if (journal) row.id = journal.id;
      const { error } = await sb.from('daily_journals').upsert(row);
      if (error) throw error;

      const removedPaths = existingPaths.filter((path) => !keptPaths.includes(path));
      if (removedPaths.length) await sb.storage.from(PHOTO_BUCKET).remove(removedPaths);
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      closeModal();
      toast(status === 'draft' ? 'Draf disimpan' : 'Jurnal dikirim');
      await renderJournals();
    } catch (error) {
      console.error(error);
      if (uploadedPaths.length) await sb.storage.from(PHOTO_BUCKET).remove(uploadedPaths);
      $('#photoStatus').textContent = error.message;
      toast(error.message, 5000);
    } finally {
      if (document.body.contains(submitButton)) {
        submitButton.disabled = false;
        otherButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  };
  $('#journalForm').onsubmit = (event) => { event.preventDefault(); save('submitted'); };
  $('#saveDraft').onclick = () => save('draft');
}

async function openValidation(journal) {
  const gallery = await journalPhotoGallery(journal.photo_paths || []);
  modal('Validasi Jurnal', `<p><strong>${esc(journal.student?.full_name)}</strong> — ${esc(journal.journal_date)}</p><div class="card"><h3>${esc(journal.activity_title)}</h3><p>${esc(journal.description)}</p><p><strong>Tahapan:</strong> ${esc((journal.activity_stages || []).join(', '))}</p>${gallery}</div><form id="validationForm" class="form-stack"><label>Catatan pembimbing<textarea name="supervisor_note">${esc(journal.supervisor_note || '')}</textarea></label><div class="actions"><button type="button" data-status="approved" class="btn primary validation-button">Setujui</button><button type="button" data-status="revision" class="btn warn validation-button">Minta Perbaikan</button><button type="button" data-status="rejected" class="btn danger validation-button">Tolak</button></div></form>`);
  document.querySelectorAll('.validation-button').forEach((button) => {
    button.onclick = async () => {
      const note = new FormData($('#validationForm')).get('supervisor_note');
      const { error } = await sb.from('daily_journals').update({
        status: button.dataset.status, supervisor_note: note,
        validated_by: state.profile.id, validated_at: new Date().toISOString(),
      }).eq('id', journal.id);
      if (error) return toast(error.message);
      closeModal();
      toast('Status jurnal diperbarui');
      await renderJournals();
    };
  });
}

async function viewJournal(journal) {
  const gallery = await journalPhotoGallery(journal.photo_paths || []);
  modal('Detail Jurnal', `<p><strong>Tanggal:</strong> ${esc(journal.journal_date)}</p><p><strong>Siswa:</strong> ${esc(journal.student?.full_name || state.profile.full_name)}</p><p><strong>Lokasi:</strong> ${esc(journal.location)}</p><h3>${esc(journal.activity_title)}</h3><p>${esc(journal.description)}</p><p><strong>Tahapan:</strong> ${esc((journal.activity_stages || []).join(', '))}</p><p><strong>Pengetahuan/keterampilan:</strong> ${esc(journal.learning || '-')}</p><p><strong>Kendala:</strong> ${esc(journal.obstacles || '-')}</p><p><strong>Refleksi:</strong> ${esc(journal.reflection || '-')}</p>${gallery}<p><strong>Status:</strong> ${statusBadge(journal.status)}</p><p><strong>Catatan pembimbing:</strong> ${esc(journal.supervisor_note || '-')}</p>`);
}

async function signedPhotoUrls(paths) {
  if (!paths.length) return {};
  const { data, error } = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  if (error) {
    console.warn('Gagal membuat URL foto:', error);
    return {};
  }
  return Object.fromEntries(paths.map((path, index) => [path, data?.[index]?.signedUrl || '']));
}

async function journalPhotoGallery(paths) {
  if (!paths.length) return '<p><strong>Dokumentasi:</strong> Tidak ada foto.</p>';
  const urls = await signedPhotoUrls(paths);
  const images = paths.map((path, index) => urls[path]
    ? `<a href="${esc(urls[path])}" target="_blank" rel="noopener"><img src="${esc(urls[path])}" alt="Dokumentasi jurnal ${index + 1}"></a>`
    : '').join('');
  return `<div><strong>Dokumentasi:</strong><div class="journal-gallery">${images || '<span class="muted">Foto tidak dapat dibuka.</span>'}</div></div>`;
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve({
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Format foto tidak dapat dibaca. Gunakan foto JPG, PNG, atau ambil foto langsung dari kamera.'));
    };
    image.src = objectUrl;
  });
}

async function decodeImageFile(file) {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close?.(),
      };
    } catch (bitmapError) {
      console.warn('createImageBitmap gagal, mencoba decoder gambar biasa.', bitmapError);
    }
  }

  return loadImageElement(file);
}

async function compressImage(file) {
  let decoded;
  try {
    decoded = await decodeImageFile(file);
    const { source, width, height } = decoded;
    if (!width || !height) throw new Error('Ukuran foto tidak valid.');

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Peramban tidak mendukung pengolahan foto.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Foto gagal dikompresi.')),
        'image/jpeg',
        0.82,
      );
    });
  } catch (error) {
    const rawMessage = String(error?.message || error || '');
    if (/source image could not be decoded|image could not be decoded|decode/i.test(rawMessage)) {
      throw new Error('Foto tidak dapat diproses oleh browser. Pilih foto JPG/PNG lain atau ambil ulang menggunakan kamera HP.');
    }
    throw error;
  } finally {
    decoded?.cleanup?.();
  }
}

function randomId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


function attendanceDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ATTENDANCE_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatAttendanceCapturedAt(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: ATTENDANCE_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

function attendancePhotoEntries(attendance) {
  if (!attendance) return [];
  const entries = [];
  if (attendance.check_in_photo_path) {
    entries.push({
      type: 'check-in',
      label: 'Selfie Datang',
      path: attendance.check_in_photo_path,
      capturedAt: attendance.check_in_captured_at,
    });
  }
  if (attendance.check_out_photo_path) {
    entries.push({
      type: 'check-out',
      label: 'Selfie Pulang',
      path: attendance.check_out_photo_path,
      capturedAt: attendance.check_out_captured_at,
    });
  }
  const known = new Set(entries.map((item) => item.path));
  (attendance.photo_paths || []).forEach((path, index) => {
    if (path && !known.has(path)) entries.push({ label: `Foto Presensi ${index + 1}`, path, capturedAt: null });
  });
  return entries;
}

function attendanceHasCheckIn(attendance) {
  return Boolean(attendance?.check_in_photo_path);
}

function attendanceHasCheckOut(attendance) {
  return Boolean(attendance?.check_out_photo_path);
}

function attendanceSelfieStatusHtml(attendance) {
  const checkIn = attendanceHasCheckIn(attendance);
  const checkOut = attendanceHasCheckOut(attendance);
  return `<div class="attendance-selfie-status">
    <span class="${checkIn ? 'done' : 'missing'}">${checkIn ? '✓' : '○'} Datang</span>
    <span class="${checkOut ? 'done' : 'missing'}">${checkOut ? '✓' : '○'} Pulang</span>
  </div>`;
}

async function renderAttendance() {
  let query = sb.from('attendance')
    .select('*,student:profiles!attendance_student_id_fkey(full_name)')
    .order('attendance_date', { ascending: false });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);

  const { data, error } = await query;
  if (error) throw error;

  const attendanceRows = data || [];
  const studentIds = [...new Set(attendanceRows.map((item) => item.student_id).filter(Boolean))];
  const detailsById = new Map();
  if (studentIds.length) {
    const detailsResult = await sb.from('student_details')
      .select('id,nis,class_name,internship_place')
      .in('id', studentIds);
    if (!detailsResult.error) {
      (detailsResult.data || []).forEach((item) => detailsById.set(item.id, item));
    }
  }

  state.attendance = attendanceRows.map((item) => ({
    ...item,
    student_detail: detailsById.get(item.student_id) || null,
  }));

  const canAdd = state.profile.role === 'student';
  const canExport = ['admin', 'teacher', 'field_supervisor'].includes(state.profile.role);
  const todayKey = attendanceDateKey();
  const todayAttendance = canAdd
    ? state.attendance.find((item) => item.attendance_date === todayKey) || null
    : null;
  const checkInDone = attendanceHasCheckIn(todayAttendance);
  const checkOutDone = attendanceHasCheckOut(todayAttendance);
  const students = [...new Map(state.attendance.map((item) => [
    item.student_id,
    item.student?.full_name || 'Siswa',
  ])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'id'));

  $('#content').innerHTML = `
    <div class="page-intro attendance-page-intro">
      <div>
        <span class="section-kicker">REKAP KEHADIRAN PKL</span>
        <h3>${canAdd ? 'Presensi Saya' : 'Presensi Siswa'}</h3>
        <p>${canAdd
          ? 'Catat kehadiran, waktu masuk, waktu pulang, dan lokasi kegiatan PKL.'
          : 'Filter data kehadiran lalu unduh rekap dalam format Excel, Word, atau PDF.'}</p>
      </div>
      ${canAdd
        ? `<div class="attendance-student-actions">
            <button class="btn primary attendance-action-btn check-in" id="attendanceCheckIn" type="button" ${checkInDone ? 'disabled' : ''}>📸 ${checkInDone ? 'Datang Tercatat' : 'Selfie Datang'}</button>
            <button class="btn secondary attendance-action-btn check-out" id="attendanceCheckOut" type="button" ${!checkInDone || checkOutDone ? 'disabled' : ''}>📸 ${checkOutDone ? 'Pulang Tercatat' : 'Selfie Pulang'}</button>
          </div>`
        : `<div class="attendance-export-actions" aria-label="Ekspor rekap presensi">
            <button class="btn export-btn excel" id="exportAttendanceExcel" type="button">Excel</button>
            <button class="btn export-btn word" id="exportAttendanceWord" type="button">Word</button>
            <button class="btn export-btn pdf" id="exportAttendancePdf" type="button">PDF</button>
          </div>`}
    </div>

    ${canAdd ? `<section class="attendance-today-card ${checkInDone && checkOutDone ? 'complete' : ''}">
      <div class="attendance-today-heading"><div><span>PRESENSI HARI INI</span><strong>${esc(formatAttendanceDate(todayKey, true))}</strong></div>${attendanceSelfieStatusHtml(todayAttendance)}</div>
      <div class="attendance-step-grid">
        <article class="attendance-step ${checkInDone ? 'done' : 'active'}"><span>1</span><div><strong>Selfie Datang</strong><small>${checkInDone ? `Tercatat ${esc(formatAttendanceTime(todayAttendance.check_in))}` : 'Isi lokasi dan catatan, lalu ambil selfie.'}</small></div></article>
        <article class="attendance-step ${checkOutDone ? 'done' : checkInDone ? 'active' : 'locked'}"><span>2</span><div><strong>Selfie Pulang</strong><small>${checkOutDone ? `Tercatat ${esc(formatAttendanceTime(todayAttendance.check_out))}` : checkInDone ? 'Tersedia setelah kegiatan selesai.' : 'Aktif setelah absen datang.'}</small></div></article>
      </div>
      <p class="attendance-time-policy">Jam masuk dan jam pulang tidak diketik manual. Waktu resmi dicatat sistem ketika selfie berhasil dikirim.</p>
    </section>` : ''}

    ${canExport ? `
      <section class="data-panel attendance-filter-panel">
        <div class="attendance-filter-heading">
          <div><strong>Filter Rekap Presensi</strong><span>Data yang tampil akan menjadi data yang diekspor.</span></div>
          <button class="btn secondary" id="resetAttendanceFilter" type="button">Reset Filter</button>
        </div>
        <div class="attendance-filter-grid">
          <label>Tanggal mulai<input id="attendanceStart" type="date"></label>
          <label>Tanggal selesai<input id="attendanceEnd" type="date"></label>
          <label>Siswa<select id="attendanceStudent"><option value="">Semua siswa</option>${students.map(([id, name]) => `<option value="${esc(id)}">${esc(name)}</option>`).join('')}</select></label>
          <label>Status<select id="attendanceStatus"><option value="">Semua status</option><option>Hadir</option><option>Sakit</option><option>Izin</option><option>Tanpa Keterangan</option><option>Dinas Luar</option></select></label>
        </div>
      </section>` : ''}

    <div class="attendance-summary" id="attendanceSummary"></div>

    <section class="data-panel attendance-data-panel">
      <div class="panel-title">
        <div><h4>Rekap Presensi</h4><p id="attendanceResultMeta">Memuat data presensi...</p></div>
        ${canExport ? '<span class="policy-note">Ekspor mengikuti filter aktif</span>' : ''}
      </div>
      <div class="table-wrap">
        <table class="attendance-table">
          <thead><tr><th>Tanggal</th><th>Siswa</th><th>NISN/Kelas</th><th>Masuk</th><th>Pulang</th><th>Status</th><th>Lokasi</th><th>Foto</th><th>Catatan</th><th>Tindakan</th></tr></thead>
          <tbody id="attendanceRows"></tbody>
        </table>
      </div>
    </section>`;

  if (canAdd) {
    $('#attendanceCheckIn')?.addEventListener('click', () => openAttendanceCheckIn(todayAttendance));
    $('#attendanceCheckOut')?.addEventListener('click', () => openAttendanceCheckOut(todayAttendance));
  }
  ['attendanceStart', 'attendanceEnd', 'attendanceStudent', 'attendanceStatus'].forEach((id) => {
    $(`#${id}`)?.addEventListener('change', drawAttendanceTable);
  });
  $('#resetAttendanceFilter')?.addEventListener('click', () => {
    ['attendanceStart', 'attendanceEnd', 'attendanceStudent', 'attendanceStatus'].forEach((id) => {
      const field = $(`#${id}`);
      if (field) field.value = '';
    });
    drawAttendanceTable();
  });
  $('#exportAttendanceExcel')?.addEventListener('click', exportAttendanceExcel);
  $('#exportAttendanceWord')?.addEventListener('click', exportAttendanceWord);
  $('#exportAttendancePdf')?.addEventListener('click', exportAttendancePdf);
  drawAttendanceTable();
}

function getFilteredAttendanceRows() {
  const start = $('#attendanceStart')?.value || '';
  const end = $('#attendanceEnd')?.value || '';
  const studentId = $('#attendanceStudent')?.value || '';
  const status = $('#attendanceStatus')?.value || '';
  return state.attendance.filter((item) => {
    if (start && item.attendance_date < start) return false;
    if (end && item.attendance_date > end) return false;
    if (studentId && item.student_id !== studentId) return false;
    if (status && item.presence_status !== status) return false;
    return true;
  });
}

function formatAttendanceDate(value, long = false) {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', long
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatAttendanceTime(value) {
  return value ? String(value).slice(0, 5) : '-';
}

function attendanceStatusClass(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'hadir') return 'present';
  if (normalized === 'sakit' || normalized === 'izin') return 'permission';
  if (normalized === 'tanpa keterangan') return 'absent';
  return 'other';
}

function drawAttendanceTable() {
  const rows = getFilteredAttendanceRows();
  const present = rows.filter((item) => item.presence_status === 'Hadir').length;
  const permission = rows.filter((item) => ['Sakit', 'Izin'].includes(item.presence_status)).length;
  const absent = rows.filter((item) => item.presence_status === 'Tanpa Keterangan').length;

  const summary = $('#attendanceSummary');
  if (summary) summary.innerHTML = `
    <article><span>Total data</span><strong>${rows.length}</strong><small>Baris presensi</small></article>
    <article><span>Hadir</span><strong>${present}</strong><small>Kehadiran tercatat</small></article>
    <article><span>Sakit/Izin</span><strong>${permission}</strong><small>Dengan keterangan</small></article>
    <article><span>Tanpa keterangan</span><strong>${absent}</strong><small>Perlu tindak lanjut</small></article>`;

  const body = $('#attendanceRows');
  if (body) body.innerHTML = rows.map((item) => {
    const detail = item.student_detail || {};
    const studentName = item.student?.full_name || state.profile.full_name || '-';
    const studentMeta = [detail.nis, detail.class_name].filter(Boolean).join(' • ') || '-';
    return `<tr>
      <td class="date-cell">${esc(formatAttendanceDate(item.attendance_date))}</td>
      <td><strong class="attendance-student-name">${esc(studentName)}</strong></td>
      <td><span class="attendance-student-meta">${esc(studentMeta)}</span></td>
      <td>${esc(formatAttendanceTime(item.check_in))}</td>
      <td>${esc(formatAttendanceTime(item.check_out))}</td>
      <td><span class="attendance-status ${attendanceStatusClass(item.presence_status)}">${esc(item.presence_status || '-')}</span></td>
      <td><div class="attendance-location-stack"><span>${esc(item.location || '-')}</span>${item.check_out_location ? `<small>Pulang: ${esc(item.check_out_location)}</small>` : ''}</div></td>
      <td>${attendanceSelfieStatusHtml(item)}</td>
      <td><div class="attendance-notes-stack"><span>${esc(item.notes || '-')}</span>${item.check_out_notes ? `<small>Pulang: ${esc(item.check_out_notes)}</small>` : ''}</div></td>
      <td><div class="actions attendance-row-actions">${attendancePhotoEntries(item).length ? `<button type="button" class="btn secondary view-attendance-photo" data-id="${item.id}">Lihat Selfie</button>` : '<span class="muted">—</span>'}${state.profile.role === 'admin' ? `<button type="button" class="btn danger delete-attendance" data-id="${item.id}">Hapus Presensi</button>` : ''}</div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="10" class="empty">Tidak ada data presensi yang sesuai dengan filter.</td></tr>';

  document.querySelectorAll('.view-attendance-photo').forEach((button) => {
    button.onclick = () => openAttendancePhotoGallery(state.attendance.find((item) => String(item.id) === String(button.dataset.id)));
  });
  document.querySelectorAll('.delete-attendance').forEach((button) => {
    button.onclick = () => openDeleteAttendanceModal(state.attendance.find((item) => String(item.id) === String(button.dataset.id)));
  });

  const meta = $('#attendanceResultMeta');
  if (meta) meta.textContent = `${rows.length} data • ${getAttendanceReportPeriod(rows)}`;
}


function openDeleteAttendanceModal(attendance) {
  if (state.profile.role !== 'admin') return toast('Hanya administrator yang dapat menghapus presensi.');
  if (!attendance) return toast('Data presensi tidak ditemukan.');

  const studentName = attendance.student?.full_name || 'Siswa';
  const detail = attendance.student_detail || {};
  const studentMeta = [detail.nis, detail.class_name].filter(Boolean).join(' • ') || '-';
  const photoCount = attendancePhotoEntries(attendance).length;

  modal('Hapus Presensi Siswa', `<div class="approval-warning teacher">
    <strong>Presensi akan dihapus permanen.</strong>
    <p>Data jam datang, jam pulang, lokasi, catatan, dan seluruh foto selfie terkait akan dibersihkan. Tindakan ini tidak dapat dibatalkan.</p>
  </div>
  <div class="card attendance-delete-summary">
    <p><strong>Siswa:</strong> ${esc(studentName)}</p>
    <p><strong>NISN/Kelas:</strong> ${esc(studentMeta)}</p>
    <p><strong>Tanggal:</strong> ${esc(formatAttendanceDate(attendance.attendance_date, true))}</p>
    <p><strong>Waktu:</strong> ${esc(formatAttendanceTime(attendance.check_in))} – ${esc(formatAttendanceTime(attendance.check_out))}</p>
    <p><strong>Selfie:</strong> ${photoCount} foto</p>
  </div>
  <form id="deleteAttendanceForm" class="form-stack">
    <label>Ketik <strong>HAPUS</strong> untuk mengonfirmasi
      <input name="confirmation" autocomplete="off" placeholder="HAPUS" required>
    </label>
    <div class="actions">
      <button type="submit" class="btn danger" id="deleteAttendanceSubmit">Hapus Presensi Permanen</button>
      <button type="button" class="btn secondary modal-close">Batal</button>
    </div>
    <p class="form-help" id="deleteAttendanceStatus" aria-live="polite"></p>
  </form>`);

  $('#deleteAttendanceForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (String(fields.confirmation || '').trim() !== 'HAPUS') {
      return toast('Ketik HAPUS dengan huruf kapital untuk melanjutkan.');
    }

    const button = $('#deleteAttendanceSubmit');
    const status = $('#deleteAttendanceStatus');
    button.disabled = true;
    button.textContent = 'Menghapus presensi...';
    status.textContent = 'Membersihkan data presensi dan foto selfie. Mohon tunggu.';

    try {
      const result = await api('/api/delete-attendance', {
        attendance_id: attendance.id,
        confirmation: 'HAPUS',
      }, { timeout: 45000 });
      if (result.error) {
        status.textContent = result.error;
        return toast(`Gagal: ${result.error}`);
      }
      closeModal();
      toast(result.warning || result.message || 'Presensi berhasil dihapus.');
      await renderAttendance();
    } finally {
      if (document.body.contains(button)) {
        button.disabled = false;
        button.textContent = 'Hapus Presensi Permanen';
      }
    }
  };
}

function getAttendanceReportPeriod(rows = getFilteredAttendanceRows()) {
  const startFilter = $('#attendanceStart')?.value || '';
  const endFilter = $('#attendanceEnd')?.value || '';
  if (startFilter && endFilter) return `${formatAttendanceDate(startFilter, true)} - ${formatAttendanceDate(endFilter, true)}`;
  if (startFilter) return `Mulai ${formatAttendanceDate(startFilter, true)}`;
  if (endFilter) return `Sampai ${formatAttendanceDate(endFilter, true)}`;
  const dates = rows.map((item) => item.attendance_date).filter(Boolean).sort();
  if (!dates.length) return 'Semua periode';
  if (dates[0] === dates[dates.length - 1]) return formatAttendanceDate(dates[0], true);
  return `${formatAttendanceDate(dates[0], true)} - ${formatAttendanceDate(dates[dates.length - 1], true)}`;
}

function attendanceReportData(rows = getFilteredAttendanceRows()) {
  return rows.map((item, index) => {
    const detail = item.student_detail || {};
    return {
      no: index + 1,
      date: formatAttendanceDate(item.attendance_date),
      nis: detail.nis || '-',
      name: item.student?.full_name || state.profile.full_name || '-',
      className: detail.class_name || '-',
      internshipPlace: detail.internship_place || '-',
      checkIn: formatAttendanceTime(item.check_in),
      checkOut: formatAttendanceTime(item.check_out),
      status: item.presence_status || '-',
      location: item.location || '-',
      notes: item.notes || '-',
    };
  });
}

function attendanceReportMeta(rows = getFilteredAttendanceRows()) {
  const now = new Date();
  const counts = {};
  rows.forEach((item) => { counts[item.presence_status || 'Lainnya'] = (counts[item.presence_status || 'Lainnya'] || 0) + 1; });
  return {
    school: 'SMK Kehutanan Rimba Bahari Sumedang',
    title: 'REKAP PRESENSI SISWA PKL',
    period: getAttendanceReportPeriod(rows),
    generatedBy: `${state.profile.full_name} - ${roles[state.profile.role] || state.profile.role}`,
    generatedAt: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(now),
    counts,
  };
}

function attendanceFilename(extension) {
  const date = new Date().toISOString().slice(0, 10);
  const student = $('#attendanceStudent')?.selectedOptions?.[0]?.textContent?.trim();
  const suffix = student && $('#attendanceStudent')?.value
    ? `-${student.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`
    : '';
  return `rekap-presensi-pkl${suffix}-${date}.${extension}`;
}

function safeSpreadsheetText(value) {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function requireAttendanceRows() {
  const rows = getFilteredAttendanceRows();
  if (!rows.length) {
    toast('Tidak ada data presensi yang dapat diekspor. Periksa kembali filter.');
    return null;
  }
  return rows;
}

function exportAttendanceExcel() {
  const rows = requireAttendanceRows();
  if (!rows) return;
  if (!window.XLSX) return toast('Modul Excel belum termuat. Periksa koneksi internet lalu muat ulang aplikasi.');

  const report = attendanceReportData(rows);
  const meta = attendanceReportMeta(rows);
  const summaryRows = [
    [meta.title],
    [meta.school],
    [],
    ['Periode', meta.period],
    ['Dicetak oleh', meta.generatedBy],
    ['Waktu ekspor', meta.generatedAt],
    ['Total data', rows.length],
    ...Object.entries(meta.counts).map(([status, total]) => [status, total]),
  ];
  const dataRows = [
    ['No', 'Tanggal', 'NISN', 'Nama Siswa', 'Kelas', 'Tempat PKL', 'Jam Masuk', 'Jam Pulang', 'Status', 'Lokasi', 'Catatan'],
    ...report.map((item) => [item.no, item.date, item.nis, item.name, item.className, item.internshipPlace, item.checkIn, item.checkOut, item.status, item.location, item.notes].map(safeSpreadsheetText)),
  ];

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 22 }, { wch: 55 }];
  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
  dataSheet['!cols'] = [
    { wch: 6 }, { wch: 13 }, { wch: 16 }, { wch: 28 }, { wch: 18 },
    { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 38 },
  ];
  dataSheet['!autofilter'] = { ref: `A1:K${dataRows.length}` };
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data Presensi');
  XLSX.writeFile(workbook, attendanceFilename('xlsx'), { compression: true });
  toast('Rekap presensi Excel berhasil dibuat.');
}

function attendanceReportTableHtml(report) {
  return `<table><thead><tr><th>No</th><th>Tanggal</th><th>NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Tempat PKL</th><th>Masuk</th><th>Pulang</th><th>Status</th><th>Lokasi</th><th>Catatan</th></tr></thead><tbody>${report.map((item) => `<tr><td>${item.no}</td><td>${esc(item.date)}</td><td>${esc(item.nis)}</td><td>${esc(item.name)}</td><td>${esc(item.className)}</td><td>${esc(item.internshipPlace)}</td><td>${esc(item.checkIn)}</td><td>${esc(item.checkOut)}</td><td>${esc(item.status)}</td><td>${esc(item.location)}</td><td>${esc(item.notes)}</td></tr>`).join('')}</tbody></table>`;
}

function attendanceDocumentHtml(rows, autoPrint = false) {
  const report = attendanceReportData(rows);
  const meta = attendanceReportMeta(rows);
  const summary = Object.entries(meta.counts).map(([status, total]) => `<span><b>${esc(status)}:</b> ${total}</span>`).join('');
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(meta.title)}</title><style>
    @page{size:A4 landscape;margin:14mm}body{font-family:Arial,sans-serif;color:#172b4d;font-size:10pt;margin:0}h1{text-align:center;font-size:17pt;margin:0 0 4px;color:#155b43}h2{text-align:center;font-size:11pt;margin:0 0 14px;font-weight:normal}.meta{display:grid;grid-template-columns:130px 1fr;gap:5px;margin:0 0 12px;padding:10px;background:#f2f7f4;border:1px solid #dce8e1}.summary{display:flex;gap:14px;flex-wrap:wrap;margin:0 0 10px;padding:8px 10px;border:1px solid #dce8e1}table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:1px solid #bccbc3;padding:5px;vertical-align:top}th{background:#155b43;color:#fff;text-align:center}tbody tr:nth-child(even){background:#f7faf8}.signature{display:flex;justify-content:flex-end;margin-top:26px}.signature div{width:250px;text-align:center}.signature .space{height:55px}.footer{margin-top:10px;color:#667085;font-size:8pt}
  </style></head><body><h1>${esc(meta.title)}</h1><h2>${esc(meta.school)}</h2><div class="meta"><b>Periode</b><span>${esc(meta.period)}</span><b>Dicetak oleh</b><span>${esc(meta.generatedBy)}</span><b>Waktu cetak</b><span>${esc(meta.generatedAt)}</span></div><div class="summary"><span><b>Total:</b> ${rows.length}</span>${summary}</div>${attendanceReportTableHtml(report)}<div class="signature"><div>Mengetahui,<br>${esc(roles[state.profile.role] || 'Guru Pembimbing')}<div class="space"></div><b>${esc(state.profile.full_name)}</b></div></div><div class="footer">Dokumen dibuat melalui E-Jurnal PKL SMK Kehutanan Rimba Bahari Sumedang.</div>${autoPrint ? '<script>window.onload=function(){window.print();}<\/script>' : ''}</body></html>`;
}

function exportAttendanceWord() {
  const rows = requireAttendanceRows();
  if (!rows) return;
  const html = attendanceDocumentHtml(rows);
  downloadBlob(new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' }), attendanceFilename('doc'));
  toast('Rekap presensi Word berhasil dibuat.');
}

function exportAttendancePdf() {
  const rows = requireAttendanceRows();
  if (!rows) return;
  const JsPdf = window.jspdf?.jsPDF;
  if (!JsPdf) {
    toast('Modul PDF belum termuat. Dialog cetak dibuka sebagai alternatif.');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast('Izinkan pop-up browser untuk mencetak PDF.');
    printWindow.document.write(attendanceDocumentHtml(rows, true));
    printWindow.document.close();
    return;
  }

  const report = attendanceReportData(rows);
  const meta = attendanceReportMeta(rows);
  const documentPdf = new JsPdf({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  documentPdf.setTextColor(21, 91, 67);
  documentPdf.setFont('helvetica', 'bold');
  documentPdf.setFontSize(15);
  documentPdf.text(meta.title, 148.5, 13, { align: 'center' });
  documentPdf.setTextColor(23, 43, 77);
  documentPdf.setFont('helvetica', 'normal');
  documentPdf.setFontSize(9);
  documentPdf.text(meta.school, 148.5, 19, { align: 'center' });
  documentPdf.setFontSize(7.5);
  documentPdf.text(`Periode: ${meta.period}`, 12, 26);
  documentPdf.text(`Dicetak oleh: ${meta.generatedBy}`, 12, 31);
  documentPdf.text(`Total: ${rows.length} data`, 285, 26, { align: 'right' });
  documentPdf.text(meta.generatedAt, 285, 31, { align: 'right' });

  if (typeof documentPdf.autoTable !== 'function') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast('Modul tabel PDF belum termuat dan pop-up diblokir browser.');
    printWindow.document.write(attendanceDocumentHtml(rows, true));
    printWindow.document.close();
    return;
  }

  documentPdf.autoTable({
    startY: 36,
    head: [['No', 'Tanggal', 'NISN', 'Nama', 'Kelas', 'Tempat PKL', 'Masuk', 'Pulang', 'Status', 'Lokasi', 'Catatan']],
    body: report.map((item) => [item.no, item.date, item.nis, item.name, item.className, item.internshipPlace, item.checkIn, item.checkOut, item.status, item.location, item.notes]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 6.5, cellPadding: 1.6, textColor: [23, 43, 77], valign: 'middle' },
    headStyles: { fillColor: [21, 91, 67], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [247, 250, 248] },
    margin: { left: 10, right: 10, bottom: 16 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 18 }, 2: { cellWidth: 17 },
      3: { cellWidth: 33 }, 4: { cellWidth: 22 }, 5: { cellWidth: 34 },
      6: { cellWidth: 14, halign: 'center' }, 7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 24 }, 9: { cellWidth: 39 }, 10: { cellWidth: 45 },
    },
    didDrawPage: () => {
      documentPdf.setFontSize(7);
      documentPdf.setTextColor(102, 112, 133);
      documentPdf.text(`E-Jurnal PKL • Halaman ${documentPdf.internal.getNumberOfPages()}`, 285, 202, { align: 'right' });
    },
  });

  const finalY = documentPdf.lastAutoTable?.finalY || 165;
  if (finalY > 175) documentPdf.addPage('a4', 'landscape');
  const signatureY = finalY > 175 ? 25 : finalY + 14;
  documentPdf.setTextColor(23, 43, 77);
  documentPdf.setFontSize(8);
  documentPdf.text('Mengetahui,', 250, signatureY, { align: 'center' });
  documentPdf.text(roles[state.profile.role] || 'Guru Pembimbing', 250, signatureY + 5, { align: 'center' });
  documentPdf.setFont('helvetica', 'bold');
  documentPdf.text(state.profile.full_name, 250, signatureY + 24, { align: 'center' });
  documentPdf.save(attendanceFilename('pdf'));
  toast('Rekap presensi PDF berhasil dibuat.');
}

async function openAttendancePhotoGallery(attendance) {
  const entries = attendancePhotoEntries(attendance);
  if (!attendance || !entries.length) return toast('Selfie presensi tidak tersedia.');
  const urls = await signedPhotoUrls(entries.map((item) => item.path));
  const images = entries.map((entry) => urls[entry.path]
    ? `<article class="attendance-selfie-card"><div><strong>${esc(entry.label)}</strong><span>${esc(formatAttendanceCapturedAt(entry.capturedAt))}</span></div><a href="${esc(urls[entry.path])}" target="_blank" rel="noopener"><img src="${esc(urls[entry.path])}" alt="${esc(entry.label)}"></a></article>`
    : '').join('');
  modal('Selfie Presensi', `<div class="attendance-photo-detail"><p><strong>Tanggal:</strong> ${esc(formatAttendanceDate(attendance.attendance_date, true))}</p><p><strong>Siswa:</strong> ${esc(attendance.student?.full_name || state.profile.full_name || '-')}</p><div class="attendance-selfie-gallery">${images || '<span class="muted">Selfie tidak dapat dibuka.</span>'}</div></div>`);
}

function renderSelfieCapturePreview(selectedSelfie, previewId, statusId) {
  const preview = $(`#${previewId}`);
  const status = $(`#${statusId}`);
  if (!preview || !status) return;
  if (!selectedSelfie) {
    preview.innerHTML = '<div class="selfie-empty">Belum ada selfie. Gunakan kamera depan untuk mengambil foto terbaru.</div>';
    status.textContent = '';
    return;
  }
  preview.innerHTML = `<div class="selfie-preview-card"><img src="${esc(selectedSelfie.previewUrl)}" alt="Pratinjau selfie"><div><strong>Selfie siap dikirim</strong><span>${esc(formatAttendanceCapturedAt(selectedSelfie.capturedAt))}</span></div></div>`;
  status.textContent = 'Waktu resmi akan dicatat server saat selfie berhasil dikirim.';
}

function setupAttendanceSelfieForm({ formId, inputId, previewId, statusId, submitId, requiredFieldNames, onSubmit }) {
  const form = $(`#${formId}`);
  const input = $(`#${inputId}`);
  const submit = $(`#${submitId}`);
  let selectedSelfie = null;

  const refresh = () => {
    const formData = new FormData(form);
    const fieldsReady = requiredFieldNames.every((name) => String(formData.get(name) || '').trim().length >= 3);
    const ready = fieldsReady && Boolean(selectedSelfie);
    submit.disabled = !ready;
    form.querySelectorAll('[data-required-check]').forEach((item) => {
      const key = item.dataset.requiredCheck;
      const ok = key === 'selfie'
        ? Boolean(selectedSelfie)
        : String(formData.get(key) || '').trim().length >= 3;
      item.classList.toggle('ready', ok);
      item.classList.toggle('missing', !ok);
      item.querySelector('b').textContent = ok ? '✓' : '○';
    });
  };

  input.onchange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Selfie harus berupa file gambar.');
    if (file.size > MAX_INPUT_PHOTO_SIZE) return toast('Ukuran selfie maksimal 10 MB.');
    if (selectedSelfie?.previewUrl) URL.revokeObjectURL(selectedSelfie.previewUrl);
    selectedSelfie = { file, previewUrl: URL.createObjectURL(file), capturedAt: new Date() };
    renderSelfieCapturePreview(selectedSelfie, previewId, statusId);
    refresh();
  };

  requiredFieldNames.forEach((name) => form.elements[name]?.addEventListener('input', refresh));
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !selectedSelfie) return refresh();
    await onSubmit({ form, selectedSelfie, submit });
  };
  renderSelfieCapturePreview(null, previewId, statusId);
  refresh();
}

function openAttendanceCheckIn(existingAttendance = null) {
  const today = attendanceDateKey();
  modal('Absen Datang', `<form id="attendanceCheckInForm" class="form-grid attendance-selfie-form">
    <div class="wide attendance-form-banner check-in"><span>SELFIE DATANG</span><strong>${esc(formatAttendanceDate(today, true))}</strong><p>Jam masuk akan dicatat otomatis saat selfie berhasil dikirim. Jam tidak dapat diisi manual.</p></div>
    <label class="wide">Lokasi datang <span class="required-mark">Wajib</span><input name="location" value="${esc(existingAttendance?.location || '')}" placeholder="Contoh: Kantor BPHL Wil VII Ciamis" minlength="3" required></label>
    <label class="wide">Catatan kegiatan awal <span class="required-mark">Wajib</span><textarea name="notes" placeholder="Contoh: Hadir dan siap mengikuti kegiatan PKL hari ini." minlength="3" required>${esc(existingAttendance?.notes || '')}</textarea></label>
    <div class="wide selfie-capture-box"><div><strong>Selfie datang</strong><p>Gunakan kamera depan. Foto menjadi dasar pencatatan jam masuk.</p></div><label class="btn primary file-button">🤳 Ambil Selfie Datang<input id="checkInSelfieInput" type="file" accept="image/*" capture="user" hidden></label><div id="checkInSelfiePreview" class="selfie-preview"></div><p id="checkInSelfieStatus" class="form-help"></p></div>
    <div class="wide attendance-required-list"><span data-required-check="location"><b>○</b> Lokasi sudah diisi</span><span data-required-check="notes"><b>○</b> Catatan sudah diisi</span><span data-required-check="selfie"><b>○</b> Selfie datang tersedia</span></div>
    <div class="wide actions"><button class="btn primary" id="submitCheckIn" disabled>Kirim Absen Datang</button><button type="button" class="btn secondary modal-close">Batal</button></div>
  </form>`);

  setupAttendanceSelfieForm({
    formId: 'attendanceCheckInForm', inputId: 'checkInSelfieInput', previewId: 'checkInSelfiePreview', statusId: 'checkInSelfieStatus', submitId: 'submitCheckIn', requiredFieldNames: ['location', 'notes'],
    onSubmit: async ({ form, selectedSelfie, submit }) => {
      const originalText = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Mengirim selfie datang...';
      let uploadedPath = null;
      try {
        const blob = await compressImage(selectedSelfie.file);
        uploadedPath = `${state.profile.id}/attendance/${today}/check-in-${randomId()}.jpg`;
        const upload = await sb.storage.from(PHOTO_BUCKET).upload(uploadedPath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
        if (upload.error) throw new Error(`Selfie datang gagal diunggah: ${upload.error.message}`);
        const data = Object.fromEntries(new FormData(form));
        const legacyPaths = attendancePhotoEntries(existingAttendance).map((item) => item.path).filter((path) => path !== existingAttendance?.check_in_photo_path);
        const fields = {
          student_id: state.profile.id,
          attendance_date: today,
          presence_status: 'Hadir',
          location: data.location.trim(),
          notes: data.notes.trim(),
          check_in_photo_path: uploadedPath,
          photo_paths: [...new Set([uploadedPath, ...legacyPaths])],
        };
        const result = existingAttendance?.id
          ? await sb.from('attendance').update(fields).eq('id', existingAttendance.id)
          : await sb.from('attendance').upsert(fields, { onConflict: 'student_id,attendance_date' });
        if (result.error) throw result.error;
        URL.revokeObjectURL(selectedSelfie.previewUrl);
        closeModal();
        toast('Absen datang berhasil. Jam masuk dicatat berdasarkan waktu selfie.');
        await renderAttendance();
      } catch (error) {
        console.error(error);
        if (uploadedPath) await sb.storage.from(PHOTO_BUCKET).remove([uploadedPath]);
        $('#checkInSelfieStatus').textContent = error.message || 'Absen datang gagal dikirim.';
        toast(error.message || 'Absen datang gagal dikirim.', 5000);
      } finally {
        if (document.body.contains(submit)) {
          submit.textContent = originalText;
          submit.disabled = false;
        }
      }
    },
  });
}

function openAttendanceCheckOut(existingAttendance) {
  if (!attendanceHasCheckIn(existingAttendance)) return toast('Lakukan selfie datang terlebih dahulu.');
  if (attendanceHasCheckOut(existingAttendance)) return toast('Absen pulang hari ini sudah tercatat.');
  modal('Absen Pulang', `<form id="attendanceCheckOutForm" class="form-grid attendance-selfie-form">
    <div class="wide attendance-form-banner check-out"><span>SELFIE PULANG</span><strong>Masuk ${esc(formatAttendanceTime(existingAttendance.check_in))}</strong><p>Jam pulang akan dicatat otomatis saat selfie pulang berhasil dikirim.</p></div>
    <label class="wide">Lokasi pulang <span class="required-mark">Wajib</span><input name="check_out_location" placeholder="Contoh: Kantor BPHL Wil VII Ciamis" minlength="3" required></label>
    <label class="wide">Catatan akhir kegiatan <span class="required-mark">Wajib</span><textarea name="check_out_notes" placeholder="Contoh: Kegiatan hari ini selesai dan saya meninggalkan lokasi PKL." minlength="3" required></textarea></label>
    <div class="wide selfie-capture-box"><div><strong>Selfie pulang</strong><p>Gunakan kamera depan. Foto menjadi dasar pencatatan jam pulang.</p></div><label class="btn primary file-button">🤳 Ambil Selfie Pulang<input id="checkOutSelfieInput" type="file" accept="image/*" capture="user" hidden></label><div id="checkOutSelfiePreview" class="selfie-preview"></div><p id="checkOutSelfieStatus" class="form-help"></p></div>
    <div class="wide attendance-required-list"><span data-required-check="check_out_location"><b>○</b> Lokasi pulang sudah diisi</span><span data-required-check="check_out_notes"><b>○</b> Catatan akhir sudah diisi</span><span data-required-check="selfie"><b>○</b> Selfie pulang tersedia</span></div>
    <div class="wide actions"><button class="btn primary" id="submitCheckOut" disabled>Kirim Absen Pulang</button><button type="button" class="btn secondary modal-close">Batal</button></div>
  </form>`);

  setupAttendanceSelfieForm({
    formId: 'attendanceCheckOutForm', inputId: 'checkOutSelfieInput', previewId: 'checkOutSelfiePreview', statusId: 'checkOutSelfieStatus', submitId: 'submitCheckOut', requiredFieldNames: ['check_out_location', 'check_out_notes'],
    onSubmit: async ({ form, selectedSelfie, submit }) => {
      const originalText = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Mengirim selfie pulang...';
      let uploadedPath = null;
      try {
        const today = attendanceDateKey();
        const blob = await compressImage(selectedSelfie.file);
        uploadedPath = `${state.profile.id}/attendance/${today}/check-out-${randomId()}.jpg`;
        const upload = await sb.storage.from(PHOTO_BUCKET).upload(uploadedPath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
        if (upload.error) throw new Error(`Selfie pulang gagal diunggah: ${upload.error.message}`);
        const data = Object.fromEntries(new FormData(form));
        const paths = [...new Set([...attendancePhotoEntries(existingAttendance).map((item) => item.path), uploadedPath])];
        const update = await sb.from('attendance').update({
          check_out_location: data.check_out_location.trim(),
          check_out_notes: data.check_out_notes.trim(),
          check_out_photo_path: uploadedPath,
          photo_paths: paths,
        }).eq('id', existingAttendance.id);
        if (update.error) throw update.error;
        URL.revokeObjectURL(selectedSelfie.previewUrl);
        closeModal();
        toast('Absen pulang berhasil. Jam pulang dicatat berdasarkan waktu selfie.');
        await renderAttendance();
      } catch (error) {
        console.error(error);
        if (uploadedPath) await sb.storage.from(PHOTO_BUCKET).remove([uploadedPath]);
        $('#checkOutSelfieStatus').textContent = error.message || 'Absen pulang gagal dikirim.';
        toast(error.message || 'Absen pulang gagal dikirim.', 5000);
      } finally {
        if (document.body.contains(submit)) {
          submit.textContent = originalText;
          submit.disabled = false;
        }
      }
    },
  });
}

async function renderReports() {
  let query = sb.from('daily_journals')
    .select('*,student:profiles!daily_journals_student_id_fkey(full_name)')
    .order('journal_date', { ascending: true });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  if (state.profile.role === 'teacher') {
    const guidedResult = await sb.from('student_details').select('id').eq('teacher_id', state.profile.id);
    if (guidedResult.error) throw guidedResult.error;
    const guidedIds = (guidedResult.data || []).map((item) => item.id);
    if (!guidedIds.length) {
      state.reportJournals = [];
    } else {
      query = query.in('student_id', guidedIds);
      const result = await query;
      if (result.error) throw result.error;
      state.reportJournals = result.data || [];
    }
  } else {
    const result = await query;
    if (result.error) throw result.error;
    state.reportJournals = result.data || [];
  }
  const rows = state.reportJournals;
  const hours = rows.reduce((total, item) => total + (Number(item.work_hours) || 0), 0);
  const studentOptions = [...new Map(rows.map((item) => [item.student_id, item.student?.full_name || state.profile.full_name || 'Siswa'])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'id'));
  const isTeacherReport = state.profile.role === 'teacher';
  const reportHeading = isTeacherReport ? 'Cetak Laporan Siswa Bimbingan' : 'Cetak Laporan Jurnal Harian';
  const reportDescription = isTeacherReport
    ? 'Pilih siswa bimbingan, periode, dan status jurnal. Hasil cetak memuat jurnal lengkap beserta lampiran foto dokumentasi kegiatan.'
    : 'Hasil cetak menampilkan uraian jurnal harian secara lengkap beserta lampiran foto dokumentasi kegiatan.';
  const printButtonLabel = isTeacherReport ? '🖨 Cetak Laporan Siswa + Foto / PDF' : '🖨 Cetak Jurnal + Foto / PDF';
  $('#content').innerHTML = `<div class="page-intro report-page-intro"><div><span class="section-kicker">LAPORAN KEGIATAN PKL</span><h3>${reportHeading}</h3><p>${reportDescription}</p></div><div class="report-action-buttons"><button class="btn secondary" id="exportCsv">Ekspor CSV</button><button class="btn primary btn-emphasis" id="printDailyJournal">${printButtonLabel}</button></div></div>
    <div class="cards"><div class="card stat"><strong>${rows.length}</strong><span>Total jurnal</span></div><div class="card stat"><strong>${hours}</strong><span>Total jam kegiatan</span></div></div>
    <section class="data-panel report-filter-panel"><div class="attendance-filter-heading"><div><strong>Filter Laporan Jurnal</strong><span>${isTeacherReport ? 'Pilih satu siswa jika ingin mencetak laporan individual. Tanpa memilih siswa, laporan seluruh siswa bimbingan yang sesuai filter akan dicetak.' : 'Filter menentukan jurnal yang akan dicetak.'}</span></div><button class="btn secondary" id="resetJournalReportFilter" type="button">Reset Filter</button></div><div class="attendance-filter-grid report-filter-grid"><label>Tanggal mulai<input id="reportStartDate" type="date"></label><label>Tanggal selesai<input id="reportEndDate" type="date"></label>${state.profile.role === 'student' ? '' : `<label>Siswa<select id="reportStudent"><option value="">Semua siswa</option>${studentOptions.map(([id,name]) => `<option value="${esc(id)}">${esc(name)}</option>`).join('')}</select></label>`}<label>Status<select id="reportStatus"><option value="">Semua status</option><option value="draft">Draf</option><option value="submitted">Menunggu validasi</option><option value="approved">Disetujui</option><option value="revision">Perlu perbaikan</option><option value="rejected">Ditolak</option></select></label></div></section>
    <div class="data-panel"><div class="panel-title"><div><h4>Daftar Jurnal Harian</h4><p id="journalReportMeta">${rows.length} jurnal tersedia.</p></div><span class="policy-note">Cetak mengikuti filter aktif</span></div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Tahapan</th><th>Foto</th><th>Status</th><th>Jam</th></tr></thead><tbody id="journalReportRows"></tbody></table></div></div>`;

  const draw = () => {
    const filtered = getFilteredJournalReportRows();
    $('#journalReportRows').innerHTML = filtered.map((item) => `<tr><td>${esc(formatAttendanceDate(item.journal_date))}</td><td>${esc(item.student?.full_name || state.profile.full_name)}</td><td><strong>${esc(item.activity_title)}</strong><small class="activity-location">${esc(item.location || '-')}</small></td><td>${esc((item.activity_stages || []).join(', ') || '-')}</td><td>${(item.photo_paths || []).length ? `<span class="photo-count">▣ ${item.photo_paths.length}</span>` : '<span class="muted">-</span>'}</td><td>${statusBadge(item.status)}</td><td>${esc(item.work_hours || 0)}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Tidak ada jurnal yang sesuai dengan filter.</td></tr>';
    $('#journalReportMeta').textContent = `${filtered.length} dari ${rows.length} jurnal akan dicetak.`;
  };
  ['reportStartDate','reportEndDate','reportStudent','reportStatus'].forEach((id) => $(`#${id}`)?.addEventListener('change', draw));
  $('#resetJournalReportFilter').onclick = () => { ['reportStartDate','reportEndDate','reportStudent','reportStatus'].forEach((id) => { const field=$(`#${id}`); if(field) field.value=''; }); draw(); };
  $('#printDailyJournal').onclick = () => printDailyJournalReport(getFilteredJournalReportRows());
  $('#exportCsv').onclick = () => downloadCsv(getFilteredJournalReportRows());
  draw();
}

function getFilteredJournalReportRows() {
  const start = $('#reportStartDate')?.value || '';
  const end = $('#reportEndDate')?.value || '';
  const studentId = $('#reportStudent')?.value || '';
  const status = $('#reportStatus')?.value || '';
  return (state.reportJournals || []).filter((item) => {
    if (start && item.journal_date < start) return false;
    if (end && item.journal_date > end) return false;
    if (studentId && item.student_id !== studentId) return false;
    if (status && item.status !== status) return false;
    return true;
  });
}

function journalReportPhotoSection(item, signedUrls) {
  const paths = (item.photo_paths || []).filter(Boolean);
  if (!paths.length) {
    return `<section class="documentation-section"><h3>Lampiran Dokumentasi Kegiatan</h3><p class="documentation-empty">Tidak ada foto dokumentasi pada jurnal ini.</p></section>`;
  }

  const photos = paths.map((path, index) => {
    const url = signedUrls[path] || '';
    if (!url) {
      return `<figure class="documentation-photo photo-unavailable"><div class="photo-unavailable-box">Foto ${index + 1} tidak dapat dimuat</div><figcaption>Dokumentasi kegiatan ${index + 1}</figcaption></figure>`;
    }
    return `<figure class="documentation-photo"><img src="${esc(url)}" alt="Dokumentasi kegiatan ${index + 1}"><figcaption>Dokumentasi kegiatan ${index + 1}</figcaption></figure>`;
  }).join('');

  return `<section class="documentation-section"><h3>Lampiran Dokumentasi Kegiatan</h3><div class="documentation-grid count-${Math.min(paths.length, MAX_JOURNAL_PHOTOS)}">${photos}</div></section>`;
}

async function printDailyJournalReport(rows) {
  if (!rows.length) return toast('Tidak ada jurnal yang dapat dicetak.');

  // Buka jendela cetak langsung dari klik pengguna agar tidak diblokir browser,
  // lalu siapkan signed URL foto sebelum merender dokumen final.
  const printWindow = window.open('', '_blank');
  if (!printWindow) return toast('Popup diblokir browser. Izinkan popup lalu coba kembali.');
  printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Menyiapkan Laporan Jurnal</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1d2939}strong{color:#174c35}</style></head><body><strong>Menyiapkan laporan jurnal dan foto dokumentasi...</strong><p>Mohon tunggu sebentar. Jangan tutup halaman ini.</p></body></html>`);
  printWindow.document.close();

  const photoPaths = [...new Set(rows.flatMap((item) => (item.photo_paths || []).filter(Boolean)))];
  const signedUrls = {};
  const PHOTO_BATCH_SIZE = 50;
  for (let index = 0; index < photoPaths.length; index += PHOTO_BATCH_SIZE) {
    const batch = photoPaths.slice(index, index + PHOTO_BATCH_SIZE);
    Object.assign(signedUrls, await signedPhotoUrls(batch));
  }

  if (printWindow.closed) return;

  const signerLabel = state.profile.role === 'teacher' ? 'Guru Pembimbing' : 'Pembimbing';
  const signerName = state.profile.role === 'teacher' ? state.profile.full_name : '________________________';
  const entries = rows.map((item, index) => `<article class="journal-entry">
    <div class="entry-heading"><div><span>JURNAL HARIAN KE-${index + 1}</span><h2>${esc(item.activity_title || 'Kegiatan PKL')}</h2></div><strong>${esc(formatAttendanceDate(item.journal_date, true))}</strong></div>
    <table class="identity"><tr><th>Nama Siswa</th><td>${esc(item.student?.full_name || state.profile.full_name || '-')}</td><th>Jam Kegiatan</th><td>${esc(item.work_hours || 0)} jam</td></tr><tr><th>Lokasi</th><td>${esc(item.location || '-')}</td><th>Cuaca</th><td>${esc(item.weather || '-')}</td></tr><tr><th>Status</th><td>${esc(statusBadgeText(item.status))}</td><th>Dokumentasi</th><td>${(item.photo_paths || []).length} foto</td></tr></table>
    <section><h3>Uraian Kegiatan</h3><p>${esc(item.description || '-')}</p></section>
    <section><h3>Tahapan Kegiatan</h3><p>${esc((item.activity_stages || []).join(', ') || '-')}</p></section>
    <section><h3>Pengetahuan / Keterampilan</h3><p>${esc(item.learning || '-')}</p></section>
    <section><h3>Kendala dan Solusi</h3><p>${esc(item.obstacles || '-')}</p></section>
    <section><h3>Refleksi</h3><p>${esc(item.reflection || '-')}</p></section>
    ${journalReportPhotoSection(item, signedUrls)}
    <section class="supervisor-note"><h3>Catatan Pembimbing</h3><p>${esc(item.supervisor_note || '-')}</p></section>
    <div class="signature"><div><span>Siswa</span><b>${esc(item.student?.full_name || state.profile.full_name || '-')}</b></div><div><span>${esc(signerLabel)}</span><b>${esc(signerName)}</b></div></div>
  </article>`).join('');

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Jurnal Harian PKL</title><style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1d2939;margin:0}.report-header{text-align:center;border-bottom:3px solid #174c35;padding-bottom:12px;margin-bottom:18px}.report-header h1{margin:0;color:#174c35;font-size:22px}.report-header p{margin:5px 0 0}.journal-entry{page-break-after:always}.journal-entry:last-child{page-break-after:auto}.entry-heading{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-left:6px solid #174c35;background:#f2f8f5;padding:12px 14px;margin-bottom:14px}.entry-heading span{font-size:10px;font-weight:bold;color:#667085}.entry-heading h2{font-size:18px;margin:4px 0 0}.entry-heading>strong{font-size:12px;white-space:nowrap}.identity{width:100%;border-collapse:collapse;margin-bottom:14px}.identity th,.identity td{border:1px solid #d0d5dd;padding:7px;font-size:11px;text-align:left}.identity th{background:#f7f9f8;width:16%}section{margin-bottom:12px}section h3{font-size:12px;color:#174c35;margin:0 0 5px;border-bottom:1px solid #d8e4de;padding-bottom:4px}section p{font-size:11px;line-height:1.55;white-space:pre-wrap;margin:0}.documentation-section{break-inside:avoid;page-break-inside:avoid;margin-top:14px}.documentation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.documentation-grid.count-1{grid-template-columns:minmax(0,1fr);max-width:75%;margin:0 auto}.documentation-grid.count-3{grid-template-columns:repeat(3,minmax(0,1fr))}.documentation-photo{margin:0;border:1px solid #d0d5dd;border-radius:7px;overflow:hidden;background:#f8faf9;break-inside:avoid;page-break-inside:avoid}.documentation-photo img{display:block;width:100%;height:165px;object-fit:contain;background:#eef3f0}.documentation-photo figcaption{font-size:9px;color:#667085;text-align:center;padding:6px 8px}.photo-unavailable-box{height:165px;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;color:#667085;font-size:10px;background:#f2f4f7}.documentation-empty{padding:9px 10px;background:#f8faf9;border:1px dashed #cfd8d3;color:#667085}.supervisor-note{background:#fff8e6;padding:10px;border-radius:8px}.signature{display:flex;justify-content:space-between;margin-top:35px;text-align:center;break-inside:avoid;page-break-inside:avoid}.signature div{width:42%}.signature span{display:block;font-size:11px;margin-bottom:45px}.signature b{font-size:11px}.print-actions{position:fixed;right:15px;top:15px;z-index:10}@media print{.print-actions{display:none}.documentation-photo{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><button class="print-actions" onclick="window.print()">Cetak / Simpan PDF</button><header class="report-header"><h1>LAPORAN JURNAL HARIAN PKL</h1><p>SMK Kehutanan Rimba Bahari Sumedang</p><p>${state.profile.role === 'teacher' ? 'Dicetak oleh Guru Pembimbing' : 'Dicetak oleh'}: ${esc(state.profile.full_name)} · ${esc(new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date()))}</p></header>${entries}<script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script></body></html>`);
  printWindow.document.close();
}

function downloadCsv(rows) {
  const head = ['Tanggal', 'Siswa', 'Kegiatan', 'Tahapan', 'Status', 'Jam'];
  const body = rows.map((item) => [item.journal_date, item.student?.full_name || state.profile.full_name, item.activity_title, (item.activity_stages || []).join('; '), item.status, item.work_hours || 0]);
  const csv = [head, ...body].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'rekap-jurnal-pkl.csv';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function getFreshSession({ forceRefresh = false } = {}) {
  if (!sb) return null;

  const { data: sessionData, error: sessionError } = await sb.auth.getSession();
  if (sessionError) {
    console.error('Gagal membaca sesi:', sessionError);
    return null;
  }

  let session = sessionData?.session || null;
  if (!session) {
    state.session = null;
    return null;
  }

  const expiresAtMs = Number(session.expires_at || 0) * 1000;
  const expiresSoon = !expiresAtMs || (expiresAtMs - Date.now()) < 90_000;
  if (forceRefresh || expiresSoon) {
    const { data: refreshData, error: refreshError } = await sb.auth.refreshSession();
    if (refreshError || !refreshData?.session) {
      console.error('Gagal memperbarui sesi:', refreshError);
      state.session = null;
      return null;
    }
    session = refreshData.session;
  }

  state.session = session;
  return session;
}

function isSessionError(result) {
  const status = Number(result?.__status || 0);
  const message = readableMessage(result?.error, '').toLowerCase();
  return status === 401
    || message.includes('sesi sudah tidak valid')
    || message.includes('sesi login tidak ditemukan')
    || message.includes('jwt expired')
    || message.includes('invalid jwt')
    || message.includes('token has expired');
}

async function api(url, body, { timeout = 20000 } = {}) {
  let session = await getFreshSession();
  if (!session?.access_token) {
    return { error: 'Sesi login berakhir. Silakan masuk kembali.', __status: 401 };
  }

  let result = await requestJson(url, body, { timeout, token: session.access_token });
  if (isSessionError(result)) {
    session = await getFreshSession({ forceRefresh: true });
    if (session?.access_token) {
      result = await requestJson(url, body, { timeout, token: session.access_token });
    }
  }

  if (isSessionError(result)) {
    await sb.auth.signOut().catch(() => {});
    showLogin();
    result.error = 'Sesi login telah berakhir. Silakan masuk kembali, lalu ulangi tindakan.';
  }
  return result;
}

async function publicApi(url, body, { timeout = 20000 } = {}) {
  return requestJson(url, body, { timeout });
}

async function requestJson(url, body, { timeout, token = null }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url, {
      method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal,
    });
    const text = await response.text();
    let result = {};
    if (text) {
      try { result = JSON.parse(text); }
      catch { result = { error: `Respons server tidak valid (${response.status}).` }; }
    }
    if (response.status === 404) {
      const endpoint = String(url || '');
      if (endpoint.includes('/api/review-journal-deletion')) {
        result.error = 'API persetujuan hapus jurnal belum terpasang. Unggah file api/review-journal-deletion.js ke folder api di GitHub, lalu tunggu deployment Vercel selesai.';
      } else {
        result.error = `Endpoint ${endpoint} tidak ditemukan pada deployment Vercel terbaru.`;
      }
    } else if (result && typeof result === 'object' && result.error) {
      result.error = readableMessage(result.error, `Permintaan gagal (${response.status})`);
    }
    if (!response.ok && !result.error) result.error = `Permintaan gagal (${response.status})`;
    if (result && typeof result === 'object') result.__status = response.status;
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.name === 'AbortError') return { error: 'Server terlalu lama merespons. Periksa koneksi.' };
    return { error: 'Tidak dapat terhubung ke API. Pastikan deployment Vercel sudah terbaru.' };
  } finally {
    clearTimeout(timer);
  }
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function modal(title, html) {
  closeModal();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="modalBackdrop"><div class="modal"><div class="modal-head"><h3>${title}</h3><button class="close-btn modal-close">✕</button></div>${html}</div></div>`);
  bindModalClose();
}

function modalReplace(title, html) {
  modal(title, html);
}

function closeModal() {
  $('#modalBackdrop')?.remove();
}

function bindModalClose() {
  document.querySelectorAll('.modal-close').forEach((button) => { button.onclick = closeModal; });
}

init();
