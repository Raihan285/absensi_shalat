const links = document.querySelectorAll(".menu-1 a");
const currentUrl = window.location.href;

links.forEach(link => {
  if (link.href === currentUrl) {
    link.classList.add("active");
  }
});

function showSidebar() {
  const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'block'
}

function hideSidebar() {
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}

function showLoading() {
  document.getElementById("loading-widget").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading-widget").style.display = "none";
}

function ambilData() {
  const tbody = document.getElementById("data-siswa");
  const filterWaktu = document.getElementById("filterWaktu").value;
  let no = 1;

  showLoading();
  db.collection("absen")
    .where("kelas", "==", kodeKelas)
    .get()
    .then((querySnapshot) => {
      const siswaMap = {};
      const tanggalSet = new Set();

      const hariIni = new Date();
      const todayStr = hariIni.toISOString().split("T")[0];

      const mingguAwal = new Date(hariIni);
      mingguAwal.setDate(hariIni.getDate() - hariIni.getDay());

      const bulanIni = hariIni.getMonth();
      const tahunIni = hariIni.getFullYear();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nis = data.siswaNis;
        const tanggal = data.tanggal;

        const tglObj = new Date(tanggal);

        // Filter berdasarkan pilihan dropdown
        if (filterWaktu === "today" && tanggal !== todayStr) return;

        if (filterWaktu === "thisWeek") {
          if (tglObj < mingguAwal || tglObj > hariIni) return;
        }

        if (filterWaktu === "thisMonth") {
          const isSameMonth = tglObj.getMonth() === bulanIni && tglObj.getFullYear() === tahunIni;
          if (!isSameMonth) return;
        }

        tanggalSet.add(tanggal);

        if (!siswaMap[nis]) {
          siswaMap[nis] = {
            nama: data.nama,
            statusByDate: {}
          };
        }

        siswaMap[nis].statusByDate[tanggal] = data.status.toLowerCase();
      });

      const totalHari = tanggalSet.size;
      tbody.innerHTML = "";

      for (const nis in siswaMap) {
        const siswa = siswaMap[nis];
        let sholat = 0, izin = 0, alpa = 0;

        tanggalSet.forEach((tgl) => {
          const status = siswa.statusByDate[tgl];
          if (status === "sholat") sholat++;
          else if (status === "izin") izin++;
          else alpa++;
        });

        const persen = (jumlah) =>
          totalHari > 0 ? ((jumlah / totalHari) * 100).toFixed(0) + "%" : "0%";

        const row = `
          <tr>
            <td>${no++}</td>
            <td>${nis}</td>
            <td>${siswa.nama}</td>
            <td><div class="Status-sholat"><p>${persen(sholat)}</p></div></td>
            <td><div class="Status-izin"><p>${persen(izin)}</p></div></td>
            <td><div class="Status-alpa"><p>${persen(alpa)}</p></div></td>
          </tr>
        `;
        tbody.innerHTML += row;
      }
    })
    .catch((error) => {
      console.error("Gagal mengambil data: ", error);
    })
      .finally(() => {
    hideLoading(); // 👈 Sembunyikan widget loading
  });
    
}

