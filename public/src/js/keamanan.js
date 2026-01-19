const user = JSON.parse(localStorage.getItem("siswa"));

// Cek apakah user login dan nama admin
(async () => {
  if (!user) {
    // Bukan user→ redirect ke index.html
    if(confirm("lanjut Mode tamu?, fitur terbatas.")){
        // Lanjutkan sebagai tamu
        window.location.href = "leaderboard.html";
    } else {
        console.log("Login terlebih dahulu, redirect ke index.html");
    window.location.href = "index.html";
    return;
    }
    
  }
  // berhasil login
  console.log(`Selamat datang ! ${user.nama}`);
})();
