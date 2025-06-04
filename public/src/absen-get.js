document.getElementById('absenForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  showLoading();
  const nis = parseInt(document.getElementById('nis').value);
  const status = document.getElementById('status').value;
  const tanggal = new Date();
  const formattedTanggal = `${tanggal.getDate().toString().padStart(2, '0')}-${(tanggal.getMonth() + 1).toString().padStart(2, '0')}-${tanggal.getFullYear()}`;

  const imageBase64 = ambilGambarDariKamera();

  if (!navigator.geolocation) {
    alert("Browser tidak mendukung lokasi!");
    hideLoading();
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // ✅ Lokasi sebagai URL Google Maps
    const lokasi = `https://www.google.com/maps?q=${latitude},${longitude}`;

    try {
      document.getElementById("preview").src = imageBase64;

      // ✅ Upload gambar ke Cloudinary
      const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dqoo5xojd/image/upload";
      const uploadPreset = "absenImage";

      const formData = new FormData();
      formData.append("file", imageBase64);
      formData.append("upload_preset", uploadPreset);

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) throw new Error("Gagal upload gambar ke Cloudinary");

      const cloudinaryData = await uploadResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      // ✅ Ambil data siswa dari Firestore
      const siswaDoc = await db.collection("siswa").doc(String(nis)).get();

      if (!siswaDoc.exists) {
        alert("Siswa tidak ditemukan!");
        return;
      }

      const siswaData = siswaDoc.data();

      // ✅ Simpan data absensi ke Firestore
      await db.collection("absen").doc(`${formattedTanggal}_${nis}`).set({
        siswaNis: nis,
        nama: siswaData.nama,
        kelas: siswaData.kelas,
        tanggal: formattedTanggal,
        lokasi: lokasi, // URL Google Maps
        status: status,
        foto: imageUrl
      });

      alert("Absen berhasil dikirim!");
      document.getElementById('absenForm').reset();
    } catch (err) {
      console.error("Gagal absen:", err);
      alert("Gagal mengirim absen.");
    } finally {
      hideLoading();
    }
  }, (error) => {
    alert("Gagal mengambil lokasi: " + error.message);
    hideLoading();
  });
});
