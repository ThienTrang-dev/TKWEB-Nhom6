fetch("../assets/data/products.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (SAN_PHAM) {
    const luoi = document.getElementById("luoi-sanpham");
    const thongBao = document.getElementById("sp-trong");

    // "259000" hoặc "259.000đ" -> 259000 (chưa có giá -> null)
    function soGia(g) {
      const s = String(g || "").replace(/\D/g, "");
      return s ? Number(s) : null;
    }
    // 259000 -> "259.000đ" (chưa có giá -> để trống)
    function dinhDangGia(g) {
      const n = soGia(g);
      if (n === null) return "";
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    }

    SAN_PHAM.forEach(function (sp, stt) {
      const giaCu = dinhDangGia(sp.giaCu);
      const a = document.createElement("a");
      a.className = "sp-card";
      a.dataset.loai = sp.loai;
      a.dataset.stt = stt;
      a.dataset.gia = soGia(sp.gia) === null ? "" : soGia(sp.gia);
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
        dinhDangGia(sp.gia) +
        (giaCu ? ' <span class="sp-gia-cu">' + giaCu + "</span>" : "") +
        "</p>";
      luoi.appendChild(a);
    });

    // ===== Nút sắp xếp giá, đặt ngay dưới chữ "BỘ LỌC" =====
    const NHAN_SX = [
      "Sắp xếp theo giá",
      "Giá: thấp đến cao ↑",
      "Giá: cao đến thấp ↓",
    ];
    let kieuSX = 0; // 0 = mặc định, 1 = tăng dần, 2 = giảm dần

    const khungLoc = document.querySelector(".bo-loc");
    const tieuDeLoc = khungLoc.querySelector("legend");
    const boxSX = document.createElement("div");
    boxSX.className = "sap-xep";
    const nutSX = document.createElement("button");
    nutSX.type = "button";
    nutSX.className = "nut-sap-xep";
    nutSX.textContent = NHAN_SX[0];
    boxSX.appendChild(nutSX);
    if (tieuDeLoc) tieuDeLoc.after(boxSX);
    else khungLoc.prepend(boxSX);

    const radios = document.querySelectorAll('.bo-loc input[name="Clothes"]');
    const cards = document.querySelectorAll(".sp-card");

    // ===== Chia trang: mỗi trang 4 hàng x 4 cột =====
    const MOI_TRANG = 16;
    let trang = 1;
    let khop = [];

    const nutXemThem = document.createElement("button");
    nutXemThem.type = "button";
    nutXemThem.className = "nut-xem-them";
    nutXemThem.textContent = "Xem thêm";
    luoi.appendChild(nutXemThem);

    function soTrang() {
      return Math.max(1, Math.ceil(khop.length / MOI_TRANG));
    }

    function hienSanPham() {
      cards.forEach(function (c) {
        c.hidden = true;
      });
      khop
        .slice((trang - 1) * MOI_TRANG, trang * MOI_TRANG)
        .forEach(function (c) {
          c.hidden = false;
        });
      const tong = soTrang();
      nutXemThem.hidden = tong <= 1;
      nutXemThem.textContent = trang < tong ? "Xem thêm" : "Về trang đầu";
    }

    nutXemThem.addEventListener("click", function () {
      trang = trang < soTrang() ? trang + 1 : 1;
      hienSanPham();
      window.scrollTo({
        top: luoi.getBoundingClientRect().top + window.scrollY - 140,
        behavior: "smooth",
      });
    });
    // Menu trên cùng chọn theo nhóm (một nhóm gồm nhiều loại)
    const NHOM = {
      quan: ["quan-dai", "quan-ngan"],
      ao: ["ao-dai-tay", "ao-ngan-tay"],
      vay: ["vay"],
      phukien: [],
    };
    let nhomChon = null;
    // ===== Lọc loại + sắp xếp giá (dùng đồng thời) =====
    function locSanPham() {
      const r = document.querySelector('.bo-loc input[name="Clothes"]:checked');
      const chon = r ? r.value : "tat-ca";
      khop = Array.from(cards).filter(function (c) {
        if (nhomChon) return NHOM[nhomChon].indexOf(c.dataset.loai) >= 0;
        return chon === "tat-ca" || c.dataset.loai === chon;
      });

      khop.sort(function (a, b) {
        const ga = a.dataset.gia === "" ? null : Number(a.dataset.gia);
        const gb = b.dataset.gia === "" ? null : Number(b.dataset.gia);
        if (kieuSX === 0 || (ga === null && gb === null)) {
          return a.dataset.stt - b.dataset.stt;
        }
        if (ga === null) return 1; // chưa có giá thì xuống cuối
        if (gb === null) return -1;
        return kieuSX === 1 ? ga - gb : gb - ga;
      });
      khop.forEach(function (c) {
        luoi.insertBefore(c, nutXemThem);
      });

      thongBao.hidden = khop.length !== 0;
      trang = 1;
      hienSanPham();
    }

    radios.forEach(function (r) {
      r.addEventListener("change", function () {
        nhomChon = null;
        locSanPham();
      });
    });
    nutSX.addEventListener("click", function () {
      kieuSX = (kieuSX + 1) % 3;
      nutSX.textContent = NHAN_SX[kieuSX];
      nutSX.classList.toggle("dang-chon", kieuSX !== 0);
      locSanPham();
    });
    locSanPham();
    // Vào từ menu có ?loai=... thì chọn sẵn bộ lọc tương ứng
    const loaiTuUrl = new URLSearchParams(location.search).get("loai");
    if (loaiTuUrl) {
      if (NHOM[loaiTuUrl]) {
        nhomChon = loaiTuUrl;
        radios.forEach(function (r) {
          r.checked = false;
        });
        locSanPham();
      } else {
        const r = document.querySelector(
          '.bo-loc input[value="' + loaiTuUrl + '"]',
        );
        if (r) {
          r.checked = true;
          locSanPham();
        }
      }
    }
  });
