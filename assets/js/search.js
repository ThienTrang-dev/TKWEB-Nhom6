/* =====================================================
   NETTO - search.js
   Tìm kiếm gợi ý sản phẩm ở thanh tìm kiếm trên header.
   Không cần nhúng tay: layout.js tự nạp file này (rồi tới chatbox.js).
===================================================== */
(function () {
  "use strict";

  const self = document.currentScript;
  const root = self && self.src ? new URL("../../", self.src).href : "";

  // Dữ liệu sản phẩm lấy từ assets/data/products.json (tên, giá thật).
  // Nếu không đọc được (mở bằng file://) thì dùng tạm SAN_PHAM của products.js.
  let duLieu = [];
  const sanSang = fetch(root + "assets/data/products.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .catch(function () {
      if (typeof SAN_PHAM !== "undefined") return SAN_PHAM;
      // Trang không có products.js (vd lienhe.html): tự nạp rồi dùng tạm
      return new Promise(function (xong) {
        const sc = document.createElement("script");
        sc.src = root + "assets/js/products.js";
        sc.onload = function () {
          xong(typeof SAN_PHAM !== "undefined" ? SAN_PHAM : []);
        };
        sc.onerror = function () {
          xong([]);
        };
        document.head.appendChild(sc);
      });
    })
    .then(function (ds) {
      duLieu = ds;
    });

  // Bỏ dấu tiếng Việt để "ao" tìm ra "áo"
  function boDau(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();
  }

  function timSanPham(tuKhoa, loai) {
    if (!duLieu.length) return [];
    const tokens = boDau(tuKhoa).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return duLieu.filter(function (sp) {
      // loai = "ao" khớp cả "ao-ngan-tay" và "ao-dai-tay"
      if (loai && sp.loai !== loai && sp.loai.indexOf(loai + "-") !== 0) return false;
      // Chỉ tìm trong tên và mã sản phẩm, không cần bảng từ điển nào
      const hay = " " + boDau(sp.ten) + " " + boDau(sp.ma) + " " + sp.id + " " +
        boDau(sp.loai.replace(/-/g, " ")) + " ";
      return tokens.every(function (t) {
        // số (vd "4") phải khớp nguyên từ để không ra nhầm 40, 41...
        if (/^\d+$/.test(t)) return hay.indexOf(" " + t + " ") > -1;
        // chữ khớp đầu từ (tránh "ao" khớp nhầm "cao")
        return hay.indexOf(" " + t) > -1;
      });
    });
  }

  // Chia sẻ cho chatbox.js dùng lại
  window.NETTO = window.NETTO || {};
  window.NETTO.boDau = boDau;
  window.NETTO.timSanPham = timSanPham;

  function taoThe(sp) {
    const a = document.createElement("a");
    a.className = "sg-item";
    a.href = root + "pages/chitietsanpham.html?id=" + encodeURIComponent(sp.id);

    const img = document.createElement("img");
    img.src = root + "assets/images/" + sp.loai + "/" + sp.id + ".jpg";
    img.alt = "";
    img.loading = "lazy";
    img.onerror = function () {
      img.style.visibility = "hidden";
    };

    const info = document.createElement("span");
    info.className = "sg-info";
    const ten = document.createElement("span");
    ten.className = "sg-name";
    ten.textContent = sp.ten;
    const gia = document.createElement("span");
    gia.className = "sg-price";
    gia.textContent = sp.gia || "";
    info.appendChild(ten);
    info.appendChild(gia);

    a.appendChild(img);
    a.appendChild(info);
    return a;
  }

  const style = document.createElement("style");
  style.textContent = `
.search-box{position:relative}
.sg-panel{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:9998;background:#fff;
  border:1px solid #eadcd6;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.12);
  max-height:420px;overflow-y:auto;display:none}
.sg-panel.show{display:block}
.sg-item{display:flex;align-items:center;gap:12px;padding:10px 14px;color:#222;text-decoration:none;
  font-family:"Be Vietnam Pro",sans-serif;font-size:14px}
.sg-item:hover,.sg-item:focus{background:#f8eeeb;outline:none}
.sg-item img{width:46px;height:58px;object-fit:cover;border-radius:6px;background:#f3e6e2;flex:none}
.sg-info{display:flex;flex-direction:column;gap:2px;min-width:0}
.sg-name{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sg-price{color:#e2543f;font-weight:600;font-size:13px}
.sg-empty{padding:16px 14px;color:#777;font-size:14px;font-family:"Be Vietnam Pro",sans-serif}
.sg-all{display:block;padding:11px 14px;text-align:center;border-top:1px solid #f0e4df;color:#e2543f;
  font-weight:600;font-size:13px;text-decoration:none;font-family:"Be Vietnam Pro",sans-serif}
.sg-all:hover{background:#f8eeeb}
`;
  document.head.appendChild(style);

  function layBoLoc(box) {
    const sel = box.querySelector(".search-select");
    return sel ? sel.value : "";
  }

  function dongPanel() {
    document.querySelectorAll(".sg-panel.show").forEach(function (p) {
      p.classList.remove("show");
    });
  }

  function chayTimKiem(box) {
    const input = box.querySelector("input");
    if (!input) return;
    let panel = box.querySelector(".sg-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "sg-panel";
      box.appendChild(panel);
    }
    const tuKhoa = input.value.trim();
    panel.textContent = "";
    if (!tuKhoa) {
      panel.classList.remove("show");
      return;
    }

    const ketQua = timSanPham(tuKhoa, layBoLoc(box));
    if (!ketQua.length) {
      const e = document.createElement("div");
      e.className = "sg-empty";
      e.textContent = duLieu.length
        ? "Không tìm thấy sản phẩm phù hợp."
        : "Chưa tải được dữ liệu sản phẩm.";
      panel.appendChild(e);
    } else {
      ketQua.slice(0, 6).forEach(function (sp) {
        panel.appendChild(taoThe(sp));
      });
      if (ketQua.length > 6) {
        const all = document.createElement("a");
        all.className = "sg-all";
        all.href = duongDanTimKiem(tuKhoa, layBoLoc(box));
        all.textContent = "Xem tất cả " + ketQua.length + " kết quả";
        panel.appendChild(all);
      }
    }
    panel.classList.add("show");
  }

  function duongDanTimKiem(q, loai) {
    return (
      root + "pages/sanpham.html?" + (loai ? "loai=" + loai + "&" : "") +
      "q=" + encodeURIComponent(q)
    );
  }

  function diDenTrangSanPham(box) {
    const q = box.querySelector("input").value.trim();
    if (q) location.href = duongDanTimKiem(q, layBoLoc(box));
  }

  // Nếu khách gõ trước khi dữ liệu tải xong thì tìm lại khi có dữ liệu
  sanSang.then(function () {
    document.querySelectorAll(".search-box").forEach(function (box) {
      const i = box.querySelector("input");
      if (i && i.value.trim()) chayTimKiem(box);
    });
  });

  // Dùng event delegation nên header render lúc nào cũng chạy được
  document.addEventListener("input", function (e) {
    const box = e.target.closest && e.target.closest(".search-box");
    if (box && e.target.matches("input")) chayTimKiem(box);
  });
  document.addEventListener("change", function (e) {
    const box = e.target.closest && e.target.closest(".search-box");
    if (box && e.target.matches(".search-select")) chayTimKiem(box);
  });
  document.addEventListener("keydown", function (e) {
    const box = e.target.closest && e.target.closest(".search-box");
    if (box && e.key === "Enter" && e.target.matches("input")) {
      e.preventDefault();
      diDenTrangSanPham(box);
    }
    if (e.key === "Escape") dongPanel();
  });
  document.addEventListener("click", function (e) {
    const btn = e.target.closest && e.target.closest(".search-btn");
    if (btn) {
      diDenTrangSanPham(btn.closest(".search-box"));
      return;
    }
    if (!e.target.closest(".search-box")) dongPanel();
  });
})();