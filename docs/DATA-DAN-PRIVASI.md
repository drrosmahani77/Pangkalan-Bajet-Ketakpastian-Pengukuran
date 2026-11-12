# Polisi Data & Privasi (LabMU Pro)

Dokumen ini menerangkan bagaimana data dikendalikan, disimpan, dan dilindungi di dalam aplikasi **LabMU Pro v1.0**.

---

## 1. Data yang Dikendalikan oleh Aplikasi

Aplikasi memproses maklumat berkaitan pengujian makmal berikut:
- **Metadata Kaedah:** Nama parameter ujian, kod standard SOP makmal, matriks sampel, dan unit pengukuran.
- **Data Ujian Mentah (Type A):** Siri bacaan berangka replikasi ujian makmal.
- **Data Komponen Ketakpastian (Type B):** Sumber komponen, had toleransi, jenis taburan kebarangkalian, dan pekali kepekaan ($c_i$).
- **Data Mikrobiologi:** Bacaan kiraan koloni CFU dan parameter kebolehulangan ISO 19036.
- **Metadata Jejak Audit:** Nama pengguna penyedia dan pelulus, tarikh, rekod tindakan, dan ulasan semakan penolakan.

---

## 2. Di Mana Data Disimpan?

- **Storan Tempatan Sahaja (Client-Side LocalStorage):**  
  Keseluruhan data disimpan secara setempat di dalam pelayar web peranti anda di bawah kunci storan `labmu_pro_budgets_v1`.
- **Tiada Pangkalan Data Pelayan Luar:**  
  Dalam versi prototaip 1.0 ini, data anda **tidak dihantar** atau disimpan pada mana-mana pelayan pangkalan data awan luar melainkan anda mengeksportnya sendiri.

---

## 3. Adakah Data Dihantar kepada Model AI atau Pihak Ketiga?

- **Pengiraan Matematik Berjalan 100% Tempatan:**  
  Semua pengiraan matematik (min, sisihan piawai, pembahagi kebarangkalian, pengiraan gabungan $u_c$, dan transformasi $\log_{10}$) diproses sepenuhnya oleh enjin JavaScript di dalam pelayar peranti anda.
- **Tiada Data Ujian Dihantar ke Model AI:**  
  Data ujian, kod SOP, dan nama makmal anda tidak dihantar ke mana-mana *Large Language Model (LLM)* atau perkhidmatan kecerdasan buatan untuk pemprosesan.
- **Tiada Penjejak Komersial (Zero Telemetry & Third-party Trackers):**  
  Aplikasi ini tidak memasukkan skrip penjejak iklan, kuki pihak ketiga, atau alat analitik komersial.

---

## 4. Kawalan Akses & Keselamatan Data

- **Akses Peranti:**  
  Sesiapa sahaja yang mempunyai akses fizikal kepada profil pelayar komputer anda boleh melihat rekod yang disimpan di dalam storan tempatan peranti tersebut.
- **Kawalan Integriti Audit Lock:**  
  Sistem menyediakan kawalan integriti perisian di mana rekod yang telah berstatus *Approved* dikunci daripada pengeditan bagi mengekalkan ketepatan data audit.

---

## 5. Cara Mengeksport, Menyandar, dan Memadam Data

### A. Menyimpan Sandaran Luar (Backup)
1. Klik butang **"Sandaran"** pada bar navigasi atas.
2. Pelayar akan memuat turun fail berformat `.json` yang mengandungi salinan penuh data bajet anda.
3. Simpan fail ini di lokasi storan selamat makmal anda.

### B. Memadam Rekod Tertentu
1. Buka papan pemuka utama.
2. Cari rekod yang berstatus *Draf* atau *Perlu Pembetulan*.
3. Klik ikon **Tong Sampah** di hujung baris dan sahkan pemadaman.

### C. Memadam Keseluruhan Data
1. Anda boleh mengosongkan keseluruhan data dengan membersihkan *Local Storage / Cache* pelayar anda, atau
2. Klik butang putar **"Set Semula Data Contoh"** untuk menggantikan data sedia ada dengan rekod contoh awal makmal.
