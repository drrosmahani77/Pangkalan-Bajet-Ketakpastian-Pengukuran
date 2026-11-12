# Keperluan Produk & Spesifikasi Kaedah (LabMU Pro)

Dokumen ini merekodkan keperluan fungsian, peraturan perniagaan (*business rules*), formula matematik, dan kriteria penerimaan yang mendasari pembangunan **LabMU Pro v1.0**.

Rujukan dokumen asal: `Dokumen_PRD_LabMU_Pro_037de035.pdf` (disimpan dalam projek di folder `/public/assets/aistudio/Dokumen_PRD_LabMU_Pro_037de035.pdf`).

---

## 1. Objektif Produk
1. **Pematuhan Penuh Piawaian:** Menghasilkan jadual penilaian ketakpastian yang menepati ISO/IEC 17025:2017 Klausa 7.6.
2. **Penjimatan Masa:** Mengurangkan masa penyediaan helaian bajet daripada 2–3 jam kepada bawah 15 minit melalui templat pratetap makmal.
3. **Penghapusan Ralat Formula:** Menghapuskan 100% risiko formula Excel terpadam dengan mengunci logik pengiraan di peringkat kod aplikasi.
4. **Ketersediaan Audit Segera:** Menjana laporan sedia audit lengkap dengan carta sumbangan varians dan rekod tandatangan dua pihak dalam masa 1 klik.

---

## 2. Model Matematik yang Dilaksanakan

### A. Mod Kimia (Berasaskan Panduan EURACHEM / CITAC CG 4)

#### 1. Komponen Type A (Replikasi Data Ujian, $n \ge 2$)
- **Nilai Min Sampel ($\bar{x}$):**
  $$\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}$$
- **Sisihan Piawai Sampel ($s$):**
  $$s = \sqrt{\frac{\sum_{i=1}^{n} (x_i - \bar{x})^2}{n - 1}}$$
- **Ketakpastian Piawai Type A ($u_A$):**
  $$u_A = \frac{s}{\sqrt{n}}$$

#### 2. Komponen Type B (Taburan Kebarangkalian & Pembahagi)
- **Normal ($k = 1$):**
  $$\text{Divisor} = 1.0$$
- **Normal ($k = 2$, Aras Keyakinan 95% Sijil Kalibrasi):**
  $$\text{Divisor} = 2.0$$
- **Rectangular / Segiempat Tepat (Toleransi had pengeluar $\pm a$):**
  $$\text{Divisor} = \sqrt{3} \approx 1.73205$$
- **Triangular / Segitiga (Kesan suhu dan toleransi kelalang volumetrik):**
  $$\text{Divisor} = \sqrt{6} \approx 2.44949$$
- **Ketakpastian Piawai Type B ($u_{B,i}$):**
  $$u_{B,i} = \left(\frac{a}{\text{Divisor}}\right) \times c_i$$
  *(di mana $c_i$ ialah pekali kepekaan / sensitivity coefficient, nilai lalai = 1.0)*

#### 3. Ketakpastian Piawai Gabungan ($u_c$)
$$u_c = \sqrt{u_A^2 + \sum_{i=1}^{m} u_{B,i}^2}$$

#### 4. Ketakpastian Diperluas ($U$)
$$U = u_c \times k \quad (k = 2, \text{ Aras Keyakinan } \sim 95\%)$$

#### 5. Sumbangan Varians (% Variance Contribution)
$$\% \text{ Sumbangan Varians} = \left(\frac{u_i^2}{u_c^2}\right) \times 100$$
*(Jumlah semua sumbangan sentiasa genap 100.0%)*

---

### B. Mod Biologi & Mikrobiologi (Berasaskan Standard ISO 19036:2019)

#### 1. Transformasi Logaritma Koloni
$$y_i = \log_{10}(C_i)$$

#### 2. Ketakpastian Gabungan Mikrobiologi ($u_{biol}$)
$$u_{biol} = \sqrt{s_R^2 + u_{mat}^2 + u_{inc}^2}$$
- $s_R$: Sisihan piawai kebolehulangan (*reproducibility standard deviation*) daripada replikasi atau carta kawalan kualiti.
- $u_{mat}$: Ketakpastian matriks sampel.
- $u_{inc}$: Ketakpastian variasi suhu dan masa pengeraman inkubator.

#### 3. Ketakpastian Diperluas ($U$)
$$U = 2 \times u_{biol} \quad (\text{unit } \log_{10}\text{ CFU/g atau CFU/mL})$$

---

## 3. Peraturan Perniagaan (Business Rules & Integrity Controls)

1. **Peraturan Pembahagi Taburan:**  
   Nilai pembahagi ditentukan secara automatik oleh jenis taburan yang dipilih bagi mengelakkan kesilapan manusia.
2. **Kekangan Pengasingan Peranan:**  
   Pengguna dalam peranan *Analyst* dilarang sama sekali daripada meluluskan atau menolak rekod sendiri. Tindakan kelulusan hanya sah melalui peranan *Manager*.
3. **Pengesahan Replikasi Minimum:**  
   Pengiraan Type A mewajibkan $n \ge 2$ titik bacaan bagi mengelakkan ralat matematik bahagi dengan sifar $(n - 1 = 0)$.
4. **Pengendalian Koloni Sifar:**  
   Bagi mengelakkan ralat $\log_{10}(0)$ yang tidak tertakrif, sistem menguatkuasakan panduan *Limit of Detection (LOD)* berserta amaran nasihat.
5. **Kunci Audit Rekod Diluluskan (*Audit Lock*):**  
   Rekod berstatus `APPROVED` dikunci sepenuhnya kepada mod baca sahaja (*Read-Only*). Tiada pengeditan langsung dibenarkan.
6. **Klon Salasilah Versi:**  
   Pindaan kepada kaedah yang telah diluluskan mesti dilakukan melalui klon versi baharu (v1.0 $\rightarrow$ v2.0 berstatus `DRAFT`) dengan menyimpan rujukan `parentRecordId`.

---

## 4. Kriteria Penerimaan & Status Verifikasi (Acceptance Criteria)

| Kod | Modul / Kriteria | Kaedah Verifikasi & Input | Keputusan Dijangka | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | Pengiraan Type A Matematik | Bacaan: 10.1, 10.2, 10.1, 10.3, 10.2 ($n = 5$) | Min = 10.18, SD = 0.0837, $u_A = 0.0374$ | **Lulus** |
| **AC-02** | Pembahagi Taburan Type B | Taburan Rectangular dengan had $\pm 0.05$ | Pembahagi = 1.7321, $u_i = 0.0289$ | **Lulus** |
| **AC-03** | Mod Biologi ISO 19036 | Input CFU 2400 dan 2600 | $\log_{10}(2400) = 3.38$, $\log_{10}(2600) = 3.41$ | **Lulus** |
| **AC-04** | Sekatan Akses Peranan | Semasa peranan Analyst aktif | Butang Approve/Reject disorok / tidak aktif | **Lulus** |
| **AC-05** | Penguncian Audit Lock | Rekod berstatus Approved | Semua medan input dikunci (Read-Only) | **Lulus** |
| **AC-06** | Klon Versi (v1.0 $\rightarrow$ v2.0) | Klon rekod Approved v1.0 | Rekod v2.0 dicipta dalam status Draft tanpa mengubah v1.0 | **Lulus** |
| **AC-07** | Laporan PDF Sedia Audit | Klik butang Cetak/Eksport PDF | Susun atur cetakan format A4 dengan jadual dan blok tandatangan dua pihak | **Lulus** |
