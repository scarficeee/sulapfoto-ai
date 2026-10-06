# SulapFoto landing page

```
sulapfoto/
├── index.html      markup, SEO meta, JSON-LD
├── css/style.css   semua styling (tokens, sections, motion, responsive)
└── js/main.js      interaksi + CONFIG (link Lynk.id & sosmed)
```

Sebelum launch:
1. `js/main.js` → `CONFIG.links` dan `CONFIG.social` (semua tombol CTA ikut otomatis)
2. `index.html` → ganti `YOURDOMAIN.com` (canonical, og:url, og:image) dan JSON-LD
3. `index.html` → testimonial masih CONTOH (cari `SAMPLE COPY`), ganti dengan review asli
4. Foto before/after masih foto contoh Pexels/Unsplash, ganti dengan hasil asli
5. Footer: isi halaman Terms & Privacy

Buka lewat Live Server di VS Code (klik kanan index.html → Open with Live Server).
