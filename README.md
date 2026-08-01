# E-Jurnal PKL SMK Kehutanan Rimba Bahari Sumedang

Aplikasi web responsif dan PWA untuk penggunaan daring lintas perangkat dan lintas jaringan internet. Data terpusat di Supabase. Frontend dan API dapat dipublikasikan melalui Vercel.

## Fitur utama

- Login empat peran: administrator, siswa, guru pembimbing, dan pembimbing lapangan.
- Administrator membuat akun pengguna dan mengelola data siswa.
- Administrator dapat **reset password siswa, guru, pembimbing lapangan, dan admin**.
- Penempatan siswa ke guru pembimbing dan pembimbing lapangan.
- Jurnal harian 40 hari, simpan draf, kirim, validasi, revisi, setujui, atau tolak.
- Presensi daring.
- Rekap dan ekspor CSV serta cetak sebagai PDF.
- PWA sehingga dapat dipasang pada layar utama HP/laptop.
- Row Level Security: siswa hanya mengakses datanya, pembimbing hanya mengakses siswa bimbingannya.

## Mengapa perlu Vercel dan Supabase?

`localhost` hanya bisa dibuka pada komputer sendiri. Dengan Vercel, aplikasi mempunyai alamat internet publik. Supabase menyimpan akun dan data secara daring sehingga pengguna dapat masuk dari perangkat dan jaringan yang berbeda.

## 1. Membuat proyek Supabase

1. Buat proyek baru di Supabase.
2. Buka **SQL Editor**.
3. Salin seluruh isi `database/supabase.sql`, lalu jalankan.
4. Buka **Authentication > Users**, buat satu akun administrator pertama.
5. Salin UUID akun admin, lalu jalankan perintah admin yang tersedia pada bagian paling bawah `database/supabase.sql`.
6. Buka **Project Settings > API**, catat:
   - Project URL
   - anon/public key
   - service_role key

**Penting:** service role key hanya dimasukkan ke Environment Variables Vercel. Jangan pernah ditulis pada `config.js` atau dibagikan kepada pengguna.

## 2. Mengisi konfigurasi frontend

Salin `config.example.js` menjadi `config.js`, lalu isi:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "ANON_KEY"
};
```

File `config.js` memang dapat dibaca browser; hanya gunakan anon key di sana.

## 3. Menjalankan lokal untuk pengujian

Instal Node.js, lalu jalankan:

```bash
npm install
npm run dev
```

Vercel CLI akan menampilkan alamat lokal, biasanya `http://localhost:3000`.

Bila fungsi API reset password diuji secara lokal, buat file `.env.local` dari `.env.example` dan isi semua variabel.

## 4. Publikasi ke Vercel

1. Buat akun GitHub dan repositori baru.
2. Unggah seluruh isi folder aplikasi ke repositori.
3. Masuk ke Vercel, pilih **Add New Project**, lalu hubungkan repositori tersebut.
4. Pada **Settings > Environment Variables**, tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik Deploy.
6. Setelah selesai, Vercel memberikan alamat seperti `https://e-jurnal-rimba-bahari.vercel.app`.

Semua siswa, guru, dan pembimbing dapat membuka alamat tersebut dengan koneksi internet apa pun.

## 5. Menambah akun dan data siswa

1. Login sebagai administrator.
2. Buka **Akun Pengguna > Tambah Akun**.
3. Buat akun siswa, guru, atau pembimbing lapangan.
4. Untuk siswa, lanjut ke **Data Siswa > Tambah Data Siswa**.
5. Pilih akun siswa, isi NIS, kelas, tempat PKL, guru pembimbing, dan pembimbing lapangan.

## 6. Reset password oleh administrator

1. Login sebagai administrator.
2. Buka **Akun Pengguna**.
3. Cari akun siswa, guru, atau pembimbing lapangan.
4. Klik **Reset Password**.
5. Masukkan password baru minimal 8 karakter dan konfirmasikan.
6. Sistem memperbarui password melalui serverless API dengan service role key dan mencatat tindakan ke audit log.

## Catatan produksi

- Gunakan HTTPS dari Vercel.
- Jangan menyimpan service role key di frontend.
- Aktifkan kebijakan password yang kuat pada Supabase.
- Lakukan backup database berkala.
- Tambahkan Supabase Storage bila dokumentasi foto akan diaktifkan.
- Pengiriman email reset mandiri dapat ditambahkan melalui Supabase Auth; versi ini menitikberatkan reset langsung oleh administrator sesuai permintaan.
