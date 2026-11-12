# LabMU Pro

**Sistem Anggaran Ketakpastian Pengukuran Makmal Berasaskan Web (ISO/IEC 17025)**

Aplikasi web interaktif untuk mengira, menyemak, mengesahkan, dan menjana laporan anggaran ketakpastian pengukuran (*Measurement Uncertainty*, MU) khusus bagi makmal pengujian Kimia dan Biologi.

---

## 1. Masalah yang Diselesaikan

Di kebanyakan makmal pengujian, pengiraan ketakpastian pengukuran masih dilakukan menggunakan helaian kerja Microsoft Excel persendirian. Situasi ini sering menimbulkan masalah serius:

- **Formula Terpadam:** Juruanalisis boleh terpadam atau terubah formula matematik tanpa disengajakan.
- **Tiada Kawalan Versi (*Version Control*):** Sukar membuktikan versi pengiraan mana yang sah apabila sijil kalibrasi instrumen (contohnya neraca atau mikropipet) dikemas kini.
- **Format Tidak Seragam:** Setiap juruanalisis mereka jadual sendiri, menyukarkan semakan pegawai atasan dan juruaudit akreditasi (seperti Jabatan Standard Malaysia / SAMM).
- **Tiada Bukti Pengasingan Kuasa:** Tiada bukti sistem bahawa orang yang menyediakan data berbeza daripada orang yang meluluskan keputusan pengujian.

**LabMU Pro** menyelesaikan cabaran ini dengan mengunci logik matematik di peringkat sistem, mengasingkan peranan penyedia (*Analyst*) dan pelulus (*Manager*), serta menghasilkan laporan audit A4 rasmi dalam satu klik.

---

## 2. Sasaran Pengguna

1. **Analyst (Juruanalisis / Pegawai Sains):**  
   Menyediakan draf pengiraan baharu, memasukkan data replikasi ujian, memilih komponen Type A & Type B, dan menghantar bajet untuk semakan pengurusan.
2. **Manager (Technical / Quality Manager):**  
   Menyemak ketepatan data kaedah, meluluskan (*Approve*) atau menolak (*Reject* berserta ulasan pembetulan), dan mencetak laporan bersijil rasmi.
3. **Juruaudit Akreditasi (ISO/IEC 17025):**  
   Menilai integriti pengiraan, jejak audit (*audit trail*), dan pembahagi taburan kebarangkalian dengan telus.

---

## 3. Fungsi Utama Aplikasi

- **Enjin Kimia (Panduan EURACHEM/CITAC CG 4):**  
  Pengiraan automatik komponen Type A daripada data replikasi ($n \ge 2$) dan komponen Type B (Normal, Rectangular, Triangular) dengan pembahagi kebarangkalian yang tepat.
- **Enjin Biologi & Mikrobiologi (ISO 19036:2019):**  
  Transformasi logaritma $\log_{10}$ bagi kiraan koloni CFU dengan pengesyoran batas pengesanan (*Limit of Detection*, LOD) untuk kiraan koloni sifar.
- **Visualisasi Sumbangan Varians (Pareto Chart):**  
  Pecahan peratusan varians setiap komponen $(u_i^2 / u_c^2 \times 100)$ yang sentiasa genap 100% untuk mengenal pasti punca ketakpastian utama.
- **Kawalan Integriti & Penguncian Rekod (*Audit Lock*):**  
  Rekod yang telah diluluskan dikunci menjadi *Read-Only*. Pindaan hanya dibenarkan melalui fungsi klon ke versi baharu (contoh: v1.0 → v2.0).
- **Penjanaan Laporan PDF Sedia Audit:**  
  Susun atur cetakan dokumen A4 rasmi lengkap dengan blok tandatangan dua pihak (*dual-party sign-off*).
- **Sandaran & Pemulihan Tempatan (*JSON Backup & Restore*):**  
  Eksport keseluruhan pangkalan data pelayar pengguna ke fail `.json` dan pulihkan bila-bila masa.

---

## 4. Contoh Senario Penggunaan

1. **Penyediaan Draf:**  
   Ahmad (*Analyst*) memilih templat *Penentuan Plumbum (Pb) dalam Air Minuman* (SOP-CH-042). Beliau memasukkan 5 bacaan replikasi ujian dan komponen kalibrasi neraca.
2. **Pengiraan Automatik:**  
   Sistem mengira min, sisihan piawai ($s$), ketakpastian Type A ($u_A$), ketakpastian gabungan ($u_c$), dan ketakpastian diperluas ($U = u_c \times 2$) secara masa-nyata.
3. **Penghantaran:**  
   Ahmad menekan butang **"Hantar Semakan"**. Status bertukar kepada `Menunggu Kelulusan`.
4. **Semakan & Kelulusan:**  
   Dr. Siti (*Technical Manager*) menukar mod peranan kepada *Manager*, memeriksa pecahan varians, dan menekan **"Luluskan (Approve)"**.
5. **Cetak & Kunci:**  
   Rekod dikunci daripada sebarang suntingan. Dr. Siti menekan butang **"Laporan A4"** dan mencetak dokumen rasmi bertandatangan untuk fail audit makmal.

---

## 5. Cara Mencuba (Live Preview)

Aplikasi sedia ada boleh dicapai dan diuji secara terus melalui pautan pelayan pembangunan berikut:

- **Pautan Aplikasi (Development URL):**  
  [https://ais-dev-yi3ha3osnffy76mjpsrm5o-858963436193.asia-northeast1.run.app](https://ais-dev-yi3ha3osnffy76mjpsrm5o-858963436193.asia-northeast1.run.app)
- **Pautan Perkongsian (Shared Preview URL):**  
  [https://ais-pre-yi3ha3osnffy76mjpsrm5o-858963436193.asia-northeast1.run.app](https://ais-pre-yi3ha3osnffy76mjpsrm5o-858963436193.asia-northeast1.run.app)

---

## 6. Status Projek Semasa

| Perkara | Status | Penerangan |
| :--- | :--- | :--- |
| **Enjin Matematik Kimia (EURACHEM)** | Siap & Disahkan | Disahkan melepasi ujian AC-01 (Type A) dan AC-02 (Type B). |
| **Enjin Mikrobiologi (ISO 19036)** | Siap & Disahkan | Disahkan melepasi ujian AC-03 (Transformasi $\log_{10}$ koloni). |
| **Pengasingan Peranan & Audit Lock** | Siap & Disahkan | Disahkan melepasi ujian AC-04 dan AC-05. |
| **Klon Versi (v1.0 → v2.0)** | Siap & Disahkan | Disahkan melepasi ujian AC-06 dengan rujukan `parentRecordId`. |
| **Laporan Cetak A4 Rasmi** | Siap & Disahkan | Disahkan melepasi ujian AC-07 dengan susun atur `@media print`. |
| **Storan Data** | Berfungsi (Tempatan) | Menggunakan `localStorage` pelayar dan fail sandaran JSON. |
| **Penyegerakan Awan Berbilang Peranti** | Dirancang (Fasa 2) | Integrasi pangkalan data awan berpusat (Cloud Database) dijadualkan kemudian mengikut PRD. |

*Perhatian:* Status "Siap & Disahkan" di atas merujuk kepada ujian logik perisian dan kriteria penerimaan yang dijalankan dalam persekitaran pembangunan.

---

## 7. Ringkasan Teknologi

- **React 19:** Pustaka utama untuk membina paparan dan interaksi pengguna yang pantas.
- **TypeScript:** Bahasa pengaturcaraan berstruktur yang mengelakkan kesilapan jenis data (*type errors*).
- **Tailwind CSS v4:** Kerangka gayaan antara muka (*styling framework*) untuk reka bentuk kemas dan susun atur cetakan A4.
- **Vite:** Enjin pembina (*build tool*) berprestasi tinggi untuk pembangunan web moden.
- **Lucide React:** Set ikon grafik teknikal yang konsisten.

---

## 8. Panduan dan Dokumentasi Berkaitan

Untuk maklumat terperinci, sila rujuk dokumentasi dalam folder `docs/`:

- [Panduan Pengguna Langkah demi Langkah](docs/PANDUAN-PENGGUNA.md)
- [Keperluan Produk & Spesifikasi Kaedah](docs/KEPERLUAN-PRODUK.md)
- [Status Pembangunan & Perancangan (Roadmap)](docs/STATUS-DAN-ROADMAP.md)
- [Polisi Data & Privasi](docs/DATA-DAN-PRIVASI.md)
- [Panduan Pemasangan & Penyelenggaraan](docs/SETUP-DAN-PENYELENGGARAAN.md)
- [Rekod Perubahan (CHANGELOG.md)](CHANGELOG.md)

---

## 9. Maklum Balas & Bantuan

Sekiranya anda menemui sebarang isu atau ingin mencadangkan penambahbaikan, sila kemukakan tiket maklum balas melalui bahagian **Issues** di repositori GitHub ini setelah repositori disambungkan.
