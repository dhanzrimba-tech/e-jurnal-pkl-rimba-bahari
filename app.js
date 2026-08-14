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
  'final-report': 'Penyusunan, peninjauan, dan cetak laporan akhir PKL individu maupun kelompok per lokasi praktik',
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
  'final-report': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 2v5h5M8 13h8v2H8v-2Zm0 4h8v2H8v-2Z"/></svg>',
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
  dailyComplianceAlerts: { today: '', activeInternship: true, attendanceMissing: false, journalMissing: false, journalToday: null, activeStudentCount: 0, missingAttendanceStudents: [], error: '' },
  dailyReminderToastKey: '',
  reportJournals: [],
  finalReport: null,
  finalReportSettings: null,
  finalReportStudents: [],
  finalReportFeatureReady: true,
  groupReport: null,
  groupReportGroups: [],
  groupReportFeatureReady: true,
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
    ['reports', 'Laporan Jurnal'], ['final-report', 'Laporan PKL'],
  ],
  student: [
    ['dashboard', 'Dashboard'], ['my-journal', 'Jurnal Harian'],
    ['my-attendance', 'Presensi Saya'], ['reports', 'Cetak Jurnal'], ['final-report', 'Laporan PKL'],
  ],
  teacher: [
    ['dashboard', 'Dashboard'], ['guided-students', 'Siswa Bimbingan'],
    ['journals', 'Monitoring Jurnal'], ['guided-journals', 'Semua Jurnal Bimbingan'],
    ['attendance', 'Kehadiran Siswa'], ['reports', 'Cetak Jurnal'], ['final-report', 'Laporan PKL Siswa'],
  ],
  field_supervisor: [
    ['dashboard', 'Dashboard'], ['journals', 'Validasi Jurnal'],
    ['attendance', 'Validasi Presensi'], ['reports', 'Penilaian & Jurnal'], ['final-report', 'Laporan PKL'],
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
  state.dailyComplianceAlerts = emptyDailyCompliance();
  state.dailyReminderToastKey = '';
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
  state.dailyComplianceAlerts = emptyDailyCompliance();
  state.dailyReminderToastKey = '';
  $('#appView').classList.add('hidden');
  $('#registerView').classList.add('hidden');
  $('#publicRegisterView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}

function renderNav() {
  const items = menus[state.profile.role] || menus.student;
  $('#navMenu').innerHTML = items.map(([id, label]) => {
    const role = state.profile.role;
    const compliance = state.dailyComplianceAlerts || {};
    const rejectedCount = Number(state.studentJournalAlerts?.rejected || 0);
    let badgeValue = '';
    let badgeTitle = '';

    if (role === 'student' && id === 'my-attendance' && compliance.activeInternship !== false && compliance.attendanceMissing) {
      badgeValue = '!';
      badgeTitle = 'Presensi hari ini belum diisi';
    }
    if (role === 'student' && id === 'my-journal') {
      if (compliance.activeInternship !== false && compliance.journalMissing) {
        badgeValue = '!';
        badgeTitle = rejectedCount ? `Jurnal hari ini belum diisi dan ${rejectedCount} jurnal ditolak` : 'Jurnal hari ini belum diisi';
      } else if (rejectedCount) {
        badgeValue = rejectedCount > 99 ? '99+' : String(rejectedCount);
        badgeTitle = `${rejectedCount} jurnal ditolak`;
      }
    }
    if (['admin', 'teacher'].includes(role) && id === 'attendance') {
      const missingCount = Number(compliance.missingAttendanceStudents?.length || 0);
      if (missingCount) {
        badgeValue = missingCount > 99 ? '99+' : String(missingCount);
        badgeTitle = `${missingCount} siswa belum presensi hari ini`;
      }
    }

    const alertBadge = badgeValue
      ? `<span class="nav-alert-badge" title="${esc(badgeTitle)}">${esc(badgeValue)}</span>`
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
  const appShell = document.querySelector('.app-shell');
  if (appShell) appShell.classList.toggle('dashboard-theme', page === 'dashboard');
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
    else if (page === 'final-report') await renderFinalReport();
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

function isStudentInInternshipPeriod(student, today) {
  if (!student) return true;
  if (student.start_date && today < student.start_date) return false;
  if (student.end_date && today > student.end_date) return false;
  return true;
}

function emptyDailyCompliance(today = attendanceDateKey()) {
  return {
    today,
    activeInternship: true,
    attendanceMissing: false,
    journalMissing: false,
    journalToday: null,
    activeStudentCount: 0,
    missingAttendanceStudents: [],
    error: '',
  };
}

async function loadDailyComplianceAlerts() {
  const today = attendanceDateKey();
  const role = state.profile?.role;
  const next = emptyDailyCompliance(today);
  if (!sb || !role) {
    state.dailyComplianceAlerts = next;
    return next;
  }

  try {
    if (role === 'student') {
      const detailResult = await sb.from('student_details')
        .select('id,nis,class_name,internship_place,start_date,end_date')
        .eq('id', state.profile.id)
        .limit(1);
      if (detailResult.error) throw detailResult.error;
      const detail = detailResult.data?.[0] || null;
      next.activeInternship = isStudentInInternshipPeriod(detail, today);
      if (!next.activeInternship) {
        state.dailyComplianceAlerts = next;
        return next;
      }

      const [attendanceResult, journalResult] = await Promise.all([
        sb.from('attendance')
          .select('id,attendance_date,presence_status,check_in,check_out,check_in_photo_path,check_out_photo_path')
          .eq('student_id', state.profile.id)
          .eq('attendance_date', today)
          .limit(1),
        sb.from('daily_journals')
          .select('id,journal_date,activity_title,status')
          .eq('student_id', state.profile.id)
          .eq('journal_date', today)
          .limit(1),
      ]);
      if (attendanceResult.error) throw attendanceResult.error;
      if (journalResult.error) throw journalResult.error;
      next.attendanceMissing = !(attendanceResult.data || []).length;
      next.journalToday = journalResult.data?.[0] || null;
      next.journalMissing = !next.journalToday;
      state.dailyComplianceAlerts = next;
      return next;
    }

    if (['admin', 'teacher'].includes(role)) {
      let studentQuery = sb.from('student_details')
        .select('id,nis,class_name,internship_place,start_date,end_date,teacher_id,profiles!student_details_id_fkey(full_name,email,is_active,registration_status),teacher:profiles!student_details_teacher_id_fkey(full_name)');
      if (role === 'teacher') studentQuery = studentQuery.eq('teacher_id', state.profile.id);
      const studentResult = await studentQuery;
      if (studentResult.error) throw studentResult.error;

      const activeStudents = (studentResult.data || [])
        .filter((item) => item.profiles && item.profiles.is_active !== false && item.profiles.registration_status !== 'pending')
        .filter((item) => isStudentInInternshipPeriod(item, today));
      next.activeStudentCount = activeStudents.length;
      const studentIds = activeStudents.map((item) => item.id).filter(Boolean);
      let attendanceRows = [];
      if (studentIds.length) {
        const attendanceResult = await sb.from('attendance')
          .select('student_id,attendance_date,presence_status')
          .eq('attendance_date', today)
          .in('student_id', studentIds);
        if (attendanceResult.error) throw attendanceResult.error;
        attendanceRows = attendanceResult.data || [];
      }
      const attended = new Set(attendanceRows.map((item) => item.student_id));
      next.missingAttendanceStudents = activeStudents
        .filter((item) => !attended.has(item.id))
        .sort((a, b) => String(a.profiles?.full_name || '').localeCompare(String(b.profiles?.full_name || ''), 'id'));
      state.dailyComplianceAlerts = next;
      return next;
    }
  } catch (error) {
    console.warn('Notifikasi kewajiban harian tidak dapat dimuat:', error);
    next.error = readableMessage(error, 'Notifikasi harian tidak dapat dimuat.');
  }

  state.dailyComplianceAlerts = next;
  return next;
}

function renderStudentDailyComplianceAlert() {
  if (state.profile?.role !== 'student') return '';
  const info = state.dailyComplianceAlerts || emptyDailyCompliance();
  if (info.error) return `<section class="daily-compliance-panel is-error"><div><span class="section-kicker">PENGINGAT HARIAN</span><h3>Status kewajiban hari ini belum dapat diperiksa</h3><p>${esc(info.error)}</p></div></section>`;
  if (info.activeInternship === false) return '';

  const attendanceDone = !info.attendanceMissing;
  const journalDone = !info.journalMissing;
  const journalText = info.journalToday
    ? `${statusBadgeText(info.journalToday.status)}${info.journalToday.activity_title ? ` · ${info.journalToday.activity_title}` : ''}`
    : 'Belum ada jurnal untuk tanggal hari ini.';
  const summary = !attendanceDone && !journalDone
    ? 'Presensi dan jurnal hari ini belum diisi.'
    : !attendanceDone
      ? 'Presensi hari ini belum diisi.'
      : !journalDone
        ? 'Jurnal hari ini belum diisi.'
        : 'Presensi dan jurnal hari ini sudah tercatat.';

  return `<section class="daily-compliance-panel ${attendanceDone && journalDone ? 'is-complete' : 'has-warning'}">
    <div class="daily-compliance-heading"><div><span class="section-kicker">KEWAJIBAN HARI INI</span><h3>${esc(summary)}</h3><p>${esc(formatAttendanceDate(info.today, true))}. Lengkapi kegiatan pada hari yang sama agar data PKL tetap tertib.</p></div><span class="daily-compliance-state ${attendanceDone && journalDone ? 'complete' : 'warning'}">${attendanceDone && journalDone ? '✓ Lengkap' : '! Perlu dilengkapi'}</span></div>
    <div class="daily-task-grid">
      <button type="button" class="daily-task-card ${attendanceDone ? 'done' : 'missing'}" data-daily-action="attendance"><span class="daily-task-icon">${attendanceDone ? '✓' : '!'}</span><span><small>PRESENSI</small><strong>${attendanceDone ? 'Sudah tercatat' : 'Belum diisi'}</strong><p>${attendanceDone ? 'Presensi hari ini sudah tersedia.' : 'Lakukan absen datang melalui selfie.'}</p></span><b>→</b></button>
      <button type="button" class="daily-task-card ${journalDone ? 'done' : 'missing'}" data-daily-action="journal"><span class="daily-task-icon">${journalDone ? '✓' : '!'}</span><span><small>JURNAL HARIAN</small><strong>${journalDone ? 'Sudah diisi' : 'Belum diisi'}</strong><p>${esc(journalText)}</p></span><b>→</b></button>
    </div>
  </section>`;
}

function renderStaffDailyAttendanceAlert() {
  const role = state.profile?.role;
  if (!['admin', 'teacher'].includes(role)) return '';
  const info = state.dailyComplianceAlerts || emptyDailyCompliance();
  if (info.error) return `<section class="daily-compliance-panel is-error"><div><span class="section-kicker">MONITORING PRESENSI</span><h3>Notifikasi presensi belum dapat dimuat</h3><p>${esc(info.error)}</p></div></section>`;
  const missing = info.missingAttendanceStudents || [];
  if (!missing.length) {
    return `<section class="staff-attendance-alert all-complete"><span class="staff-alert-icon">✓</span><div><span class="section-kicker">MONITORING PRESENSI HARI INI</span><h3>Seluruh ${info.activeStudentCount || 0} siswa aktif sudah mengisi presensi</h3><p>${esc(formatAttendanceDate(info.today, true))}</p></div></section>`;
  }
  const scopeText = role === 'teacher' ? 'siswa bimbingan' : 'siswa aktif PKL';
  return `<button type="button" class="staff-attendance-alert has-missing" id="missingAttendanceAlert">
    <span class="staff-alert-icon">!</span><span class="staff-alert-copy"><span class="section-kicker">MONITORING PRESENSI HARI INI</span><strong>${missing.length} ${scopeText} belum mengisi presensi</strong><p>${esc(formatAttendanceDate(info.today, true))}. Klik untuk melihat daftar siswa yang belum absen.</p></span><span class="staff-alert-open">Lihat siswa →</span>
  </button>`;
}

function openMissingAttendanceModal() {
  const info = state.dailyComplianceAlerts || emptyDailyCompliance();
  const missing = info.missingAttendanceStudents || [];
  const isAdmin = state.profile?.role === 'admin';
  if (!missing.length) return toast('Tidak ada siswa yang belum presensi hari ini.');
  const rows = missing.map((student, index) => `<tr><td>${index + 1}</td><td><strong>${esc(student.profiles?.full_name || 'Siswa')}</strong><small class="table-subtext">${esc(student.profiles?.email || '')}</small></td><td>${esc(student.nis || '-')}<small class="table-subtext">${esc(student.class_name || '-')}</small></td><td>${esc(student.internship_place || '-')}</td>${isAdmin ? `<td>${esc(student.teacher?.full_name || 'Belum ditetapkan')}</td>` : ''}</tr>`).join('');
  modal('Siswa Belum Presensi Hari Ini', `<div class="missing-attendance-modal-head"><span class="badge red">${missing.length} belum presensi</span><p>${esc(formatAttendanceDate(info.today, true))}. Daftar hanya mencakup siswa aktif yang sedang berada dalam periode PKL.</p></div><div class="table-wrap"><table class="missing-attendance-table"><thead><tr><th>No</th><th>Nama Siswa</th><th>NISN / Kelas</th><th>Tempat PKL</th>${isAdmin ? '<th>Guru Pembimbing</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></div><div class="actions"><button type="button" class="btn primary" id="openAttendanceFromAlert">Buka Rekap Presensi</button><button type="button" class="btn secondary modal-close">Tutup</button></div>`);
  $('#openAttendanceFromAlert')?.addEventListener('click', () => {
    closeModal();
    navigate('attendance');
  });
}

function showDailyComplianceToast() {
  const info = state.dailyComplianceAlerts || emptyDailyCompliance();
  const role = state.profile?.role;
  const key = `${state.profile?.id || role}:${info.today}`;
  if (!role || state.dailyReminderToastKey === key) return;
  let message = '';
  if (role === 'student' && info.activeInternship !== false) {
    if (info.attendanceMissing && info.journalMissing) message = 'Pengingat: presensi dan jurnal hari ini belum diisi.';
    else if (info.attendanceMissing) message = 'Pengingat: presensi hari ini belum diisi.';
    else if (info.journalMissing) message = 'Pengingat: jurnal hari ini belum diisi.';
  } else if (['admin', 'teacher'].includes(role) && info.missingAttendanceStudents?.length) {
    message = `${info.missingAttendanceStudents.length} siswa belum mengisi presensi hari ini. Buka notifikasi dashboard untuk melihat daftarnya.`;
  }
  if (message) {
    state.dailyReminderToastKey = key;
    toast(message, 5200);
  }
}

async function renderDashboard() {
  const role = state.profile.role;
  if (role === 'student') await loadStudentJournalAlerts();
  await loadDailyComplianceAlerts();
  renderNav();
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
  ${role === 'student' ? renderStudentDailyComplianceAlert() : renderStaffDailyAttendanceAlert()}
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
  document.querySelectorAll('[data-daily-action]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.dailyAction === 'attendance' ? 'my-attendance' : 'my-journal'));
  });
  $('#missingAttendanceAlert')?.addEventListener('click', openMissingAttendanceModal);
  showDailyComplianceToast();
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
      await loadDailyComplianceAlerts();
      renderNav();
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
        await loadDailyComplianceAlerts();
        renderNav();
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

const DEFAULT_PKL_REPORT_SETTINGS = {
  id: 1,
  school_name: 'SMK Kehutanan Rimba Bahari Sumedang',
  school_year: '2026/2027',
  principal_name: '',
  principal_nip: '',
  report_title: 'LAPORAN PRAKTIK KERJA LAPANGAN',
  approval_location: 'Sumedang',
  standard_background: 'Praktik Kerja Lapangan merupakan bagian dari proses pembelajaran siswa SMK untuk memperoleh pengalaman kerja nyata, menerapkan kompetensi yang dipelajari di sekolah, serta memahami budaya kerja di dunia kerja.',
  standard_objectives: '1. Meningkatkan pengalaman kerja siswa.\n2. Menerapkan kompetensi yang diperoleh di sekolah.\n3. Mengenal budaya dan tata kerja di dunia kerja.\n4. Mengembangkan kedisiplinan dan tanggung jawab.\n5. Meningkatkan keterampilan sesuai bidang keahlian.',
  standard_benefits: 'Bagi siswa: menambah pengalaman, pengetahuan, keterampilan, disiplin, dan tanggung jawab kerja.\nBagi sekolah: menjadi bahan evaluasi kesesuaian kompetensi siswa dengan kebutuhan dunia kerja.\nBagi instansi: mendukung kegiatan pendidikan dan memberikan pengalaman kerja kepada peserta didik.',
};

function isFinalReportSchemaError(error) {
  const code = String(error?.code || '').toUpperCase();
  const message = readableMessage(error, '').toLowerCase();
  return ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(code)
    || message.includes('pkl_reports')
    || message.includes('pkl_report_settings')
    || message.includes('save_pkl_report')
    || message.includes('submit_pkl_report')
    || message.includes('review_pkl_report');
}

function isGroupReportSchemaError(error) {
  const message = readableMessage(error, '').toLowerCase();
  return message.includes('pkl_group_reports')
    || message.includes('list_pkl_groups')
    || message.includes('get_pkl_group_context')
    || message.includes('save_group_pkl_report')
    || message.includes('submit_group_pkl_report')
    || message.includes('review_group_pkl_report');
}


function finalReportStatusMeta(status) {
  const map = {
    draft: ['Draf', 'gray', 'Laporan masih dapat diedit oleh siswa.'],
    submitted: ['Diajukan', 'yellow', 'Menunggu pemeriksaan Guru Pembimbing.'],
    revision: ['Perlu Revisi', 'red', 'Siswa perlu memperbaiki laporan sesuai catatan guru.'],
    approved: ['Disetujui', 'green', 'Laporan sudah disetujui Guru Pembimbing.'],
  };
  return map[status] || ['Belum Dibuat', 'gray', 'Siswa belum menyimpan draf laporan.'];
}

function finalReportStatusBadge(status) {
  const [label, color] = finalReportStatusMeta(status);
  return `<span class="badge ${color}">${esc(label)}</span>`;
}

function textBlock(value, fallback = '-') {
  const text = String(value || '').trim();
  return esc(text || fallback).replace(/\n/g, '<br>');
}

function uniqueTextValues(rows, field) {
  return [...new Set(rows.map((item) => String(item?.[field] || '').trim()).filter(Boolean))];
}

async function loadFinalReportSettings() {
  const { data, error } = await sb.from('pkl_report_settings').select('*').eq('id', 1).maybeSingle();
  if (error) {
    if (isFinalReportSchemaError(error)) {
      state.finalReportFeatureReady = false;
      state.finalReportSettings = { ...DEFAULT_PKL_REPORT_SETTINGS };
      return state.finalReportSettings;
    }
    throw error;
  }
  state.finalReportFeatureReady = true;
  state.finalReportSettings = { ...DEFAULT_PKL_REPORT_SETTINGS, ...(data || {}) };
  return state.finalReportSettings;
}

function finalReportMigrationNotice() {
  return `<div class="card final-report-migration"><span class="section-kicker">AKTIVASI DATABASE LAPORAN PKL</span><h3>Database Laporan PKL belum di-upgrade</h3><p>Frontend v6.28 sudah terpasang, tetapi tabel dan fungsi laporan akhir belum tersedia di Supabase.</p><div class="info-strip"><strong>Jalankan sekali:</strong> buka Supabase → SQL Editor → salin dan jalankan file <code>database/upgrade-final-pkl-report.sql</code>.</div><p class="muted">Setelah SQL berhasil dijalankan, refresh aplikasi dengan Ctrl + F5.</p></div>`;
}

async function renderFinalReport() {
  await loadFinalReportSettings();
  if (!state.finalReportFeatureReady) {
    $('#content').innerHTML = finalReportMigrationNotice();
    return;
  }
  if (state.profile.role === 'student') return renderStudentFinalReport();
  return renderFinalReportManager();
}

async function loadFinalReportContext(studentId) {
  const [detailResult, reportResult, journalResult] = await Promise.all([
    sb.from('student_details')
      .select('*,profiles!student_details_id_fkey(full_name,email),teacher:profiles!student_details_teacher_id_fkey(full_name),field_supervisor:profiles!student_details_field_supervisor_id_fkey(full_name)')
      .eq('id', studentId).maybeSingle(),
    sb.from('pkl_reports').select('*').eq('student_id', studentId).maybeSingle(),
    sb.from('daily_journals').select('*').eq('student_id', studentId).order('journal_date', { ascending: true }),
  ]);
  for (const result of [detailResult, reportResult, journalResult]) {
    if (result.error) {
      if (isFinalReportSchemaError(result.error)) {
        state.finalReportFeatureReady = false;
        throw new Error('Database Laporan PKL belum di-upgrade. Jalankan database/upgrade-final-pkl-report.sql.');
      }
      throw result.error;
    }
  }
  return {
    detail: detailResult.data || null,
    report: reportResult.data || null,
    journals: journalResult.data || [],
    settings: state.finalReportSettings || await loadFinalReportSettings(),
  };
}

function finalReportFormHtml(report, detail, settings, editable) {
  const disabled = editable ? '' : 'disabled';
  return `<form id="finalReportForm" class="form-grid final-report-form">
    <label class="wide">Judul Laporan<input name="report_title" maxlength="180" value="${esc(report?.report_title || settings.report_title || '')}" ${disabled}></label>
    <label>Tempat PKL<input value="${esc(detail?.internship_place || '')}" disabled></label>
    <label>Unit/Bagian Penempatan<input name="placement_unit" maxlength="200" value="${esc(report?.placement_unit || '')}" placeholder="Contoh: Bagian Administrasi / RPH ..." ${disabled}></label>
    <label class="wide">Profil Singkat Instansi <span class="required-mark">Wajib sebelum diajukan</span><textarea name="institution_profile" minlength="30" required placeholder="Jelaskan secara ringkas Perhutani/unit tempat PKL, tugas utama, dan bidang kerjanya." ${disabled}>${esc(report?.institution_profile || '')}</textarea></label>
    <label class="wide">Struktur Organisasi / Posisi Penempatan <span class="optional-label">opsional</span><textarea name="organization_structure" placeholder="Tuliskan susunan singkat atau posisi bagian tempat Anda ditempatkan." ${disabled}>${esc(report?.organization_structure || '')}</textarea></label>
    <label class="wide">Kata Pengantar <span class="required-mark">Wajib sebelum diajukan</span><textarea name="preface" minlength="50" required placeholder="Tuliskan kata pengantar laporan PKL." ${disabled}>${esc(report?.preface || '')}</textarea></label>
    <label class="wide">Kesimpulan <span class="required-mark">Wajib sebelum diajukan</span><textarea name="conclusion" minlength="50" required placeholder="Rangkum pengalaman, keterampilan, dan perkembangan selama PKL." ${disabled}>${esc(report?.conclusion || '')}</textarea></label>
    <label class="wide">Saran untuk Sekolah<textarea name="suggestions_school" placeholder="Saran yang berkaitan dengan persiapan, pembimbingan, atau monitoring PKL." ${disabled}>${esc(report?.suggestions_school || '')}</textarea></label>
    <label class="wide">Saran untuk Tempat PKL<textarea name="suggestions_workplace" placeholder="Sampaikan saran secara sopan dan konkret." ${disabled}>${esc(report?.suggestions_workplace || '')}</textarea></label>
    <label class="wide">Saran untuk Siswa PKL Berikutnya<textarea name="suggestions_students" placeholder="Tuliskan hal yang sebaiknya dipersiapkan siswa berikutnya." ${disabled}>${esc(report?.suggestions_students || '')}</textarea></label>
  </form>`;
}

async function renderStudentFinalReport() {
  const context = await loadFinalReportContext(state.profile.id);
  const { detail, report, journals, settings } = context;
  state.finalReport = report;
  const approved = journals.filter((item) => item.status === 'approved');
  const editable = !report || ['draft', 'revision'].includes(report.status);
  const [statusLabel, statusColor, statusDescription] = finalReportStatusMeta(report?.status);
  const teacherName = detail?.teacher?.full_name || 'Belum ditetapkan';

  $('#content').innerHTML = `<div class="page-intro final-report-intro"><div><span class="section-kicker">LAPORAN AKHIR PKL</span><h3>Susun Laporan PKL Individu</h3><p>Isi bagian yang bersifat naratif satu kali. BAB III akan diringkas dari jurnal yang disetujui, dilengkapi satu foto per jurnal dan sitasi ilmiah yang relevan dengan kegiatan.</p></div><div class="report-action-buttons"><button class="btn secondary group-switch-btn" id="openGroupFinalReport">Laporan Kelompok</button><button class="btn secondary" id="previewFinalReport">Pratinjau</button><button class="btn secondary" id="downloadWordFinalReport">Unduh Word (.doc)</button><button class="btn primary" id="printFinalReport">Cetak / Simpan PDF</button></div></div>
    <div class="cards final-report-summary-cards"><div class="card stat"><strong>${approved.length}</strong><span>Jurnal disetujui</span></div><div class="card stat"><strong>${journals.length}</strong><span>Total jurnal</span></div><div class="card stat"><strong>${approved.reduce((sum,item)=>sum+(Number(item.work_hours)||0),0)}</strong><span>Jam dari jurnal disetujui</span></div></div>
    <section class="data-panel final-report-status-panel"><div><span class="badge ${statusColor}">${esc(statusLabel)}</span><h4>Status Laporan PKL</h4><p>${esc(statusDescription)}</p>${report?.teacher_note ? `<div class="teacher-review-note"><strong>Catatan Guru Pembimbing</strong><p>${textBlock(report.teacher_note)}</p></div>` : ''}</div><div class="final-report-identity"><span><small>Guru Pembimbing</small><strong>${esc(teacherName)}</strong></span><span><small>Tempat PKL</small><strong>${esc(detail?.internship_place || '-')}</strong></span><span><small>Periode</small><strong>${esc(detail?.start_date ? formatAttendanceDate(detail.start_date) : '-')} s.d. ${esc(detail?.end_date ? formatAttendanceDate(detail.end_date) : '-')}</strong></span></div></section>
    <div class="info-strip final-report-auto-info"><strong>Bagian otomatis dari E-Jurnal:</strong> BAB III Pembahasan diringkas dari jurnal berstatus <b>Disetujui</b>. Setiap jurnal memakai maksimal satu foto, memiliki keterangan Gambar, serta mendapat sitasi jurnal ilmiah berdasarkan relevansi kata kunci kegiatan. Catatan pembimbing tidak ditampilkan di BAB III dan tetap tersedia pada lampiran rekap jurnal.</div><div class="info-strip"><strong>Pemeriksaan sumber:</strong> sitasi dipilih otomatis dari pustaka ilmiah terverifikasi berdasarkan isi kegiatan. Siswa dan Guru Pembimbing tetap perlu memeriksa kesesuaian sitasi sebelum laporan disetujui.</div>
    <section class="data-panel"><div class="panel-title"><div><h4>Data Naratif Laporan</h4><p>${editable ? 'Isi dan simpan draf. Anda masih dapat memperbaikinya sampai laporan diajukan.' : 'Data dikunci selama laporan menunggu pemeriksaan atau setelah disetujui.'}</p></div>${finalReportStatusBadge(report?.status)}</div>${finalReportFormHtml(report, detail, settings, editable)}
      <div class="final-report-form-actions">${editable ? '<button class="btn secondary" id="saveFinalReport">Simpan Draf</button><button class="btn primary btn-emphasis" id="submitFinalReport">Ajukan ke Guru Pembimbing</button>' : ''}</div>
    </section>
    <section class="data-panel"><div class="panel-title"><div><h4>Struktur Laporan yang Dibentuk Otomatis</h4><p>Sistem menyusun laporan akhir tanpa menghapus fitur Cetak Jurnal Harian.</p></div></div><div class="report-outline-grid"><span><b>Bagian Awal</b><small>Cover, pengesahan, kata pengantar, daftar isi, daftar gambar</small></span><span><b>BAB I</b><small>Pendahuluan dari teks standar sekolah</small></span><span><b>BAB II</b><small>Profil tempat PKL dan unit penempatan</small></span><span><b>BAB III</b><small>Pembahasan ringkas dari jurnal, foto, dan sitasi ilmiah</small></span><span><b>BAB IV</b><small>Kesimpulan dan saran</small></span><span><b>Daftar Pustaka</b><small>Sumber jurnal yang benar-benar digunakan pada pembahasan</small></span><span><b>Lampiran</b><small>Rekap jurnal dan catatan pembimbing</small></span></div></section>`;

  $('#openGroupFinalReport')?.addEventListener('click', () => renderStudentGroupReport());
  $('#saveFinalReport')?.addEventListener('click', () => saveStudentFinalReport());
  $('#submitFinalReport')?.addEventListener('click', () => submitStudentFinalReport());
  $('#previewFinalReport').onclick = async () => {
    if (editable) {
      const saved = await saveStudentFinalReport({ silent: true });
      if (!saved) return;
    }
    await printFinalPklReport(state.profile.id, { autoPrint: false });
  };
  $('#downloadWordFinalReport').onclick = async () => {
    if (editable) {
      const saved = await saveStudentFinalReport({ silent: true });
      if (!saved) return;
    }
    await downloadFinalPklReportWord(state.profile.id);
  };
  $('#printFinalReport').onclick = async () => {
    if (editable) {
      const saved = await saveStudentFinalReport({ silent: true });
      if (!saved) return;
    }
    await printFinalPklReport(state.profile.id, { autoPrint: true });
  };
}

function collectFinalReportForm() {
  const form = $('#finalReportForm');
  if (!form) return null;
  const data = Object.fromEntries(new FormData(form));
  return {
    p_report_title: String(data.report_title || '').trim(),
    p_placement_unit: String(data.placement_unit || '').trim(),
    p_institution_profile: String(data.institution_profile || '').trim(),
    p_organization_structure: String(data.organization_structure || '').trim(),
    p_preface: String(data.preface || '').trim(),
    p_conclusion: String(data.conclusion || '').trim(),
    p_suggestions_school: String(data.suggestions_school || '').trim(),
    p_suggestions_workplace: String(data.suggestions_workplace || '').trim(),
    p_suggestions_students: String(data.suggestions_students || '').trim(),
  };
}

async function saveStudentFinalReport({ silent = false } = {}) {
  const payload = collectFinalReportForm();
  if (!payload) return false;
  const { data, error } = await sb.rpc('save_pkl_report', payload);
  if (error) {
    if (isFinalReportSchemaError(error)) return toast('Fitur laporan belum aktif. Jalankan upgrade database v6.26.'), false;
    toast(error.message || 'Laporan gagal disimpan.', 5000);
    return false;
  }
  state.finalReport = data || state.finalReport;
  if (!silent) {
    toast('Draf laporan PKL berhasil disimpan.');
    await renderStudentFinalReport();
  }
  return true;
}

async function submitStudentFinalReport() {
  if (!$('#finalReportForm')?.reportValidity()) return;
  const saved = await saveStudentFinalReport({ silent: true });
  if (!saved) return;
  if (!confirm('Ajukan laporan kepada Guru Pembimbing? Setelah diajukan, isi laporan dikunci sampai guru memberikan keputusan.')) return;
  const { error } = await sb.rpc('submit_pkl_report');
  if (error) return toast(error.message || 'Laporan gagal diajukan.', 5500);
  toast('Laporan berhasil diajukan kepada Guru Pembimbing.');
  await renderStudentFinalReport();
}

function groupReportMigrationNotice() {
  return `<div class="card final-report-migration group-report-migration"><span class="section-kicker">AKTIVASI LAPORAN KELOMPOK</span><h3>Fitur laporan kelompok belum diaktifkan</h3><p>Laporan individu tetap dapat digunakan. Untuk mengaktifkan laporan kelompok berdasarkan lokasi praktik, jalankan SQL upgrade v6.28.</p><div class="info-strip"><strong>Jalankan sekali:</strong> Supabase → SQL Editor → <code>database/upgrade-group-pkl-report.sql</code>.</div><p class="muted">Setelah berhasil, refresh aplikasi dengan Ctrl + F5.</p></div>`;
}

async function loadGroupReportContext(groupKey = null) {
  const args = { p_group_key: groupKey || null };
  const { data, error } = await sb.rpc('get_pkl_group_context', args);
  if (error) {
    if (isGroupReportSchemaError(error)) {
      state.groupReportFeatureReady = false;
      throw new Error('Fitur laporan kelompok belum diaktifkan. Jalankan database/upgrade-group-pkl-report.sql.');
    }
    throw error;
  }
  state.groupReportFeatureReady = true;
  const context = data || {};
  context.members = Array.isArray(context.members) ? context.members : [];
  context.journals = Array.isArray(context.journals) ? context.journals : [];
  context.report = context.report || null;
  context.settings = state.finalReportSettings || await loadFinalReportSettings();
  return context;
}

function groupReportPeriodText(members = []) {
  const starts = members.map((item) => item.start_date).filter(Boolean).sort();
  const ends = members.map((item) => item.end_date).filter(Boolean).sort();
  const start = starts[0] || '';
  const end = ends.at(-1) || '';
  return `${start ? formatAttendanceDate(start) : '-'} s.d. ${end ? formatAttendanceDate(end) : '-'}`;
}

function uniqueGroupNames(members = [], field) {
  return [...new Set(members.map((item) => String(item?.[field] || '').trim()).filter(Boolean))];
}

function groupMembersTableHtml(members = []) {
  if (!members.length) return '<p class="empty">Belum ada anggota pada lokasi PKL ini.</p>';
  return `<div class="table-wrap"><table class="group-member-table"><thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th><th>Guru Pembimbing</th></tr></thead><tbody>${members.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${esc(item.full_name || '-')}</strong></td><td>${esc(item.nis || '-')}</td><td>${esc(item.class_name || '-')}</td><td>${esc(item.teacher_name || '-')}</td></tr>`).join('')}</tbody></table></div>`;
}

function groupReportFormHtml(report, context, settings, editable) {
  const disabled = editable ? '' : 'disabled';
  return `<form id="groupReportForm" class="form-grid final-report-form group-report-form">
    <label class="wide">Judul Laporan<input name="report_title" maxlength="180" value="${esc(report?.report_title || `${settings.report_title || 'LAPORAN PRAKTIK KERJA LAPANGAN'} KELOMPOK`)}" ${disabled}></label>
    <label>Lokasi PKL<input value="${esc(context.internship_place || '')}" disabled></label>
    <label>Unit/Bagian Penempatan<input name="placement_unit" maxlength="200" value="${esc(report?.placement_unit || '')}" placeholder="Contoh: Administrasi / RPH / BKPH ..." ${disabled}></label>
    <label class="wide">Profil Singkat Instansi <span class="required-mark">Wajib sebelum diajukan</span><textarea name="institution_profile" minlength="30" required placeholder="Jelaskan profil singkat instansi/lokasi PKL kelompok." ${disabled}>${esc(report?.institution_profile || '')}</textarea></label>
    <label class="wide">Struktur Organisasi / Posisi Penempatan <span class="optional-label">opsional</span><textarea name="organization_structure" placeholder="Tuliskan struktur singkat atau posisi unit tempat kelompok ditempatkan." ${disabled}>${esc(report?.organization_structure || '')}</textarea></label>
    <label class="wide">Kata Pengantar Kelompok <span class="required-mark">Wajib sebelum diajukan</span><textarea name="preface" minlength="50" required placeholder="Tuliskan kata pengantar sebagai laporan kelompok." ${disabled}>${esc(report?.preface || '')}</textarea></label>
    <label class="wide">Kesimpulan Kelompok <span class="required-mark">Wajib sebelum diajukan</span><textarea name="conclusion" minlength="50" required placeholder="Rangkum pengalaman dan hasil PKL seluruh anggota kelompok." ${disabled}>${esc(report?.conclusion || '')}</textarea></label>
    <label class="wide">Saran untuk Sekolah<textarea name="suggestions_school" placeholder="Saran kelompok untuk sekolah." ${disabled}>${esc(report?.suggestions_school || '')}</textarea></label>
    <label class="wide">Saran untuk Tempat PKL<textarea name="suggestions_workplace" placeholder="Saran kelompok untuk tempat PKL." ${disabled}>${esc(report?.suggestions_workplace || '')}</textarea></label>
    <label class="wide">Saran untuk Siswa PKL Berikutnya<textarea name="suggestions_students" placeholder="Saran kelompok bagi siswa PKL berikutnya." ${disabled}>${esc(report?.suggestions_students || '')}</textarea></label>
  </form>`;
}

async function renderStudentGroupReport() {
  let context;
  try {
    context = await loadGroupReportContext();
  } catch (error) {
    if (isGroupReportSchemaError(error) || !state.groupReportFeatureReady) {
      $('#content').innerHTML = `<div class="page-intro"><div><span class="section-kicker">LAPORAN KELOMPOK</span><h3>Laporan PKL Kelompok</h3><p>Kelompok dibentuk otomatis berdasarkan lokasi praktik yang sama.</p></div><button class="btn secondary" id="backIndividualReport">Kembali ke Laporan Individu</button></div>${groupReportMigrationNotice()}`;
      $('#backIndividualReport').onclick = () => renderStudentFinalReport();
      return;
    }
    throw error;
  }

  const { report, members, journals, settings } = context;
  state.groupReport = report;
  const editable = !report || ['draft', 'revision'].includes(report.status);
  const [statusLabel, statusColor, statusDescription] = finalReportStatusMeta(report?.status);
  const totalHours = journals.reduce((sum, item) => sum + (Number(item.work_hours) || 0), 0);
  const teacherNames = uniqueGroupNames(members, 'teacher_name');
  const isValidGroup = members.length >= 2;

  $('#content').innerHTML = `<div class="page-intro final-report-intro"><div><span class="section-kicker">LAPORAN AKHIR PKL KELOMPOK</span><h3>${esc(context.internship_place || 'Lokasi PKL')}</h3><p>Anggota kelompok dibentuk otomatis dari siswa yang memiliki lokasi praktik yang sama. Isi naratif laporan dipakai bersama seluruh anggota.</p></div><div class="report-action-buttons"><button class="btn secondary" id="backIndividualReport">Laporan Individu</button><button class="btn secondary" id="previewGroupReport">Pratinjau</button><button class="btn secondary" id="downloadWordGroupReport">Unduh Word (.doc)</button><button class="btn primary" id="printGroupReport">Cetak / Simpan PDF</button></div></div>
    <div class="cards final-report-summary-cards"><div class="card stat"><strong>${members.length}</strong><span>Anggota kelompok</span></div><div class="card stat"><strong>${journals.length}</strong><span>Jurnal disetujui gabungan</span></div><div class="card stat"><strong>${totalHours}</strong><span>Total jam kelompok</span></div><div class="card stat"><strong>${teacherNames.length}</strong><span>Guru pembimbing</span></div></div>
    ${!isValidGroup ? '<div class="info-strip group-warning"><strong>Belum dapat diajukan:</strong> laporan kelompok membutuhkan minimal 2 siswa pada lokasi PKL yang sama. Draf tetap dapat disiapkan.</div>' : ''}
    <section class="data-panel final-report-status-panel"><div><span class="badge ${statusColor}">${esc(statusLabel)}</span><h4>Status Laporan Kelompok</h4><p>${esc(statusDescription)}</p>${report?.teacher_note ? `<div class="teacher-review-note"><strong>Catatan Guru Pembimbing</strong><p>${textBlock(report.teacher_note)}</p></div>` : ''}</div><div class="final-report-identity"><span><small>Lokasi PKL</small><strong>${esc(context.internship_place || '-')}</strong></span><span><small>Periode Kelompok</small><strong>${esc(groupReportPeriodText(members))}</strong></span><span><small>Guru Pembimbing</small><strong>${esc(teacherNames.join(', ') || 'Belum ditetapkan')}</strong></span><span><small>Mode</small><strong>Kolaboratif per lokasi</strong></span></div></section>
    <div class="info-strip final-report-auto-info"><strong>Data otomatis kelompok:</strong> daftar anggota dan BAB III Pembahasan dibentuk dari seluruh jurnal <b>Disetujui</b> pada lokasi ini. Setiap jurnal memakai maksimal satu foto dan sitasi ilmiah yang dipilih berdasarkan kata kunci kegiatan. Daftar Gambar dan Daftar Pustaka dibuat otomatis. Catatan pembimbing tidak ditampilkan di BAB III.</div><div class="info-strip"><strong>Pemeriksaan sumber:</strong> sitasi ilmiah dipilih otomatis berdasarkan isi jurnal anggota. Guru Pembimbing perlu memeriksa kesesuaiannya sebelum menyetujui laporan kelompok.</div>
    <section class="data-panel"><div class="panel-title"><div><h4>Anggota Kelompok</h4><p>Pengelompokan mengikuti nilai <b>Tempat PKL</b> pada data siswa. Perbedaan huruf besar/kecil dan spasi diabaikan.</p></div><span class="badge green">${members.length} siswa</span></div>${groupMembersTableHtml(members)}</section>
    <section class="data-panel"><div class="panel-title"><div><h4>Data Naratif Laporan Kelompok</h4><p>${editable ? 'Semua anggota kelompok dapat menyunting draf. Simpan terbaru akan menjadi isi bersama untuk kelompok.' : 'Data dikunci selama laporan menunggu review atau setelah disetujui.'}</p></div>${finalReportStatusBadge(report?.status)}</div>${groupReportFormHtml(report, context, settings, editable)}<div class="final-report-form-actions">${editable ? '<button class="btn secondary" id="saveGroupReport">Simpan Draf Kelompok</button><button class="btn primary btn-emphasis" id="submitGroupReport">Ajukan Laporan Kelompok</button>' : ''}</div></section>`;

  $('#backIndividualReport').onclick = () => renderStudentFinalReport();
  $('#saveGroupReport')?.addEventListener('click', () => saveStudentGroupReport());
  $('#submitGroupReport')?.addEventListener('click', () => submitStudentGroupReport());
  $('#previewGroupReport').onclick = async () => {
    if (editable) { const saved = await saveStudentGroupReport({ silent: true }); if (!saved) return; }
    await printGroupPklReport(context.group_key, { autoPrint: false });
  };
  $('#downloadWordGroupReport').onclick = async () => {
    if (editable) { const saved = await saveStudentGroupReport({ silent: true }); if (!saved) return; }
    await downloadGroupPklReportWord(context.group_key);
  };
  $('#printGroupReport').onclick = async () => {
    if (editable) { const saved = await saveStudentGroupReport({ silent: true }); if (!saved) return; }
    await printGroupPklReport(context.group_key, { autoPrint: true });
  };
}

function collectGroupReportForm() {
  const form = $('#groupReportForm');
  if (!form) return null;
  const data = Object.fromEntries(new FormData(form));
  return {
    p_report_title: String(data.report_title || '').trim(),
    p_placement_unit: String(data.placement_unit || '').trim(),
    p_institution_profile: String(data.institution_profile || '').trim(),
    p_organization_structure: String(data.organization_structure || '').trim(),
    p_preface: String(data.preface || '').trim(),
    p_conclusion: String(data.conclusion || '').trim(),
    p_suggestions_school: String(data.suggestions_school || '').trim(),
    p_suggestions_workplace: String(data.suggestions_workplace || '').trim(),
    p_suggestions_students: String(data.suggestions_students || '').trim(),
  };
}

async function saveStudentGroupReport({ silent = false } = {}) {
  const payload = collectGroupReportForm();
  if (!payload) return false;
  const { data, error } = await sb.rpc('save_group_pkl_report', payload);
  if (error) {
    if (isGroupReportSchemaError(error)) return toast('Fitur laporan kelompok belum aktif. Jalankan upgrade database v6.28.'), false;
    toast(error.message || 'Laporan kelompok gagal disimpan.', 5500);
    return false;
  }
  state.groupReport = data || state.groupReport;
  if (!silent) {
    toast('Draf laporan kelompok berhasil disimpan. Perubahan berlaku untuk seluruh anggota.');
    await renderStudentGroupReport();
  }
  return true;
}

async function submitStudentGroupReport() {
  if (!$('#groupReportForm')?.reportValidity()) return;
  const saved = await saveStudentGroupReport({ silent: true });
  if (!saved) return;
  if (!confirm('Ajukan laporan kelompok untuk ditinjau Guru Pembimbing? Setelah diajukan, isi laporan kelompok dikunci sampai ada keputusan.')) return;
  const { error } = await sb.rpc('submit_group_pkl_report');
  if (error) return toast(error.message || 'Laporan kelompok gagal diajukan.', 6000);
  toast('Laporan kelompok berhasil diajukan untuk ditinjau Guru Pembimbing.');
  await renderStudentGroupReport();
}


function reportSettingsFormHtml(settings) {
  return `<details class="data-panel report-settings-panel" open><summary><strong>Pengaturan Format Laporan Sekolah</strong><span>Administrator</span></summary><form id="reportSettingsForm" class="form-grid">
    <label>Nama Sekolah<input name="school_name" value="${esc(settings.school_name || '')}" required></label>
    <label>Tahun Pelajaran<input name="school_year" value="${esc(settings.school_year || '')}" placeholder="2026/2027"></label>
    <label>Nama Kepala Sekolah<input name="principal_name" value="${esc(settings.principal_name || '')}"></label>
    <label>NIP Kepala Sekolah<input name="principal_nip" value="${esc(settings.principal_nip || '')}"></label>
    <label>Lokasi Pengesahan<input name="approval_location" value="${esc(settings.approval_location || '')}" placeholder="Sumedang"></label>
    <label>Judul Standar Laporan<input name="report_title" value="${esc(settings.report_title || '')}" required></label>
    <label class="wide">Latar Belakang Standar<textarea name="standard_background">${esc(settings.standard_background || '')}</textarea></label>
    <label class="wide">Tujuan PKL Standar<textarea name="standard_objectives">${esc(settings.standard_objectives || '')}</textarea></label>
    <label class="wide">Manfaat PKL Standar<textarea name="standard_benefits">${esc(settings.standard_benefits || '')}</textarea></label>
    <div class="wide actions"><button class="btn primary" type="submit">Simpan Pengaturan Laporan</button></div>
  </form></details>`;
}

async function groupReportManagerHtml(role) {
  const { data, error } = await sb.rpc('list_pkl_groups');
  if (error) {
    if (isGroupReportSchemaError(error)) {
      state.groupReportFeatureReady = false;
      state.groupReportGroups = [];
      return `<section class="group-manager-section">${groupReportMigrationNotice()}</section>`;
    }
    throw error;
  }
  state.groupReportFeatureReady = true;
  state.groupReportGroups = Array.isArray(data) ? data : [];
  const created = state.groupReportGroups.filter((item) => item.status).length;
  const submitted = state.groupReportGroups.filter((item) => item.status === 'submitted').length;
  const approved = state.groupReportGroups.filter((item) => item.status === 'approved').length;
  return `<section class="group-manager-section">
    <div class="group-section-heading"><div><span class="section-kicker">LAPORAN KELOMPOK PER LOKASI</span><h3>Laporan PKL Kelompok</h3><p>Kelompok terbentuk otomatis berdasarkan <b>Tempat PKL</b> yang sama. Jurnal dan dokumentasi seluruh anggota pada lokasi tersebut digabung dalam satu laporan.</p></div><div class="group-section-stats"><span><b>${state.groupReportGroups.length}</b> lokasi</span><span><b>${created}</b> dibuat</span><span><b>${submitted}</b> menunggu review</span><span><b>${approved}</b> disetujui</span></div></div>
    <section class="data-panel"><div class="attendance-filter-heading"><div><strong>Daftar Kelompok Lokasi PKL</strong><span>Cari berdasarkan lokasi, nama anggota, atau guru pembimbing.</span></div><button class="btn secondary" id="resetGroupReportFilters">Reset Filter</button></div><div class="attendance-filter-grid"><label>Cari kelompok<input id="groupReportSearch" placeholder="Lokasi PKL, anggota, guru"></label><label>Status<select id="groupReportStatusFilter"><option value="">Semua status</option><option value="none">Belum dibuat</option><option value="draft">Draf</option><option value="submitted">Diajukan</option><option value="revision">Perlu revisi</option><option value="approved">Disetujui</option></select></label></div></section>
    <section class="data-panel"><div class="table-wrap"><table><thead><tr><th>Lokasi Praktik</th><th>Anggota</th><th>Guru Pembimbing</th><th>Status</th><th>Diperbarui</th><th>Tindakan</th></tr></thead><tbody id="groupReportRows"></tbody></table></div><p id="groupReportListMeta" class="form-help"></p></section>
  </section>`;
}

function bindGroupReportManager(role) {
  if (!state.groupReportFeatureReady || !$('#groupReportRows')) return;
  const draw = () => {
    const query = ($('#groupReportSearch')?.value || '').trim().toLowerCase();
    const status = $('#groupReportStatusFilter')?.value || '';
    const visible = (state.groupReportGroups || []).filter((item) => {
      const reportStatus = item.status || 'none';
      const searchText = `${item.internship_place || ''} ${item.member_names || ''} ${item.teacher_names || ''}`.toLowerCase();
      return (!query || searchText.includes(query)) && (!status || reportStatus === status);
    });
    $('#groupReportRows').innerHTML = visible.map((item) => {
      const canReview = role === 'teacher' && item.status === 'submitted';
      const actions = item.status
        ? `<button class="btn secondary open-group-report" data-key="${esc(item.group_key)}">Lihat</button><button class="btn secondary preview-group-report" data-key="${esc(item.group_key)}">Pratinjau</button><button class="btn secondary word-group-report" data-key="${esc(item.group_key)}">Word</button>${canReview ? `<button class="btn primary review-group-report" data-key="${esc(item.group_key)}">Tinjau</button>` : ''}`
        : '<span class="muted">Menunggu siswa membuat draf</span>';
      return `<tr><td><strong>${esc(item.internship_place || '-')}</strong><small>Kunci kelompok: ${esc(item.group_key || '-')}</small></td><td><strong>${esc(item.member_count || 0)} siswa</strong><small>${esc(item.member_names || '-')}</small></td><td>${esc(item.teacher_names || '-')}</td><td>${finalReportStatusBadge(item.status)}</td><td>${esc(item.updated_at ? formatDateTime(item.updated_at) : '-')}</td><td><div class="actions">${actions}</div></td></tr>`;
    }).join('') || '<tr><td colspan="6" class="empty">Tidak ada kelompok lokasi yang sesuai dengan filter.</td></tr>';
    $('#groupReportListMeta').textContent = `Menampilkan ${visible.length} dari ${(state.groupReportGroups || []).length} lokasi praktik.`;
    document.querySelectorAll('.open-group-report').forEach((button) => button.onclick = () => openGroupReportDetail(button.dataset.key));
    document.querySelectorAll('.preview-group-report').forEach((button) => button.onclick = () => printGroupPklReport(button.dataset.key, { autoPrint: false }));
    document.querySelectorAll('.word-group-report').forEach((button) => button.onclick = () => downloadGroupPklReportWord(button.dataset.key));
    document.querySelectorAll('.review-group-report').forEach((button) => button.onclick = () => openGroupReportDetail(button.dataset.key, { reviewMode: true }));
  };
  $('#groupReportSearch')?.addEventListener('input', draw);
  $('#groupReportStatusFilter')?.addEventListener('change', draw);
  $('#resetGroupReportFilters')?.addEventListener('click', () => {
    if ($('#groupReportSearch')) $('#groupReportSearch').value = '';
    if ($('#groupReportStatusFilter')) $('#groupReportStatusFilter').value = '';
    draw();
  });
  draw();
}

async function openGroupReportDetail(groupKey, { reviewMode = false } = {}) {
  let context;
  try {
    context = await loadGroupReportContext(groupKey);
  } catch (error) {
    return toast(error.message || 'Laporan kelompok gagal dimuat.', 5500);
  }
  const { report, members, journals } = context;
  if (!report) return toast('Kelompok ini belum membuat laporan PKL.');
  const isReviewable = state.profile.role === 'teacher' && report.status === 'submitted';
  modal('Detail Laporan PKL Kelompok', `<div class="final-report-modal-summary group-modal-summary"><div><span>Lokasi PKL</span><strong>${esc(context.internship_place || '-')}</strong></div><div><span>Anggota</span><strong>${members.length} siswa</strong></div><div><span>Jurnal Disetujui</span><strong>${journals.length}</strong></div><div><span>Status</span>${finalReportStatusBadge(report.status)}</div></div>
    <div class="group-modal-members"><h4>Anggota Kelompok</h4>${groupMembersTableHtml(members)}</div>
    <div class="final-report-readonly"><section><h4>Profil Instansi</h4><p>${textBlock(report.institution_profile)}</p></section><section><h4>Unit Penempatan</h4><p>${textBlock(report.placement_unit)}</p></section><section><h4>Kata Pengantar Kelompok</h4><p>${textBlock(report.preface)}</p></section><section><h4>Kesimpulan</h4><p>${textBlock(report.conclusion)}</p></section><section><h4>Saran</h4><p><b>Sekolah:</b><br>${textBlock(report.suggestions_school)}<br><br><b>Tempat PKL:</b><br>${textBlock(report.suggestions_workplace)}<br><br><b>Siswa berikutnya:</b><br>${textBlock(report.suggestions_students)}</p></section>${report.teacher_note ? `<section class="teacher-review-note"><h4>Catatan Guru</h4><p>${textBlock(report.teacher_note)}</p></section>` : ''}</div>
    <div class="actions"><button class="btn secondary" id="modalPreviewGroupReport">Pratinjau Laporan</button><button class="btn secondary" id="modalWordGroupReport">Unduh Word</button><button class="btn primary" id="modalPrintGroupReport">Cetak / PDF</button></div>
    ${isReviewable && reviewMode ? `<form id="groupReportReviewForm" class="form-stack teacher-review-form"><label>Catatan Guru Pembimbing<textarea name="teacher_note" placeholder="Wajib diisi jika meminta revisi."></textarea></label><div class="actions"><button type="button" class="btn warn group-report-review-action" data-status="revision">Minta Revisi</button><button type="button" class="btn primary group-report-review-action" data-status="approved">Setujui Laporan Kelompok</button></div></form>` : ''}`);
  $('#modalPreviewGroupReport').onclick = () => printGroupPklReport(groupKey, { autoPrint: false });
  $('#modalWordGroupReport').onclick = () => downloadGroupPklReportWord(groupKey);
  $('#modalPrintGroupReport').onclick = () => printGroupPklReport(groupKey, { autoPrint: true });
  document.querySelectorAll('.group-report-review-action').forEach((button) => {
    button.onclick = async () => {
      const note = String(new FormData($('#groupReportReviewForm')).get('teacher_note') || '').trim();
      const status = button.dataset.status;
      const label = status === 'approved' ? 'menyetujui' : 'meminta revisi pada';
      if (!confirm(`Anda akan ${label} laporan kelompok lokasi ${context.internship_place || ''}. Lanjutkan?`)) return;
      button.disabled = true;
      const { error } = await sb.rpc('review_group_pkl_report', { p_group_key: groupKey, p_status: status, p_teacher_note: note || null });
      if (error) { button.disabled = false; return toast(error.message || 'Review laporan kelompok gagal.', 5500); }
      closeModal();
      toast(status === 'approved' ? 'Laporan kelompok berhasil disetujui.' : 'Laporan kelompok dikembalikan untuk direvisi.');
      await renderFinalReportManager();
    };
  });
}


async function renderFinalReportManager() {
  const role = state.profile.role;
  let studentQuery = sb.from('student_details')
    .select('*,profiles!student_details_id_fkey(full_name,email),teacher:profiles!student_details_teacher_id_fkey(full_name),field_supervisor:profiles!student_details_field_supervisor_id_fkey(full_name)')
    .order('nis');
  if (role === 'teacher') studentQuery = studentQuery.eq('teacher_id', state.profile.id);
  if (role === 'field_supervisor') studentQuery = studentQuery.eq('field_supervisor_id', state.profile.id);
  const studentResult = await studentQuery;
  if (studentResult.error) throw studentResult.error;
  const students = studentResult.data || [];
  const ids = students.map((item) => item.id);
  let reports = [];
  if (ids.length) {
    const reportResult = await sb.from('pkl_reports').select('*').in('student_id', ids);
    if (reportResult.error) {
      if (isFinalReportSchemaError(reportResult.error)) {
        state.finalReportFeatureReady = false;
        $('#content').innerHTML = finalReportMigrationNotice();
        return;
      }
      throw reportResult.error;
    }
    reports = reportResult.data || [];
  }
  const reportByStudent = new Map(reports.map((item) => [item.student_id, item]));
  state.finalReportStudents = students.map((student) => ({ ...student, report: reportByStudent.get(student.id) || null }));
  const counts = state.finalReportStudents.reduce((acc, item) => {
    const key = item.report?.status || 'none';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { none:0, draft:0, submitted:0, revision:0, approved:0 });
  const heading = role === 'teacher' ? 'Laporan PKL Siswa Bimbingan' : role === 'admin' ? 'Monitoring Laporan PKL' : 'Laporan PKL Siswa';
  const description = role === 'teacher'
    ? 'Periksa laporan yang diajukan siswa, berikan catatan revisi, lalu setujui laporan yang sudah sesuai.'
    : role === 'admin'
      ? 'Pantau status laporan seluruh siswa dan atur identitas serta teks baku yang digunakan pada hasil cetak.'
      : 'Lihat laporan akhir siswa yang menjadi bimbingan lapangan Anda.';
  const groupManagerSection = await groupReportManagerHtml(role);

  $('#content').innerHTML = `<div class="page-intro final-report-intro"><div><span class="section-kicker">LAPORAN AKHIR PKL</span><h3>${heading}</h3><p>${description}</p></div></div>
    ${role === 'admin' ? reportSettingsFormHtml(state.finalReportSettings || DEFAULT_PKL_REPORT_SETTINGS) : ''}
    <div class="cards final-report-summary-cards"><div class="card stat"><strong>${counts.submitted}</strong><span>Menunggu review</span></div><div class="card stat"><strong>${counts.revision}</strong><span>Perlu revisi</span></div><div class="card stat"><strong>${counts.approved}</strong><span>Disetujui</span></div><div class="card stat"><strong>${counts.none + counts.draft}</strong><span>Belum diajukan</span></div></div>
    <section class="data-panel"><div class="attendance-filter-heading"><div><strong>Daftar Laporan Siswa</strong><span>Gunakan pencarian dan status untuk menemukan laporan dengan cepat.</span></div><button class="btn secondary" id="resetFinalReportFilters">Reset Filter</button></div><div class="attendance-filter-grid"><label>Cari siswa<input id="finalReportSearch" placeholder="Nama, NISN, kelas, tempat PKL"></label><label>Status<select id="finalReportStatusFilter"><option value="">Semua status</option><option value="none">Belum dibuat</option><option value="draft">Draf</option><option value="submitted">Diajukan</option><option value="revision">Perlu revisi</option><option value="approved">Disetujui</option></select></label></div></section>
    <section class="data-panel"><div class="table-wrap"><table><thead><tr><th>Siswa</th><th>NISN/Kelas</th><th>Tempat PKL</th><th>Guru Pembimbing</th><th>Status</th><th>Diperbarui</th><th>Tindakan</th></tr></thead><tbody id="finalReportStudentRows"></tbody></table></div><p id="finalReportListMeta" class="form-help"></p></section>
    ${groupManagerSection}`;

  const draw = () => {
    const query = ($('#finalReportSearch')?.value || '').trim().toLowerCase();
    const status = $('#finalReportStatusFilter')?.value || '';
    const visible = state.finalReportStudents.filter((item) => {
      const reportStatus = item.report?.status || 'none';
      const searchText = `${item.profiles?.full_name || ''} ${item.nis || ''} ${item.class_name || ''} ${item.internship_place || ''}`.toLowerCase();
      return (!query || searchText.includes(query)) && (!status || reportStatus === status);
    });
    $('#finalReportStudentRows').innerHTML = visible.map((item) => {
      const report = item.report;
      const canReview = role === 'teacher' && report?.status === 'submitted';
      return `<tr><td><strong>${esc(item.profiles?.full_name || '-')}</strong><small>${esc(item.profiles?.email || '')}</small></td><td><strong>${esc(item.nis || '-')}</strong><small>${esc(item.class_name || '-')}</small></td><td>${esc(item.internship_place || '-')}</td><td>${esc(item.teacher?.full_name || '-')}</td><td>${finalReportStatusBadge(report?.status)}</td><td>${esc(report?.updated_at ? formatDateTime(report.updated_at) : '-')}</td><td><div class="actions">${report ? `<button class="btn secondary open-final-report" data-id="${item.id}">Lihat</button><button class="btn secondary preview-final-report" data-id="${item.id}">Pratinjau</button><button class="btn secondary word-final-report" data-id="${item.id}">Word</button>${canReview ? `<button class="btn primary review-final-report" data-id="${item.id}">Tinjau</button>` : ''}` : '<span class="muted">Belum tersedia</span>'}</div></td></tr>`;
    }).join('') || '<tr><td colspan="7" class="empty">Tidak ada laporan yang sesuai dengan filter.</td></tr>';
    $('#finalReportListMeta').textContent = `Menampilkan ${visible.length} dari ${state.finalReportStudents.length} siswa.`;
    document.querySelectorAll('.open-final-report').forEach((button) => button.onclick = () => openFinalReportDetail(button.dataset.id));
    document.querySelectorAll('.preview-final-report').forEach((button) => button.onclick = () => printFinalPklReport(button.dataset.id, { autoPrint: false }));
    document.querySelectorAll('.word-final-report').forEach((button) => button.onclick = () => downloadFinalPklReportWord(button.dataset.id));
    document.querySelectorAll('.review-final-report').forEach((button) => button.onclick = () => openFinalReportDetail(button.dataset.id, { reviewMode: true }));
  };

  $('#finalReportSearch').addEventListener('input', draw);
  $('#finalReportStatusFilter').addEventListener('change', draw);
  $('#resetFinalReportFilters').onclick = () => { $('#finalReportSearch').value=''; $('#finalReportStatusFilter').value=''; draw(); };
  $('#reportSettingsForm')?.addEventListener('submit', saveFinalReportSettings);
  draw();
  bindGroupReportManager(role);
}

async function saveFinalReportSettings(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Object.fromEntries(new FormData(form));
  const payload = {
    id: 1,
    school_name: String(fields.school_name || '').trim(),
    school_year: String(fields.school_year || '').trim() || null,
    principal_name: String(fields.principal_name || '').trim() || null,
    principal_nip: String(fields.principal_nip || '').trim() || null,
    report_title: String(fields.report_title || '').trim(),
    approval_location: String(fields.approval_location || '').trim() || null,
    standard_background: String(fields.standard_background || '').trim() || null,
    standard_objectives: String(fields.standard_objectives || '').trim() || null,
    standard_benefits: String(fields.standard_benefits || '').trim() || null,
    updated_at: new Date().toISOString(),
    updated_by: state.profile.id,
  };
  const { error } = await sb.from('pkl_report_settings').upsert(payload, { onConflict: 'id' });
  if (error) return toast(error.message || 'Pengaturan laporan gagal disimpan.', 5000);
  state.finalReportSettings = { ...DEFAULT_PKL_REPORT_SETTINGS, ...payload };
  toast('Pengaturan format laporan berhasil disimpan.');
}

async function openFinalReportDetail(studentId, { reviewMode = false } = {}) {
  const context = await loadFinalReportContext(studentId);
  const { detail, report, journals } = context;
  if (!report) return toast('Siswa belum membuat laporan PKL.');
  const approved = journals.filter((item) => item.status === 'approved');
  const isReviewable = state.profile.role === 'teacher' && report.status === 'submitted';
  modal('Detail Laporan PKL', `<div class="final-report-modal-summary"><div><span>Siswa</span><strong>${esc(detail?.profiles?.full_name || '-')}</strong></div><div><span>NISN / Kelas</span><strong>${esc(detail?.nis || '-')} / ${esc(detail?.class_name || '-')}</strong></div><div><span>Tempat PKL</span><strong>${esc(detail?.internship_place || '-')}</strong></div><div><span>Status</span>${finalReportStatusBadge(report.status)}</div><div><span>Jurnal Disetujui</span><strong>${approved.length}</strong></div></div>
    <div class="final-report-readonly"><section><h4>Profil Instansi</h4><p>${textBlock(report.institution_profile)}</p></section><section><h4>Unit Penempatan</h4><p>${textBlock(report.placement_unit)}</p></section><section><h4>Kata Pengantar</h4><p>${textBlock(report.preface)}</p></section><section><h4>Kesimpulan</h4><p>${textBlock(report.conclusion)}</p></section><section><h4>Saran</h4><p><b>Sekolah:</b><br>${textBlock(report.suggestions_school)}<br><br><b>Tempat PKL:</b><br>${textBlock(report.suggestions_workplace)}<br><br><b>Siswa berikutnya:</b><br>${textBlock(report.suggestions_students)}</p></section>${report.teacher_note ? `<section class="teacher-review-note"><h4>Catatan Guru</h4><p>${textBlock(report.teacher_note)}</p></section>` : ''}</div>
    <div class="actions"><button class="btn secondary" id="modalPreviewFinalReport">Pratinjau Laporan</button><button class="btn secondary" id="modalWordFinalReport">Unduh Word</button><button class="btn primary" id="modalPrintFinalReport">Cetak / PDF</button></div>
    ${isReviewable && reviewMode ? `<form id="finalReportReviewForm" class="form-stack teacher-review-form"><label>Catatan Guru Pembimbing<textarea name="teacher_note" placeholder="Wajib diisi jika meminta revisi."></textarea></label><div class="actions"><button type="button" class="btn warn final-report-review-action" data-status="revision">Minta Revisi</button><button type="button" class="btn primary final-report-review-action" data-status="approved">Setujui Laporan</button></div></form>` : ''}`);
  $('#modalPreviewFinalReport').onclick = () => printFinalPklReport(studentId, { autoPrint: false });
  $('#modalWordFinalReport').onclick = () => downloadFinalPklReportWord(studentId);
  $('#modalPrintFinalReport').onclick = () => printFinalPklReport(studentId, { autoPrint: true });
  document.querySelectorAll('.final-report-review-action').forEach((button) => {
    button.onclick = async () => {
      const note = String(new FormData($('#finalReportReviewForm')).get('teacher_note') || '').trim();
      const status = button.dataset.status;
      const label = status === 'approved' ? 'menyetujui' : 'meminta revisi pada';
      if (!confirm(`Anda akan ${label} laporan siswa ini. Lanjutkan?`)) return;
      button.disabled = true;
      const { error } = await sb.rpc('review_pkl_report', { p_student_id: studentId, p_status: status, p_teacher_note: note || null });
      if (error) { button.disabled = false; return toast(error.message || 'Review laporan gagal.', 5000); }
      closeModal();
      toast(status === 'approved' ? 'Laporan siswa berhasil disetujui.' : 'Laporan dikembalikan kepada siswa untuk direvisi.');
      await renderFinalReportManager();
    };
  });
}

const PKL_RESEARCH_REFERENCES = Object.freeze([
  {
    id: 'archives',
    short: 'Ardiana & Suratman, 2021',
    citation: 'Ardiana dan Suratman (2021)',
    keywords: ['arsip', 'kearsipan', 'pengarsipan', 'berkas', 'surat masuk', 'surat keluar', 'dokumen', 'disposisi'],
    relevance: 'Pengelolaan arsip yang tertib mendukung pelayanan informasi karena dokumen dapat ditemukan kembali secara lebih cepat dan akurat.',
    apa: 'Ardiana, S., & Suratman, B. (2021). Pengelolaan Arsip Dalam Mendukung Pelayanan Informasi Pada Bagian Tata Usaha di Dinas Sosial Kabupaten Ponorogo. Jurnal Pendidikan Administrasi Perkantoran (JPAP), 9(2), 335–348. https://doi.org/10.26740/jpap.v9n2.p335-348'
  },
  {
    id: 'electronic-records',
    short: 'Rohmawati & Puspasari, 2020',
    citation: 'Rohmawati dan Puspasari (2020)',
    keywords: ['input data', 'entry data', 'data entry', 'scan', 'scanning', 'digital', 'komputer', 'excel', 'spreadsheet', 'database', 'aplikasi surat', 'sistem informasi', 'data elektronik'],
    relevance: 'Pengelolaan arsip dan data elektronik perlu dilakukan secara terstruktur, terkontrol, dan konsisten agar proses penyimpanan, penggunaan, pemeliharaan, serta temu kembali informasi berjalan efektif.',
    apa: 'Rohmawati, L., & Puspasari, D. (2020). Pengelolaan Arsip Berbasis Aplikasi Surat Di Dinas Perpustakaan dan Kearsipan Provinsi Jawa Timur. Jurnal Pendidikan Administrasi Perkantoran (JPAP), 8(2), 180–193. https://doi.org/10.26740/jpap.v8n2.p180-193'
  },
  {
    id: 'forest-inventory',
    short: 'Priatama et al., 2022',
    citation: 'Priatama et al. (2022)',
    keywords: ['inventarisasi', 'pengukuran pohon', 'ukur pohon', 'diameter pohon', 'dbh', 'tinggi pohon', 'volume tegakan', 'biomassa', 'pemetaan', 'mapping', 'gis', 'gps', 'koordinat', 'petak ukur', 'plot ukur'],
    relevance: 'Data pengukuran dan informasi spasial merupakan unsur penting dalam penilaian kondisi tegakan, termasuk untuk mendukung estimasi biomassa dan volume tegakan.',
    apa: 'Priatama, A. R., Setiawan, Y., Mansur, I., & Masyhuri, M. (2022). Regression Models for Estimating Aboveground Biomass and Stand Volume Using Landsat-Based Indices in Post-Mining Area. Jurnal Manajemen Hutan Tropika, 28(1), 1–14. https://doi.org/10.7226/jtfm.28.1.1'
  },
  {
    id: 'nursery',
    short: 'Priatna et al., 2026',
    citation: 'Priatna et al. (2026)',
    keywords: ['persemaian', 'bibit', 'benih', 'pembibitan', 'penanaman', 'menanam', 'tanam', 'semai', 'gmelina', 'jati', 'pinus', 'pemeliharaan tanaman'],
    relevance: 'Mutu benih, perlakuan pembibitan, dan pemeliharaan awal berhubungan dengan viabilitas benih serta pertumbuhan awal bibit, sehingga ketelitian pada tahapan persemaian menjadi bagian penting dalam kegiatan kehutanan.',
    apa: 'Priatna, D., Sudrajat, D. J., Sukma, A. D., Triastinurmiatiningsih, Surono, Rosadi, Ginarso, G. P., & Hartiningtias, D. (2026). Effectiveness of Biopriming Using Dark Septate Endophytes in Improving Seed Viability and Early Seedling Growth of Gmelina arborea Roxb. ex Sm. Jurnal Manajemen Hutan Tropika, 32(2), 183. https://doi.org/10.7226/jtfm.32.2.183'
  },
  {
    id: 'osh-forestry',
    short: 'Yovi et al., 2016',
    citation: 'Yovi et al. (2016)',
    keywords: ['k3', 'keselamatan kerja', 'kesehatan kerja', 'apd', 'alat pelindung', 'helm', 'sarung tangan', 'penebangan', 'chainsaw', 'gergaji mesin', 'risiko kerja', 'bahaya kerja'],
    relevance: 'Pengetahuan keselamatan dan kesehatan kerja perlu diperkuat pada pekerjaan kehutanan karena kegiatan lapangan memiliki risiko kerja dan membutuhkan perilaku kerja yang aman.',
    apa: 'Yovi, E. Y., Yamada, Y., Zaini, M. F., Kusumadewi, C. A. Y., & Marisiana, L. (2016). Improving the OSH Knowledge of Indonesian Forestry Workers by Using Safety Game Application: Tree Felling Supervisors and Operators. Jurnal Manajemen Hutan Tropika, 22(1), 75–85. https://doi.org/10.7226/jtfm.22.1.75'
  },
  {
    id: 'social-forestry',
    short: 'Setiajiati et al., 2017',
    citation: 'Setiajiati et al. (2017)',
    keywords: ['masyarakat', 'kelompok tani', 'perhutanan sosial', 'kemitraan', 'sosialisasi', 'pendampingan', 'pemberdayaan', 'lmdh', 'desa hutan'],
    relevance: 'Pemberdayaan, pendampingan, dan penguatan kapasitas kelompok merupakan bagian penting dalam pengelolaan hutan yang berkelanjutan dan berbasis masyarakat.',
    apa: 'Setiajiati, F., Hardjanto, H., & Hendrayanto, H. (2017). Strategies of Community Empowerment to Manage Protection Forest Sustainably. Jurnal Manajemen Hutan Tropika, 23(2), 71–80. https://doi.org/10.7226/jtfm.23.2.71'
  },
  {
    id: 'forest-management',
    short: 'Massiri et al., 2020',
    citation: 'Massiri et al. (2020)',
    keywords: ['perhutani', 'kph', 'bkph', 'rph', 'kehutanan', 'hutan', 'patroli', 'tegakan', 'resort', 'pengelolaan hutan', 'kawasan hutan'],
    relevance: 'Kapasitas dan peran unit pengelolaan hutan pada tingkat tapak penting untuk mendukung pelaksanaan pengelolaan hutan, pelayanan, serta kegiatan pendampingan di wilayah kerja.',
    apa: 'Massiri, S. D., Malik, A., Golar, Hamzari, & Nugroho, B. (2020). Institutional Capacity of Forest Management Unit in Promoting Sustainable Community-Based Forest Management: Case Study of Forest Management Unit in Central Sulawesi Province, Indonesia. Jurnal Manajemen Hutan Tropika, 26(2), 169–177. https://doi.org/10.7226/jtfm.26.2.169'
  },
  {
    id: 'pkl-general',
    short: 'Frahidayah et al., 2024',
    citation: 'Frahidayah et al. (2024)',
    keywords: [],
    relevance: 'Pengalaman PKL dan penguasaan soft skill berhubungan positif dengan kesiapan kerja siswa SMK, sehingga kegiatan praktik perlu diarahkan pada pengalaman kerja nyata, tanggung jawab, komunikasi, dan kemandirian.',
    apa: 'Frahidayah, A. E., Murtini, W., & Susantiningrum, S. (2024). Pengaruh Pengalaman PKL, Kepercayaan Diri, dan Penguasaan Soft Skill terhadap Kesiapan Kerja. Efisiensi: Kajian Ilmu Administrasi, 21(1), 63–78. https://doi.org/10.21831/efisiensi.v21i1.64221'
  }
]);

function compactReportText(value, limit = 420) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  if (sentenceEnd > Math.floor(limit * 0.45)) return cut.slice(0, sentenceEnd + 1).trim();
  return `${cut.replace(/\s+\S*$/, '').trim()}…`;
}

function journalResearchText(journal) {
  return [
    journal?.activity_title,
    journal?.description,
    ...(Array.isArray(journal?.activity_stages) ? journal.activity_stages : []),
    journal?.learning,
    journal?.obstacles,
    journal?.reflection,
    journal?.location,
  ].filter(Boolean).join(' ').toLocaleLowerCase('id-ID');
}

function researchReferenceForJournal(journal) {
  const text = journalResearchText(journal);
  let best = PKL_RESEARCH_REFERENCES[PKL_RESEARCH_REFERENCES.length - 1];
  let bestScore = 0;
  PKL_RESEARCH_REFERENCES.slice(0, -1).forEach((reference) => {
    let score = 0;
    reference.keywords.forEach((keyword) => {
      if (text.includes(keyword)) score += keyword.includes(' ') ? 3 : 1;
    });
    if (score > bestScore) {
      best = reference;
      bestScore = score;
    }
  });
  return best;
}

function referencesUsedByJournals(journals) {
  const map = new Map();
  (journals || []).forEach((journal) => {
    const reference = researchReferenceForJournal(journal);
    map.set(reference.id, reference);
  });
  return [...map.values()].sort((a, b) => a.apa.localeCompare(b.apa, 'id'));
}

function reportFigureItems(journals, { group = false } = {}) {
  let sequence = 0;
  return (journals || []).map((journal, journalIndex) => {
    const path = (journal.photo_paths || []).filter(Boolean)[0] || '';
    if (!path) return null;
    sequence += 1;
    const activity = compactReportText(journal.activity_title || 'Kegiatan PKL', 110);
    const studentPart = group && journal.student_name ? ` oleh ${journal.student_name}` : '';
    const caption = `Dokumentasi ${activity}${studentPart} pada ${formatAttendanceDate(journal.journal_date)}`;
    return {
      journalIndex,
      path,
      number: `3.${sequence}`,
      caption,
    };
  }).filter(Boolean);
}

function reportFigureListHtml(figures) {
  if (!figures.length) return '<p>Belum ada foto pada jurnal yang disetujui.</p>';
  return `<table class="figure-list">${figures.map((figure) => `<tr><td><b>Gambar ${esc(figure.number)}</b></td><td>${esc(figure.caption)}</td></tr>`).join('')}</table>`;
}

function formatReferenceApa7(reference) {
  const raw = String(reference?.apa || '').trim();
  if (!raw) return '';
  // Existing reference records are already stored in APA-like form.
  // Normalize presentation to APA 7: sentence-case title, italic journal + volume,
  // issue in parentheses, pages, and DOI as a URL.
  const match = raw.match(/^(.+?)\s*\((\d{4})\)\.\s*(.+?)\.\s+([^,]+),\s*(\d+)\(([^)]+)\),\s*([^\.]+?)(?:\.\s*(https:\/\/doi\.org\/\S+))?$/);
  if (!match) return esc(raw);
  const [, authors, year, title, journal, volume, issue, pages, doi] = match;
  const titleSentence = title.charAt(0).toUpperCase() + title.slice(1);
  return `${esc(authors)} (${year}). ${esc(titleSentence)}. <i>${esc(journal)}</i>, <i>${esc(volume)}</i>(${esc(issue)}), ${esc(pages)}${doi ? `. ${esc(doi)}` : ''}`;
}

function reportBibliographyHtml(references) {
  if (!references.length) return '<p>Belum ada sumber ilmiah yang digunakan.</p>';
  return `<ol class="bibliography-list">${references.map((reference) => `<li>${formatReferenceApa7(reference)}</li>`).join('')}</ol>`;
}

function journalMaterialTokens(journal) {
  const stop = new Set([
    'kegiatan','aktivitas','aktivitasnya','melakukan','melaksanakan','praktik','pkl','lapangan',
    'siswa','kelompok','hari','tanggal','tempat','lokasi','dengan','dan','yang','untuk','dari',
    'pada','dalam','serta','sesuai','proses','hasil','kerja','pekerjaan','bagian','unit'
  ]);
  return new Set(
    `${journal.activity_title || ''} ${(journal.activity_stages || []).join(' ')} ${journal.description || ''}`
      .toLocaleLowerCase('id-ID')
      .normalize('NFKD')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !stop.has(word))
  );
}

function journalMaterialSimilarity(a, b) {
  const aa = journalMaterialTokens(a);
  const bb = journalMaterialTokens(b);
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  aa.forEach((token) => { if (bb.has(token)) common += 1; });
  return common / (aa.size + bb.size - common);
}

function reportMaterialName(journal) {
  const text = journalResearchText(journal);
  const title = String(journal?.activity_title || '').trim();
  const rules = [
    { name: 'Agroforestry', keys: ['agroforestry', 'agroforestri', 'wanatani'] },
    { name: 'Inventarisasi Hutan', keys: ['inventarisasi', 'dbh', 'diameter pohon', 'tinggi pohon', 'volume tegakan', 'petak ukur', 'plot ukur', 'pemetaan', 'gis', 'gps'] },
    { name: 'Persemaian dan Pembibitan', keys: ['persemaian', 'pembibitan', 'bibit', 'benih', 'semai'] },
    { name: 'Silvikultur', keys: ['silvikultur', 'penanaman', 'pemeliharaan tanaman', 'pemeliharaan tegakan', 'pemupukan'] },
    { name: 'Pemanenan Hutan', keys: ['pemanenan', 'penebangan', 'chainsaw', 'penyaradan', 'pengangkutan kayu', 'logging'] },
    { name: 'Perlindungan Hutan', keys: ['perlindungan hutan', 'patroli', 'hama', 'penyakit tanaman', 'kebakaran hutan', 'gangguan hutan'] },
    { name: 'Pengelolaan Hutan Lestari', keys: ['pengelolaan hutan lestari', 'pengelolaan hutan', 'kph', 'bkph', 'rph', 'perhutani'] },
    { name: 'Perhutanan Sosial dan Pemberdayaan Masyarakat', keys: ['perhutanan sosial', 'masyarakat', 'kelompok tani', 'lmdh', 'pendampingan', 'pemberdayaan'] },
    { name: 'Keselamatan dan Kesehatan Kerja (K3)', keys: ['k3', 'keselamatan kerja', 'kesehatan kerja', 'apd', 'alat pelindung', 'risiko kerja'] },
  ];
  const found = rules.find((rule) => rule.keys.some((key) => text.includes(key)));
  return found?.name || compactReportText(title || 'Kegiatan PKL', 90);
}

function normalizeMaterialSubtopicTitle(title, material) {
  let clean = compactReportText(title || 'Kegiatan PKL', 120).trim();
  clean = clean.replace(/^(kegiatan|praktik|praktikum|materi)\s*[:\-]?\s*/i, '');
  if (!clean) clean = `Pelaksanaan ${material}`;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function groupJournalsByMaterial(journals) {
  const groups = [];
  (journals || []).forEach((journal) => {
    const material = reportMaterialName(journal);
    let target = groups.find((group) => group.name.toLocaleLowerCase('id-ID') === material.toLocaleLowerCase('id-ID'));
    if (!target) {
      target = {
        key: `${material.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${groups.length}`,
        name: material,
        reference: researchReferenceForJournal(journal),
        items: [],
        subgroups: [],
      };
      groups.push(target);
    }
    target.items.push(journal);

    const title = normalizeMaterialSubtopicTitle(journal.activity_title, material);
    let subgroup = target.subgroups.find((item) => {
      const a = item.title.toLocaleLowerCase('id-ID');
      const b = title.toLocaleLowerCase('id-ID');
      return a === b || journalMaterialSimilarity(item.items[0], journal) >= 0.42;
    });
    if (!subgroup) {
      subgroup = { title, items: [] };
      target.subgroups.push(subgroup);
    }
    subgroup.items.push(journal);
  });
  return groups;
}

function groupReportFigureItems(journals) {
  const groups = groupJournalsByMaterial(journals);
  let sequence = 0;
  const figures = [];
  groups.forEach((materialGroup) => {
    materialGroup.subgroups.forEach((subgroup) => {
      const first = subgroup.items[0];
      const path = (first?.photo_paths || []).filter(Boolean)[0] || '';
      if (!path) return;
      sequence += 1;
      figures.push({
        path,
        number: `3.${sequence}`,
        caption: `Dokumentasi ${compactReportText(subgroup.title || 'Kegiatan PKL', 110)} berdasarkan rekap jurnal kelompok`,
      });
    });
  });
  return figures;
}

function mergedUniqueText(items, field, limit = 8) {
  const values = [];
  const seen = new Set();
  (items || []).forEach((item) => {
    const raw = field === 'activity_stages'
      ? (item.activity_stages || [])
      : [item[field]];
    raw.flat ? raw.flat().forEach((value) => {
      const text = compactReportText(value, 260).trim();
      const key = text.toLocaleLowerCase('id-ID');
      if (text && !seen.has(key)) {
        seen.add(key);
        values.push(text);
      }
    }) : null;
  });
  return values.slice(0, limit);
}

function groupDiscussionNarrative(group, groupIndex, imageSources, figure, options = {}) {
  const items = group.items || [];
  const first = items[0] || {};
  const materialNumber = options.materialNumber || `3.${Number(groupIndex) + 2}`;
  const subtopicNumber = options.subtopicNumber || 1;
  const title = compactReportText(options.titleOverride || first.activity_title || 'Kegiatan PKL', 150);

  const students = [...new Set(items.map((item) => item.student_name).filter(Boolean))];
  const dates = [...new Set(items.map((item) => formatAttendanceDate(item.journal_date)).filter(Boolean))];
  const locations = mergedUniqueText(items, 'location', 4);
  const descriptions = mergedUniqueText(items, 'description', 5);
  const stages = mergedUniqueText(items, 'activity_stages', 8);
  const learnings = mergedUniqueText(items, 'learning', 6);
  const obstacles = mergedUniqueText(items, 'obstacles', 4);
  const reflections = mergedUniqueText(items, 'reflection', 4);
  const reference = group.reference || researchReferenceForJournal(first);

  const studentText = students.length > 1
    ? `${students.slice(0, -1).join(', ')} dan ${students.at(-1)}`
    : (students[0] || 'siswa');

  const dateText = dates.length > 1
    ? `pada beberapa waktu, antara lain ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? ', dan seterusnya' : ''}`
    : `pada ${dates[0] || '-'}`;

  const locationText = locations.length ? ` di ${locations.join(', ')}` : '';
  const descText = descriptions.length
    ? `Berdasarkan rekap jurnal, kegiatan meliputi ${descriptions.join('; ')}.`
    : 'Kegiatan dilaksanakan berdasarkan penugasan dan arahan pembimbing di tempat PKL.';
  const stageText = stages.length ? ` Tahapan kerja yang tercatat meliputi ${stages.join(', ')}.` : '';
  const learningText = learnings.length ? ` Pengetahuan dan keterampilan yang diperoleh meliputi ${learnings.join('; ')}.` : '';
  const obstacleText = obstacles.length ? ` Kendala yang dicatat meliputi ${obstacles.join('; ')} dan diselesaikan melalui penyesuaian kerja serta arahan pembimbing.` : '';
  const reflectionText = reflections.length ? ` Refleksi jurnal menunjukkan bahwa ${reflections.join('; ')}.` : '';
  const referenceText = reference
    ? ` Kegiatan ini selaras dengan ${reference.citation}, yang menjelaskan bahwa ${reference.relevance.toLowerCase()}`
    : '';

  const photo = figure
    ? `<figure class="discussion-photo">${imageSources?.[figure.path]
        ? `<img src="${esc(imageSources[figure.path])}" alt="${esc(figure.caption)}">`
        : '<div class="photo-missing">Foto tidak dapat dimuat</div>'}
       <figcaption><b>Gambar ${esc(figure.number)}.</b> ${esc(figure.caption)}</figcaption></figure>`
    : '';

  return `<div class="activity-discussion">
    <h4 class="activity-discussion-title">${esc(materialNumber)}.${esc(subtopicNumber)} ${esc(title)}</h4>
    <p>Hasil rekap ${items.length} jurnal siswa menunjukkan bahwa ${esc(studentText)} melaksanakan kegiatan <b>${esc(title)}</b> ${esc(dateText)}${esc(locationText)}. ${esc(descText)}${esc(stageText)}${esc(learningText)}${esc(obstacleText)}${esc(reflectionText)}${esc(referenceText)}</p>
    ${photo}
  </div>`;
}

function reportDiscussionHtml(journals, imageSources, { group = false, membersCount = 1, totalHours = 0 } = {}) {
  if (!journals.length) return '<h3 class="subchapter">3.1 Ringkasan Hasil Praktik Kerja Lapangan</h3><p>Belum ada jurnal berstatus Disetujui yang dapat dibahas.</p>';

  if (group) {
    const materialGroups = groupJournalsByMaterial(journals);

    // One representative photo for each submateri.
    let figureSequence = 0;
    const figureByJournal = new Map();
    materialGroups.forEach((materialGroup) => {
      materialGroup.subgroups.forEach((subgroup) => {
        const representative = subgroup.items[0];
        const path = (representative?.photo_paths || []).filter(Boolean)[0] || '';
        if (path) {
          figureSequence += 1;
          figureByJournal.set(representative, {
            path,
            number: `3.${figureSequence}`,
            caption: `Dokumentasi ${compactReportText(subgroup.title || 'Kegiatan PKL', 110)} berdasarkan rekap jurnal kelompok`,
          });
        }
      });
    });

    const materialNames = materialGroups.map((item) => item.name);
    const summary = `<h3 class="subchapter">3.1 Ringkasan Hasil Praktik Kerja Lapangan</h3>
      <p>Berdasarkan rekapitulasi ${journals.length} jurnal yang telah disetujui dari ${membersCount} anggota kelompok, kegiatan PKL dikelompokkan berdasarkan pokok materi. Jurnal siswa yang membahas materi yang sama disatukan dan dirangkum menjadi narasi kelompok. Setiap pokok materi kemudian diuraikan ke dalam submateri berdasarkan kegiatan yang tercatat pada jurnal. Materi yang terdokumentasi meliputi ${esc(materialNames.join(', '))}. Total waktu kerja yang tercatat adalah ${totalHours} jam.</p>`;

    const details = materialGroups.map((materialGroup, materialIndex) => {
      const materialNumber = `3.${materialIndex + 2}`;
      const materialIntro = materialGroup.items.length > 1
        ? `Pokok materi ${materialGroup.name} dirangkum dari ${materialGroup.items.length} jurnal siswa yang memiliki keterkaitan kegiatan.`
        : `Pokok materi ${materialGroup.name} dirangkum dari jurnal kegiatan siswa.`;

      const subtopics = materialGroup.subgroups.map((subgroup, subIndex) => {
        const first = subgroup.items[0];
        const figure = figureByJournal.get(first);
        const localGroup = { ...subgroup, reference: researchReferenceForJournal(first) };
        return groupDiscussionNarrative(
          localGroup,
          subIndex,
          imageSources,
          figure,
          {
            materialNumber,
            subtopicNumber: subIndex + 1,
            titleOverride: subgroup.title
          }
        );
      }).join('');

      return `<section class="material-discussion">
        <h3 class="material-discussion-title">${esc(materialNumber)} ${esc(materialGroup.name)}</h3>
        <p>${esc(materialIntro)} Uraian submateri berikut menggabungkan informasi yang sejenis sehingga tidak terjadi pengulangan pembahasan dan tetap mencerminkan pengalaman praktik seluruh anggota kelompok.</p>
        ${subtopics}
      </section>`;
    }).join('');

    return `${summary}${details}`;
  }

  const figures = reportFigureItems(journals);
  const figureByJournal = new Map(figures.map((figure) => [figure.journalIndex, figure]));
  const activityCount = new Set(journals.map((item) => String(item.activity_title || '').trim().toLocaleLowerCase('id-ID')).filter(Boolean)).size;
  const summary = `<h3 class="subchapter">3.1 Ringkasan Hasil Praktik Kerja Lapangan</h3><p>Berdasarkan ${journals.length} jurnal yang telah disetujui, kegiatan PKL mencakup ${activityCount || journals.length} jenis kegiatan dengan total ${totalHours} jam kerja tercatat. Pembahasan berikut diringkas dari isi jurnal harian sehingga uraian kegiatan, tahapan kerja, hasil pembelajaran, kendala, dan refleksi tetap sesuai dengan catatan kegiatan siswa.</p><h3 class="subchapter">3.2 Pembahasan Kegiatan Berdasarkan Jurnal</h3>`;
  const details = journals.map((journal, index) => {
    const title = compactReportText(journal.activity_title || 'Kegiatan PKL', 150);
    const date = formatAttendanceDate(journal.journal_date);
    const location = compactReportText(journal.location, 160);
    const description = compactReportText(journal.description, 430);
    const stages = (journal.activity_stages || []).map((item) => compactReportText(item, 130)).filter(Boolean).slice(0, 7).join(', ');
    const learning = compactReportText(journal.learning, 360);
    const obstacles = compactReportText(journal.obstacles, 300);
    const reflection = compactReportText(journal.reflection, 300);
    const reference = researchReferenceForJournal(journal);
    const figure = figureByJournal.get(index);
    const firstParagraph = `Siswa melaksanakan kegiatan <b>${esc(title)}</b> pada ${esc(date)}${location ? ` di ${esc(location)}` : ''}. ${description ? `Berdasarkan jurnal harian, kegiatan tersebut mencakup ${esc(description)}.` : 'Kegiatan dilaksanakan sesuai penugasan dan arahan di tempat praktik.'}${stages ? ` Tahapan kerja yang tercatat meliputi ${esc(stages)}.` : ''}`;
    const outcomeParts = [];
    if (learning) outcomeParts.push(`Hasil pembelajaran yang dicatat adalah ${esc(learning)}.`);
    if (obstacles) outcomeParts.push(`Kendala dan penyelesaian yang dicatat dalam jurnal adalah ${esc(obstacles)}.`);
    if (reflection) outcomeParts.push(`Pada refleksi kegiatan, siswa mencatat ${esc(reflection)}.`);
    const secondParagraph = outcomeParts.length ? `<p>${outcomeParts.join(' ')}</p>` : '';
    const literature = `<p class="literature-link">Kegiatan ini relevan dengan kajian ${esc(reference.citation)}. ${esc(reference.relevance)}</p>`;
    const photo = figure ? `<figure class="discussion-photo">${imageSources[figure.path] ? `<img src="${esc(imageSources[figure.path])}" alt="${esc(figure.caption)}">` : '<div class="photo-missing">Foto tidak dapat dimuat</div>'}<figcaption><b>Gambar ${esc(figure.number)}.</b> ${esc(figure.caption)}</figcaption></figure>` : '';
    return `<div class="activity-discussion"><h4 class="activity-discussion-title">3.2.${index + 1} ${esc(title)}</h4><p>${firstParagraph}</p>${secondParagraph}${literature}${photo}</div>`;
  }).join('');
  return `${summary}${details}`;
}



async function printFinalPklReport(studentId, { autoPrint = false } = {}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return toast('Popup diblokir browser. Izinkan popup lalu coba kembali.');
  printWindow.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Menyiapkan Laporan PKL</title><style>body{font-family:Arial;padding:32px;color:#1d2939}strong{color:#174c35}</style></head><body><strong>Menyiapkan laporan PKL dan foto dokumentasi...</strong><p>Mohon tunggu. Jangan tutup halaman ini.</p></body></html>');
  printWindow.document.close();
  try {
    const context = await loadFinalReportContext(studentId);
    const { detail, report, journals, settings } = context;
    if (!report) { printWindow.close(); return toast('Laporan PKL belum dibuat.'); }
    const approved = journals.filter((item) => item.status === 'approved');
    const photoPaths = [...new Set(approved.map((item) => (item.photo_paths || []).filter(Boolean)[0]).filter(Boolean))];
    const signedUrls = {};
    const batchSize = 50;
    for (let index = 0; index < photoPaths.length; index += batchSize) {
      Object.assign(signedUrls, await signedPhotoUrls(photoPaths.slice(index, index + batchSize)));
    }
    if (printWindow.closed) return;

    const studentName = detail?.profiles?.full_name || 'Siswa';
    const nis = detail?.nis || '-';
    const className = detail?.class_name || '-';
    const internshipPlace = detail?.internship_place || '-';
    const teacherName = detail?.teacher?.full_name || '________________________';
    const fieldSupervisorName = detail?.field_supervisor?.full_name || '________________________';
    const principalName = settings.principal_name || '________________________';
    const title = report.report_title || settings.report_title || 'LAPORAN PRAKTIK KERJA LAPANGAN';
    const activities = uniqueTextValues(approved, 'activity_title');
    const learnings = uniqueTextValues(approved, 'learning');
    const obstacles = uniqueTextValues(approved, 'obstacles');
    const reflections = uniqueTextValues(approved, 'reflection');
    const supervisorNotes = uniqueTextValues(approved, 'supervisor_note');
    const period = `${detail?.start_date ? formatAttendanceDate(detail.start_date) : '-'} s.d. ${detail?.end_date ? formatAttendanceDate(detail.end_date) : '-'}`;
    const totalHours = approved.reduce((sum,item)=>sum+(Number(item.work_hours)||0),0);
    const reportFigures = reportFigureItems(approved);
    const reportReferences = referencesUsedByJournals(approved);
    const suggestions = `<h3>4.2 Saran</h3><h4>A. Untuk Sekolah</h4><p>${textBlock(report.suggestions_school)}</p><h4>B. Untuk Tempat PKL</h4><p>${textBlock(report.suggestions_workplace)}</p><h4>C. Untuk Siswa</h4><p>${textBlock(report.suggestions_students)}</p>`;
    const reviewWatermark = report.status === 'approved' ? '' : `<div class="watermark">${esc(finalReportStatusMeta(report.status)[0].toUpperCase())}</div>`;
    const logoUrl = `${location.origin}/assets/logo-sekolah.png`;

    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)} - ${esc(studentName)}</title><style>
      @page{size:A4;margin:20mm 18mm 18mm}*{box-sizing:border-box}body{font-family:"Times New Roman",serif;color:#111;margin:0;font-size:12pt;line-height:1.55}.page{min-height:245mm;page-break-after:always;position:relative}.page:last-child{page-break-after:auto}.cover{display:flex;min-height:245mm;flex-direction:column;align-items:center;text-align:center;justify-content:flex-start;padding-top:22mm}.cover img{width:105px;height:105px;object-fit:contain;margin:18mm 0 12mm}.cover h1{font-size:18pt;line-height:1.4;margin:0 0 8mm}.cover h2{font-size:14pt;margin:0 0 12mm}.cover .identity-lines{width:75%;text-align:left;margin:0 auto}.cover .identity-lines div{display:grid;grid-template-columns:110px 15px 1fr;margin:5px 0}.cover .school{margin-top:auto;font-weight:bold;font-size:13pt}.cover .year{margin-top:4px}.chapter-title{text-align:center;font-size:15pt;margin:0 0 12mm}.subchapter{font-size:12pt;margin:7mm 0 3mm}.page p{text-align:justify;margin:0 0 4mm;white-space:normal}.pre{white-space:pre-line}.approval-table{width:100%;border-collapse:collapse;margin:8mm 0}.approval-table td,.approval-table th{padding:5px 7px;border:1px solid #333;text-align:left}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:18mm 15mm;margin-top:16mm;text-align:center}.signature-grid .space{height:22mm}.toc{width:100%;border-collapse:collapse}.toc td{padding:5px 0;border-bottom:0;vertical-align:bottom}.toc td:first-child{width:100%;background-image:linear-gradient(to right,#777 1px,transparent 1px);background-size:4px 1px;background-repeat:repeat-x;background-position:left calc(100% - 2px)}.toc td:first-child{padding-right:6px}.toc td:first-child span.toc-label{background:#fff;padding-right:4px}.toc td:last-child{text-align:right;width:42pt;white-space:nowrap;background:#fff;padding-left:6px}.word-field{white-space:nowrap}.report-table{width:100%;border-collapse:collapse;font-size:9.5pt;margin:4mm 0}.report-table th,.report-table td{border:1px solid #444;padding:4px;vertical-align:top}.report-table th{background:#eee;text-align:center}.bullet-list{margin:3mm 0 5mm;padding-left:7mm}.bullet-list li{margin-bottom:2mm;text-align:justify}.final-doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm 7mm}.final-doc-photo{margin:0;break-inside:avoid;page-break-inside:avoid;border:1px solid #777;padding:3mm}.final-doc-photo img,.photo-missing{width:100%;height:72mm;object-fit:contain;background:#f2f2f2}.photo-missing{display:flex;align-items:center;justify-content:center;color:#666}.final-doc-photo figcaption{text-align:center;font-size:9pt;margin-top:2mm}.journal-appendix{break-inside:avoid;margin-bottom:8mm;border-bottom:1px solid #aaa;padding-bottom:5mm}.journal-appendix h4{margin:0 0 2mm}.journal-appendix p{font-size:10pt;margin:1mm 0}.watermark{position:fixed;top:48%;left:12%;font-family:Arial,sans-serif;font-size:68pt;font-weight:bold;color:rgba(160,0,0,.08);transform:rotate(-28deg);z-index:0;pointer-events:none}.print-actions{position:fixed;right:16px;top:16px;z-index:20;font-family:Arial;border:0;background:#174c35;color:#fff;padding:10px 14px;border-radius:7px;cursor:pointer}.meta-box{border:1px solid #555;padding:5mm;margin:5mm 0}.meta-box p{text-align:left;margin:1mm 0}.report-note{font-size:9pt;color:#555;font-style:italic}.activity-discussion{margin:0 0 9mm;break-inside:auto}.activity-discussion-title{font-size:12pt;margin:5mm 0 2mm}.literature-link{font-size:10.5pt}.discussion-photo{width:82%;margin:5mm auto 8mm;break-inside:avoid;page-break-inside:avoid;text-align:center}.discussion-photo img,.discussion-photo .photo-missing{width:100%;max-height:105mm;object-fit:contain;background:#f2f2f2}.discussion-photo figcaption{font-size:9.5pt;margin-top:2mm;text-align:center}.figure-list{width:100%;border-collapse:collapse}.figure-list td{padding:5px 4px;border-bottom:1px dotted #999;vertical-align:top}.figure-list td:first-child{width:95px}.bibliography-list{padding-left:8mm}.bibliography-list li{margin-bottom:4mm;text-align:justify}.center{text-align:center!important}.right{text-align:right!important}@media print{.print-actions{display:none}.watermark{-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-table th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>${reviewWatermark}<button class="print-actions" onclick="window.print()">Cetak / Simpan PDF</button>
      <section class="page cover"><h1>${esc(title)}</h1><h2>${esc(internshipPlace)}</h2><img src="${esc(logoUrl)}" alt="Logo sekolah"><div class="identity-lines"><div><b>Nama</b><span>:</span><span>${esc(studentName)}</span></div><div><b>NISN</b><span>:</span><span>${esc(nis)}</span></div><div><b>Kelas</b><span>:</span><span>${esc(className)}</span></div><div><b>Program</b><span>:</span><span>Praktik Kerja Lapangan</span></div></div><div class="school">${esc(settings.school_name || DEFAULT_PKL_REPORT_SETTINGS.school_name)}</div><div class="year">Tahun Pelajaran ${esc(settings.school_year || '-')}</div></section>
      <section class="page"><h2 class="chapter-title">LEMBAR PENGESAHAN</h2><p>Laporan Praktik Kerja Lapangan ini telah diperiksa dan disetujui sebagai dokumentasi pelaksanaan PKL siswa.</p><table class="approval-table"><tr><th>Nama Siswa</th><td>${esc(studentName)}</td></tr><tr><th>NISN / Kelas</th><td>${esc(nis)} / ${esc(className)}</td></tr><tr><th>Tempat PKL</th><td>${esc(internshipPlace)}</td></tr><tr><th>Unit Penempatan</th><td>${esc(report.placement_unit || '-')}</td></tr><tr><th>Periode PKL</th><td>${esc(period)}</td></tr><tr><th>Status Laporan</th><td>${esc(finalReportStatusMeta(report.status)[0])}</td></tr></table><p class="right">${esc(settings.approval_location || 'Sumedang')}, ${esc(new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date()))}</p><div class="signature-grid"><div>Pembimbing Lapangan<div class="space"></div><b>${esc(fieldSupervisorName)}</b></div><div>Guru Pembimbing<div class="space"></div><b>${esc(teacherName)}</b></div><div>Siswa<div class="space"></div><b>${esc(studentName)}</b></div><div>Kepala Sekolah<div class="space"></div><b>${esc(principalName)}</b>${settings.principal_nip ? `<br>NIP. ${esc(settings.principal_nip)}` : ''}</div></div></section>
      <section class="page"><h2 class="chapter-title">KATA PENGANTAR</h2><p class="pre">${textBlock(report.preface)}</p></section>
      <section class="page"><h2 class="chapter-title">DAFTAR ISI</h2><table class="toc"><tr><td>LEMBAR PENGESAHAN</td><td></td></tr><tr><td>KATA PENGANTAR</td><td></td></tr><tr><td>DAFTAR GAMBAR</td><td></td></tr><tr><td>BAB I PENDAHULUAN</td><td></td></tr><tr><td>BAB II PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</td><td></td></tr><tr><td>BAB III PEMBAHASAN PRAKTIK KERJA LAPANGAN</td><td></td></tr><tr><td>BAB IV PENUTUP</td><td></td></tr><tr><td>DAFTAR PUSTAKA</td><td></td></tr><tr><td>LAMPIRAN</td><td></td></tr></table><p class="report-note">Nomor halaman dapat disesuaikan setelah dokumen disimpan sebagai PDF atau dicetak.</p></section>
      <section class="page"><h2 class="chapter-title">DAFTAR GAMBAR</h2>${reportFigureListHtml(reportFigures)}</section>
      <section class="page"><h2 class="chapter-title">BAB I<br>PENDAHULUAN</h2><h3 class="subchapter">1.1 Latar Belakang</h3><p class="pre">${textBlock(settings.standard_background)}</p><h3 class="subchapter">1.2 Tujuan PKL</h3><p class="pre">${textBlock(settings.standard_objectives)}</p><h3 class="subchapter">1.3 Manfaat PKL</h3><p class="pre">${textBlock(settings.standard_benefits)}</p><h3 class="subchapter">1.4 Waktu dan Tempat Pelaksanaan</h3><div class="meta-box"><p><b>Tempat PKL:</b> ${esc(internshipPlace)}</p><p><b>Unit/Bagian:</b> ${esc(report.placement_unit || '-')}</p><p><b>Periode:</b> ${esc(period)}</p></div></section>
      <section class="page"><h2 class="chapter-title">BAB II<br>PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</h2><h3 class="subchapter">2.1 Identitas dan Gambaran Umum Instansi</h3><p class="pre">${textBlock(report.institution_profile)}</p><h3 class="subchapter">2.2 Struktur Organisasi / Posisi Penempatan</h3><p class="pre">${textBlock(report.organization_structure, 'Struktur organisasi tidak dicantumkan.')}</p><h3 class="subchapter">2.3 Bidang atau Bagian Penempatan Siswa</h3><p>Siswa melaksanakan PKL pada unit/bagian <b>${esc(report.placement_unit || '-')}</b> di ${esc(internshipPlace)}.</p></section>
      <section class="page"><h2 class="chapter-title">BAB III<br>PEMBAHASAN PRAKTIK KERJA LAPANGAN</h2>${reportDiscussionHtml(approved, signedUrls, { totalHours })}</section>
      
      
      <section class="page"><h2 class="chapter-title">BAB IV<br>PENUTUP</h2><h3 class="subchapter">4.1 Kesimpulan</h3><p class="pre">${textBlock(report.conclusion)}</p>${suggestions}</section>
      <section class="page"><h2 class="chapter-title">DAFTAR PUSTAKA</h2>${reportBibliographyHtml(reportReferences)}</section>
      <section class="page"><h2 class="chapter-title">LAMPIRAN 1<br>REKAPITULASI JURNAL HARIAN</h2>${approved.length ? approved.map((item,index)=>`<div class="journal-appendix"><h4>${index+1}. ${esc(formatAttendanceDate(item.journal_date))} - ${esc(item.activity_title || 'Kegiatan PKL')}</h4><p><b>Lokasi:</b> ${esc(item.location || '-')} | <b>Jam:</b> ${esc(item.work_hours || 0)}</p><p><b>Uraian:</b> ${esc(item.description || '-')}</p><p><b>Tahapan:</b> ${esc((item.activity_stages || []).join(', ') || '-')}</p><p><b>Pengetahuan/Keterampilan:</b> ${esc(item.learning || '-')}</p><p><b>Kendala dan Solusi:</b> ${esc(item.obstacles || '-')}</p><p><b>Refleksi:</b> ${esc(item.reflection || '-')}</p><p><b>Catatan Pembimbing:</b> ${esc(item.supervisor_note || '-')}</p></div>`).join('') : '<p>Belum ada jurnal disetujui.</p>'}</section>
      
      <script>window.addEventListener('load',function(){const waits=[...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve;}));Promise.all(waits).then(()=>setTimeout(()=>{${autoPrint ? 'window.print();' : ''}},600));});<\/script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } catch (error) {
    console.error(error);
    if (!printWindow.closed) printWindow.close();
    toast(error.message || 'Laporan PKL gagal disiapkan.', 5500);
  }
}


function safeWordFilePart(value, fallback = 'laporan-pkl') {
  const clean = String(value || '')
    .normalize('NFKD')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/[^a-zA-Z0-9._ -]+/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return clean || fallback;
}

async function urlToEmbeddedDataUrl(url) {
  if (!url) return '';
  try {
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Gagal menanam gambar ke Word:', error);
    return '';
  }
}

function wordDocumentationHtml(journals, imageSources) {
  const items = [];
  journals.forEach((journal) => {
    (journal.photo_paths || []).filter(Boolean).forEach((path, photoIndex) => {
      items.push({
        src: imageSources[path] || '',
        date: formatAttendanceDate(journal.journal_date),
        activity: journal.activity_title || 'Kegiatan PKL',
        number: photoIndex + 1,
      });
    });
  });
  if (!items.length) return '<p>Belum ada foto dokumentasi pada jurnal yang disetujui.</p>';
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    const cells = pair.map((item) => `<td class="photo-cell">${item.src ? `<img class="word-photo" src="${esc(item.src)}" alt="Dokumentasi kegiatan">` : '<div class="word-photo-missing">Foto tidak dapat dimuat</div>'}<p class="photo-caption"><b>${esc(item.date)}</b><br>${esc(item.activity)} · Foto ${item.number}</p></td>`).join('');
    rows.push(`<tr>${cells}${pair.length === 1 ? '<td class="photo-cell"></td>' : ''}</tr>`);
  }
  return `<table class="photo-table">${rows.join('')}</table>`;
}

function wordSimpleList(items, ordered = false, fallback = '-') {
  if (!items.length) return `<p>${esc(fallback)}</p>`;
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
}

async function downloadFinalPklReportWord(studentId) {
  toast('Menyiapkan dokumen Word beserta foto dokumentasi...', 4500);
  try {
    const context = await loadFinalReportContext(studentId);
    const { detail, report, journals, settings } = context;
    if (!report) return toast('Laporan PKL belum dibuat.');

    const approved = journals.filter((item) => item.status === 'approved');
    const photoPaths = [...new Set(approved.map((item) => (item.photo_paths || []).filter(Boolean)[0]).filter(Boolean))];
    const signedUrls = {};
    const batchSize = 50;
    for (let index = 0; index < photoPaths.length; index += batchSize) {
      Object.assign(signedUrls, await signedPhotoUrls(photoPaths.slice(index, index + batchSize)));
    }

    const imageSources = {};
    for (const path of photoPaths) {
      const signedUrl = signedUrls[path] || '';
      imageSources[path] = signedUrl ? (await urlToEmbeddedDataUrl(signedUrl) || signedUrl) : '';
    }
    const logoAbsolute = new URL('/assets/logo-sekolah.png', window.location.origin).href;
    const logoSrc = await urlToEmbeddedDataUrl(logoAbsolute) || logoAbsolute;

    const studentName = detail?.profiles?.full_name || 'Siswa';
    const nis = detail?.nis || '-';
    const className = detail?.class_name || '-';
    const internshipPlace = detail?.internship_place || '-';
    const teacherName = detail?.teacher?.full_name || '________________________';
    const fieldSupervisorName = detail?.field_supervisor?.full_name || '________________________';
    const principalName = settings.principal_name || '________________________';
    const title = report.report_title || settings.report_title || 'LAPORAN PRAKTIK KERJA LAPANGAN';
    const activities = uniqueTextValues(approved, 'activity_title');
    const learnings = uniqueTextValues(approved, 'learning');
    const obstacles = uniqueTextValues(approved, 'obstacles');
    const reflections = uniqueTextValues(approved, 'reflection');
    const supervisorNotes = uniqueTextValues(approved, 'supervisor_note');
    const period = `${detail?.start_date ? formatAttendanceDate(detail.start_date) : '-'} s.d. ${detail?.end_date ? formatAttendanceDate(detail.end_date) : '-'}`;
    const totalHours = approved.reduce((sum, item) => sum + (Number(item.work_hours) || 0), 0);
    const reportFigures = reportFigureItems(approved);
    const reportReferences = referencesUsedByJournals(approved);
    const statusLabel = finalReportStatusMeta(report.status)[0];
    const approvalDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());
    const statusNotice = report.status === 'approved' ? '' : `<p class="status-warning"><b>STATUS: ${esc(statusLabel.toUpperCase())}</b> · Dokumen ini belum menjadi laporan final yang disetujui.</p>`;

    const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="id">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="E-Jurnal PKL">
<title>${esc(title)} - ${esc(studentName)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
  @page Section1{size:595.3pt 841.9pt;margin:56.7pt 51pt 51pt 51pt;mso-header-margin:35.4pt;mso-footer-margin:35.4pt}
  div.Section1{page:Section1}
  body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5;color:#111}
  p{margin:0 0 9pt;text-align:justify}.center{text-align:center}.right{text-align:right}.page-break{page-break-before:always;mso-page-break-before:always;page-break-after:auto;mso-pagination:widow-orphan}
  h1{font-size:18pt;text-align:center;margin:0 0 18pt}h2{font-size:15pt;text-align:center;margin:0 0 18pt}h3{font-size:12pt;margin:14pt 0 7pt}h4{font-size:12pt;margin:10pt 0 5pt}
  .cover{text-align:center}.cover-logo{width:105px;height:auto;margin:40pt 0 25pt}.cover-table{margin:0 auto;width:75%;border-collapse:collapse}.cover-table td{padding:4pt;border:0;text-align:left}.school{margin-top:90pt;font-weight:bold;font-size:13pt}.year{margin-top:4pt}
  table{border-collapse:collapse;width:100%;margin:9pt 0;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt}.approval-table th,.approval-table td,.report-table th,.report-table td{border:1px solid #333;padding:5pt;vertical-align:top}.approval-table th{width:28%;text-align:left}.report-table{font-size:9.5pt}.report-table th{text-align:center;background:#eeeeee}
  .signature-table td{width:50%;text-align:center;border:0;padding:10pt 8pt}.signature-space{height:60pt}.toc td{border-bottom:1px dotted #999;padding:5pt 0}.toc td:last-child{width:30pt;text-align:right}
  ul,ol{margin:5pt 0 9pt 24pt;padding:0}li{margin-bottom:4pt;text-align:justify}.meta-box{border:1px solid #555;padding:10pt;margin:10pt 0}.meta-box p{text-align:left;margin:2pt 0}
  .photo-table{border-collapse:separate;border-spacing:8pt;width:100%}.photo-cell{width:50%;vertical-align:top;text-align:center;border:1px solid #777;padding:7pt}.word-photo{width:250px;max-height:220px}.word-photo-missing{height:150px;background:#eee;color:#666;text-align:center;padding-top:65px}.photo-caption{text-align:center;font-size:9pt;margin-top:5pt}
  .journal-item{border-bottom:1px solid #aaa;padding-bottom:9pt;margin-bottom:12pt;page-break-inside:avoid;break-inside:avoid;mso-pagination:keep-with-next}.journal-item p{font-size:10pt;margin:2pt 0}.status-warning{border:2px solid #a40000;color:#a40000;padding:8pt;text-align:center;margin-bottom:15pt}
  .note{font-size:9pt;color:#555;font-style:italic}.activity-discussion{margin-bottom:18pt;page-break-inside:avoid;break-inside:avoid}.activity-discussion-title{font-size:12pt;margin:14pt 0 6pt;page-break-after:avoid;mso-pagination:keep-with-next}.literature-link{font-size:10.5pt}.discussion-photo{width:100%;margin:12pt auto 16pt;text-align:center;page-break-inside:avoid;break-inside:avoid}.discussion-photo img{display:block;width:auto;max-width:390px;height:auto;max-height:300px;margin:0 auto}.discussion-photo .photo-missing{height:180px;background:#eee;color:#666;text-align:center;padding-top:80px}.discussion-photo figcaption{font-size:9.5pt;text-align:center;margin-top:5pt}.figure-list{width:100%;border-collapse:collapse}.figure-list td{padding:5pt;border-bottom:1px dotted #999;vertical-align:top}.figure-list td:first-child{width:80pt}.bibliography-list{margin-left:24pt;padding-left:0}.bibliography-list li{padding-left:12pt;text-indent:-12pt;page-break-inside:avoid;break-inside:avoid}.bibliography-list li{margin-bottom:8pt;text-align:justify}
</style>
</head><body><div class="Section1">${statusNotice}
  <div class="cover"><h1>${esc(title)}</h1><h2>${esc(internshipPlace)}</h2><img class="cover-logo" src="${esc(logoSrc)}" alt="Logo sekolah"><table class="cover-table"><tr><td><b>Nama</b></td><td>:</td><td>${esc(studentName)}</td></tr><tr><td><b>NISN</b></td><td>:</td><td>${esc(nis)}</td></tr><tr><td><b>Kelas</b></td><td>:</td><td>${esc(className)}</td></tr><tr><td><b>Program</b></td><td>:</td><td>Praktik Kerja Lapangan</td></tr></table><div class="school">${esc(settings.school_name || DEFAULT_PKL_REPORT_SETTINGS.school_name)}</div><div class="year">Tahun Pelajaran ${esc(settings.school_year || '-')}</div></div>

  <div class="page-break"><h2>LEMBAR PENGESAHAN</h2><p>Laporan Praktik Kerja Lapangan ini telah diperiksa dan disetujui sebagai dokumentasi pelaksanaan PKL siswa.</p><table class="approval-table"><tr><th>Nama Siswa</th><td>${esc(studentName)}</td></tr><tr><th>NISN / Kelas</th><td>${esc(nis)} / ${esc(className)}</td></tr><tr><th>Tempat PKL</th><td>${esc(internshipPlace)}</td></tr><tr><th>Unit Penempatan</th><td>${esc(report.placement_unit || '-')}</td></tr><tr><th>Periode PKL</th><td>${esc(period)}</td></tr><tr><th>Status Laporan</th><td>${esc(statusLabel)}</td></tr></table><p class="right">${esc(settings.approval_location || 'Sumedang')}, ${esc(approvalDate)}</p><table class="signature-table"><tr><td>Pembimbing Lapangan<div class="signature-space"></div><b>${esc(fieldSupervisorName)}</b></td><td>Guru Pembimbing<div class="signature-space"></div><b>${esc(teacherName)}</b></td></tr><tr><td>Siswa<div class="signature-space"></div><b>${esc(studentName)}</b></td><td>Kepala Sekolah<div class="signature-space"></div><b>${esc(principalName)}</b>${settings.principal_nip ? `<br>NIP. ${esc(settings.principal_nip)}` : ''}</td></tr></table></div>

  <div class="page-break"><h2>KATA PENGANTAR</h2><p>${textBlock(report.preface)}</p></div>
  <div class="page-break"><h2>DAFTAR ISI</h2><table class="toc"><tr><td>LEMBAR PENGESAHAN</td><td></td></tr><tr><td>KATA PENGANTAR</td><td></td></tr><tr><td>DAFTAR GAMBAR</td><td></td></tr><tr><td>BAB I PENDAHULUAN</td><td></td></tr><tr><td>BAB II PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</td><td></td></tr><tr><td>BAB III PEMBAHASAN PRAKTIK KERJA LAPANGAN</td><td></td></tr><tr><td>BAB IV PENUTUP</td><td></td></tr><tr><td>DAFTAR PUSTAKA</td><td></td></tr><tr><td>LAMPIRAN</td><td></td></tr></table><p class="note">Nomor halaman dapat diperbarui setelah dokumen dibuka dan diedit di Microsoft Word.</p></div>
  <div class="page-break"><h2>DAFTAR GAMBAR</h2>${reportFigureListHtml(reportFigures)}</div>

  <div class="page-break"><h2>BAB I<br>PENDAHULUAN</h2><h3>1.1 Latar Belakang</h3><p>${textBlock(settings.standard_background)}</p><h3>1.2 Tujuan PKL</h3><p>${textBlock(settings.standard_objectives)}</p><h3>1.3 Manfaat PKL</h3><p>${textBlock(settings.standard_benefits)}</p><h3>1.4 Waktu dan Tempat Pelaksanaan</h3><div class="meta-box"><p><b>Tempat PKL:</b> ${esc(internshipPlace)}</p><p><b>Unit/Bagian:</b> ${esc(report.placement_unit || '-')}</p><p><b>Periode:</b> ${esc(period)}</p></div></div>

  <div class="page-break"><h2>BAB II<br>PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</h2><h3>2.1 Identitas dan Gambaran Umum Instansi</h3><p>${textBlock(report.institution_profile)}</p><h3>2.2 Struktur Organisasi / Posisi Penempatan</h3><p>${textBlock(report.organization_structure, 'Struktur organisasi tidak dicantumkan.')}</p><h3>2.3 Bidang atau Bagian Penempatan Siswa</h3><p>Siswa melaksanakan PKL pada unit/bagian <b>${esc(report.placement_unit || '-')}</b> di ${esc(internshipPlace)}.</p></div>

  <div class="page-break"><h2>BAB III<br>PEMBAHASAN PRAKTIK KERJA LAPANGAN</h2>${reportDiscussionHtml(approved, imageSources, { totalHours })}</div>

  

  <div class="page-break"><h2>BAB IV<br>PENUTUP</h2><h3>4.1 Kesimpulan</h3><p>${textBlock(report.conclusion)}</p><h3>4.2 Saran</h3><h4>A. Untuk Sekolah</h4><p>${textBlock(report.suggestions_school)}</p><h4>B. Untuk Tempat PKL</h4><p>${textBlock(report.suggestions_workplace)}</p><h4>C. Untuk Siswa</h4><p>${textBlock(report.suggestions_students)}</p></div>

  <div class="page-break"><h2>DAFTAR PUSTAKA</h2>${reportBibliographyHtml(reportReferences)}</div>

  <div class="page-break"><h2>LAMPIRAN 1<br>REKAPITULASI JURNAL HARIAN</h2>${approved.length ? approved.map((item,index)=>`<div class="journal-item"><h4>${index+1}. ${esc(formatAttendanceDate(item.journal_date))} - ${esc(item.activity_title || 'Kegiatan PKL')}</h4><p><b>Lokasi:</b> ${esc(item.location || '-')} | <b>Jam:</b> ${esc(item.work_hours || 0)}</p><p><b>Uraian:</b> ${esc(item.description || '-')}</p><p><b>Tahapan:</b> ${esc((item.activity_stages || []).join(', ') || '-')}</p><p><b>Pengetahuan/Keterampilan:</b> ${esc(item.learning || '-')}</p><p><b>Kendala dan Solusi:</b> ${esc(item.obstacles || '-')}</p><p><b>Refleksi:</b> ${esc(item.reflection || '-')}</p><p><b>Catatan Pembimbing:</b> ${esc(item.supervisor_note || '-')}</p></div>`).join('') : '<p>Belum ada jurnal disetujui.</p>'}</div>

  
</div></body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `Laporan_PKL_${safeWordFilePart(studentName, 'Siswa')}_${safeWordFilePart(nis, 'NISN')}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    toast('Dokumen Word berhasil dibuat. File dapat diedit kembali di Microsoft Word.', 5000);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Dokumen Word gagal dibuat.', 5500);
  }
}


function groupCompactJournalSummaryTable(journals) {
  if (!journals.length) return '<p>Belum ada jurnal yang disetujui.</p>';
  return `<table class="report-table"><thead><tr><th>No</th><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Tahapan</th><th>Pengetahuan/Keterampilan</th></tr></thead><tbody>${journals.map((item,index)=>`<tr><td>${index+1}</td><td>${esc(formatAttendanceDate(item.journal_date))}</td><td>${esc(item.student_name || '-')}</td><td>${esc(item.activity_title || '-')}</td><td>${esc((item.activity_stages || []).join(', ') || '-')}</td><td>${esc(item.learning || '-')}</td></tr>`).join('')}</tbody></table>`;
}

function groupReportDocumentationHtml(journals, signedUrls) {
  const items = [];
  journals.forEach((journal) => {
    (journal.photo_paths || []).filter(Boolean).forEach((path, photoIndex) => {
      const url = signedUrls[path] || '';
      items.push(`<figure class="final-doc-photo">${url ? `<img src="${esc(url)}" alt="Dokumentasi kegiatan">` : '<div class="photo-missing">Foto tidak dapat dimuat</div>'}<figcaption><b>${esc(formatAttendanceDate(journal.journal_date))}</b><br>${esc(journal.student_name || '-')} · ${esc(journal.activity_title || 'Kegiatan PKL')} · Foto ${photoIndex + 1}</figcaption></figure>`);
    });
  });
  return items.length ? `<div class="final-doc-grid">${items.join('')}</div>` : '<p>Belum ada foto dokumentasi pada jurnal yang disetujui.</p>';
}

function groupMembersPrintTable(members) {
  return `<table class="approval-table member-list"><thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th></tr></thead><tbody>${members.map((item,index)=>`<tr><td>${index+1}</td><td>${esc(item.full_name || '-')}</td><td>${esc(item.nis || '-')}</td><td>${esc(item.class_name || '-')}</td></tr>`).join('')}</tbody></table>`;
}

function groupJournalAppendixHtml(journals) {
  if (!journals.length) return '<p>Belum ada jurnal disetujui.</p>';
  return journals.map((item,index)=>`<div class="journal-appendix"><h4>${index+1}. ${esc(formatAttendanceDate(item.journal_date))} - ${esc(item.student_name || '-')} - ${esc(item.activity_title || 'Kegiatan PKL')}</h4><p><b>NISN / Kelas:</b> ${esc(item.student_nis || '-')} / ${esc(item.student_class || '-')}</p><p><b>Lokasi kegiatan:</b> ${esc(item.location || '-')} | <b>Jam:</b> ${esc(item.work_hours || 0)}</p><p><b>Uraian:</b> ${esc(item.description || '-')}</p><p><b>Tahapan:</b> ${esc((item.activity_stages || []).join(', ') || '-')}</p><p><b>Pengetahuan/Keterampilan:</b> ${esc(item.learning || '-')}</p><p><b>Kendala dan Solusi:</b> ${esc(item.obstacles || '-')}</p><p><b>Refleksi:</b> ${esc(item.reflection || '-')}</p><p><b>Catatan Pembimbing:</b> ${esc(item.supervisor_note || '-')}</p></div>`).join('');
}

async function printGroupPklReport(groupKey, { autoPrint = false } = {}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return toast('Popup diblokir browser. Izinkan popup lalu coba kembali.');
  printWindow.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Menyiapkan Laporan Kelompok</title><style>body{font-family:Arial;padding:32px;color:#1d2939}strong{color:#174c35}</style></head><body><strong>Menyiapkan laporan kelompok dan foto dokumentasi...</strong><p>Mohon tunggu. Jangan tutup halaman ini.</p></body></html>');
  printWindow.document.close();
  try {
    const context = await loadGroupReportContext(groupKey);
    const { report, members, journals, settings } = context;
    if (!report) { printWindow.close(); return toast('Laporan kelompok belum dibuat.'); }
    const photoPaths = [...new Set(journals.map((item) => (item.photo_paths || []).filter(Boolean)[0]).filter(Boolean))];
    const signedUrls = {};
    for (let index = 0; index < photoPaths.length; index += 50) {
      Object.assign(signedUrls, await signedPhotoUrls(photoPaths.slice(index, index + 50)));
    }
    if (printWindow.closed) return;

    const internshipPlace = context.internship_place || report.internship_place || '-';
    const title = report.report_title || `${settings.report_title || 'LAPORAN PRAKTIK KERJA LAPANGAN'} KELOMPOK`;
    const teacherNames = uniqueGroupNames(members, 'teacher_name');
    const fieldNames = uniqueGroupNames(members, 'field_supervisor_name');
    const principalName = settings.principal_name || '________________________';
    const activities = uniqueTextValues(journals, 'activity_title');
    const learnings = uniqueTextValues(journals, 'learning');
    const obstacles = uniqueTextValues(journals, 'obstacles');
    const reflections = uniqueTextValues(journals, 'reflection');
    const supervisorNotes = uniqueTextValues(journals, 'supervisor_note');
    const period = groupReportPeriodText(members);
    const totalHours = journals.reduce((sum,item)=>sum+(Number(item.work_hours)||0),0);
    const reportFigures = groupReportFigureItems(journals);
    const reportReferences = referencesUsedByJournals(journals);
    const reviewWatermark = report.status === 'approved' ? '' : `<div class="watermark">${esc(finalReportStatusMeta(report.status)[0].toUpperCase())}</div>`;
    const logoUrl = `${location.origin}/assets/logo-sekolah.png`;
    const memberNamesHtml = members.map((item) => `<div><b>${esc(item.full_name || '-')}</b><span>${esc(item.nis || '-')} · ${esc(item.class_name || '-')}</span></div>`).join('');
    const suggestions = `<h3 class="subchapter">4.2 Saran</h3><h4>A. Untuk Sekolah</h4><p>${textBlock(report.suggestions_school)}</p><h4>B. Untuk Tempat PKL</h4><p>${textBlock(report.suggestions_workplace)}</p><h4>C. Untuk Siswa</h4><p>${textBlock(report.suggestions_students)}</p>`;

    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)} - ${esc(internshipPlace)}</title><style>
      @page{size:A4;margin:20mm 18mm 18mm}*{box-sizing:border-box}body{font-family:"Times New Roman",serif;color:#111;margin:0;font-size:12pt;line-height:1.55}.page{min-height:245mm;page-break-after:always;position:relative}.page:last-child{page-break-after:auto}.cover{display:flex;min-height:245mm;flex-direction:column;align-items:center;text-align:center;padding-top:16mm}.cover img{width:105px;height:105px;object-fit:contain;margin:11mm 0}.cover h1{font-size:18pt;line-height:1.4;margin:0 0 5mm}.cover h2{font-size:14pt;margin:0 0 6mm}.group-cover-members{width:82%;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;text-align:left;margin:2mm auto}.group-cover-members div{border-bottom:1px dotted #999;padding:3px 0}.group-cover-members b,.group-cover-members span{display:block}.group-cover-members span{font-size:9pt;color:#444}.cover .school{margin-top:auto;font-weight:bold;font-size:13pt}.cover .year{margin-top:4px}.chapter-title{text-align:center;font-size:15pt;margin:0 0 12mm}.subchapter{font-size:12pt;margin:7mm 0 3mm}.page p{text-align:justify;margin:0 0 4mm}.approval-table{width:100%;border-collapse:collapse;margin:7mm 0}.approval-table td,.approval-table th{padding:5px 7px;border:1px solid #333;text-align:left}.member-list th{text-align:center;background:#eee}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:17mm 15mm;margin-top:13mm;text-align:center}.signature-grid .space{height:22mm}.toc{width:100%;border-collapse:collapse}.toc td{padding:5px 0;border-bottom:1px dotted #999}.report-table{width:100%;border-collapse:collapse;font-size:8.8pt;margin:4mm 0}.report-table th,.report-table td{border:1px solid #444;padding:4px;vertical-align:top}.report-table th{background:#eee;text-align:center}.bullet-list{margin:3mm 0 5mm;padding-left:7mm}.bullet-list li{margin-bottom:2mm;text-align:justify}.final-doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm 7mm}.final-doc-photo{margin:0;break-inside:avoid;border:1px solid #777;padding:3mm}.final-doc-photo img,.photo-missing{width:100%;height:72mm;object-fit:contain;background:#f2f2f2}.photo-missing{display:flex;align-items:center;justify-content:center;color:#666}.final-doc-photo figcaption{text-align:center;font-size:9pt;margin-top:2mm}.journal-appendix{break-inside:avoid;margin-bottom:8mm;border-bottom:1px solid #aaa;padding-bottom:5mm}.journal-appendix h4{margin:0 0 2mm}.journal-appendix p{font-size:10pt;margin:1mm 0}.watermark{position:fixed;top:48%;left:12%;font-family:Arial,sans-serif;font-size:68pt;font-weight:bold;color:rgba(160,0,0,.08);transform:rotate(-28deg);z-index:0;pointer-events:none}.print-actions{position:fixed;right:16px;top:16px;z-index:20;font-family:Arial;border:0;background:#174c35;color:#fff;padding:10px 14px;border-radius:7px;cursor:pointer}.meta-box{border:1px solid #555;padding:5mm;margin:5mm 0}.meta-box p{text-align:left;margin:1mm 0}.report-note{font-size:9pt;color:#555;font-style:italic}.activity-discussion{margin:0 0 9mm;break-inside:auto}.activity-discussion-title{font-size:12pt;margin:5mm 0 2mm}.literature-link{font-size:10.5pt}.discussion-photo{width:82%;margin:5mm auto 8mm;break-inside:avoid;page-break-inside:avoid;text-align:center}.discussion-photo img,.discussion-photo .photo-missing{width:100%;max-height:105mm;object-fit:contain;background:#f2f2f2}.discussion-photo figcaption{font-size:9.5pt;margin-top:2mm;text-align:center}.figure-list{width:100%;border-collapse:collapse}.figure-list td{padding:5px 4px;border-bottom:1px dotted #999;vertical-align:top}.figure-list td:first-child{width:95px}.bibliography-list{padding-left:8mm}.bibliography-list li{margin-bottom:4mm;text-align:justify}.right{text-align:right!important}@media print{.print-actions{display:none}.watermark,.report-table th,.member-list th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>${reviewWatermark}<button class="print-actions" onclick="window.print()">Cetak / Simpan PDF</button>
      <section class="page cover"><h1>${esc(title)}</h1><h2>${esc(internshipPlace)}</h2><img src="${esc(logoUrl)}" alt="Logo sekolah"><h3>Disusun oleh Kelompok PKL</h3><div class="group-cover-members">${memberNamesHtml}</div><div class="school">${esc(settings.school_name || DEFAULT_PKL_REPORT_SETTINGS.school_name)}</div><div class="year">Tahun Pelajaran ${esc(settings.school_year || '-')}</div></section>
      <section class="page"><h2 class="chapter-title">LEMBAR PENGESAHAN</h2><p>Laporan Praktik Kerja Lapangan kelompok ini telah diperiksa dan disetujui sebagai dokumentasi pelaksanaan PKL pada lokasi yang sama.</p><table class="approval-table"><tr><th>Tempat PKL</th><td>${esc(internshipPlace)}</td></tr><tr><th>Unit Penempatan</th><td>${esc(report.placement_unit || '-')}</td></tr><tr><th>Periode PKL</th><td>${esc(period)}</td></tr><tr><th>Jumlah Anggota</th><td>${members.length} siswa</td></tr><tr><th>Status Laporan</th><td>${esc(finalReportStatusMeta(report.status)[0])}</td></tr></table><h3>Anggota Kelompok</h3>${groupMembersPrintTable(members)}<p class="right">${esc(settings.approval_location || 'Sumedang')}, ${esc(new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date()))}</p><div class="signature-grid"><div>Pembimbing Lapangan<div class="space"></div><b>${fieldNames.length ? fieldNames.map(esc).join('<br>') : '________________________'}</b></div><div>Guru Pembimbing<div class="space"></div><b>${teacherNames.length ? teacherNames.map(esc).join('<br>') : '________________________'}</b></div><div>Perwakilan Kelompok<div class="space"></div><b>${esc(members[0]?.full_name || '________________________')}</b></div><div>Kepala Sekolah<div class="space"></div><b>${esc(principalName)}</b>${settings.principal_nip ? `<br>NIP. ${esc(settings.principal_nip)}` : ''}</div></div></section>
      <section class="page"><h2 class="chapter-title">KATA PENGANTAR</h2><p>${textBlock(report.preface)}</p></section>
      <section class="page"><h2 class="chapter-title">DAFTAR ISI</h2><table class="toc"><tr><td>LEMBAR PENGESAHAN</td></tr><tr><td>KATA PENGANTAR</td></tr><tr><td>DAFTAR GAMBAR</td></tr><tr><td>BAB I PENDAHULUAN</td></tr><tr><td>BAB II PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</td></tr><tr><td>BAB III PEMBAHASAN PRAKTIK KERJA LAPANGAN</td></tr><tr><td>BAB IV PENUTUP</td></tr><tr><td>DAFTAR PUSTAKA</td></tr><tr><td>LAMPIRAN</td></tr></table></section>
      <section class="page"><h2 class="chapter-title">DAFTAR GAMBAR</h2>${reportFigureListHtml(reportFigures)}</section>
      <section class="page"><h2 class="chapter-title">BAB I<br>PENDAHULUAN</h2><h3 class="subchapter">1.1 Latar Belakang</h3><p>${textBlock(settings.standard_background)}</p><h3 class="subchapter">1.2 Tujuan PKL</h3><p>${textBlock(settings.standard_objectives)}</p><h3 class="subchapter">1.3 Manfaat PKL</h3><p>${textBlock(settings.standard_benefits)}</p><h3 class="subchapter">1.4 Waktu dan Tempat Pelaksanaan</h3><div class="meta-box"><p><b>Tempat PKL:</b> ${esc(internshipPlace)}</p><p><b>Unit/Bagian:</b> ${esc(report.placement_unit || '-')}</p><p><b>Periode kelompok:</b> ${esc(period)}</p><p><b>Jumlah anggota:</b> ${members.length} siswa</p></div></section>
      <section class="page"><h2 class="chapter-title">BAB II<br>PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</h2><h3 class="subchapter">2.1 Identitas dan Gambaran Umum Instansi</h3><p>${textBlock(report.institution_profile)}</p><h3 class="subchapter">2.2 Struktur Organisasi / Posisi Penempatan</h3><p>${textBlock(report.organization_structure, 'Struktur organisasi tidak dicantumkan.')}</p><h3 class="subchapter">2.3 Bidang atau Bagian Penempatan Kelompok</h3><p>Kelompok melaksanakan PKL pada unit/bagian <b>${esc(report.placement_unit || '-')}</b> di ${esc(internshipPlace)}.</p></section>
      <section class="page"><h2 class="chapter-title">BAB III<br>PEMBAHASAN PRAKTIK KERJA LAPANGAN</h2>${reportDiscussionHtml(journals, signedUrls, { group: true, membersCount: members.length, totalHours })}</section>
      
      
      <section class="page"><h2 class="chapter-title">BAB IV<br>PENUTUP</h2><h3 class="subchapter">4.1 Kesimpulan</h3><p>${textBlock(report.conclusion)}</p>${suggestions}</section>
      <section class="page"><h2 class="chapter-title">DAFTAR PUSTAKA</h2>${reportBibliographyHtml(reportReferences)}</section>
      <section class="page"><h2 class="chapter-title">LAMPIRAN 1<br>DAFTAR ANGGOTA KELOMPOK</h2>${groupMembersPrintTable(members)}<h2 class="chapter-title" style="margin-top:14mm">REKAPITULASI JURNAL HARIAN KELOMPOK</h2>${groupJournalAppendixHtml(journals)}</section>
      
      <script>window.addEventListener('load',function(){const waits=[...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve;}));Promise.all(waits).then(()=>setTimeout(()=>{${autoPrint ? 'window.print();' : ''}},700));});<\/script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } catch (error) {
    console.error(error);
    if (!printWindow.closed) printWindow.close();
    toast(error.message || 'Laporan kelompok gagal disiapkan.', 6000);
  }
}

function wordGroupDocumentationHtml(journals, imageSources) {
  const items = [];
  journals.forEach((journal) => {
    (journal.photo_paths || []).filter(Boolean).forEach((path, photoIndex) => {
      items.push({ src: imageSources[path] || '', date: formatAttendanceDate(journal.journal_date), student: journal.student_name || '-', activity: journal.activity_title || 'Kegiatan PKL', number: photoIndex + 1 });
    });
  });
  if (!items.length) return '<p>Belum ada foto dokumentasi pada jurnal yang disetujui.</p>';
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    const cells = pair.map((item) => `<td class="photo-cell">${item.src ? `<img class="word-photo" src="${esc(item.src)}" alt="Dokumentasi kegiatan">` : '<div class="word-photo-missing">Foto tidak dapat dimuat</div>'}<p class="photo-caption"><b>${esc(item.date)}</b><br>${esc(item.student)}<br>${esc(item.activity)} · Foto ${item.number}</p></td>`).join('');
    rows.push(`<tr>${cells}${pair.length === 1 ? '<td class="photo-cell"></td>' : ''}</tr>`);
  }
  return `<table class="photo-table">${rows.join('')}</table>`;
}

function wordField(code, fallback = '1') {
  // Word HTML field: the visible result is kept as fallback until Word recalculates
  // the PAGEREF/PAGE field. UpdateFields is enabled in the document settings below.
  return `<span class="word-field" style='mso-field-code:" ${code} "'>${esc(String(fallback))}</span>`;
}

function wordBookmark(name) {
  return `<a name="${name}"></a>`;
}

function wordTocRow(label, bookmark, level = 0) {
  const indent = level ? `padding-left:${level * 16}pt;` : '';
  return `<tr><td style="${indent}"><span class="toc-label">${esc(label)}</span></td><td>${wordField(`PAGEREF ${bookmark} \\h`, '1')}</td></tr>`;
}

function wordFigureTocRows(figures) {
  if (!figures.length) return '<tr><td>Belum ada gambar</td><td></td></tr>';
  return figures.map((figure, index) => wordTocRow(`Gambar ${figure.number}. ${figure.caption}`, `_Fig_${index + 1}`, 0)).join('');
}

function addWordReportBookmarks(html) {
  let sectionIndex = 0;
  html = html.replace(/<h3 class="material-discussion-title">/g, () => `${wordBookmark(`_Sec_${++sectionIndex}`)}<h3 class="material-discussion-title">`);
  let subIndex = 0;
  html = html.replace(/<h4 class="activity-discussion-title">/g, () => `${wordBookmark(`_Sub_${++subIndex}`)}<h4 class="activity-discussion-title">`);
  let figureIndex = 0;
  html = html.replace(/<figure class="discussion-photo">/g, () => `${wordBookmark(`_Fig_${++figureIndex}`)}<figure class="discussion-photo">`);
  return { html, sectionCount: sectionIndex, subCount: subIndex, figureCount: figureIndex };
}

function wordFrontTocRows() {
  return [
    wordTocRow('LEMBAR PENGESAHAN', '_Pengesahan'),
    wordTocRow('KATA PENGANTAR', '_KataPengantar'),
    wordTocRow('DAFTAR ISI', '_DaftarIsi'),
    wordTocRow('DAFTAR GAMBAR', '_DaftarGambar'),
    wordTocRow('BAB I PENDAHULUAN', '_Bab1'),
    wordTocRow('1.1 Latar Belakang', '_Bab1_1', 1),
    wordTocRow('1.2 Tujuan PKL', '_Bab1_2', 1),
    wordTocRow('1.3 Manfaat PKL', '_Bab1_3', 1),
    wordTocRow('1.4 Waktu dan Tempat Pelaksanaan', '_Bab1_4', 1),
    wordTocRow('BAB II PROFIL TEMPAT PRAKTIK KERJA LAPANGAN', '_Bab2'),
    wordTocRow('2.1 Identitas dan Gambaran Umum Instansi', '_Bab2_1', 1),
    wordTocRow('2.2 Struktur Organisasi / Posisi Penempatan', '_Bab2_2', 1),
    wordTocRow('2.3 Bidang atau Bagian Penempatan Kelompok', '_Bab2_3', 1),
    wordTocRow('BAB III PEMBAHASAN PRAKTIK KERJA LAPANGAN', '_Bab3'),
    wordTocRow('BAB IV PENUTUP', '_Bab4'),
    wordTocRow('4.1 Kesimpulan', '_Bab4_1', 1),
    wordTocRow('4.2 Saran', '_Bab4_2', 1),
    wordTocRow('4.2.1 Untuk Sekolah', '_Bab4_2a', 2),
    wordTocRow('4.2.2 Untuk Tempat PKL', '_Bab4_2b', 2),
    wordTocRow('4.2.3 Untuk Siswa', '_Bab4_2c', 2),
    wordTocRow('DAFTAR PUSTAKA', '_DaftarPustaka'),
    wordTocRow('LAMPIRAN', '_Lampiran'),
  ].join('');
}


async function downloadGroupPklReportWord(groupKey) {
  toast('Menyiapkan dokumen Word laporan kelompok beserta foto...', 5000);
  try {
    const context = await loadGroupReportContext(groupKey);
    const { report, members, journals, settings } = context;
    if (!report) return toast('Laporan kelompok belum dibuat.');
    const photoPaths = [...new Set(journals.map((item) => (item.photo_paths || []).filter(Boolean)[0]).filter(Boolean))];
    const signedUrls = {};
    for (let index = 0; index < photoPaths.length; index += 50) Object.assign(signedUrls, await signedPhotoUrls(photoPaths.slice(index, index + 50)));
    const imageSources = {};
    for (const path of photoPaths) {
      const signedUrl = signedUrls[path] || '';
      imageSources[path] = signedUrl ? (await urlToEmbeddedDataUrl(signedUrl) || signedUrl) : '';
    }
    const logoAbsolute = new URL('/assets/logo-sekolah.png', window.location.origin).href;
    const logoSrc = await urlToEmbeddedDataUrl(logoAbsolute) || logoAbsolute;
    const internshipPlace = context.internship_place || report.internship_place || '-';
    const title = report.report_title || `${settings.report_title || 'LAPORAN PRAKTIK KERJA LAPANGAN'} KELOMPOK`;
    const teacherNames = uniqueGroupNames(members, 'teacher_name');
    const fieldNames = uniqueGroupNames(members, 'field_supervisor_name');
    const activities = uniqueTextValues(journals, 'activity_title');
    const learnings = uniqueTextValues(journals, 'learning');
    const obstacles = uniqueTextValues(journals, 'obstacles');
    const reflections = uniqueTextValues(journals, 'reflection');
    const supervisorNotes = uniqueTextValues(journals, 'supervisor_note');
    const totalHours = journals.reduce((sum,item)=>sum+(Number(item.work_hours)||0),0);
    const reportFigures = reportFigureItems(journals, { group: true });
    const reportReferences = referencesUsedByJournals(journals);
    const statusLabel = finalReportStatusMeta(report.status)[0];
    const statusNotice = report.status === 'approved' ? '' : `<p class="status-warning"><b>STATUS: ${esc(statusLabel.toUpperCase())}</b> · Dokumen kelompok ini belum menjadi laporan final yang disetujui.</p>`;
    const membersRows = members.map((item,index)=>`<tr><td>${index+1}</td><td>${esc(item.full_name || '-')}</td><td>${esc(item.nis || '-')}</td><td>${esc(item.class_name || '-')}</td></tr>`).join('');
    const discussionPrepared = addWordReportBookmarks(reportDiscussionHtml(journals, imageSources, { group: true, membersCount: members.length, totalHours }));
    const discussionHtml = discussionPrepared.html;
    const materialGroups = groupJournalsByMaterial(journals);
    let globalSubIndex = 0;
    const tocMaterialRows = materialGroups.map((materialGroup, materialIndex) => {
      const materialNumber = `3.${materialIndex + 2}`;
      const materialBookmark = `_Sec_${materialIndex + 1}`;
      const materialRow = wordTocRow(`${materialNumber} ${materialGroup.name}`, materialBookmark, 0);
      const subRows = materialGroup.subgroups.map((subgroup, subIndex) => {
        globalSubIndex += 1;
        return wordTocRow(
          `${materialNumber}.${subIndex + 1} ${subgroup.title}`,
          `_Sub_${globalSubIndex}`,
          1
        );
      }).join('');
      return materialRow + subRows;
    }).join('');

    const tocRows = wordFrontTocRows().replace('</tr>','</tr>') + tocMaterialRows;

    const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="id"><head><meta charset="utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="E-Jurnal PKL"><xml><w:WordDocument><w:UpdateFields w:val="true"/></w:WordDocument></xml><title>${esc(title)}</title><style>
      @page Section1{size:595.3pt 841.9pt;margin:56.7pt 51pt 51pt 51pt;mso-footer:f1} .MsoFooter{text-align:center;font-size:10pt}div.Section1{page:Section1}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5;color:#111}p{margin:0 0 9pt;text-align:justify}.center{text-align:center}.right{text-align:right}.page-break{page-break-before:always;mso-page-break-before:always;page-break-after:auto;mso-pagination:widow-orphan}h1{font-size:18pt;text-align:center;margin:0 0 18pt}h2{font-size:15pt;text-align:center;margin:0 0 18pt}h3{font-size:12pt;margin:14pt 0 7pt}h4{font-size:12pt;margin:10pt 0 5pt}.cover{text-align:center}.cover-logo{width:105px;height:auto;margin:28pt 0 18pt}.school{margin-top:55pt;font-weight:bold;font-size:13pt}table{border-collapse:collapse;width:100%;margin:9pt 0;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt}.approval-table th,.approval-table td,.report-table th,.report-table td,.member-table th,.member-table td{border:1px solid #333;padding:6pt;vertical-align:top;word-wrap:break-word;mso-line-height-rule:exactly}.member-table th,.report-table th{text-align:center;background:#eee}.report-table{font-size:9pt}.signature-table td{width:50%;text-align:center;border:0;padding:10pt 8pt}.signature-space{height:60pt}.toc td{border-bottom:1px dotted #999;padding:5pt 0}ul,ol{margin:5pt 0 9pt 24pt;padding:0}li{margin-bottom:4pt;text-align:justify}.meta-box{border:1px solid #555;padding:10pt;margin:10pt 0}.photo-table{border-collapse:separate;border-spacing:8pt}.photo-cell{width:50%;vertical-align:top;text-align:center;border:1px solid #777;padding:7pt}.word-photo{width:250px;max-height:220px}.word-photo-missing{height:150px;background:#eee;color:#666;text-align:center;padding-top:65px}.photo-caption{text-align:center;font-size:9pt;margin-top:5pt}.journal-item{border-bottom:1px solid #aaa;padding-bottom:9pt;margin-bottom:12pt;page-break-inside:avoid;break-inside:avoid;mso-pagination:keep-with-next}.journal-item p{font-size:10pt;margin:2pt 0}.status-warning{border:2px solid #a40000;color:#a40000;padding:8pt;text-align:center;margin-bottom:15pt}.note{font-size:9pt;color:#555;font-style:italic}.activity-discussion{margin-bottom:18pt;page-break-inside:avoid;break-inside:avoid}.activity-discussion-title{font-size:12pt;margin:14pt 0 6pt;page-break-after:avoid;mso-pagination:keep-with-next}.literature-link{font-size:10.5pt}.discussion-photo{width:100%;margin:12pt auto 16pt;text-align:center;page-break-inside:avoid;break-inside:avoid}.discussion-photo img{display:block;width:auto;max-width:390px;height:auto;max-height:300px;margin:0 auto}.discussion-photo .photo-missing{height:180px;background:#eee;color:#666;text-align:center;padding-top:80px}.discussion-photo figcaption{font-size:9.5pt;text-align:center;margin-top:5pt}.figure-list{width:100%;border-collapse:collapse}.figure-list td{padding:5pt;border-bottom:1px dotted #999;vertical-align:top}.figure-list td:first-child{width:80pt}.bibliography-list{margin-left:24pt;padding-left:0}.bibliography-list li{padding-left:12pt;text-indent:-12pt;page-break-inside:avoid;break-inside:avoid}.bibliography-list li{margin-bottom:8pt;text-align:justify}
    </style></head><body><div class="Section1">${statusNotice}
      <div class="cover"><h1>${esc(title)}</h1><h2>${esc(internshipPlace)}</h2><img class="cover-logo" src="${esc(logoSrc)}" alt="Logo sekolah"><h3>Disusun oleh Kelompok PKL</h3><table class="member-table"><thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th></tr></thead><tbody>${membersRows}</tbody></table><div class="school">${esc(settings.school_name || DEFAULT_PKL_REPORT_SETTINGS.school_name)}</div><div>Tahun Pelajaran ${esc(settings.school_year || '-')}</div></div>
      <div class="page-break">${wordBookmark("_Pengesahan")}<h2>LEMBAR PENGESAHAN</h2><table class="approval-table"><tr><th>Tempat PKL</th><td>${esc(internshipPlace)}</td></tr><tr><th>Unit Penempatan</th><td>${esc(report.placement_unit || '-')}</td></tr><tr><th>Periode</th><td>${esc(groupReportPeriodText(members))}</td></tr><tr><th>Jumlah Anggota</th><td>${members.length} siswa</td></tr><tr><th>Status</th><td>${esc(statusLabel)}</td></tr></table><h3>Anggota Kelompok</h3><table class="member-table"><thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th></tr></thead><tbody>${membersRows}</tbody></table><p class="right">${esc(settings.approval_location || 'Sumedang')}, ${esc(new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date()))}</p><table class="signature-table"><tr><td>Pembimbing Lapangan<div class="signature-space"></div><b>${fieldNames.length ? fieldNames.map(esc).join('<br>') : '________________________'}</b></td><td>Guru Pembimbing<div class="signature-space"></div><b>${teacherNames.length ? teacherNames.map(esc).join('<br>') : '________________________'}</b></td></tr><tr><td>Perwakilan Kelompok<div class="signature-space"></div><b>${esc(members[0]?.full_name || '________________________')}</b></td><td>Kepala Sekolah<div class="signature-space"></div><b>${esc(settings.principal_name || '________________________')}</b>${settings.principal_nip ? `<br>NIP. ${esc(settings.principal_nip)}` : ''}</td></tr></table></div>
      <div class="page-break">${wordBookmark("_KataPengantar")}<h2>KATA PENGANTAR</h2><p>${textBlock(report.preface)}</p></div>
      <div class="page-break">${wordBookmark("_DaftarIsi")}<h2>DAFTAR ISI</h2><table class="toc">${tocRows}</table><p class="note">Nomor halaman diambil otomatis dari posisi judul. Jika Word belum menampilkan nomor halaman saat pratinjau, buka file di Microsoft Word lalu pilih Ctrl+A → F9 sekali untuk memperbarui seluruh nomor halaman.</p></div>
      <div class="page-break">${wordBookmark("_DaftarGambar")}<h2>DAFTAR GAMBAR</h2><table class="toc">${wordFigureTocRows(reportFigures)}</table></div>
      <div class="page-break">${wordBookmark("_Bab1")}<h2>BAB I<br>PENDAHULUAN</h2>${wordBookmark("_Bab1_1")}<h3>1.1 Latar Belakang</h3><p>${textBlock(settings.standard_background)}</p>${wordBookmark("_Bab1_2")}<h3>1.2 Tujuan PKL</h3><p>${textBlock(settings.standard_objectives)}</p>${wordBookmark("_Bab1_3")}<h3>1.3 Manfaat PKL</h3><p>${textBlock(settings.standard_benefits)}</p>${wordBookmark("_Bab1_4")}<h3>1.4 Waktu dan Tempat Pelaksanaan</h3><div class="meta-box"><p><b>Tempat PKL:</b> ${esc(internshipPlace)}</p><p><b>Unit:</b> ${esc(report.placement_unit || '-')}</p><p><b>Periode:</b> ${esc(groupReportPeriodText(members))}</p><p><b>Jumlah anggota:</b> ${members.length} siswa</p></div></div>
      <div class="page-break">${wordBookmark("_Bab2")}<h2>BAB II<br>PROFIL TEMPAT PRAKTIK KERJA LAPANGAN</h2>${wordBookmark("_Bab2_1")}<h3>2.1 Identitas dan Gambaran Umum Instansi</h3><p>${textBlock(report.institution_profile)}</p>${wordBookmark("_Bab2_2")}<h3>2.2 Struktur Organisasi / Posisi Penempatan</h3><p>${textBlock(report.organization_structure, 'Struktur organisasi tidak dicantumkan.')}</p>${wordBookmark("_Bab2_3")}<h3>2.3 Bidang atau Bagian Penempatan Kelompok</h3><p>Kelompok melaksanakan PKL pada unit/bagian <b>${esc(report.placement_unit || '-')}</b> di ${esc(internshipPlace)}.</p></div>
      <div class="page-break">${wordBookmark("_Bab3")}<h2>BAB III<br>PEMBAHASAN PRAKTIK KERJA LAPANGAN</h2>${discussionHtml}</div>
      
      <div class="page-break">${wordBookmark("_Bab4")}<h2>BAB IV<br>PENUTUP</h2>${wordBookmark("_Bab4_1")}<h3>4.1 Kesimpulan</h3><p>${textBlock(report.conclusion)}</p>${wordBookmark("_Bab4_2")}<h3>4.2 Saran</h3>${wordBookmark("_Bab4_2a")}<h4>A. Untuk Sekolah</h4><p>${textBlock(report.suggestions_school)}</p>${wordBookmark("_Bab4_2b")}<h4>B. Untuk Tempat PKL</h4><p>${textBlock(report.suggestions_workplace)}</p>${wordBookmark("_Bab4_2c")}<h4>C. Untuk Siswa</h4><p>${textBlock(report.suggestions_students)}</p></div>
      <div class="page-break">${wordBookmark("_DaftarPustaka")}<h2>DAFTAR PUSTAKA</h2>${reportBibliographyHtml(reportReferences)}</div>
      <div class="page-break">${wordBookmark("_Lampiran")}<h2>LAMPIRAN 1<br>DAFTAR ANGGOTA DAN REKAP JURNAL</h2><table class="member-table"><thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th></tr></thead><tbody>${membersRows}</tbody></table>${groupJournalAppendixHtml(journals)}</div>
      <div style="mso-element:footer" id="f1"><p class="MsoFooter">Halaman ${wordField("PAGE", "1")}</p></div>
    </div></body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `Laporan_PKL_Kelompok_${safeWordFilePart(internshipPlace, 'Lokasi_PKL')}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    toast('Dokumen Word laporan kelompok berhasil dibuat.', 5000);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Dokumen Word laporan kelompok gagal dibuat.', 6000);
  }
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
