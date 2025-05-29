document.getElementById('absenForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nis = parseInt(document.getElementById('nis').value);
  const lokasi = document.getElementById('lokasi').value.trim();
  const status = document.getElementById('status').value;
  const tanggal = new Date();

  // Format tanggal ke DD-MM-YYYY
  const formattedTanggal = `${tanggal.getDate().toString().padStart(2, '0')}-${(tanggal.getMonth() + 1).toString().padStart(2, '0')}-${tanggal.getFullYear()}`;

  try {
    // Ambil data siswa
    const siswaDoc = await db.collection("siswa").doc(String(nis)).get();

    if (!siswaDoc.exists) {
      alert("Siswa tidak ditemukan!");
      return;
    }

    const siswaData = siswaDoc.data();

    // Simpan absen, dokumen unik per hari dan nis
    await db.collection("absen").doc(`${formattedTanggal}_${nis}`).set({
      siswaNis: nis,
      nama: siswaData.nama,
      kelas: siswaData.kelas,
      tanggal: formattedTanggal,
      lokasi: lokasi,
      status: status,
    });

    alert("Absen berhasil dikirim!");
    document.getElementById('absenForm').reset();
  } catch (err) {
    console.error("Gagal absen:", err);
    alert("Gagal mengirim absen.");
  }
});
