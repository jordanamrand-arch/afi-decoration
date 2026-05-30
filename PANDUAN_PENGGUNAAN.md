# 📖 Panduan Penggunaan Aplikasi AFI Decoration

Selamat datang di sistem manajemen operasional AFI Decoration! Aplikasi ini dirancang khusus untuk mempermudah Anda dalam mengelola inventaris stok, pencatatan transaksi kas, manajemen booking acara (wedding & event), hingga pemantauan laba rugi.

Berikut adalah panduan lengkap untuk menggunakan seluruh fitur yang ada di dalam aplikasi.

---

## 1. Dashboard (Dasbor Utama)
**Fungsi:** Memantau ringkasan performa bisnis secara *real-time*.
- **Summary Cards (Kartu Ringkasan):**
  - **Total Omset**: Total seluruh uang pemasukan yang masuk (diambil dari arus kas). Lengkap dengan indikator persentase tren pertumbuhan (bulan ini vs bulan lalu).
  - **Total Piutang**: Total sisa pembayaran klien yang belum lunas dari seluruh booking aktif. Lengkap dengan persentase tren pertumbuhan.
  - **Sisa Kas**: Saldo uang kas murni yang ada saat ini (Pemasukan - Pengeluaran).
  - **Laba Kotor**: Total Pemasukan dikurangi Biaya Langsung (Pembelian stok/barang & Transportasi event).
  - **Laba Bersih**: Laba Kotor dikurangi Biaya Operasional (Gaji, Operasional harian, dan biaya lainnya).
- **Log Aktivitas**: Melihat riwayat terbaru dari semua tindakan di aplikasi (seperti "Booking Baru", "Pengeluaran", "Update Kondisi Stok").
- **Agenda Terdekat**: Menampilkan jadwal acara/event klien yang paling dekat dengan hari ini, beserta status *countdown* (berapa hari lagi acara dimulai).

---

## 2. Menu Booking
**Fungsi:** Mengelola data penyewaan atau pemesanan acara dari klien.
- **Tambah Booking Baru**: Catat data klien (nama, kontak), detail acara (tanggal, venue), dan pilih apakah mereka menyewa "Paket" atau "Item Lepasan (Mix)".
- **Penagihan & Pembayaran**: Saat membuat booking, Anda dapat memasukkan nilai DP yang dibayarkan. Sistem otomatis akan menghitung *Sisa Bayar* dan mencatat DP tersebut ke dalam **Arus Kas** sebagai *Pemasukan*.
- **Status Booking**: Booking bisa berstatus *Pending*, *Confirmed*, *Lunas*, atau *Batal*.
- **Cetak Invoice**: Anda dapat menekan tombol cetak pada setiap booking untuk menghasilkan dan mencetak Invoice digital yang terlihat profesional untuk diserahkan ke klien.

---

## 3. Manajemen Stok
**Fungsi:** Mengelola aset dekorasi (tenda, kursi, pelaminan, lampu, dll) dan merangkai paket sewa.
- **Daftar Stok (Item)**: 
  - Tambahkan barang baru dengan nama, kategori, jumlah total, dan harga sewa.
  - **Update Kondisi**: Ubah kondisi barang menjadi *Baik*, *Perbaikan*, atau *Rusak*. Ini sangat penting untuk memantau kelayakan aset Anda setelah disewa.
- **Paket Sewa (Package)**:
  - Rangkai beberapa item stok menjadi satu paket utuh (misal: "Paket Intimate Garden" yang berisi 1 Tenda, 50 Kursi, dan 1 Pelaminan).
  - Harga paket bisa disesuaikan secara grosir (Harga Base) tanpa harus menjumlahkan harga satuan item.

---

## 4. Arus Kas (Cash Flow)
**Fungsi:** Mencatat seluruh transaksi masuk dan keluar uang secara detail dan transparan.
- **Catat Pemasukan (Inflow)**: Uang masuk, bisa dikategorikan sebagai DP, Pelunasan, atau Sewa.
- **Catat Pengeluaran (Outflow)**: Uang keluar untuk operasional. Ada pembagian kategori penting:
  - *Pemotong Laba Kotor (HPP/Biaya Langsung)*: Pilih kategori **Pembelian** atau **Transport** jika pengeluaran berhubungan langsung dengan pengadaan barang event.
  - *Pemotong Laba Bersih (Beban Operasional)*: Pilih kategori **Gaji**, **Operasional**, atau **Lainnya** untuk pengeluaran rutin yang tidak langsung terkait dengan satu event spesifik.
- **Filter & Cari**: Temukan transaksi lampau dengan mudah melalui kolom pencarian atau filter tipe transaksi (Pemasukan/Pengeluaran).

---

## 5. Fitur Sinkronisasi Cloud (Supabase)
**Fungsi:** Mengamankan data Anda agar tidak hilang dan bisa diakses dari berbagai perangkat (Real-time).
- Di pojok kiri bawah (bagian *footer sidebar*), terdapat indikator status koneksi ke *database cloud*.
- Jika indikator berwarna **Hijau (Terhubung)**: Data Anda aman dan tersinkronisasi otomatis secara online.
- Jika indikator berwarna **Merah/Abu-abu (Offline)**: Anda kehilangan koneksi internet atau ada masalah server. *Jangan khawatir*, Anda tetap bisa menambah atau mengedit data (sistem akan otomatis menyimpannya di memori lokal peramban Anda/Cache). Begitu internet kembali online, sistem akan otomatis melakukan *Push* data ke server.
- **Setup Wizard**: Jika Anda baru pertama kali mengatur database, aplikasi akan memberikan tombol *Salin SQL Script* yang bisa Anda letakkan di platform Supabase Anda.

---

## Tips & Trik Penggunaan Terbaik
1. **Biasakan Catat Detail**: Semakin rinci Anda memilih kategori saat mencatat *Arus Kas*, semakin akurat pula perhitungan Laba Kotor dan Laba Bersih di Dashboard Anda.
2. **Perbarui Status Kondisi**: Jangan lupa memindahkan kondisi stok (misal *Gate Entrance Bunga* menjadi *Perbaikan*) agar Anda tidak salah menyewakan barang yang sedang rusak ke klien berikutnya.
3. **Proteksi Data Dummy**: Jika Anda menghapus semua booking Anda dari sistem, aplikasi tidak akan lagi mengisi ulang dengan data dummy (karena data dummy hanya digunakan untuk tahap inisialisasi awal aplikasi). Anda memiliki kanvas kosong (clean slate) seutuhnya.

*(Panduan ini dapat diperbarui sewaktu-waktu seiring dengan bertambahnya fitur aplikasi.)*
