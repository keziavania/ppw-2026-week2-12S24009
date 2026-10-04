# Refactoring Arsitektural Portofolio Web Minggu 04 (Decoupled Multi-Tier & Dynamic CSR)

* **Nama:** Kezia Vania Pasaribu
* **NIM:** 12S24009
* **Program Studi:** S1 Sistem Informasi
* **Mata Kuliah:** Pemrograman dan Pengujian Web (12S3101)
* **Dosen Pengampu:** Chandro Pardede, S.Kom., M.Sc.
* **Live Demo:** [https://keziavania.github.io/ppw-2026-week2-12S24009/](https://keziavania.github.io/ppw-2026-week2-12S24009/)

---

## 1. Diagram Arsitektur Sistem (C4 Container Model)

```mermaid
flowchart LR
    user(["<b>Pengunjung</b><br/>[Person]<br/>Melihat portofolio dan mengirim permintaan layanan"])

    subgraph client["Perangkat Pengunjung"]
        browser["<b>Web Browser</b><br/>[Container: HTML5, Bootstrap 5.3, JavaScript ES6+]<br/>Presentation Tier: index.html, app.js, api-service.js"]
        storage[("<b>localStorage</b><br/>[Container: Web Storage API]<br/>Riwayat pemesanan layanan")]
    end

    static["<b>Static Server</b><br/>[Container: GitHub Pages]<br/>Menyajikan HTML, CSS, JS, dan gambar"]
    json[("<b>JSON Data Providers</b><br/>[Container: data/*.json]<br/>projects.json, services.json, profile.json")]
    cdn["<b>CDN</b><br/>[Container: jsDelivr]<br/>Bootstrap 5.3 CSS/JS dan Bootstrap Icons"]
    api["<b>REST API</b><br/>[Container: JSONPlaceholder, mock]<br/>Endpoint POST /posts"]

    user -->|"Membuka halaman"| browser
    browser -->|"HTTPS GET: index.html, CSS, JS"| static
    browser -->|"fetch GET: data/*.json"| json
    static -->|"Hosting file statis"| json
    browser -->|"HTTPS GET: library Bootstrap"| cdn
    browser -->|"fetch POST: payload JSON (DTO)"| api
    browser -->|"Simpan dan baca riwayat"| storage
```

### Pemetaan Tiga Tier

| Tier | Komponen pada Proyek | Tanggung Jawab |
| :--- | :--- | :--- |
| **Presentation Tier** | `index.html`, `css/custom-style.css`, `js/app.js` | Merakit DOM, mengelola 4 UI state, filter kategori, modal, dan interaksi form. |
| **Application / API Logic Tier** | `js/api-service.js`, REST API tiruan (JSONPlaceholder) | Mengatur pemanggilan HTTP, penanganan error, dan kontrak data JSON. |
| **Data Storage Tier** | `data/*.json`, `localStorage` | Menyimpan data portofolio, katalog layanan, dan riwayat pemesanan sisi klien. |

### Narasi Separation of Concerns (SoC)

Pada Minggu 3, seluruh konten portofolio tertanam langsung di dalam `index.html`, sehingga satu berkas memegang struktur halaman, data proyek, isi modal, dan katalog layanan sekaligus. Kondisi ini membuat perubahan sekecil apa pun, misalnya mengganti deskripsi proyek, mengharuskan penyuntingan markup dan berisiko merusak tata letak. Pada Minggu 4, tanggung jawab tersebut dipisah menjadi tiga lapisan dengan batas yang jelas. Lapisan data berada di direktori `data/` sebagai tiga berkas JSON mandiri yang bertindak sebagai penyedia data tiruan bergaya RESTful. Lapisan akses data berada di `api-service.js`, yang hanya mengurus pemanggilan `fetch`, pengecekan status HTTP, dan pelemparan error tanpa menyentuh DOM. Lapisan presentasi berada di `app.js`, yang menerima data dari lapisan di bawahnya lalu merakit kartu, modal, dan riwayat pesanan di browser.

Pemisahan ini membawa beberapa manfaat. Pertama, data dapat diubah tanpa menyentuh kode tampilan, dan sebaliknya tampilan dapat didesain ulang tanpa menyentuh data. Kedua, `app.js` tidak perlu tahu dari mana data berasal, sehingga berkas JSON lokal kelak dapat diganti dengan API sungguhan hanya dengan mengubah `api-service.js`. Ketiga, setiap kegagalan jaringan ditangani di satu tempat dan diterjemahkan menjadi status antarmuka yang jelas bagi pengguna. Dari sisi pola rendering, aplikasi ini menganut Client-Side Rendering di atas hosting statis (mendekati Jamstack): server hanya mengirim HTML shell yang ringan, lalu browser mengambil data JSON secara asinkron dan merakit DOM sendiri. Konsekuensinya, beban komputasi server nyaris nol dan waktu respons awal sangat cepat, tetapi konten dinamis baru muncul setelah JavaScript selesai berjalan. Karena data JSON disuntikkan ke DOM, seluruh nilai dinamis disanitasi dengan fungsi `escapeHTML` atau `textContent` untuk mencegah serangan DOM-based XSS.

---

## 2. Tabel Komparasi: Sebelum vs Sesudah Refactoring

| Aspek Komparasi | Minggu 03 (Bootstrap 5.3 Statis) | Minggu 04 (Decoupled Multi-Tier & Dynamic CSR) |
| :--- | :--- | :--- |
| **Sumber Data** | Hardcoded di `index.html` (4 kartu dan 4 modal ditulis manual). | Tiga berkas JSON di `/data` (`projects.json`, `services.json`, `profile.json`). |
| **Pola Rendering** | Static HTML, seluruh konten sudah ada saat halaman dimuat. | Client-Side Rendering via `fetch()` dan `async/await`. |
| **Struktur Kode** | Satu berkas HTML dan satu berkas CSS. | Dipisah: `index.html` (shell), `css/`, `data/`, `js/api-service.js`, `js/app.js`. |
| **Status Antarmuka** | Tidak ada. | 4 UI state: Loading (spinner), Success, Empty, dan Error (alert). |
| **Filter Proyek** | Tidak ada. | Filter kategori instan tanpa reload halaman. |
| **Modal Detail** | 4 elemen modal terpisah di HTML. | 1 modal universal yang diisi dinamis berdasarkan ID proyek. |
| **Pengiriman Form** | `action="#"`, tidak terhubung ke layanan apa pun. | `fetch` POST asinkron dengan payload JSON, tanpa reload halaman. |
| **Umpan Balik Form** | Validasi visual bawaan saja. | Tombol kirim responsif, Bootstrap Toast, dan penanganan error. |
| **Penyimpanan Sisi Klien** | Tidak ada. | Riwayat pemesanan disimpan di `localStorage` dan ditampilkan lewat badge reaktif. |
| **Keamanan** | Konten statis, tidak ada risiko injeksi dinamis. | Sanitasi `escapeHTML` dan `textContent` untuk mencegah DOM-based XSS. |

---

## 3. Struktur Direktori

```text
ppw-2026-week2-12S24009/
├── index.html
├── profile.jpg
├── README.md
├── css/
│   └── custom-style.css
├── data/
│   ├── profile.json
│   ├── projects.json
│   └── services.json
└── js/
    ├── api-service.js
    └── app.js
```