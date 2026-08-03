/* E-Jurnal PKL Rimba Bahari - frontend tanpa proses build */
const cfg = window.APP_CONFIG || {};
const sb = (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
  : null;

const PHOTO_BUCKET = 'journal-photos';
const MAX_JOURNAL_PHOTOS = 3;
const MAX_INPUT_PHOTO_SIZE = 10 * 1024 * 1024;
const state = {
  session: null,
  profile: null,
  page: 'dashboard',
  students: [],
  journals: [],
  attendance: [],
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

function toast(message, duration = 3200) {
  const element = $('#toast');
  element.textContent = message;
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
  if (!requireConfig()) return;

  const registrationToken = new URLSearchParams(location.search).get('register');
  if (registrationToken) {
    await showRegistrationView(registrationToken);
    return;
  }

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
  $('#appView').classList.remove('hidden');
  $('#userInfo').textContent = `${data.full_name} • ${roles[data.role] || data.role}`;
  renderNav();
  await navigate('dashboard');
}

function showLogin() {
  state.session = null;
  state.profile = null;
  $('#appView').classList.add('hidden');
  $('#registerView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}

function renderNav() {
  const items = menus[state.profile.role] || menus.student;
  $('#navMenu').innerHTML = items.map(([id, label]) =>
    `<button class="nav-btn ${state.page === id ? 'active' : ''}" data-page="${id}">${label}</button>`).join('');
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.onclick = () => navigate(button.dataset.page);
  });
}

async function navigate(page) {
  state.page = page;
  document.querySelector('.sidebar').classList.remove('open');
  renderNav();
  const label = (menus[state.profile.role] || []).find((item) => item[0] === page)?.[1] || 'Dashboard';
  $('#pageTitle').textContent = label;
  $('#content').innerHTML = '<div class="card">Memuat data...</div>';
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
  const rows = journals.data || [];
  const approved = rows.filter((item) => item.status === 'approved').length;
  const pending = rows.filter((item) => item.status === 'submitted').length;
  const progress = Math.min(100, Math.round((approved / 40) * 100));
  $('#content').innerHTML = `<div class="cards">
    <div class="card stat"><strong>${journals.count || 0}</strong><span>Total jurnal</span></div>
    <div class="card stat"><strong>${approved}</strong><span>Jurnal disetujui</span></div>
    <div class="card stat"><strong>${pending}</strong><span>Menunggu validasi</span></div>
    <div class="card stat"><strong>${attendance.count || 0}</strong><span>Data presensi</span></div>
  </div>
  <div class="card mt-16"><h3>Progres PKL 40 Hari</h3><div class="progress"><span style="width:${progress}%"></span></div><p>${progress}% jurnal telah disetujui.</p></div>
  <div class="card mt-16"><h3>Selamat datang, ${esc(state.profile.full_name)}</h3><p>Aplikasi menyimpan data secara daring. Foto jurnal dapat diambil langsung dari kamera HP.</p></div>`;
}

async function renderUsers() {
  if (state.profile.role !== 'admin') return navigate('dashboard');
  const { data, error } = await sb.from('profiles')
    .select('id,full_name,email,role,is_active,registration_status,created_at')
    .order('full_name');
  if (error) throw error;

  $('#content').innerHTML = `<div class="section-head"><h3>Akun Pengguna</h3><button class="btn primary" id="addUserBtn">Tambah Akun</button></div>
    <div class="toolbar"><input id="userSearch" placeholder="Cari nama atau email..."><select id="roleFilter"><option value="">Semua peran</option><option value="student">Siswa</option><option value="teacher">Guru</option><option value="field_supervisor">Pembimbing lapangan</option><option value="admin">Administrator</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Tindakan</th></tr></thead><tbody id="userRows"></tbody></table></div>`;

  const draw = () => {
    const query = $('#userSearch').value.toLowerCase();
    const role = $('#roleFilter').value;
    $('#userRows').innerHTML = (data || []).filter((item) =>
      (!role || item.role === role) && `${item.full_name} ${item.email}`.toLowerCase().includes(query))
      .map((item) => `<tr><td>${esc(item.full_name)}</td><td>${esc(item.email)}</td><td>${esc(roles[item.role] || item.role)}</td><td>${userStatusBadge(item)}</td><td><div class="actions"><button class="btn warn reset-pass" data-id="${item.id}" data-name="${esc(item.full_name)}">Reset Password</button><button class="btn secondary edit-profile" data-id="${item.id}">Edit</button></div></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Tidak ada data.</td></tr>';
    bindUserActions(data || []);
  };
  $('#userSearch').oninput = draw;
  $('#roleFilter').onchange = draw;
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
  $('#content').innerHTML = `<div class="section-head"><div><h3>Pendaftaran Mandiri Siswa</h3><p class="muted">Buat link unik untuk setiap siswa. Akun baru tetap nonaktif sampai administrator menyetujuinya.</p></div><button class="btn primary" id="createInviteBtn">Buat Link Pendaftaran</button></div>
    <div class="card"><h3>Menunggu Verifikasi (${pending.length})</h3><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Nomor HP</th><th>Tanggal Daftar</th><th>Tindakan</th></tr></thead><tbody>${pending.map((item) => `<tr><td>${esc(item.full_name)}</td><td>${esc(item.email)}</td><td>${esc(item.phone || '-')}</td><td>${esc(formatDateTime(item.created_at))}</td><td><button class="btn primary approve-registration" data-id="${item.id}" data-name="${esc(item.full_name)}">Verifikasi & Aktifkan</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Tidak ada pendaftaran yang menunggu.</td></tr>'}</tbody></table></div></div>
    <div class="card mt-16"><h3>Riwayat Link Pendaftaran</h3><div class="table-wrap"><table><thead><tr><th>Nama Siswa</th><th>NIS</th><th>Kelas</th><th>Status Link</th><th>Kedaluwarsa</th></tr></thead><tbody>${invites.map((item) => `<tr><td>${esc(item.full_name)}</td><td>${esc(item.nis)}</td><td>${esc(item.class_name)}</td><td>${inviteStatusBadge(item)}</td><td>${esc(formatDateTime(item.expires_at))}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Belum ada link pendaftaran.</td></tr>'}</tbody></table></div></div>`;

  $('#createInviteBtn').onclick = () => openInviteModal();
  document.querySelectorAll('.approve-registration').forEach((button) => {
    button.onclick = async () => {
      if (!confirm(`Verifikasi dan aktifkan akun ${button.dataset.name}?`)) return;
      button.disabled = true;
      const result = await api('/api/verify-registration', { user_id: button.dataset.id });
      if (result.error) {
        button.disabled = false;
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
    <label>NIS<input name="nis" required></label>
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

async function showRegistrationView(token) {
  $('#loginView').classList.add('hidden');
  $('#appView').classList.add('hidden');
  $('#registerView').classList.remove('hidden');
  const info = await publicApi('/api/register-student', { action: 'info', token });
  if (info.error) {
    $('#registrationCard').innerHTML = `<div class="brand-block"><img src="/assets/logo-sekolah.svg" alt="Logo sekolah" class="logo"><h1>Link Tidak Dapat Digunakan</h1><p>${esc(info.error)}</p><a class="btn secondary inline-link" href="/">Kembali ke halaman login</a></div>`;
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
    $('#registrationCard').innerHTML = `<div class="brand-block"><img src="/assets/logo-sekolah.svg" alt="Logo sekolah" class="logo"><h1>Pendaftaran Berhasil</h1><p>Akun Anda sudah dibuat dan sedang menunggu verifikasi administrator. Anda dapat login setelah administrator mengaktifkan akun.</p><a class="btn primary inline-link" href="/">Kembali ke halaman login</a></div>`;
  };
}

async function renderStudents() {
  if (state.profile.role !== 'admin') return navigate('dashboard');
  const { data, error } = await sb.from('student_details')
    .select('*,profiles!student_details_id_fkey(full_name,email),teacher:profiles!student_details_teacher_id_fkey(full_name),field_supervisor:profiles!student_details_field_supervisor_id_fkey(full_name)')
    .order('nis');
  if (error) throw error;
  state.students = data || [];
  $('#content').innerHTML = `<div class="section-head"><h3>Data Siswa</h3><button class="btn primary" id="addStudentBtn">Tambah Data Siswa</button></div><div class="table-wrap"><table><thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Tempat PKL</th><th>Guru</th><th>Pembimbing Lapangan</th><th>Tindakan</th></tr></thead><tbody>${state.students.map((student) => `<tr><td>${esc(student.nis)}</td><td>${esc(student.profiles?.full_name)}</td><td>${esc(student.class_name)}</td><td>${esc(student.internship_place)}</td><td>${esc(student.teacher?.full_name || '-')}</td><td>${esc(student.field_supervisor?.full_name || '-')}</td><td><button class="btn secondary edit-student" data-id="${student.id}">Edit</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">Belum ada data siswa.</td></tr>'}</tbody></table></div>`;
  $('#addStudentBtn').onclick = () => openStudentModal();
  document.querySelectorAll('.edit-student').forEach((button) => {
    button.onclick = () => openStudentModal(state.students.find((item) => item.id === button.dataset.id));
  });
}

async function openStudentModal(existing = null) {
  const [{ data: students }, { data: teachers }, { data: supervisors }] = await Promise.all([
    sb.from('profiles').select('id,full_name,email').eq('role', 'student').eq('is_active', true),
    sb.from('profiles').select('id,full_name').eq('role', 'teacher').eq('is_active', true),
    sb.from('profiles').select('id,full_name').eq('role', 'field_supervisor').eq('is_active', true),
  ]);
  modal(existing ? 'Edit Data Siswa' : 'Tambah Data Siswa', `<form id="studentForm" class="form-grid"><label>Akun siswa<select name="id" required><option value="">Pilih siswa</option>${(students || []).map((item) => `<option value="${item.id}" ${existing?.id === item.id ? 'selected' : ''}>${esc(item.full_name)} - ${esc(item.email)}</option>`).join('')}</select></label><label>NIS<input name="nis" value="${esc(existing?.nis || '')}" required></label><label>Kelas<input name="class_name" value="${esc(existing?.class_name || 'XI')}" required></label><label>Tempat PKL/KPH/BKPH/RPH<input name="internship_place" value="${esc(existing?.internship_place || '')}" required></label><label>Guru pembimbing<select name="teacher_id"><option value="">Pilih guru</option>${(teachers || []).map((item) => `<option value="${item.id}" ${existing?.teacher_id === item.id ? 'selected' : ''}>${esc(item.full_name)}</option>`).join('')}</select></label><label>Pembimbing lapangan<select name="field_supervisor_id"><option value="">Pilih pembimbing</option>${(supervisors || []).map((item) => `<option value="${item.id}" ${existing?.field_supervisor_id === item.id ? 'selected' : ''}>${esc(item.full_name)}</option>`).join('')}</select></label><label>Tanggal mulai<input name="start_date" type="date" value="${existing?.start_date || ''}"></label><label>Tanggal selesai<input name="end_date" type="date" value="${existing?.end_date || ''}"></label><div class="wide actions"><button class="btn primary">Simpan</button><button type="button" class="btn secondary modal-close">Batal</button></div></form>`);
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

async function renderJournals() {
  let query = sb.from('daily_journals')
    .select('*,student:profiles!daily_journals_student_id_fkey(full_name),validator:profiles!daily_journals_validated_by_fkey(full_name)')
    .order('journal_date', { ascending: false });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  const { data, error } = await query;
  if (error) throw error;
  state.journals = data || [];
  const canAdd = state.profile.role === 'student';
  $('#content').innerHTML = `<div class="section-head"><h3>${canAdd ? 'Jurnal Harian Saya' : 'Daftar Jurnal Siswa'}</h3>${canAdd ? '<button class="btn primary" id="addJournalBtn">Isi Jurnal</button>' : ''}</div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Foto</th><th>Tahapan</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>${state.journals.map((journal) => `<tr><td>${esc(journal.journal_date)}</td><td>${esc(journal.student?.full_name || state.profile.full_name)}</td><td>${esc(journal.activity_title)}</td><td>${(journal.photo_paths || []).length ? `${journal.photo_paths.length} foto` : '-'}</td><td>${esc((journal.activity_stages || []).join(', '))}</td><td>${statusBadge(journal.status)}</td><td><div class="actions">${canAdd && ['draft', 'revision'].includes(journal.status) ? `<button class="btn secondary edit-journal" data-id="${journal.id}">Edit</button>` : ''}${!canAdd && journal.status === 'submitted' ? `<button class="btn primary validate-journal" data-id="${journal.id}">Validasi</button>` : ''}<button class="btn secondary view-journal" data-id="${journal.id}">Lihat</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="empty">Belum ada jurnal.</td></tr>'}</tbody></table></div>`;
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
}

async function openJournalModal(journal = null) {
  const checks = stages.map((stage) => `<label class="check-item"><input type="checkbox" name="stages" value="${esc(stage)}" ${(journal?.activity_stages || []).includes(stage) ? 'checked' : ''}>${esc(stage)}</label>`).join('');
  const existingPaths = [...(journal?.photo_paths || [])];
  let keptPaths = [...existingPaths];
  let selectedFiles = [];
  const existingUrls = await signedPhotoUrls(existingPaths);

  modal(journal ? 'Edit Jurnal' : 'Isi Jurnal Harian', `<form id="journalForm" class="form-grid"><label>Tanggal<input name="journal_date" type="date" value="${journal?.journal_date || new Date().toISOString().slice(0, 10)}" required></label><label>Jam kegiatan<input name="work_hours" type="number" min="1" max="12" value="${journal?.work_hours || 7}"></label><label>Lokasi<input name="location" value="${esc(journal?.location || '')}" required></label><label>Cuaca<input name="weather" value="${esc(journal?.weather || '')}"></label><label class="wide">Judul kegiatan<input name="activity_title" value="${esc(journal?.activity_title || '')}" required></label><label class="wide">Uraian kegiatan<textarea name="description" required>${esc(journal?.description || '')}</textarea></label><div class="wide"><strong>Tahapan Kegiatan Perhutani</strong><div class="check-grid">${checks}</div></div><label class="wide">Pengetahuan/keterampilan<textarea name="learning">${esc(journal?.learning || '')}</textarea></label><label class="wide">Kendala dan solusi<textarea name="obstacles">${esc(journal?.obstacles || '')}</textarea></label><label class="wide">Refleksi<textarea name="reflection">${esc(journal?.reflection || '')}</textarea></label>
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
  let query = sb.from('attendance').select('*,student:profiles!attendance_student_id_fkey(full_name)').order('attendance_date', { ascending: false });
  if (state.profile.role === 'student') query = query.eq('student_id', state.profile.id);
  const { data, error } = await query;
  if (error) throw error;
  state.attendance = data || [];
  const canAdd = state.profile.role === 'student';
  $('#content').innerHTML = `<div class="section-head"><h3>Presensi PKL</h3>${canAdd ? '<button class="btn primary" id="addAttendance">Isi Presensi</button>' : ''}</div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Masuk</th><th>Pulang</th><th>Status</th><th>Lokasi</th></tr></thead><tbody>${state.attendance.map((item) => `<tr><td>${esc(item.attendance_date)}</td><td>${esc(item.student?.full_name || state.profile.full_name)}</td><td>${esc(item.check_in || '-')}</td><td>${esc(item.check_out || '-')}</td><td>${esc(item.presence_status)}</td><td>${esc(item.location || '-')}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Belum ada presensi.</td></tr>'}</tbody></table></div>`;
  if (canAdd) $('#addAttendance').onclick = () => openAttendance();
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

async function api(url, body, { timeout = 20000 } = {}) {
  const token = state.session?.access_token;
  if (!token) return { error: 'Sesi login berakhir. Silakan masuk kembali.' };
  return requestJson(url, body, { timeout, token });
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
    if (!response.ok && !result.error) result.error = `Permintaan gagal (${response.status})`;
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
