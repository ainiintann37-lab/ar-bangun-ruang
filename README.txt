=== PETUNJUK MEMBUAT MARKER AR ===

Aplikasi ini menggunakan MindAR Image Targets. Anda HARUS membuat
file marker (.mind) dari 5 gambar.

LANGKAH:

1. Siapkan 5 gambar JPG/PNG dengan pola unik dan kontras tinggi:
   - kubus.png   (contoh: tulisan "KUBUS" + gambar kubus)
   - balok.png
   - tabung.png
   - kerucut.png
   - bola.png

2. Buka: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
   di browser desktop (Chrome/Firefox).

3. Upload KELIMA file dengan URUTAN PERSIS:
   1) kubus.png
   2) balok.png
   3) tabung.png
   4) kerucut.png
   5) bola.png
   (Urutan ini penting karena kode memakai index 0..4)

4. Klik "Start" → tunggu → klik "Download". Hasilnya "targets.mind".

5. Taruh file "targets.mind" di folder ini (markers/).

6. Cetak kelima gambar marker di kertas (minimal 10x10 cm).

CATATAN:
- File targets.mind harus dibuat sendiri karena berbentuk biner.
- Tanpa file ini, kamera akan terbuka tapi objek 3D tidak muncul.