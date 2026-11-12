# Panduan Pemasangan & Penyelenggaraan (Setup & Maintenance)

Panduan ini ditujukan kepada jurutera perisian atau pentadbir IT makmal yang ingin memasang, menjalankan, membina, dan menyelenggara kod sumber **LabMU Pro**.

---

## 1. Keperluan Sistem (Prerequisites)

Sebelum memulakan, pastikan komputer anda mempunyai perisian berikut:
- **Node.js:** Versi 18.x, 20.x, atau lebih baharu.
- **npm:** Versi 9.x atau lebih baharu (disertakan bersama pemasangan Node.js).
- **Pelayar Web Moden:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau Apple Safari dengan JavaScript aktif.

---

## 2. Langkah Pemasangan & Menjalankan Projek

### Langkah 1: Klon atau Muat Turun Kod Sumber
```bash
git clone https://github.com/USERNAME/labmu-pro.git
cd labmu-pro
```

### Langkah 2: Pasang Ketergantungan (Install Dependencies)
Jalankan arahan berikut di terminal untuk memasang semua pustaka yang diperlukan:
```bash
npm install
```

### Langkah 3: Menjalankan Pelayan Pembangunan (Run Dev Server)
Jalankan arahan berikut untuk memulakan pelayan tempatan:
```bash
npm run dev
```
Selepas arahan berjaya dijalankan, buka pelayar web anda di alamat:
```
http://localhost:3000
```
*(atau port yang dipaparkan di terminal anda).*

---

## 3. Membina Versi Pengeluaran (Production Build)

Untuk menghasilkan kod yang dioptimumkan bagi pelayan pengeluaran (*production web hosting*):
```bash
npm run build
```
Hasil binaan akan disimpan di dalam folder `/dist`. Folder ini mengandungi fail HTML, JavaScript, dan CSS statik yang boleh dihoskan pada mana-mana pelayan web (contohnya Nginx, Apache, Cloudflare Pages, atau Cloud Run).

Untuk menguji binaan pengeluaran secara tempatan:
```bash
npm run preview
```

---

## 4. Semakan Kualiti Kod (Linting & Verification)

Untuk memastikan tiada ralat sintaks, jenis data (*type errors*), atau masalah import:
```bash
npm run lint
```
Arahan ini menjalankan penyusun TypeScript (`tsc --noEmit`) untuk mengesahkan integriti keseluruhan fail kod sumber.

---

## 5. Konfigurasi Pemboleh Ubah Persekitaran (Environment Variables)

Fail `.env.example` disediakan dalam direktori utama sebagai panduan:
```bash
# GEMINI_API_KEY: Pilihan (hanya jika modul AI diperlukan pada masa hadapan)
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: Alamat URL aplikasi dihoskan
APP_URL="MY_APP_URL"
```
*Nota Penting:* Untuk fungsi semasa LabMU Pro (pengiraan matematik EURACHEM dan ISO 19036), **tiada kunci API persendirian atau token rahsia diperlukan**. Semua pengiraan berjalan sepenuhnya pada pelayar klien.

---

## 6. Penyelesaian Masalah Biasa (Troubleshooting)

1. **Ralat `port 3000 in use`:**
   - *Punca:* Aplikasi lain sedang menggunakan port 3000.
   - *Penyelesaian:* Hentikan aplikasi berkenaan atau jalankan Vite dengan menentukan port lain: `npx vite --port 3001`.
2. **Ralat Jenis Data TypeScript (`Type error`):**
   - *Penyelesaian:* Jalankan `npm run lint` untuk mengenal pasti fail dan nombor baris ralat. Pastikan versi dependencies sepadan dengan fail `package.json`.
3. **Data Tidak Dikemas Kini Selepas Pindaan Kod:**
   - *Punca:* Pelayar menyimpan data lama di dalam `localStorage`.
   - *Penyelesaian:* Buka aplikasi dan klik butang **"Set Semula Data Contoh"** di bar navigasi atas, atau kosongkan cache pelayar anda.
