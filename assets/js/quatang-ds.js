fetch("../assets/data/quatang.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (ds) {
    const luoi = document.getElementById("luoi-quatang");
    if (!ds.length) {
      document.getElementById("qt-trong").hidden = false;
      return;
    }
    ds.forEach(function (q, i) {
      const id = q.id !== undefined ? q.id : i + 1;
      const a = document.createElement("a");
      a.className = "sp-card";
      a.href = "quatang.html?id=" + encodeURIComponent(id);

      const khung = document.createElement("div");
      khung.className = "sp-anh";
      const img = document.createElement("img");
      img.src = "../assets/images/qua-tang/" + q.anh;
      img.alt = q.ten;
      img.loading = "lazy";
      img.style.aspectRatio = "1/1";
      img.style.objectFit = "cover";
      khung.appendChild(img);

      const nhan = document.createElement("span");
      nhan.className = "sp-giam";
      nhan.textContent = "Quà tặng";
      khung.appendChild(nhan);

      const ten = document.createElement("p");
      ten.className = "sp-ten";
      ten.textContent = q.ten;

      const md = document.createElement("p");
      md.className = "sp-gia";
      md.innerHTML =
        '<span class="sp-gia-ban" style="font-size:13px">Xem chi tiết</span>';

      a.appendChild(khung);
      a.appendChild(ten);
      a.appendChild(md);
      luoi.appendChild(a);
    });
  })
  .catch(function (err) {
    console.log("Không nạp được quà tặng:", err);
  });
