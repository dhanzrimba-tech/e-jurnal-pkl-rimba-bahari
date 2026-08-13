# E-Jurnal PKL Rimba Bahari v6.31

Versi 6.31 menambahkan monitoring kewajiban harian tanpa mengubah struktur database. Fitur laporan akademik v6.29 tetap dipertahankan.

## Notifikasi kewajiban harian v6.31

- Administrator menerima notifikasi jumlah siswa aktif PKL yang belum presensi pada tanggal hari ini.
- Guru Pembimbing menerima notifikasi khusus siswa yang ditugaskan kepadanya dan belum presensi.
- Notifikasi dapat diklik untuk membuka daftar nama siswa, NISN, kelas, dan tempat PKL. Administrator juga melihat nama Guru Pembimbing.
- Siswa mendapat panel peringatan jika presensi atau jurnal pada tanggal hari ini belum diisi.
- Tombol pada peringatan siswa langsung membuka menu Presensi Saya atau Jurnal Harian.
- Sidebar menampilkan badge pada Presensi/Jurnal saat masih ada kewajiban yang belum selesai.
- Siswa yang tanggal hari ini berada di luar periode PKL tidak dihitung. Bila tanggal mulai atau selesai belum diatur, siswa tetap dianggap aktif.
- Tidak ada migration SQL baru untuk fitur ini.


## Perubahan utama

- BAB III berganti nama menjadi **Pembahasan Praktik Kerja Lapangan**.
- Isi BAB III tidak lagi berupa tabel rekap yang diulang dengan daftar pengetahuan, kendala, refleksi, dan catatan pembimbing.
- BAB III tidak lagi memasukkan semua jurnal. Materi yang sama atau sangat mirip dikelompokkan, lalu sistem memilih jurnal dengan isi paling lengkap sebagai representasi. Laporan individu menampilkan maksimal 5 materi utama dan laporan kelompok maksimal 6 materi utama.
- Catatan pembimbing **tidak ditampilkan di BAB III**. Catatan tersebut tetap tersedia pada Lampiran Rekap Jurnal.
- Setiap jurnal yang terpilih untuk BAB III menggunakan **maksimal 1 foto**, yaitu foto pertama dari jurnal tersebut.
- Foto ditempatkan langsung pada pembahasan kegiatan terpilih di BAB III; seluruh jurnal disetujui tetap tersimpan di lampiran.
- Setiap foto mendapat nomor dan nama, misalnya **Gambar 3.1. Dokumentasi ...**.
- Sistem membuat **Daftar Gambar** otomatis dari foto yang benar-benar digunakan.
- BAB Dokumentasi dihapus. Penutup yang sebelumnya BAB V menjadi **BAB IV Penutup**.
- Ditambahkan **Daftar Pustaka** sebelum lampiran.
- Setiap pembahasan kegiatan mendapat sitasi ilmiah yang dipilih berdasarkan kata kunci jurnal. Daftar Pustaka hanya memuat sumber yang benar-benar digunakan pada pembahasan.
- Berlaku pada laporan **individu dan kelompok**, baik **Pratinjau/Cetak PDF** maupun **Unduh Word (.docx)**.
- Ekspor Word sekarang menghasilkan **DOCX native**, dengan halaman A4, margin akademik, Times New Roman, heading, tabel, foto, caption, page break, dan nomor halaman yang lebih stabil.

## Pustaka ilmiah bawaan untuk pencocokan kegiatan

1. Ardiana, S., & Suratman, B. (2021). Pengelolaan Arsip Dalam Mendukung Pelayanan Informasi Pada Bagian Tata Usaha di Dinas Sosial Kabupaten Ponorogo. *Jurnal Pendidikan Administrasi Perkantoran (JPAP), 9*(2), 335–348. https://doi.org/10.26740/jpap.v9n2.p335-348
2. Rohmawati, L., & Puspasari, D. (2020). Pengelolaan Arsip Berbasis Aplikasi Surat Di Dinas Perpustakaan dan Kearsipan Provinsi Jawa Timur. *Jurnal Pendidikan Administrasi Perkantoran (JPAP), 8*(2), 180–193. https://doi.org/10.26740/jpap.v8n2.p180-193
3. Priatama, A. R., Setiawan, Y., Mansur, I., & Masyhuri, M. (2022). Regression Models for Estimating Aboveground Biomass and Stand Volume Using Landsat-Based Indices in Post-Mining Area. *Jurnal Manajemen Hutan Tropika, 28*(1), 1–14. https://doi.org/10.7226/jtfm.28.1.1
4. Priatna, D., Sudrajat, D. J., Sukma, A. D., Triastinurmiatiningsih, Surono, Rosadi, Ginarso, G. P., & Hartiningtias, D. (2026). Effectiveness of Biopriming Using Dark Septate Endophytes in Improving Seed Viability and Early Seedling Growth of Gmelina arborea Roxb. ex Sm. *Jurnal Manajemen Hutan Tropika, 32*(2), 183. https://doi.org/10.7226/jtfm.32.2.183
5. Yovi, E. Y., Yamada, Y., Zaini, M. F., Kusumadewi, C. A. Y., & Marisiana, L. (2016). Improving the OSH Knowledge of Indonesian Forestry Workers by Using Safety Game Application: Tree Felling Supervisors and Operators. *Jurnal Manajemen Hutan Tropika, 22*(1), 75–85. https://doi.org/10.7226/jtfm.22.1.75
6. Setiajiati, F., Hardjanto, H., & Hendrayanto, H. (2017). Strategies of Community Empowerment to Manage Protection Forest Sustainably. *Jurnal Manajemen Hutan Tropika, 23*(2), 71–80. https://doi.org/10.7226/jtfm.23.2.71
7. Massiri, S. D., Malik, A., Golar, Hamzari, & Nugroho, B. (2020). Institutional Capacity of Forest Management Unit in Promoting Sustainable Community-Based Forest Management: Case Study of Forest Management Unit in Central Sulawesi Province, Indonesia. *Jurnal Manajemen Hutan Tropika, 26*(2), 169–177. https://doi.org/10.7226/jtfm.26.2.169
8. Frahidayah, A. E., Murtini, W., & Susantiningrum, S. (2024). Pengaruh Pengalaman PKL, Kepercayaan Diri, dan Penguasaan Soft Skill terhadap Kesiapan Kerja. *Efisiensi: Kajian Ilmu Administrasi, 21*(1), 63–78. https://doi.org/10.21831/efisiensi.v21i1.64221

Pencocokan sumber bersifat otomatis berbasis kata kunci. Guru Pembimbing tetap perlu memeriksa apakah sitasi yang dipilih sesuai dengan konteks kegiatan siswa sebelum laporan disetujui.

## Upgrade ke v6.31

Tidak ada perubahan database dan tidak perlu menjalankan SQL baru.

Timpa/unggah seluruh source v6.31 agar komponen baru ikut terpasang. File penting yang berubah antara lain:

- `app.js`
- `word-export.js`
- `vendor/jszip.min.js`
- `index.html`
- `sw.js`
- `vercel.json`
- `api/register-public-student.js`
- `api/_supabase.js`
- `package.json`
- `VERSION.txt`
- `README.md`

Setelah commit, tunggu Vercel berstatus **Ready**, lalu buka aplikasi dan tekan `Ctrl + F5`.

## Pengujian yang disarankan

1. Pilih satu siswa yang memiliki beberapa jurnal Disetujui dan setiap jurnal memiliki lebih dari satu foto.
2. Buka Laporan PKL dan pilih Pratinjau.
3. Pastikan BAB III hanya muncul satu kali.
4. Pastikan jurnal dengan materi sama tidak diulang di BAB III dan hanya jurnal terbaik yang dipakai sebagai representasi.
5. Cocokkan nomor Gambar pada BAB III dengan Daftar Gambar.
6. Pastikan BAB IV adalah Penutup dan tidak ada BAB Dokumentasi.
7. Pastikan Catatan Pembimbing tidak muncul di BAB III.
8. Pastikan sitasi di BAB III memiliki pasangan yang sama pada Daftar Pustaka.
9. Ulangi pengujian pada Laporan Kelompok dan pastikan Unduh Word menghasilkan file `.docx` yang rapi.
