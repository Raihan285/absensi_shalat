const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Gagal mengakses kamera:", err);
  });

// Fungsi untuk mengambil gambar dari video
function ambilGambarDariKamera() {
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

// Ekspor fungsi agar bisa dipakai di file lain
window.ambilGambarDariKamera = ambilGambarDariKamera;
