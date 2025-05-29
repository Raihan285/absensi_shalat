const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const kirimButton = document.getElementById("kirimButton");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Gagal mengakses kamera:", err);
  });

kirimButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const nis = document.getElementById("nis").value;
  const status = document.getElementById("status").value;
  const imageData = canvas.toDataURL("image/png");

  // Kirim ke database/server jika diperlukan
  console.log("NIS:", nis);
  console.log("Status:", status);
  console.log("Foto base64:", imageData);

 
});
