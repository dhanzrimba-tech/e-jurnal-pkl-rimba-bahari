# E-Jurnal PKL Rimba Bahari v6.28

Versi 6.28 menambahkan **Laporan PKL Kelompok per Lokasi Praktik** tanpa menghapus laporan individu dan Cetak Jurnal Harian.

## Fitur baru v6.28

- Kelompok terbentuk otomatis berdasarkan nilai **Tempat PKL** yang sama pada data siswa.
- Normalisasi pengelompokan mengabaikan perbedaan huruf besar/kecil dan spasi berlebih.
- Satu laporan kelompok dipakai bersama seluruh siswa pada lokasi tersebut.
- Semua anggota kelompok dapat menyunting draf/revisi secara kolaboratif.
- Pengajuan kelompok membutuhkan minimal 2 siswa pada lokasi yang sama.
- Setiap anggota harus memiliki minimal 1 jurnal berstatus **Disetujui** sebelum laporan kelompok dapat diajukan.
- BAB III, lampiran, rekap jurnal, total jam, pengetahuan/keterampilan, kendala, refleksi, catatan pembimbing, dan foto digabung otomatis dari seluruh anggota.
- Hasil laporan kelompok tersedia sebagai **Pratinjau**, **Word (.doc)**, dan **Cetak / Simpan PDF**.
- Cover dan lembar pengesahan menampilkan daftar anggota kelompok.
- Guru Pembimbing yang memiliki siswa pada lokasi tersebut dapat meninjau, meminta revisi, atau menyetujui laporan kelompok.
- Administrator dapat melihat seluruh kelompok berdasarkan lokasi praktik.
- Pembimbing Lapangan dapat melihat dan mencetak kelompok sesuai lokasi siswa bimbingannya.
- Laporan individu v6.27 tetap tersedia dan tidak berubah.

## Upgrade database

Pastikan fitur laporan individu v6.26 sudah aktif dengan:

`database/upgrade-final-pkl-report.sql`

Kemudian jalankan **satu kali**:

`database/upgrade-group-pkl-report.sql`

melalui **Supabase Dashboard → SQL Editor**.

SQL v6.28 membuat tabel `pkl_group_reports`, RPC pengelompokan/review, dan policy baca foto anggota kelompok. Script dirancang aman untuk dijalankan ulang.

## File yang perlu ditimpa di GitHub

Untuk upgrade dari v6.27, timpa:

- `app.js`
- `index.html`
- `styles.css`
- `sw.js`
- `package.json`
- `VERSION.txt`
- `README.md`

Tambahkan:

- `database/upgrade-group-pkl-report.sql`

Jangan mengganti `config.js`, environment variables Vercel, folder `api`, atau file database lama.

## Urutan pemasangan

1. Timpa file v6.28 di repository GitHub lama.
2. Tambahkan `database/upgrade-group-pkl-report.sql`.
3. Commit ke branch produksi.
4. Jalankan SQL v6.28 di Supabase SQL Editor.
5. Tunggu deployment Vercel berstatus Ready.
6. Buka aplikasi dan tekan `Ctrl + F5`.
7. Uji akun siswa pada **Laporan PKL → Laporan Kelompok**.
8. Uji akun Guru Pembimbing pada bagian **Laporan Kelompok per Lokasi**.
