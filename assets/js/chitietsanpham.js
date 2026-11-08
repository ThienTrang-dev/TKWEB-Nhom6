function dinhDangGia(g) {
  const s = String(g || "").replace(/\D/g, "");
  return s ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ" : "";
}
fetch("../assets/data/products.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (SAN_PHAM) {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const sp = SAN_PHAM.find(function (x) {
      return x.id === id;
    });

    if (!sp) {
      document.querySelector(".ct-wrap").innerHTML =
        '<p>Không tìm thấy sản phẩm. <a href="sanpham.html">Quay lại danh sách</a></p>';
    } else {
      const anh = "../assets/images/" + sp.loai + "/" + sp.id + ".jpg";
      document.title = sp.ten;
      document.getElementById("ct-ten").textContent = sp.ten;
      document.getElementById("ct-duongdan").textContent = sp.ten;
      document.getElementById("ct-ma").textContent = sp.ma;
      document.getElementById("ct-gia").textContent = dinhDangGia(sp.gia);
      document.getElementById("ct-mota-text").textContent = sp.mota;

      if (sp.giaCu) {
        const cu = document.getElementById("ct-gia-cu");
        cu.textContent = dinhDangGia(sp.giaCu);
        cu.hidden = false;
        document.getElementById("ct-sale").hidden = false;
      }
      const thuMuc = "../assets/images/" + sp.loai + "/";
      const anhLon = document.getElementById("ct-anh-lon");
      const boxThumb = document.querySelector(".ct-thumbs");
      anhLon.alt = sp.ten;

      function tenFile(a) {
        return typeof a === "number" ? a + ".jpg" : a;
      }

      // Gom ảnh của tất cả các màu vào một danh sách
      const tatCaAnh = [];
      sp.mau.forEach(function (m, iMau) {
        const ds = m.anh && m.anh.length ? m.anh : [sp.id];
        ds.forEach(function (a) {
          tatCaAnh.push({ file: tenFile(a), mau: iMau });
        });
      });

      function chonAnh(i) {
        anhLon.src = thuMuc + tatCaAnh[i].file;
        boxThumb.querySelectorAll("img").forEach(function (x, k) {
          x.classList.toggle("active", k === i);
        });
        document.querySelectorAll("#ct-mau button").forEach(function (n, k) {
          n.classList.toggle("active", k === tatCaAnh[i].mau);
        });
      }
      boxThumb.innerHTML = "";

      tatCaAnh.forEach(function (a, i) {
        const img = document.createElement("img");
        img.src = thuMuc + a.file;
        img.alt = sp.ten;
        img.addEventListener("click", function () {
          chonAnh(i);
        });
        boxThumb.appendChild(img);
      });
      // Tạo nút size và màu từ dữ liệu
      const boxSize = document.getElementById("ct-size");
      sp.size.forEach(function (s, i) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = s;
        if (i === 0) b.className = "active";
        boxSize.appendChild(b);
      });
      const boxMau = document.getElementById("ct-mau");
      sp.mau.forEach(function (m, i) {
        const b = document.createElement("button");
        b.type = "button";
        b.title = m.ten;
        b.style.background = m.ma;
        if (i === 0) b.className = "active";
        b.addEventListener("click", function () {
          chonAnh(
            tatCaAnh.findIndex(function (a) {
              return a.mau === i;
            }),
          );
        });
        boxMau.appendChild(b);
      });
      chonAnh(0);
      // Chọn một nút trong nhóm
      ["ct-size", "ct-mau"].forEach(function (idNhom) {
        const nuts = document.querySelectorAll("#" + idNhom + " button");
        nuts.forEach(function (n) {
          n.addEventListener("click", function () {
            nuts.forEach(function (x) {
              x.classList.remove("active");
            });
            n.classList.add("active");
          });
        });
      });

      // Số lượng
      const sl = document.getElementById("ct-sl");
      document.getElementById("ct-tang").addEventListener("click", function () {
        sl.value = Number(sl.value) + 1;
      });
      document.getElementById("ct-giam").addEventListener("click", function () {
        if (Number(sl.value) > 1) sl.value = Number(sl.value) - 1;
      });

      // Gợi ý size
      document.getElementById("ct-tinh").addEventListener("click", function () {
        const cao = Number(document.getElementById("ct-cao").value);
        const nang = Number(document.getElementById("ct-nang").value);
        const kq = document.getElementById("ct-ketqua");
        if (!cao || !nang) {
          kq.textContent = "Vui lòng nhập chiều cao và cân nặng.";
          return;
        }
        const bmi = nang / (cao * cao);
        kq.textContent =
          "Size gợi ý cho bạn: " + (bmi < 19 ? "S" : bmi > 23.5 ? "L" : "M");
      });

      document.getElementById("ct-mua").addEventListener("click", function () {
        const size = document.querySelector("#ct-size .active").textContent;
        alert(
          "Đã thêm " + sl.value + " sản phẩm (size " + size + ") vào giỏ hàng!",
        );
      });
    }
  });
