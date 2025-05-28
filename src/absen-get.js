

document.getElementById('absenForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nis = parseInt(document.getElementById('nis').value);
    const lokasi = document.getElementById('lokasi').value;
    const status = document.getElementById('status').value;
    const tanggal = new Date().toISOString().split('T')[0];

    try {
      // Cari data siswa dulu
      const siswaDoc = await db.collection("siswa").doc(String(nis)).get();

      if (!siswaDoc.exists) {
        alert("Siswa tidak ditemukan!");
        return;
      }

      const siswaData = siswaDoc.data();

      await db.collection("absen").doc(`${tanggal}_${nis}`).set({
        siswaNis: nis,
        nama: siswaData.nama,
        kelas: siswaData.kelas,
        tanggal: tanggal,
        lokasi: lokasi,
        status: status
      });

      alert("Absen berhasil dikirim!");
    } catch (err) {
      console.error("Gagal absen:", err);
      alert("Gagal mengirim absen.");
    }
  });