// Hộp chat nhỏ "Thành viên thân thiết":
// khách nhập tổng chi tiêu -> tính hạng theo pages/chinh-sach.html (mục 1) -> cấp voucher nếu đủ điều kiện.
(function () {
  "use strict";

  /* ============ QUY ĐỊNH HẠNG (khớp pages/chinh-sach.html, mục 1) ============ */
  // Đổi quy định ở trang chính sách thì sửa bảng này cho khớp.
  const HANG = [
    { khoa: "thanhvien", ten: "Thành Viên", icon: "🌱", tu: 0, giam: 0, toiDa: 0, ma: "" },
    { khoa: "dong", ten: "Thành Viên Đồng", icon: "🥉", tu: 3000000, giam: 3, toiDa: 30000, ma: "THANTHIET-DONG" },
    { khoa: "bac", ten: "Thành Viên Bạc", icon: "🥈", tu: 5000000, giam: 5, toiDa: 50000, ma: "THANTHIET-BAC" },
  ];
  const MA_BAN_MOI = "CHAOBANMOI"; // voucher có sẵn ở pages/khuyen-mai.html
  const KHOA_LUU = "netto-thanhvien";

  /* ============ HÀM TÍNH TOÁN ============ */
  function boDau(t) {
    return String(t || "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function dinhDangTien(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  // Đọc số tiền khách gõ: 3tr, 3,5 triệu, 4 triệu 2, 3500k, 3.500.000đ...
  // Trả về { gia } | { moHo: true } (số nhỏ không có đơn vị) | null (không hiểu)
  function docSoTien(text) {
    let s = boDau(text).replace(/\b(vnd|dong)\b/g, " ").replace(/(\d)\s*d\b/g, "$1");
    if (!/\d/.test(s)) {
      return /\b(chua|moi|khong)\b/.test(s) ? { gia: 0 } : null;
    }
    const m = s.match(/(\d[\d.,]*)\s*(trieu|tr|m|nghin|ngan|k)?(?![a-z])(?:\s*(\d{1,3})(?!\d))?/);
    if (!m) return null;

    const so = m[1].replace(/[.,]$/, "");
    const donVi = m[2] || "";
    const soDem = (so.match(/[.,]/g) || []).length;
    // "3,5" / "3.5" (một dấu) là số thập phân khi có đơn vị; nhiều dấu là phân cách nghìn
    const laSo = function (x) {
      return soDem === 1 ? parseFloat(x.replace(",", ".")) : parseFloat(x.replace(/[.,]/g, ""));
    };

    let gia;
    if (donVi === "tr" || donVi === "trieu" || donVi === "m") {
      gia = laSo(so) * 1e6;
      // "4 triệu 2" = 4,2 triệu; "4tr500" = 4,5 triệu
      if (m[3] && soDem === 0) gia += Number(m[3]) * Math.pow(10, 6 - m[3].length);
    } else if (donVi === "k" || donVi === "nghin" || donVi === "ngan") {
      gia = laSo(so) * 1e3;
    } else {
      gia = Number(so.replace(/[.,]/g, ""));
      if (gia > 0 && gia < 1000) return { moHo: true };
    }
    if (!isFinite(gia) || gia < 0 || gia > 1e10) return null;
    return { gia: Math.round(gia) };
  }

  function timHang(chiTieu) {
    let h = HANG[0];
    HANG.forEach(function (x) {
      if (chiTieu >= x.tu) h = x;
    });
    return h;
  }

  function hangKeTiep(hang) {
    const i = HANG.indexOf(hang);
    return HANG[i + 1] || null;
  }

  function moTaQuyenLoi(h) {
    return h.giam
      ? "giảm " + h.giam + "% giá trị đơn hàng (tối đa " + dinhDangTien(h.toiDa) + "/đơn)"
      : "tham gia chương trình tích điểm thưởng của NETTO";
  }

  function docLuu() {
    try {
      return JSON.parse(localStorage.getItem(KHOA_LUU)) || null;
    } catch (e) {
      return null;
    }
  }
  function ghiLuu(obj) {
    try {
      localStorage.setItem(KHOA_LUU, JSON.stringify(obj));
    } catch (e) {}
  }

  /* ============ GIAO DIỆN ============ */
  const nutMo = document.querySelector(".float-member");
  if (!nutMo) return;

  const style = document.createElement("style");
  style.textContent = `
.tv-box{position:fixed;left:16px;bottom:110px;width:340px;max-width:calc(100vw - 24px);height:460px;
  max-height:calc(100vh - 140px);background:#fff;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.2);
  display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:"Be Vietnam Pro",sans-serif;font-size:14px}
.tv-box.open{display:flex}
.tv-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#111;color:#fff;font-weight:600}
.tv-head button{background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer}
.tv-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#fdf6f3}
.tv-msg{max-width:88%;padding:9px 12px;border-radius:12px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
.tv-msg.bot{align-self:flex-start;background:#fff;border:1px solid #eee;color:#333;border-bottom-left-radius:4px}
.tv-msg.user{align-self:flex-end;background:#e2543f;color:#fff;border-bottom-right-radius:4px}
.tv-msg a{color:#e2543f;font-weight:600}
.tv-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 0;background:#fdf6f3}
.tv-chips button{font-family:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #e2543f;color:#e2543f;background:#fff;border-radius:999px;cursor:pointer}
.tv-chips button:hover{background:#e2543f;color:#fff}
.tv-form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}
.tv-form input{flex:1;min-width:0;padding:10px 12px;border:1px solid #e8d9d3;border-radius:8px;font-family:inherit;font-size:14px;outline:none}
.tv-form input:focus{border-color:#e2543f}
.tv-form button{padding:0 16px;border:none;border-radius:8px;background:#111;color:#fff;font-family:inherit;font-weight:600;cursor:pointer}
.tv-form button:hover{background:#e2543f}
.tv-bar{height:8px;border-radius:99px;background:#eee;overflow:hidden;margin:8px 0 2px}
.tv-bar span{display:block;height:100%;background:#e2543f}
.tv-voucher{margin-top:8px;border:1px dashed #e2543f;border-radius:10px;padding:10px;background:#fff7f5}
.tv-voucher strong.tv-gt{display:block;font-size:16px;color:#e2543f}
.tv-voucher .tv-ma{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
.tv-voucher code{background:#fff;border:1px solid #f3c6bd;border-radius:6px;padding:3px 8px;font-weight:700;color:#e2543f}
.tv-voucher button{font-family:inherit;font-size:12px;padding:4px 10px;border:1px solid #e2543f;color:#e2543f;background:#fff;border-radius:999px;cursor:pointer}
.tv-voucher button:hover{background:#e2543f;color:#fff}
`;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.className = "tv-box";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Thành viên thân thiết");
  box.innerHTML =
    '<div class="tv-head"><span>🎁 Thành viên thân thiết</span><button type="button" aria-label="Đóng">&times;</button></div>' +
    '<div class="tv-body"></div>' +
    '<div class="tv-chips"></div>' +
    '<form class="tv-form"><input type="text" autocomplete="off" placeholder="Nhập tổng chi tiêu, ví dụ: 3,5 triệu"><button type="submit">Gửi</button></form>';
  document.body.appendChild(box);

  const elBody = box.querySelector(".tv-body");
  const elChips = box.querySelector(".tv-chips");
  const elForm = box.querySelector(".tv-form");
  const elInput = elForm.querySelector("input");
  let daChao = false;

  function them(noiDung, ai) {
    const d = document.createElement("div");
    d.className = "tv-msg " + ai;
    if (typeof noiDung === "string") d.textContent = noiDung;
    else d.appendChild(noiDung);
    elBody.appendChild(d);
    elBody.scrollTop = elBody.scrollHeight;
    return d;
  }

  function veChips(ds) {
    elChips.innerHTML = "";
    ds.forEach(function (nhan) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = nhan;
      b.addEventListener("click", function () {
        xuLy(nhan);
      });
      elChips.appendChild(b);
    });
  }

  function saoChep(ma, nut) {
    const xong = function () {
      nut.textContent = "Đã chép ✓";
      setTimeout(function () {
        nut.textContent = "Copy mã";
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ma).then(xong, xong);
    } else {
      const t = document.createElement("textarea");
      t.value = ma;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(t);
      xong();
    }
  }

  function theVoucher(h) {
    const v = document.createElement("div");
    v.className = "tv-voucher";
    const gt = document.createElement("strong");
    gt.className = "tv-gt";
    gt.textContent = "GIẢM " + h.giam + "% - " + h.ten.toUpperCase();
    const mt = document.createElement("div");
    mt.textContent = "Tối đa " + dinhDangTien(h.toiDa) + "/đơn hàng";
    const dong = document.createElement("div");
    dong.className = "tv-ma";
    const code = document.createElement("code");
    code.textContent = h.ma;
    const nut = document.createElement("button");
    nut.type = "button";
    nut.textContent = "Copy mã";
    nut.addEventListener("click", function () {
      saoChep(h.ma, nut);
    });
    dong.appendChild(code);
    dong.appendChild(nut);
    v.appendChild(gt);
    v.appendChild(mt);
    v.appendChild(dong);
    return v;
  }

  function quyenLoiCacHang() {
    return HANG.map(function (h) {
      return (
        h.icon + " " + h.ten + (h.tu ? " (từ " + dinhDangTien(h.tu) + ")" : " (0đ)") + ": " + moTaQuyenLoi(h) + "."
      );
    }).join("\n");
  }

  function traKetQua(chiTieu) {
    const hang = timHang(chiTieu);
    const tiep = hangKeTiep(hang);

    // Thanh tiến độ tới hạng kế tiếp
    const khung = document.createElement("div");
    khung.appendChild(
      document.createTextNode(
        "Tổng chi tiêu: " + dinhDangTien(chiTieu) + "\nHạng của bạn: " + hang.icon + " " + hang.ten + "\nQuyền lợi: " + moTaQuyenLoi(hang) + "."
      )
    );
    if (tiep) {
      const moc = tiep.tu;
      const bar = document.createElement("div");
      bar.className = "tv-bar";
      const fill = document.createElement("span");
      fill.style.width = Math.min(100, Math.round((chiTieu / moc) * 100)) + "%";
      bar.appendChild(fill);
      khung.appendChild(bar);
      khung.appendChild(
        document.createTextNode(
          "Còn " + dinhDangTien(moc - chiTieu) + " nữa để lên " + tiep.ten + " (giảm " + tiep.giam + "%, tối đa " + dinhDangTien(tiep.toiDa) + "/đơn)."
        )
      );
    } else {
      khung.appendChild(document.createTextNode("\nBạn đang ở hạng cao nhất hiện tại."));
    }
    them(khung, "bot");

    // Voucher nếu đủ điều kiện
    if (hang.ma) {
      const luu = docLuu();
      const daCoMa = luu && luu.hang === hang.khoa;
      ghiLuu({ hang: hang.khoa, ma: hang.ma, chiTieu: chiTieu });
      const hop = document.createElement("div");
      hop.appendChild(
        document.createTextNode(
          daCoMa ? "Voucher hạng của bạn đây, dùng khi thanh toán nhé:" : "🎉 Chúc mừng! Bạn đủ điều kiện nhận voucher thành viên:"
        )
      );
      hop.appendChild(theVoucher(hang));
      them(hop, "bot");
    } else {
      const hop = document.createElement("div");
      hop.appendChild(document.createTextNode("Hạng này chưa có voucher thành viên. Bạn có thể dùng mã "));
      const b = document.createElement("strong");
      b.textContent = MA_BAN_MOI;
      hop.appendChild(b);
      hop.appendChild(document.createTextNode(" (trợ ship 10K cho mọi đơn) ở trang "));
      const a = document.createElement("a");
      a.href = "pages/khuyen-mai.html";
      a.textContent = "Khuyến mãi";
      hop.appendChild(a);
      hop.appendChild(document.createTextNode("."));
      them(hop, "bot");
    }
    veChips(["Xem quyền lợi các hạng", "Tính lại"]);
  }

  function xuLy(text) {
    them(text, "user");
    const s = boDau(text);

    if (/quyen loi|cac hang|chinh sach|hang nao/.test(s)) {
      const hop = document.createElement("div");
      hop.appendChild(document.createTextNode(quyenLoiCacHang() + "\n\nChi tiết xem tại "));
      const a = document.createElement("a");
      a.href = "pages/chinh-sach.html";
      a.textContent = "Chính sách khách hàng";
      hop.appendChild(a);
      hop.appendChild(document.createTextNode("."));
      them(hop, "bot");
      veChips(["Tính lại"]);
      return;
    }

    if (/^tinh lai$|tinh lai/.test(s)) {
      them("Bạn đã mua tổng cộng bao nhiêu ở NETTO? (ví dụ: 3tr, 3,5 triệu, 4.200.000đ)", "bot");
      veChips(["Chưa mua gì", "Xem quyền lợi các hạng"]);
      return;
    }

    const kq = docSoTien(text);
    if (kq && kq.moHo) {
      them("Số này nhỏ quá, bạn ghi rõ đơn vị giúp mình nhé, ví dụ \"" + text.trim() + " triệu\" hoặc \"" + text.trim() + "k\".", "bot");
      return;
    }
    if (!kq) {
      them("Mình chưa hiểu số tiền. Bạn nhập tổng chi tiêu theo dạng 3tr, 3,5 triệu hoặc 4.200.000đ nhé.", "bot");
      veChips(["Chưa mua gì", "Xem quyền lợi các hạng"]);
      return;
    }
    traKetQua(kq.gia);
  }

  function chao() {
    if (daChao) return;
    daChao = true;
    const luu = docLuu();
    const h = luu && HANG.filter(function (x) { return x.khoa === luu.hang; })[0];
    if (h && h.ma) {
      const hop = document.createElement("div");
      hop.appendChild(document.createTextNode("Chào bạn quay lại! Bạn đang ở hạng " + h.icon + " " + h.ten + ". Voucher của bạn:"));
      hop.appendChild(theVoucher(h));
      hop.appendChild(document.createTextNode("\nMua thêm rồi, nhập lại tổng chi tiêu mới để mình cập nhật hạng nhé."));
      them(hop, "bot");
    } else {
      them(
        "Chào bạn ♡ Mình tính hạng thành viên NETTO theo tổng chi tiêu của bạn và tặng voucher nếu đủ điều kiện.\n\nBạn đã mua tổng cộng bao nhiêu ở NETTO rồi? (ví dụ: 3tr, 3,5 triệu, 4.200.000đ)",
        "bot"
      );
    }
    veChips(["Chưa mua gì", "Xem quyền lợi các hạng"]);
  }

  function dong() {
    box.classList.remove("open");
    nutMo.setAttribute("aria-expanded", "false");
  }

  nutMo.setAttribute("aria-expanded", "false");
  nutMo.addEventListener("click", function () {
    const mo = !box.classList.contains("open");
    box.classList.toggle("open", mo);
    nutMo.setAttribute("aria-expanded", String(mo));
    if (mo) {
      chao();
      elInput.focus();
    }
  });
  box.querySelector(".tv-head button").addEventListener("click", dong);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") dong();
  });
  elForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const t = elInput.value.trim();
    if (!t) return;
    elInput.value = "";
    xuLy(t);
  });
})();