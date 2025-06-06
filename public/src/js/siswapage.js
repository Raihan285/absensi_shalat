 const urlParams = new URLSearchParams(window.location.search);
    const nis = urlParams.get("nis");
    const infoDiv = document.getElementById("infoPersentase");

    async function hitungPersentase() {
      if (!nis) {
        infoDiv.innerText = "NIS tidak ditemukan di URL.";
        return;
      }

      try {
        const snapshot = await db.collection("absen").where("siswaNis", "==", Number(nis)).get();

        if (snapshot.empty) {
          infoDiv.innerHTML = `Tidak ada data untuk NIS: ${nis}`;
          return;
        }

        const statusByDate = {};
        const tanggalSet = new Set();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const tgl = data.tanggal;
          tanggalSet.add(tgl);
          statusByDate[tgl] = data.status.toLowerCase();
        });

        let sholat = 0, izin = 0, alpa = 0;
        tanggalSet.forEach(tgl => {
          const status = statusByDate[tgl];
          if (status === "sholat") sholat++;
          else if (status === "izin") izin++;
          else alpa++;
        });

        const totalHari = tanggalSet.size;
        const persen = (jumlah) => totalHari > 0 ? ((jumlah / totalHari) * 100).toFixed(2) + "%" : "0.00%";

        infoDiv.innerHTML = `
          <p>NIS: ${nis}</p>
          <p>Total Hari: ${totalHari}</p>
          <p>Sholat: ${sholat} (${persen(sholat)})</p>
          <p>Izin: ${izin} (${persen(izin)})</p>
          <p>Alpa: ${alpa} (${persen(alpa)})</p>
        `;
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        infoDiv.innerText = "Terjadi kesalahan saat mengambil data.";
      }
    }

   