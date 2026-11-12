# Status Pembangunan & Perancangan (Roadmap)

Dokumen ini merekodkan status sebenar ciri-ciri aplikasi **LabMU Pro**, isu-isu yang diketahui, dan perancangan penambahbaikan fasa seterusnya mengikut skop PRD.

---

## 1. Status Ciri-Ciri Semasa (MVP v1.0)

### A. Siap Dibina & Telah Disahkan (Verified)
- [x] **Enjin Matematik Kimia (EURACHEM / CITAC):** Pengiraan $u_A$, $u_B$, $u_c$, $U$ ($k = 2$), dan sumbangan varians (AC-01, AC-02).
- [x] **Enjin Mikrobiologi Makanan (ISO 19036):** Transformasi $\log_{10}$, pengiraan $u_{biol}$, dan amaran *Limit of Detection* (AC-03).
- [x] **Suis Peranan & Kawalan Capaian (Role Switching):** Pengasingan akses antara *Analyst* dan *Technical Manager* (AC-04).
- [x] **Audit Lock & Aliran Kelulusan:** Status `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED` / `REJECTED` berserta penguncian rekod (AC-05).
- [x] **Klon Versi Baharu (Version Upgrade):** Pengklonan rekod diluluskan ke versi bertambah (v1.0 $\rightarrow$ v2.0) dengan rekod salasilah (AC-06).
- [x] **Laporan Rasmi Sedia Audit A4:** Reka letak dokumen cetakan menepati saiz standard A4 dengan blok tandatangan dua pihak (AC-07).
- [x] **Templat Pratetap Makmal:** 4 templat kaedah piawai (Kimia ICP-MS, Titratan, TVC ISO 19036, dan E. coli).
- [x] **Sandaran & Pemulihan Tempatan:** Eksport dan import fail `.json` dengan pengesahan skema.
- [x] **Antaramuka Metrologi Klinikal:** Reka bentuk teknikal berketumpatan tinggi tanpa kapsul pil hiasan dan menggunakan angka tabular (*tabular-nums*).

---

### B. Siap Dibina Tetapi Memerlukan Pengesahan Lapangan (Field Verification)
- [ ] **Variasi Pemacu Pencetak Fizikal (*Printer Driver Differences*):** Susun atur `@media print` telah diuji dalam pelayar moden (Chrome / Edge / Firefox). Walau bagaimanapun, margin pencetak perkakasan fizikal yang berbeza di setiap makmal memerlukan ujian cetakan manual pengguna.
- [ ] **Prestasi Muatan Data Ekstrim:** Telah diuji sehingga 20 baris komponen Type B. Penggunaan melebihi 50 komponen Type B dalam satu kaedah belum diuji dari sudut prestasi kelajuan skrol.

---

## 2. Isu Diketahui & Had Semasa (Known Limitations)

1. **Storan Tempatan Pelayar (*Browser-Local Storage*):**  
   Data bajet disimpan di dalam `localStorage` pelayar peranti semasa pengguna. Sekiranya pengguna menukar komputer atau memadamkan *cache* pelayar, data mesti dipulihkan melalui fail sandaran `.json` yang dieksport.
2. **Ketiadaan Pengesahan Identiti Sebenar (Mock Authentication):**  
   Suis peranan pada bar navigasi adalah simulasi persekitaran kerja makmal untuk tujuan prototaip fungsian. Sistem pengesahan log masuk berasaskan kata laluan / SSO belum disepadukan.
3. **Faktor Liputan Tetap ($k = 2$):**  
   Sistem mengguna pakai faktor liputan tetap $k = 2$ (~95% aras keyakinan). Penyesuaian darjah kebebasan efektif menggunakan formula Welch-Satterthwaite belum disertakan dalam versi 1.0.

---

## 3. Perancangan Fasa Seterusnya (Future Roadmap)

Berikut adalah ciri-ciri yang telah dipersetujui untuk fasa pembangunan seterusnya mengikut Seksyen 6 dokumen PRD (tanpa tarikh pelaksanaan yang direka-reka):

### Fasa 2: Kesinambungan Data & Awan
- [ ] **Penyegerakan Awan Berpusat (Multi-User Cloud Sync):**  
  Penyepaduan pangkalan data awan (seperti Firebase / PostgreSQL) supaya juruanalisis dan pengurus boleh bekerjasama merentasi komputer dan cawangan makmal yang berbeza.
- [ ] **Sistem Log Masuk & Kawalan Pengguna (Authentication):**  
  Penyepaduan pengesahan pengguna berasaskan e-mel rasmi kakitangan makmal dan peranan sebenar.

### Fasa 3: Pengurusan Instrumen & Kalibrasi
- [ ] **Perpustakaan Instrumen & CRM Berpusat (Equipment Master Library):**  
  Pangkalan data inventori peralatan makmal berpusat untuk mengesan tarikh tamat tempoh sijil kalibrasi neraca, pipet, dan bahan rujukan (CRM).
- [ ] **Formula Welch-Satterthwaite:**  
  Pengiraan darjah kebebasan efektif ($v_{eff}$) dan faktor liputan dinamik $t$-distribution bagi pengujian berkejituan tinggi.
- [ ] **Eksport Jadual ke Format CSV / Excel:**  
  Fungsi eksport terus data mentah bagi memudahkan integrasi dengan Sistem Pengurusan Maklumat Makmal (*Laboratory Information Management System*, LIMS).

---

## 4. Perkara di Luar Skop (Out of Scope)
- Sambungan perkakasan terus ke instrumen fizikal makmal (*LIMS hardware link*).
- Pengiraan ketakpastian untuk dimensi fizikal industri kejuruteraan berat.
