// Fungsi untuk menentukan class CSS berdasarkan status
function statusGet(status) {
  if (status === "Sholat") return "Status-sholat";
  else if (status === "Izin") return "Status-izin";
  else return "Status-alpa";
}

// Format tanggal menjadi DD-MM-YYYY
function formatTanggal(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// Fungsi utama memuat absen default
async function loadAbsenByTanggal() {
  try {
    showLoading();
    const container = document.getElementById('absenContainer');
    container.innerHTML = "";

    const snapshot = await db.collection("absen").orderBy("tanggal", "desc").get();
    const grouped = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const tanggal = data.tanggal;
      if (!grouped[tanggal]) grouped[tanggal] = [];
      grouped[tanggal].push(data);
    });

    for (const tanggal in grouped) {
      const tableHTML = `
        <button id="download" class="download" data-target="konten-${tanggal}">
        <img src="image/download_24dp_000000_FILL0_wght400_GRAD0_opsz24.png" alt="">
        </button>
        <div id="konten-${tanggal}" style="margin-bottom: 50px;">
          <h3 style="padding-bottom: 20px;">Tanggal: ${tanggal}</h3>
          <table class="tabel-absen">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Lokasi</th>
                <th>Bukti</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="data-siswa-${tanggal}">
              ${grouped[tanggal].map(data => `
                <tr class="siswa-row">
                  <td>${data.siswaNis}</td>
                  <td>${data.nama}</td>
                  <td>${data.kelas}</td>
                  <td><a href="${data.lokasi}">Lokasi</a></td>
                  <td>
                    ${data.foto
                      ? `<a href="${data.foto}" target="_blank">
                          <img src="${data.foto}" alt="Foto Absen" width="60" style="border-radius: 8px;">
                        </a>`
                      : `<img src="image/foto_kosong.png" alt="Belum Ada Foto" width="60" style="border-radius: 8px; opacity: 0.5;" title="Belum upload foto">`
                    }
                  </td>
                  <td><div class="${statusGet(data.status)}">${data.status}</div></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML += tableHTML;
    }

    aktifkanSearch();

  } catch (error) {
    console.error("Gagal menampilkan absen:", error);
    alert("Terjadi kesalahan saat menampilkan data absen.");
  } finally {
    hideLoading();
  }
}

// Fungsi filter absen
async function filterAbsen() {
  showLoading();

  try {
    const filter = document.getElementById('filterAbsen').value;
    localStorage.setItem("lastFilterAbsen", filter); // simpan filter terakhir

    const container = document.getElementById('absenContainer');
    const tanggalBrapa = document.getElementById('tanggalBrapa');
    container.innerHTML = "";

    const snapshot = await db.collection("absen").orderBy("tanggal", "desc").get();
    const today = new Date();
    const grouped = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const [day, month, year] = data.tanggal.split('-').map(Number);
      const tanggalDoc = new Date(year, month - 1, day);

      let include = false;

      if (filter === "today") {
        include = (formatTanggal(today) === data.tanggal);
      } else if (filter === "week") {
        const dayOfWeek = today.getDay();
        const diffToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        include = tanggalDoc >= monday && tanggalDoc <= sunday;
      } else if (filter === "month") {
        include = tanggalDoc.getMonth() === today.getMonth() &&
                  tanggalDoc.getFullYear() === today.getFullYear();
      } else if (filter === "semester1") {
        const awal = new Date(today.getFullYear(), 0, 1);
        const akhir = new Date(today.getFullYear(), 5, 30, 23, 59, 59);
        include = tanggalDoc >= awal && tanggalDoc <= akhir;
      } else if (filter === "semester2") {
        const awal = new Date(today.getFullYear(), 6, 1);
        const akhir = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        include = tanggalDoc >= awal && tanggalDoc <= akhir;
      } else if (filter === "semua") {
        localStorage.removeItem("lastFilterAbsen");
        localStorage.removeItem("user");
        include = true;
      }

      if (include) {
        if (!grouped[data.tanggal]) grouped[data.tanggal] = [];
        grouped[data.tanggal].push(data);
      }
    });

    tanggalBrapa.innerText = Object.keys(grouped).length === 0
      ? "Tidak ada data pada filter ini."
      : `Menampilkan data: ${filter.toUpperCase()}`;

    for (const tanggal in grouped) {
      const tableHTML = `
      <button id="download" class="download" data-target="konten-${tanggal}">
      <img src="image/download_24dp_000000_FILL0_wght400_GRAD0_opsz24.png" alt="">
      </button>
        <div style="margin-bottom: 50px;">
          <h3 style="padding-bottom: 20px;">Tanggal: ${tanggal}</h3>
          <table class="tabel-absen">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Lokasi</th>
                <th>Bukti</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="data-siswa-${tanggal}">
              ${grouped[tanggal].map(data => `
                <tr class="siswa-row">
                  <td>${data.siswaNis}</td>
                  <td>${data.nama}</td>
                  <td>${data.kelas}</td>
                  <td><a href="${data.lokasi}">Lokasi</a></td>
                  <td style="text-align: left;">
                    ${data.foto
                      ? `<a href="${data.foto}" target="_blank">
                          <img src="${data.foto}" alt="Foto Absen" width="50" style="border-radius: 8px;">
                        </a>`
                      : `<img src="image/foto_kosong.png" alt="Belum Ada Foto" width="50" style="border-radius: 8px; opacity: 0.5;" title="Belum upload foto">`
                    }
                  </td>
                  <td><div class="${statusGet(data.status)}">${data.status}</div></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML += tableHTML;
    }

    aktifkanSearch();

  } catch (error) {
    console.error("Gagal memfilter data absen:", error);
    alert("Terjadi kesalahan saat memfilter absen.");
  } finally {
    hideLoading();
  }
}

// Fungsi pencarian siswa
function aktifkanSearch() {
  const searchInputs = [
    document.getElementById('searchSiswa'),
    document.getElementById('searchSiswaMobile')
  ];

  searchInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', function () {
        const keyword = this.value.toLowerCase();
        const rows = document.querySelectorAll('.siswa-row');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(keyword) ? '' : 'none';
        });
      });
    }
  });
}

// Fungsi download PDF

     document.addEventListener("click", async (e) => {
  if (e.target.closest(".download")) {
    const btn = e.target.closest(".download");
    const targetId = btn.getAttribute("data-target");

    showLoading();
    const { jsPDF } = window.jspdf;
    const tableEl = document.getElementById(targetId);

    const canvas = await html2canvas(tableEl, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position -= pdf.internal.pageSize.getHeight();
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`Rekap_Absensi_${targetId}.pdf`);
    hideLoading();
  }
});



// Jalankan saat halaman dibuka
// Saat halaman dimuat
window.onload = async function () {
  const lastFilter = localStorage.getItem("lastFilterAbsen");
  if (lastFilter && lastFilter !== "all") {
    document.getElementById('filterAbsen').value = lastFilter;
    await filterAbsen();
  } else {
    await loadAbsenByTanggal();
  }
};

// Fungsi Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("lastFilterAbsen"); // Hapus filter tersimpan
  // Hapus data user
  localStorage.removeItem("user");

});

// Logout di sidebar (kalau ada)
document.getElementById("logoutBtnHidebar").addEventListener("click", function () {
  localStorage.removeItem("lastFilterAbsen");
  localStorage.removeItem("user");

});