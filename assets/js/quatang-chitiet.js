fetch("../assets/data/quatang.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (ds) {
    const id = new URLSearchParams(location.search).get("id");
    const q = ds.find(function (x, i) {
      return String(x.id !== undefined ? x.id : i + 1) === String(id);
    });

    if (!q) {
      document.getElementById("qt-wrap").innerHTML =
        '<p>Không tìm thấy quà tặng. <a href="quatang-ds.html">Quay lại danh sách quà tặng</a></p>';
      return;
    }

    document.title = q.ten;
    document.getElementById("qt-duongdan").textContent = q.ten;
    document.getElementById("qt-ten").textContent = q.ten;
    document.getElementById("qt-mota").textContent = q.mota || "";

    const img = document.getElementById("qt-anh-lon");
    img.src = "../assets/images/qua-tang/" + q.anh;
    img.alt = q.ten;

    const ul = document.getElementById("qt-chitiet");
    if (Array.isArray(q.chiTiet) && q.chiTiet.length) {
      q.chiTiet.forEach(function (dong) {
        const li = document.createElement("li");
        li.textContent = dong;
        ul.appendChild(li);
      });
    } else {
      document.getElementById("qt-khoi-chitiet").hidden = true;
    }

    if (q.dieuKien) {
      document.getElementById("qt-dieukien").textContent = q.dieuKien;
    } else {
      document.getElementById("qt-khoi-dieukien").hidden = true;
    }
  });
