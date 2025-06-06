  // Fungsi untuk menentukan class CSS berdasarkan status
function statusGet(status) {
  if (status === "Sholat") return "Status-sholat";
  else if (status === "Izin") return "Status-izin";
  else return "Status-alpa"; // Default jika tidak ada status yang cocok
}

// Format tanggal menjadi DD-MM-YYYY
function formatTanggal(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// Fungsi utama untuk memuat absen default (semua tanggal)
async function loadAbsenByTanggal() {
 try {
    showLoading(); // Tampilkan loading widget

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
      <button id="download" onclick="download('konten-${tanggal}')"><img src="image/download_24dp_000000_FILL0_wght400_GRAD0_opsz24.png" alt=""></button>
        <div id="konten-${tanggal}" style="margin-bottom: 50px;">
          <h3 style="padding-bottom: 20px;">Tanggal: ${tanggal}</h3>
          <table>
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
            <tbody>
              ${grouped[tanggal].map(data => `
                <tr>
                  <td>${data.siswaNis}</td>
                  <td>${data.nama}</td>
                  <td>${data.kelas}</td>
                  <td><a href="${data.lokasi}">Lokasi</a></td>
                  <td>
                    <a href="${data.foto}" target="_blank">
                      <img src="${data.foto}" alt="-" width="60" style="border-radius: 8px;">
                    </a>
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

  } catch (error) {
    console.error("Gagal menampilkan absen:", error);
    alert("Terjadi kesalahan saat menampilkan data absen.");
  } finally {
    hideLoading(); // Pastikan loading disembunyikan walau error
  }
  
}

// Fungsi untuk filter berdasarkan "Hari Ini", "Minggu Ini", atau "Bulan Ini"
async function filterAbsen() {
 
  showLoading(); // 👈 Tampilkan loading widget di awal

  try {
    const filter = document.getElementById('filterAbsen').value;
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
        const dayOfWeek = today.getDay(); // Minggu = 0
        const diffToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        include = tanggalDoc >= monday && tanggalDoc <= sunday;
      } else if (filter === "month") {
        include = tanggalDoc.getMonth() === today.getMonth() && tanggalDoc.getFullYear() === today.getFullYear();
      }

      if (include) {
        if (!grouped[data.tanggal]) grouped[data.tanggal] = [];
        grouped[data.tanggal].push(data);
      }
    });

    if (Object.keys(grouped).length === 0) {
      tanggalBrapa.innerText = "Tidak ada data pada filter ini.";
    } else {
      tanggalBrapa.innerText = `Menampilkan data: ${filter.toUpperCase()}`;
    }

    for (const tanggal in grouped) {
      const tableHTML = `
      <div style="margin-bottom: 50px;">
        <h3 style="padding-bottom: 20px;">Tanggal: ${tanggal}</h3>
        <table>
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
          <tbody>
            ${grouped[tanggal].map(data => `
              <tr>
                <td>${data.siswaNis}</td>
                <td>${data.nama}</td>
                <td>${data.kelas}</td>
                 <td><a href="${data.lokasi}">Lokasi</a></td>
                <td>
                  <a href="${data.foto}" target="_blank">
                    <img src="${data.foto}" alt="Foto Absen" width="60" style="border-radius: 8px;">
                  </a>
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

  } catch (error) {
    console.error("Gagal memfilter data absen:", error);
    alert("Terjadi kesalahan saat memfilter absen.");
  } finally {
    hideLoading(); // 👈 Sembunyikan loading widget setelah selesai
  }
}

  async function download(tableId) {
    const { jsPDF } = window.jspdf;
    const konten = document.getElementById(tableId);

    const canvas = await html2canvas(konten);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save(`${tableId}.pdf`);
  }



// Jalankan saat halaman dibuka
window.onload = async function () {
  await loadAbsenByTanggal(); // Tampilkan semua data absen per tanggal saat awal
};
