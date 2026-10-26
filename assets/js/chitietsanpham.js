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
  document.getElementById("ct-gia").textContent = sp.gia;
  document.getElementById("ct-mota-text").textContent = sp.mota;

  if (sp.giaCu) {
    const cu = document.getElementById("ct-gia-cu");
    cu.textContent = sp.giaCu;
    cu.hidden = false;
    document.getElementById("ct-sale").hidden = false;
  }

  ["ct-anh-lon", "ct-thumb"].forEach(function (i) {
    const el = document.getElementById(i);
    el.src = anh;
    el.alt = sp.ten;
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
    boxMau.appendChild(b);
  });

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
