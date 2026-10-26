const luoi = document.getElementById("luoi-sanpham");
const thongBao = document.getElementById("sp-trong");

SAN_PHAM.forEach(function (sp) {
  const a = document.createElement("a");
  a.className = "sp-card";
  a.dataset.loai = sp.loai;
  a.href = "chitietsanpham.html?id=" + sp.id;
  a.innerHTML =
    '<img src="../assets/images/' +
    sp.loai +
    "/" +
    sp.id +
    '.jpg" alt="' +
    sp.ten +
    '" loading="lazy" />' +
    '<p class="sp-ten">' +
    sp.ten +
    "</p>" +
    '<p class="sp-gia">' +
    sp.gia +
    (sp.giaCu ? ' <span class="sp-gia-cu">' + sp.giaCu + "</span>" : "") +
    "</p>";
  luoi.appendChild(a);
});

const radios = document.querySelectorAll('.bo-loc input[name="Clothes"]');
const cards = document.querySelectorAll(".sp-card");

function locSanPham() {
  const chon = document.querySelector(
    '.bo-loc input[name="Clothes"]:checked',
  ).value;
  let dem = 0;
  cards.forEach(function (c) {
    const hien = chon === "tat-ca" || c.dataset.loai === chon;
    c.hidden = !hien;
    if (hien) dem++;
  });
  thongBao.hidden = dem !== 0;
}
radios.forEach(function (r) {
  r.addEventListener("change", locSanPham);
});
locSanPham();
