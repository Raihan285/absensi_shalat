let model;

// Load model CNN TFJS
async function loadModel() {
  console.log("Memuat model...");
  try {
    model = await tf.loadLayersModel('CNN/model.json'); // ganti path ke model.json
    console.log('Model CNN berhasil dimuat');
  } catch (error) {
    console.error("Gagal memuat model:", error);
    alert("Gagal memuat model. Silakan coba lagi.");
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");
  const ambilGambarButton = document.getElementById("ambilGambarButton");
  const submitButton = document.getElementById("submitButton");
  const form = document.getElementById("absenForm");

  let fotoSiapKirim = ""; // untuk menyimpan foto yang akan dikirim

  // Aktifkan kamera
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      alert("Gagal mengakses kamera: " + err);
      console.error(err);
    });

  // Ambil gambar saat tombol diklik
  ambilGambarButton.addEventListener("click", async () => {
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    

    // loadModel();
    // --- CNN: prediksi Siswa / Bukan Siswa ---
    // if (!model) {
    //   alert("Model belum dimuat, silakan tunggu beberapa detik.");
    //   return;
    // }

    // const INPUT_SIZE = 100; // sesuaikan dengan model
    // let tfImg = tf.browser.fromPixels(canvas)
    //               .resizeNearestNeighbor([INPUT_SIZE, INPUT_SIZE])
    //               .toFloat()
    //               .expandDims(0);

    // try {
    //   const prediction = await model.predict(tfImg).data();
    //   const isSiswa = prediction[0] > prediction[1]; // [Siswa, Bukan Siswa]

    //   if (!isSiswa) {
    //     alert("Anda bukan siswa, absen dibatalkan.");
    //     return; // hentikan proses preview & kirim
    //   }
    // } catch (err) {
    //   console.error("Error prediksi CNN:", err);
    //   alert("Terjadi kesalahan saat memprediksi gambar.");
    //   return;
    // }

    // Ambil data URL dari canvas
    fotoSiapKirim = canvas.toDataURL("image/png");

    // Sinkronisasi ukuran preview dengan elemen video di layar
    const videoDisplayWidth = video.offsetWidth;
    const videoDisplayHeight = video.offsetHeight;

    preview.src = fotoSiapKirim;
    preview.style.display = "block";
    preview.style.width = videoDisplayWidth + "px";
    preview.style.height = videoDisplayHeight + "px";
    preview.style.objectFit = "cover";
    preview.style.transform = "scaleX(-1)"; // mirror effect

    submitButton.style.display = "block";
  });

  // Kirim data absensi ke Firebase
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = document.getElementById("token").value.trim();
    const status = document.getElementById("status").value;

    if (!token) {
      alert("Token harus diisi.");
      return;
    }
    if (!fotoSiapKirim) {
      alert("Silakan ambil gambar terlebih dahulu.");
      return;
    }

    try {
      const timestamp = new Date().toLocaleString("id-ID");
      await firebase.firestore().collection("absensi").add({
        token,
        status,
        gambar: fotoSiapKirim, // kirim foto preview
        waktu: timestamp
      });

      alert("Absen berhasil dikirim.");
      form.reset();
      preview.style.display = "none";
      submitButton.style.display = "none";
      fotoSiapKirim = "";
    } catch (err) {
      console.error("Gagal menyimpan absen:", err);
      alert("Gagal menyimpan absen.");
    }
  });

  window.ambilGambarDariKamera = function() {
    return canvas.toDataURL("image/png");
  };
});
