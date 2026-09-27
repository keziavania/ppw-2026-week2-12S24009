# Refactoring Portofolio Web Minggu 03 (Bootstrap 5.3 Integration)

* **Nama:** Kezia Vania Pasaribu
* **NIM:** 12S24009
* **Program Studi:** S1 Sistem Informasi
* **Mata Kuliah:** Pemrograman dan Pengujian Web (12S3101)
* **Dosen Pengampu:** Chandro Pardede, S.Kom., M.Sc.
* **Live Demo:** [https://keziavania.github.io/ppw-2026-week2-12S24009/](https://keziavania.github.io/ppw-2026-week2-12S24009/)

---

## Tabel Komparasi: Sebelum vs Sesudah Integrasi Framework

| Aspek Komparasi | Minggu 02 (Pure HTML5 & Custom CSS) | Minggu 03 (Bootstrap 5.3 + Custom Overrides) |
| :--- | :--- | :--- |
| **Grid System & Layout** | Flexbox & CSS Grid manual, breakpoint manual `@media`. | Bootstrap 12-Column Responsive Grid (`container`, `row`, `col-md-*`). |
| **Navigasi Mobile** | Navigasi membungkus vertikal statis tanpa toggle. | Responsive Navbar dengan tombol hamburger `collapse` via Bootstrap JS. |
| **Komponen Kartu & Detail** | Tabel statis data portofolio. | Card Grid interaktif terintegrasi dengan 4 Bootstrap Modal Dialog detail proyek. |
| **Formulir Interaktif** | Label teks konvensional dan validasi HTML5 bawaan browser. | Bootstrap Floating Labels (`.form-floating`), Input Groups berikon, dan Feedback Validasi Visual. |
| **Komponen Ikon** | Entitas karakter HTML Unicode. | Paket resmi Bootstrap Icons CDN (`bi-*`). |
| **Spesifisitas & CSS Variables** | CSS kustom murni. | Arsitektur `:root` ($\ge 6$ variabel) dengan custom overrides tanpa deklarasi `!important`. |