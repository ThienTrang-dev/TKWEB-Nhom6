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
    // Phần trăm giảm: (giá cũ - giá bán) / giá cũ
    function phanTramGiam(gia, giaCu) {
      const g = soGia(gia);
      const c = soGia(giaCu);
      if (g === null || c === null || c <= g) return 0;
      return Math.round(((c - g) / c) * 100);
    }

    SAN_PHAM.forEach(function (sp, stt) {
      const giaCu = dinhDangGia(sp.giaCu);
      const giam = phanTramGiam(sp.gia, sp.giaCu);
      const a = document.createElement("a");
      a.className = "sp-card";
      a.dataset.loai = sp.loai;
      a.dataset.stt = stt;
      a.dataset.gia = soGia(sp.gia) === null ? "" : soGia(sp.gia);
      a.href = "chitietsanpham.html?id=" + sp.id;
      a.innerHTML =
        '<div class="sp-anh">' +
        '<img src="../assets/images/' +
        sp.loai +
        "/" +
        sp.id +
        '.jpg" alt="' +
        sp.ten +
        '" loading="lazy" />' +
        (giam ? '<span class="sp-giam">-' + giam + "%</span>" : "") +
        "</div>" +
        '<p class="sp-ten">' +
        sp.ten +
        "</p>" +
        '<p class="sp-gia"><span class="sp-gia-ban">' +
        dinhDangGia(sp.gia) +
        "</span>" +
        (giaCu ? ' <span class="sp-gia-cu">' + giaCu + "</span>" : "") +
        "</p>";
      luoi.appendChild(a);
    });

    // ===== Nút sắp xếp giá, đặt ngay dưới chữ "BỘ LỌC" =====
    const NHAN_SX = [
      "Sắp xếp theo giá ⇅",
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

    // ===== Phân trang: mỗi trang 4 hàng x 4 cột =====
    const MOI_TRANG = 16;
    let trang = 1;
    let khop = [];

    const phanTrang = document.createElement("nav");
    phanTrang.className = "phan-trang";
    phanTrang.setAttribute("aria-label", "Phân trang");
    luoi.appendChild(phanTrang);

    function soTrang() {
      return Math.max(1, Math.ceil(khop.length / MOI_TRANG));
    }

    // Dãy số trang: 1 2 3 4 5 ... 10
    function danhSachTrang(tong, hienTai) {
      if (tong <= 7) {
        return Array.from({ length: tong }, function (_, i) {
          return i + 1;
        });
      }
      let tu = Math.max(2, hienTai - 1);
      let den = Math.min(tong - 1, hienTai + 1);
      if (hienTai <= 3) {
        tu = 2;
        den = 4;
      }
      if (hienTai >= tong - 2) {
        tu = tong - 3;
        den = tong - 1;
      }
      const ds = [1];
      if (tu > 2) ds.push("...");
      for (let i = tu; i <= den; i++) ds.push(i);
      if (den < tong - 1) ds.push("...");
      ds.push(tong);
      return ds;
    }

    function taoNut(nhan, tat, bat, onClick) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = nhan;
      b.disabled = tat;
      if (bat) b.className = "on";
      if (!tat) b.addEventListener("click", onClick);
      return b;
    }

    function chuyenTrang(n) {
      trang = n;
      hienSanPham();
      window.scrollTo({
        top: luoi.getBoundingClientRect().top + window.scrollY - 140,
        behavior: "smooth",
      });
    }

    function veTrang() {
      const tong = soTrang();
      phanTrang.innerHTML = "";
      phanTrang.hidden = tong <= 1;
      if (tong <= 1) return;

      phanTrang.appendChild(
        taoNut("‹", trang === 1, false, function () {
          chuyenTrang(trang - 1);
        }),
      );
      danhSachTrang(tong, trang).forEach(function (p) {
        if (p === "...") {
          const s = document.createElement("span");
          s.className = "cham";
          s.textContent = "...";
          phanTrang.appendChild(s);
        } else {
          phanTrang.appendChild(
            taoNut(p, false, p === trang, function () {
              chuyenTrang(p);
            }),
          );
        }
      });
      phanTrang.appendChild(
        taoNut("›", trang === tong, false, function () {
          chuyenTrang(trang + 1);
        }),
      );
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
      veTrang();
    }

    // ===== Menu trên cùng chọn theo nhóm (một nhóm gồm nhiều loại) =====
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
        luoi.insertBefore(c, phanTrang);
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
