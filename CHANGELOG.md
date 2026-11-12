# Rekod Perubahan (Changelog)

Semua perubahan penting pada projek **LabMU Pro** akan direkodkan dalam fail ini mengikut format [Keep a Changelog](https://keepachangelog.com/).

---

## [1.1.0] - 2026-11-12

### Ditambah & Dipertingkat (UI/UX Redesign)
- **Arah Reka Bentuk Metrologi Klinikal:** Antara muka diperbaharui dengan konsep *"Clinical Metrology & Precision Laboratory Instrumentation"*.
- **Disiplin Zero-Pill:** Menghapuskan kapsul pil hiasan berwarna-warni dan menggantikannya dengan teks unboxed berpemisah tipografi (`·` dan `/`) serta glif semantik.
- **Jalur Telemetri Bersepadu:** Menggantikan kad-kad KPI berasingan dengan bar telemetri satu baris yang padat untuk metrik jumlah, kelulusan, dan draf.
- **Jadual Lejar Metrologi Padat:** Jadual Type B dan siri replikasi Type A diperkemas menyerupai hamparan lejar makmal profesional.
- **Angka Tabular (*Tabular Numerals*):** Menetapkan font `JetBrains Mono` dan kelas `tabular-nums` pada semua nilai angka ketakpastian untuk penjajaran perpuluhan yang tepat.
- **Ribon Ujian Pantas Kriteria Penerimaan:** Memasukkan butang ujian pantas AC-01, AC-02, dan AC-03 ke dalam bar alat mini padat di atas borang pengiraan.
- **Pengepala Standard (*Top Bar Contract*):** Suis peranan diringkaskan kepada *segmented control* kemas tanpa animasi berkelip atau teks penerangan berlebihan.

---

## [1.0.0] - 2026-11-12

### Ciri-Ciri Awal (MVP Release)
- **Enjin Kimia EURACHEM:** Pengiraan kebolehulangan Type A ($n \ge 2$) dan komponen Type B mengikut taburan Normal ($k=1, k=2$), Rectangular ($\sqrt{3}$), dan Triangular ($\sqrt{6}$).
- **Enjin Biologi ISO 19036:** Transformasi $\log_{10}$ bagi kiraan CFU koloni bakteria dan pengiraan ketakpastian gabungan $u_{biol} = \sqrt{s_R^2 + u_{mat}^2 + u_{inc}^2}$.
- **Pengendalian Koloni Sifar:** Amaran nasihat batas pengesanan (*LOD Advisory*) apabila nilai 0 CFU dikesan bagi mengelakkan ralat matematik.
- **Carta Sumbangan Varians:** Pecahan peratusan varians dinamik $(u_i^2 / u_c^2 \times 100)$ dengan pengesanan punca varians dominan.
- **Simulasi Dua Peranan:** Pengasingan kuasa antara *Analyst* (penyedia) dan *Technical Manager* (pelulus).
- **Aliran Kelulusan & Audit Lock:** Rekod diluluskan dikunci menjadi *Read-Only* bagi mematuhi audit ISO/IEC 17025.
- **Klon Versi (v1.0 $\rightarrow$ v2.0):** Fungsi menaik taraf kaedah berstatus *Approved* ke versi baharu tanpa mengubah rekod asal.
- **Laporan Rasmi Format A4:** Susun atur cetakan dokumen sedia audit lengkap dengan jadual komponen, ringkasan keputusan, dan blok tandatangan dua pihak.
- **Templat Pratetap Makmal:** 4 set data kaedah piawai (Plumbum Air, Titratan Asid Asetik, TVC Makanan, dan E. coli).
- **Sandaran & Pemulihan JSON:** Eksport dan import keseluruhan pangkalan data pelayar ke fail `.json`.
