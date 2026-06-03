OpenJob API & Consumer App
Proyek ini adalah implementasi dari OpenJob API versi 2 yang telah dipisah menjadi dua layanan independen: API Service dan Consumer Service, yang berkomunikasi menggunakan RabbitMQ.

Struktur Proyek
Plaintext
/submission
├── openjob_api/          # Layanan API (Producer)
└── openjob_consumer/     # Layanan Consumer (Worker)
Prasyarat
Node.js (v18+)

PostgreSQL

Redis

RabbitMQ

Cara Menjalankan
1. Persiapan Database
Pastikan PostgreSQL sudah berjalan dan buat database dengan nama openjob_db.

2. Menjalankan API Service
Masuk ke folder API:

Bash
cd openjob_api
Salin .env.example ke .env dan sesuaikan konfigurasinya:

Bash
cp .env.example .env
Install dependencies:

Bash
npm install
Jalankan migrasi database:

Bash
npm run migrate up
Jalankan server:

Bash
npm run start:dev
3. Menjalankan Consumer Service
Buka terminal baru, masuk ke folder consumer:

Bash
cd openjob_consumer
Salin .env.example ke .env dan sesuaikan kredensial email (Nodemailer) & RabbitMQ:

Bash
cp .env.example .env
Install dependencies:

Bash
npm install
Jalankan consumer:

Bash
npm start
Fitur Utama
Authentication: JWT Based Auth.

Caching: Menggunakan Redis untuk endpoint perusahaan/lowongan.

Message Queue: Menggunakan RabbitMQ untuk menangani notifikasi email secara asynchronous.

Email Notification: Menggunakan Nodemailer untuk mengirim email ke pemilik lowongan saat ada pelamar baru.