# Ruang Elektronik

Toko elektronik full-stack untuk belajar React dan Next.js. UI berjalan di React, sedangkan API produk dan pesanan berjalan di Next.js Route Handlers.

## 1. Siapkan aplikasi

Prasyarat: Node.js 20.9 atau lebih baru dan npm.

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Buka `http://localhost:3000`.

`db:setup` membuat Prisma Client, menyinkronkan tabel SQLite, lalu mengisi katalog contoh. Database tersimpan lokal di `prisma/dev.db`.

## 2. Pahami alurnya

- `src/app/page.js`: komponen React untuk katalog, filter, keranjang, dan checkout.
- `src/app/api/products/route.js`: `GET /api/products` membaca katalog dari database.
- `src/app/api/orders/route.js`: `POST /api/orders` memvalidasi checkout, menghitung total dari harga di server, lalu mengurangi stok dan menyimpan pesanan dalam satu transaksi.
- `prisma/schema.prisma`: bentuk tabel `Product`, `Order`, dan `OrderItem`.
- `prisma/seed.js`: data produk awal yang aman dijalankan berulang.
- `src/lib/prisma.js`: satu Prisma Client bersama saat development hot reload.

Harga disimpan sebagai bilangan bulat rupiah. Keranjang masih berada di state browser; pesanan yang dikirim checkout tersimpan di SQLite.

## 3. Database lokal dan Git

SQLite cocok untuk latihan karena tidak memerlukan server atau Docker. Variabel koneksi ada di `.env.local`; database dan journal SQLite di-ignore oleh Git. Jangan commit file `.env.local` atau `prisma/dev.db`.

Untuk membuka database lokal, gunakan **DB Browser for SQLite** atau **DBeaver Community**. Saat aplikasi siap dipakai banyak pengguna atau di-deploy, gunakan PostgreSQL terkelola seperti **Supabase**; ubah provider Prisma dan connection string, lalu jalankan migrasi untuk lingkungan production.

## Perintah berguna

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run lint
npm run build
```

`db:push` praktis untuk belajar secara lokal. Setelah skema mulai stabil, pelajari `prisma migrate dev` dan gunakan migrasi yang sama saat deploy.
