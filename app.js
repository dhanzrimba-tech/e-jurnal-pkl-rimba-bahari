/* E-Jurnal PKL Rimba Bahari - frontend tanpa proses build */
const cfg = window.APP_CONFIG || {};
const sb = (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
  : null;

const PHOTO_BUCKET = 'journal-photos';
const MAX_JOURNAL_PHOTOS = 3;
const MAX_INPUT_PHOTO_SIZE = 10 * 1024 * 1024;
const REMOVABLE_JOURNAL_STATUSES = ['draft', 'revision', 'rejected'];

const pageDescriptions = {
  dashboard: 'Ringkasan aktivitas dan perkembangan PKL',
  users: 'Kelola akun dan hak akses pengguna',
  registrations: 'Pendaftaran mandiri dan verifikasi siswa',
  students: 'Data penempatan dan pembimbing siswa',
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
    ['dashboard', 'Dashboard'], ['journals', 'Monitoring Jurnal'],
    ['attendance', 'Kehadiran Siswa'], ['reports', 'Laporan'],
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
  $('#navMenu').innerHTML = items.map(([id, label]) =>
    `<button class="nav-btn ${state.page === id ? 'active' : ''}" data-page="${id}"><span class="nav-icon">${navIcons[id] || ''}</span><span>${label}</span></button>`).join('');
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.onclick = () => {
      const targetPage = button.dataset.page;
      if (targetPage === 'journals' || targetPage === 'my-journal') {
        state.dashboardJournalFilter = 'all';
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
    else if (page === 'journals' || page === 'my-journal') await renderJournals();
    else if (page === 'attendance' || page === 'my-attendance') await renderAttendance();
    else await renderReports();
  } catch (error) {
    console.error(error);
    $('#content').innerHTML = `<div class="card"><strong>Terjadi kesalahan:</strong> ${esc(error.message)}</div>`;
  }
}

async function renderDashboard() {
  const role = state.profile.role;
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
  <section class="dashboard-layout">
    <article class="card progress-card"><div class="card-heading"><div><span class="section-kicker">TARGET PEMBELAJARAN</span><h3>Progres PKL 40 Hari</h3></div><strong class="progress-number">${progress}%</strong></div><div class="progress progress-large"><span style="width:${progress}%"></span></div><div class="progress-meta"><span>${approved} jurnal disetujui</span><span>${Math.max(0, 40 - approved)} jurnal menuju target</span></div></article>
    <article class="card insight-card"><span class="insight-symbol">✦</span><div><span class="section-kicker">PENGINGAT HARI INI</span><h3>Belajar dari pengalaman nyata</h3><p>Tulis kegiatan secara spesifik, tambahkan foto dokumentasi, serta jelaskan keterampilan yang Anda peroleh.</p>${revision ? `<span class="attention-note">${revision} jurnal perlu diperbaiki</span>` : '<span class="success-note">Data Anda tersusun dengan baik</span>'}</div></article>
  </section>`;

  $('#quickJournal')?.addEventListener('click', () => navigate('my-journal'));
  $('#quickAttendance')?.addEventListener('click', () => navigate('my-attendance'));
  $('#quickRegistration')?.addEventListener('click', () => navigate('registrations'));
  $('#quickUsers')?.addEventListener('click', () => navigate('users'));
  $('#quickMonitoring')?.addEventListener('click', () => navigate('journals'));

  const journalPage = role === 'student' ? 'my-journal' : 'journals';
  const attendancePage = role === 'student' ? 'my-attendance' : 'attendance';
  const openJournalRecap = (filter = 'all') => {
    state.dashboardJournalFilter = filter;
    navigate(journalPage);
  };
  $('#metricTotalJournals')?.addEventListener('click', () => openJournalRecap('all'));
  $('#metricApprovedJournals')?.addEventListener('click', () => openJournalRecap('approved'));
  $('#metricPendingJournals')?.addEventListener('click', () => openJournalRecap('submitted'));
  $('#metricAttendance')?.addEventListener('click', () => navigate(attendancePage));
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

  $('#content').innerHTML = `<div class="section-head"><div><span class="section-kicker">MANAJEMEN PENGGUNA</span><h3>Akun Pengguna</h3><p>Administrator dapat melihat jumlah akun, mengelola profil, serta menghapus langsung akun nonadministrator.</p></div><button class="btn primary" id="addUserBtn">Tambah Akun</button></div>
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
    <div class="info-strip account-delete-direct-note"><strong>Penghapusan langsung oleh administrator.</strong> Alasan wajib diisi dan tindakan tidak dapat dibatalkan. Akun administrator tetap dilindungi.</div>
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
      return `<tr><td class="row-number">${index + 1}</td><td>${esc(item.full_name)}</td><td>${esc(item.email)}</td><td>${esc(roles[item.role] || item.role)}</td><td>${userStatusBadge(item)}</td><td><div class="actions"><button class="btn warn reset-pass" data-id="${item.id}" data-name="${esc(item.full_name)}">Reset Password</button><button class="btn secondary edit-profile" data-id="${item.id}">Edit</button>${deletionAction}</div></td></tr>`;
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
    button.onclick = () => openResetModal(button.dataset.id, button.dataset.name);
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

function openResetModal(id, name) {
  modal('Reset Password', `<p>Atur password baru untuk <strong>${esc(name)}</strong>.</p><form id="resetForm" class="form-stack"><label>Password baru<input name="new_password" type="password" minlength="8" required></label><label>Ulangi password<input name="confirm" type="password" minlength="8" required></label><div class="actions"><button class="btn warn">Reset Password</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);
  $('#resetForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (fields.new_password !== fields.confirm) return toast('Konfirmasi password tidak sama');
    const result = await api('/api/reset-password', { user_id: id, new_password: fields.new_password });
    if (result.error) return toast(result.error);
    closeModal();
    toast('Password berhasil direset');
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
  const [{ data, error }] = await Promise.all([query, loadJournalDeletionRequests()]);
  if (error) throw error;
  state.journals = data || [];
  const canAdd = state.profile.role === 'student';
  const draftCount = state.journals.filter((item) => item.status === 'draft').length;
  const pendingCount = state.journals.filter((item) => item.status === 'submitted').length;
  const approvedCount = state.journals.filter((item) => item.status === 'approved').length;
  const revisionCount = state.journals.filter((item) => item.status === 'revision').length;
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
    pending_deletion: 'Jurnal menunggu penghapusan',
  };
  const visibleJournals = journalFilter === 'all'
    ? state.journals
    : journalFilter === 'pending_deletion'
      ? state.journals.filter((item) => {
          const deletionRequest = latestDeletionRequest(item.id);
          return deletionRequest && deletionRequest.status === 'pending';
        })
      : state.journals.filter((item) => item.status === journalFilter);
  const activeFilterBar = journalFilter === 'all'
    ? ''
    : `<div class="dashboard-filter-bar"><div><span>Filter jurnal aktif</span><strong>${journalFilterLabels[journalFilter] || 'Rekap jurnal'}</strong><small>${visibleJournals.length} data ditemukan</small></div><button type="button" class="btn secondary" id="clearDashboardJournalFilter">Tampilkan Semua Jurnal</button></div>`;

  const journalSummaryCards = [
    { key: 'all', count: state.journals.length, label: 'Semua jurnal', icon: '▤' },
    { key: 'draft', count: draftCount, label: 'Draf', icon: '✎' },
    { key: 'submitted', count: pendingCount, label: 'Menunggu', icon: '⌛' },
    { key: 'approved', count: approvedCount, label: 'Disetujui', icon: '✓' },
    canAdd
      ? { key: 'pending_deletion', count: pendingDeletionCount, label: 'Menunggu hapus', icon: '⌫' }
      : { key: 'revision', count: revisionCount, label: 'Perlu perbaikan', icon: '!' },
  ];

  $('#content').innerHTML = `<div class="page-intro"><div><span class="section-kicker">DOKUMENTASI PEMBELAJARAN</span><h3>${canAdd ? 'Jurnal Harian Saya' : 'Daftar Jurnal Siswa'}</h3><p>${canAdd ? 'Catat kegiatan, hasil belajar, kendala, refleksi, dan foto dokumentasi kegiatan PKL.' : 'Pantau catatan kegiatan dan perkembangan pembelajaran siswa selama PKL.'}</p></div>${canAdd ? '<button class="btn primary btn-emphasis" id="addJournalBtn">＋ Isi Jurnal Baru</button>' : ''}</div>
    ${featureWarning}
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
      return `<tr><td><span class="date-cell">${esc(journal.journal_date)}</span></td><td>${esc(journal.student?.full_name || state.profile.full_name)}</td><td><strong class="activity-title">${esc(journal.activity_title)}</strong><small class="activity-location">${esc(journal.location || '-')}</small>${requestState}</td><td>${(journal.photo_paths || []).length ? `<span class="photo-count">▣ ${journal.photo_paths.length}</span>` : '<span class="muted">—</span>'}</td><td><span class="stage-text">${esc((journal.activity_stages || []).join(', ') || '-')}</span></td><td>${statusBadge(journal.status)}</td><td><div class="actions">${canModify ? `<button class="btn secondary edit-journal" data-id="${journal.id}">Edit</button>` : ''}${!canAdd && journal.status === 'submitted' ? `<button class="btn primary validate-journal" data-id="${journal.id}">Validasi</button>` : ''}<button class="btn secondary view-journal" data-id="${journal.id}">Lihat</button>${canDelete ? `<button class="btn danger delete-journal" data-id="${journal.id}">Hapus</button>` : ''}${canRequestApprovedDeletion ? `<button class="btn warn request-delete-journal" data-id="${journal.id}">${requestButtonLabel}</button>` : ''}</div></td></tr>`;
    }).join('') || `<tr><td colspan="7" class="empty"><div class="empty-state"><span>▤</span><strong>${journalFilter === 'all' ? 'Belum ada jurnal' : 'Tidak ada jurnal pada rekap ini'}</strong><p>${journalFilter === 'all' ? 'Mulai dokumentasikan kegiatan PKL Anda.' : 'Gunakan tombol Tampilkan Semua Jurnal untuk kembali ke seluruh data.'}</p></div></td></tr>`}</tbody></table></div></div>
    ${renderStudentDeletionHistory()}`;
  $('#clearDashboardJournalFilter')?.addEventListener('click', async () => {
    state.dashboardJournalFilter = 'all';
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

  modal(journal ? 'Edit Jurnal' : 'Isi Jurnal Harian', `<form id="journalForm" class="form-grid"><label>Tanggal<input name="journal_date" type="date" value="${journal?.journal_date || new Date().toISOString().slice(0, 10)}" required></label><label>Jam kegiatan<input name="work_hours" type="number" min="1" max="12" value="${journal?.work_hours || 7}"></label><label>Lokasi<input name="location" value="${esc(journal?.location || '')}" required></label><label>Cuaca<input name="weather" value="${esc(journal?.weather || '')}"></label><label class="wide">Judul kegiatan<input name="activity_title" value="${esc(journal?.activity_title || '')}" required></label><label class="wide">Uraian kegiatan<textarea name="description" required>${esc(journal?.description || '')}</textarea></label><div class="wide"><strong>Tahapan Kegiatan</strong><div class="check-grid">${checks}</div></div><label class="wide">Pengetahuan/keterampilan<textarea name="learning">${esc(journal?.learning || '')}</textarea></label><label class="wide">Kendala dan solusi<textarea name="obstacles">${esc(journal?.obstacles || '')}</textarea></label><label class="wide">Refleksi<textarea name="reflection">${esc(journal?.reflection || '')}</textarea></label>
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
        toast('Hanya file gambar yang diperbolehkan.');
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

  const save = async (status) => {
    const form = $('#journalForm');
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
        description: formData.get('description'),
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

async function compressImage(file) {
  let source;
  let width;
  let height;
  let cleanup = () => {};

  if ('createImageBitmap' in window) {
    source = await createImageBitmap(file);
    width = source.width;
    height = source.height;
    cleanup = () => source.close?.();
  } else {
    const objectUrl = URL.createObjectURL(file);
    source = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Foto tidak dapat dibaca.'));
      image.src = objectUrl;
    });
    width = source.naturalWidth;
    height = source.naturalHeight;
    cleanup = () => URL.revokeObjectURL(objectUrl);
  }

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  cleanup();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Foto gagal dikompresi.')), 'image/jpeg', 0.82);
  });
}

function randomId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
        ? '<button class="btn primary btn-emphasis" id="addAttendance">＋ Isi Presensi</button>'
        : `<div class="attendance-export-actions" aria-label="Ekspor rekap presensi">
            <button class="btn export-btn excel" id="exportAttendanceExcel" type="button">Excel</button>
            <button class="btn export-btn word" id="exportAttendanceWord" type="button">Word</button>
            <button class="btn export-btn pdf" id="exportAttendancePdf" type="button">PDF</button>
          </div>`}
    </div>

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
          <thead><tr><th>Tanggal</th><th>Siswa</th><th>NISN/Kelas</th><th>Masuk</th><th>Pulang</th><th>Status</th><th>Lokasi</th><th>Catatan</th></tr></thead>
          <tbody id="attendanceRows"></tbody>
        </table>
      </div>
    </section>`;

  if (canAdd) $('#addAttendance').onclick = () => openAttendance();
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
      <td>${esc(item.location || '-')}</td>
      <td><span class="attendance-notes">${esc(item.notes || '-')}</span></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="empty">Tidak ada data presensi yang sesuai dengan filter.</td></tr>';

  const meta = $('#attendanceResultMeta');
  if (meta) meta.textContent = `${rows.length} data • ${getAttendanceReportPeriod(rows)}`;
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

function openAttendance() {
  const today = new Date().toISOString().slice(0, 10);
  modal('Isi Presensi', `<form id="attendanceForm" class="form-grid"><label>Tanggal<input name="attendance_date" type="date" value="${today}" required></label><label>Status<select name="presence_status"><option>Hadir</option><option>Sakit</option><option>Izin</option><option>Tanpa Keterangan</option><option>Dinas Luar</option></select></label><label>Jam masuk<input name="check_in" type="time"></label><label>Jam pulang<input name="check_out" type="time"></label><label class="wide">Lokasi<input name="location"></label><label class="wide">Catatan<textarea name="notes"></textarea></label><div class="wide actions"><button class="btn primary">Simpan</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);
  $('#attendanceForm').onsubmit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.student_id = state.profile.id;
    fields.check_in = fields.check_in || null;
    fields.check_out = fields.check_out || null;
    const { error } = await sb.from('attendance').upsert(fields, { onConflict: 'student_id,attendance_date' });
    if (error) return toast(error.message);
    closeModal();
    toast('Presensi disimpan');
    await renderAttendance();
  };
}

async function renderReports() {
  let query = sb.from('daily_journals').select('journal_date,activity_title,activity_stages,status,work_hours,student:profiles!daily_journals_student_id_fkey(full_name)').order('journal_date');
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];
  const hours = rows.reduce((total, item) => total + (Number(item.work_hours) || 0), 0);
  $('#content').innerHTML = `<div class="cards"><div class="card stat"><strong>${rows.length}</strong><span>Total jurnal</span></div><div class="card stat"><strong>${hours}</strong><span>Total jam kegiatan</span></div></div><div class="section-head"><h3>Rekap Laporan</h3><div class="actions"><button class="btn secondary" id="exportCsv">Ekspor CSV</button><button class="btn primary" id="printReport">Cetak/PDF</button></div></div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Tahapan</th><th>Status</th><th>Jam</th></tr></thead><tbody>${rows.map((item) => `<tr><td>${esc(item.journal_date)}</td><td>${esc(item.student?.full_name || state.profile.full_name)}</td><td>${esc(item.activity_title)}</td><td>${esc((item.activity_stages || []).join(', '))}</td><td>${statusBadge(item.status)}</td><td>${esc(item.work_hours || 0)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Belum ada data.</td></tr>'}</tbody></table></div>`;
  $('#printReport').onclick = () => window.print();
  $('#exportCsv').onclick = () => downloadCsv(rows);
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
