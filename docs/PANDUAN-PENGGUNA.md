# Panduan Pengguna LabMU Pro

Panduan ini menerangkan cara menggunakan aplikasi **LabMU Pro** langkah demi langkah untuk juruanalisis makmal dan pengurus teknikal.

---

## 1. Pilihan Peranan Pengguna (Role Switcher)

Aplikasi ini mempunyai simulasi dua peranan bagi mematuhi prinsip pengasingan kuasa ISO/IEC 17025. Anda boleh menukar peranan pada bila-bila masa menggunakan butang togol di sudut kanan atas:

- **Peranan Analyst (Ahmad):**
  - Digunakan untuk membina draf baharu.
  - Memasukkan data replikasi mentah dan komponen Type B.
  - Menghantar rekod untuk semakan pengurus.
  - *Sekatan:* Analyst tidak dibenarkan meluluskan atau menolak rekod sendiri.
- **Peranan Manager (Dr. Siti):**
  - Digunakan untuk menyemak perincian bajet yang dihantar.
  - Meluluskan (*Approve*) atau menolak (*Reject*) berserta ulasan pembetulan.
  - Menjana dan mencetak laporan bersijil rasmi.
  - *Sekatan:* Manager tidak boleh menyunting data draf secara langsung (data mesti disediakan oleh juruanalisis).

---

## 2. Cara Membina Bajet Baharu (Sebagai Analyst)

### Pilihan A: Menggunakan Templat Pratetap (Disyorkan)
1. Pastikan peranan semasa ialah **Analyst**.
2. Klik butang **"Templat Pratetap"** di bahagian atas papan pemuka.
3. Pilih salah satu daripada 4 templat makmal yang tersedia:
   - *Penentuan Plumbum (Pb) dalam Air Minuman* (Kimia - ICP-MS)
   - *Penentuan Kepekatan Asid Asetik Melalui Titratan* (Kimia - Titratan)
   - *Pengiraan Jumlah Bakteria Aerobik TVC* (Biologi - ISO 19036)
   - *Penghitungan Escherichia coli dalam Sampel Makanan* (Biologi - ISO 19036)
4. Sistem akan membuka editor dengan data konfigurasi awal sedia ada.

### Pilihan B: Membina Draf dari Mula
1. Klik butang **"Bina Bajet Baharu"**.
2. Isikan metadata kaedah pengujian:
   - **Nama Kaedah / Parameter:** Contohnya *Penentuan Zink (Zn) dalam Air*.
   - **Kod SOP:** Contohnya *SOP-CH-055*.
   - **Kategori:** Pilih sama ada **Kimia** atau **Biologi**.
   - **Matriks Sampel:** Contohnya *Air Sungai*.
   - **Unit Pengukuran:** Contohnya *mg/L* atau *µg/g*.

---

## 3. Memasukkan Data Pengiraan

### A. Mod Kimia (EURACHEM / CITAC)

#### 1. Komponen Type A (Replikasi Ujian)
- Tandakan kotak semak **"Gunakan Type A"**.
- Masukkan nilai bacaan satu demi satu ke dalam medan teks dan klik **"+ Tambah"** (atau tekan `Enter`).
- *Syarat Pengesahan:* Anda mesti memasukkan sekurang-kurangnya **2 bacaan** ($n \ge 2$) supaya sisihan piawai ($s$) dan ketakpastian Type A ($u_A$) dapat dikira secara sah.

#### 2. Komponen Type B (Sijil Kalibrasi & Had Peralatan)
- Gunakan butang pratetap pantas:
  - **+ Neraca:** Menambah penentukuran neraca analitikal (Taburan Normal $k=2$, pembahagi 2.0).
  - **+ Pipet:** Menambah had toleransi pengeluar mikropipet (Taburan Rectangular, pembahagi $\sqrt{3} \approx 1.7321$).
  - **+ CRM:** Menambah sijil bahan rujukan piawai (Taburan Normal $k=2$, pembahagi 2.0).
  - **+ Kelalang:** Menambah kesan suhu kelalang volumetrik Kelas A (Taburan Triangular, pembahagi $\sqrt{6} \approx 2.4495$).
- Anda juga boleh klik **"Tambah Baris Komponen Type B"** untuk menambah komponen tersuai.

---

### B. Mod Biologi & Mikrobiologi (ISO 19036)
1. Masukkan bacaan koloni koloni bakteria (**CFU/g** atau **CFU/mL**).
2. Sistem akan menukar nombor tersebut secara automatik kepada nilai $\log_{10}$ (contohnya: $2400\text{ CFU} \rightarrow 3.38\text{ log}_{10}$).
3. Masukkan parameter ketakpastian ISO 19036:
   - **sR:** Sisihan piawai kebolehulangan makmal.
   - **uMat:** Ketakpastian heterogeniti matriks sampel (kebiasaannya 0.01 hingga 0.05).
   - **uInc:** Ketakpastian variasi suhu pengeraman inkubator (kebiasaannya 0.01 hingga 0.02).

*Peringatan Koloni Sifar:* Sekiranya bacaan 0 CFU dimasukkan, amaran *Limit of Detection (LOD)* akan dipaparkan. Sistem mengesyorkan nilai batas pengesanan bagi mengelakkan ralat $\log_{10}(0)$ yang tidak tertakrif.

---

## 4. Memeriksa Keputusan & Carta Varians
Sebelum menghantar bajet, perhatikan dua kotak ringkasan:
- **Keputusan Ketakpastian:** Memaparkan nilai ketakpastian gabungan ($u_c$), faktor liputan ($k = 2$), dan ketakpastian diperluas ($U = u_c \times 2$) bersama format pelaporan rasmi ISO/IEC 17025.
- **Sumbangan Varians (%):** Menunjukkan komponen mana yang menjadi punca varians terbesar. Komponen dengan sumbangan lebih daripada 35% akan dilabelkan sebagai **"Dominant"**.

---

## 5. Aliran Semakan & Kelulusan (Workflow)

```
[ DRAF ] ──(Analyst hantar)──> [ MENUNGGU KELULUSAN ]
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
                 [ DILULUSKAN ]              [ PERLU PEMBETULAN ]
                 (Audit Locked)             (Analyst betulkan & hantar semula)
```

1. **Analyst:** Klik **"Hantar Semakan"**. Status bertukar kepada `Menunggu Kelulusan`.
2. **Manager:**
   - Tukar peranan ke **Manager**.
   - Buka rekod berkenaan dan klik **"Semak"**.
   - Sekiranya berpuas hati, klik **"Luluskan (Approve)"**. Status bertukar kepada `Diluluskan` dan rekod dikunci (*Audit Lock*).
   - Sekiranya terdapat kesilapan, klik **"Tolak (Reject)"** dan taip sebab penolakan. Status bertukar kepada `Perlu Pembetulan`.
3. **Analyst (jika ditolak):**
   - Buka semula rekod, baca ulasan semakan pengurus, buat pembetulan yang diminta, dan klik **"Hantar Semakan"** sekali lagi.

---

## 6. Menaik Taraf Versi (Version Upgrade)
Apabila peralatan makmal menerima sijil kalibrasi baharu pada masa hadapan:
1. Buka rekod yang telah berstatus **Diluluskan** (contohnya v1.0).
2. Klik butang **"Klon ke v2.0"**.
3. Sistem akan menghasilkan salinan pendua baharu berstatus **Draf** dengan nombor versi bertambah (v2.0) dan mengekalkan rujukan rekod asal.
4. Kemas kini data kalibrasi baharu dan hantar semula untuk kelulusan.

---

## 7. Cetakan & Eksport Laporan Rasmi A4
1. Buka mana-mana rekod bajet.
2. Klik butang **"Laporan A4"** di sudut atas.
3. Paparan dokumen rasmi akan dibuka.
4. Klik butang **"Cetak / Eksport PDF"** (atau tekan `Ctrl+P`).
5. Pada tetingkap cetakan pelayar:
   - Pilih *Destination:* **Save as PDF** atau pencetak fizikal.
   - Tetapkan saiz kertas kepada **A4**.
   - Pastikan pilihan *Background graphics* ditandakan.
6. Laporan siap dicetak bersama blok tandatangan dua pihak.

---

## 8. Sandaran & Pemulihan Data (Backup & Restore)
- **Eksport Sandaran:** Klik butang **"Sandaran"** pada bar navigasi atas. Fail `LabMU_Pro_Backup_YYYY-MM-DD.json` akan dimuat turun secara automatik.
- **Pulihkan Data:** Klik butang **"Pulihkan"** dan pilih fail `.json` sandaran yang sah.
- **Set Semula Contoh:** Klik butang ikon bulat putar jika anda ingin memulihkan semula data kepada set data contoh makmal asal.
