# E-Jurnal PKL Rimba Bahari v6.26

Versi 6.26 menambahkan **Laporan PKL akhir berbasis E-Jurnal** tanpa menghapus fitur Cetak Jurnal Harian yang sudah ada.

## Fitur baru v6.26

- Siswa memiliki menu **Laporan PKL** untuk menyusun laporan akhir.
- Data kegiatan, tahapan, pengetahuan/keterampilan, kendala dan solusi, refleksi, catatan pembimbing, jam kegiatan, serta foto diambil otomatis dari jurnal berstatus **Disetujui**.
- Siswa cukup mengisi data naratif yang tidak tersedia pada jurnal: profil instansi, unit penempatan, struktur organisasi/posisi penempatan, kata pengantar, kesimpulan, dan saran.
- Alur laporan: **Draf → Diajukan → Perlu Revisi / Disetujui**.
- Guru Pembimbing dapat melihat laporan siswa bimbingan, memberikan catatan revisi, dan menyetujui laporan.
- Administrator dapat memantau seluruh status laporan dan mengatur nama sekolah, tahun pelajaran, Kepala Sekolah, NIP, judul laporan, lokasi pengesahan, latar belakang, tujuan, serta manfaat PKL standar.
- Pembimbing Lapangan dapat melihat dan mencetak laporan siswa yang menjadi bimbingannya.
- Pratinjau dan cetak/PDF menyusun: Cover, Lembar Pengesahan, Kata Pengantar, Daftar Isi, BAB I sampai BAB V, Rekap Jurnal, dan Dokumentasi Foto.
- Laporan yang belum disetujui diberi watermark status agar tidak tertukar dengan laporan final.

## Upgrade database wajib

Jalankan satu kali file berikut melalui **Supabase Dashboard → SQL Editor**:

```text
database/upgrade-final-pkl-report.sql
```

SQL tersebut membuat tabel dan fungsi:

- `pkl_reports`
- `pkl_report_settings`
- `save_pkl_report(...)`
- `submit_pkl_report()`
- `review_pkl_report(...)`

SQL aman dijalankan ulang dan menggunakan RLS serta RPC supaya siswa tidak dapat menetapkan sendiri status persetujuan laporan.

## Update GitHub dari v6.25

Timpa file berikut:

```text
app.js
index.html
styles.css
sw.js
package.json
VERSION.txt
README.md
```

Tambahkan file baru:

```text
database/upgrade-final-pkl-report.sql
```

Folder `api/`, aset, `config.js`, `vercel.json`, dan migration database lama tetap dipertahankan.

Setelah commit dan deployment Vercel selesai, lakukan **Ctrl + F5** atau tutup dan buka kembali PWA agar service worker v33 aktif.

## Pengujian minimum

1. Login siswa, buka **Laporan PKL**, isi data naratif dan simpan draf.
2. Pastikan jurnal yang akan masuk laporan sudah berstatus **Disetujui**.
3. Siswa klik **Ajukan ke Guru Pembimbing**.
4. Login Guru Pembimbing, buka **Laporan PKL Siswa**, lalu pilih **Tinjau**.
5. Uji **Minta Revisi** dan **Setujui Laporan**.
6. Buka **Pratinjau** dan **Cetak / Simpan PDF**, lalu pastikan foto dokumentasi muncul.
7. Login Administrator, cek **Laporan PKL** dan simpan pengaturan format sekolah.

## Catatan keamanan

Password autentikasi tetap tidak disimpan atau ditampilkan dalam bentuk terbaca. Fitur Bantuan Password Administrator dari v6.25 tetap dipertahankan.
