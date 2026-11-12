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
      a.dataset.id = sp.id;

      a.dataset.loai = sp.loai;
      a.dataset.stt = stt;
      a.dataset.gia = soGia(sp.gia) === null ? "" : soGia(sp.gia);
      // Nổi bật = đang giảm giá (cùng tiêu chí với trang chủ, xem main.js)
      a.dataset.giam = giam;
      if (giam) a.dataset.noibat = "1";
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
    let chonNoiBat = false; // ?loai=noi-bat: chỉ hiện sản phẩm nổi bật
    const tieuDeTrang = document.querySelector(".sp-banner h1");

    // Bỏ dấu để tìm "quan" ra "quần", "vay" ra "váy", "ao" ra "áo"
    function boDau(s) {
      return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
    }

    // Từ khóa tìm kiếm từ URL (?q=...)
    const tuKhoaTuUrl = new URLSearchParams(location.search).get("q") || "";
    const tokensTim = boDau(tuKhoaTuUrl).split(/\s+/).filter(Boolean);

    // ===== Lọc loại + từ khóa tìm kiếm + sắp xếp giá =====
    function locSanPham() {
      const r = document.querySelector('.bo-loc input[name="Clothes"]:checked');
      const chon = r ? r.value : "tat-ca";

      if (tieuDeTrang) {
        if (tuKhoaTuUrl) {
          tieuDeTrang.textContent = 'KẾT QUẢ TÌM KIẾM: "' + tuKhoaTuUrl + '"';
        } else {
          tieuDeTrang.textContent = chonNoiBat
            ? "SẢN PHẨM NỔI BẬT"
            : "SẢN PHẨM";
        }
      }

      khop = Array.from(cards).filter(function (c) {
        // Lọc theo nhóm / loại / nổi bật
        if (chonNoiBat) {
          if (c.dataset.noibat !== "1") return false;
        } else if (nhomChon) {
          if (NHOM[nhomChon].indexOf(c.dataset.loai) < 0) return false;
        } else if (chon !== "tat-ca" && c.dataset.loai !== chon) {
          return false;
        }

        // Lọc theo từ khóa tìm kiếm (?q=)
        if (tokensTim.length) {
          const ten = (c.querySelector(".sp-ten") || {}).textContent || "";
          const loai = c.dataset.loai || "";
          const hay =
            " " +
            boDau(ten) +
            " " +
            boDau(loai.replace(/-/g, " ")) +
            " " +
            c.dataset.stt +
            " ";
          return tokensTim.every(function (t) {
            // số phải khớp nguyên từ (tránh "4" khớp 40, 41...)
            if (/^\d+$/.test(t)) return hay.indexOf(" " + t + " ") > -1;
            // chữ khớp đầu từ
            return hay.indexOf(" " + t) > -1;
          });
        }
        return true;
      });

      khop.sort(function (a, b) {
        const ga = a.dataset.gia === "" ? null : Number(a.dataset.gia);
        const gb = b.dataset.gia === "" ? null : Number(b.dataset.gia);
        if (kieuSX === 0 || (ga === null && gb === null)) {
          // Nổi bật: giảm sâu nhất lên trước
          if (chonNoiBat && a.dataset.giam !== b.dataset.giam) {
            return b.dataset.giam - a.dataset.giam;
          }
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
        chonNoiBat = false;
        locSanPham();
      });
    });
    nutSX.addEventListener("click", function () {
      kieuSX = (kieuSX + 1) % 3;
      nutSX.textContent = NHAN_SX[kieuSX];
      nutSX.classList.toggle("dang-chon", kieuSX !== 0);
      locSanPham();
    });

    // Vào từ menu có ?loai=... thì chọn sẵn bộ lọc tương ứng
    const loaiTuUrl = new URLSearchParams(location.search).get("loai");
    if (loaiTuUrl) {
      if (loaiTuUrl === "noi-bat") {
        chonNoiBat = true;
        radios.forEach(function (r) {
          r.checked = false;
        });
      } else if (NHOM[loaiTuUrl]) {
        nhomChon = loaiTuUrl;
        radios.forEach(function (r) {
          r.checked = false;
        });
      } else {
        const r = document.querySelector(
          '.bo-loc input[value="' + loaiTuUrl + '"]',
        );
        if (r) {
          r.checked = true;
        }
      }
    }

    // Áp dụng lọc (loại + từ khóa tìm kiếm)
    locSanPham();

    // ===== Quay lại đúng sản phẩm vừa xem =====
    const idCanVe = new URLSearchParams(location.search).get("sp");

    if (idCanVe) {
      // Tìm sản phẩm theo ID
      const theCanVe = Array.from(cards).find(function (c) {
        return c.dataset.id === idCanVe;
      });

      if (theCanVe) {
        // Tự động chọn lại bộ lọc của sản phẩm
        nhomChon = null;
        chonNoiBat = false;

        radios.forEach(function (r) {
          r.checked = false;
        });

        const radioCanChon = Array.from(radios).find(function (r) {
          return r.value === theCanVe.dataset.loai;
        });

        if (radioCanChon) {
          radioCanChon.checked = true;
        }

        // Lọc lại sản phẩm
        locSanPham();

        // Xác định sản phẩm nằm ở trang bao nhiêu
        const viTri = khop.indexOf(theCanVe);

        if (viTri !== -1) {
          trang = Math.floor(viTri / MOI_TRANG) + 1;

          // Hiển thị đúng trang
          hienSanPham();

          // Cuộn đến sản phẩm
          requestAnimationFrame(function () {
            theCanVe.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          });
        }
      }
    }
  });
