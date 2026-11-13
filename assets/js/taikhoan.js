(function () {
  // Khớp với thanhvien.js / pages/chinh-sach.html (mục 1)
  const HANG = [
    { ten: "Thành Viên", tu: 0, giam: 0, toiDa: 0, ma: "" },
    {
      ten: "Thành Viên Đồng",
      tu: 3000000,
      giam: 3,
      toiDa: 30000,
      ma: "THANTHIET-DONG",
    },
    {
      ten: "Thành Viên Bạc",
      tu: 5000000,
      giam: 5,
      toiDa: 50000,
      ma: "THANTHIET-BAC",
    },
  ];

  const goc = window.nettoRoot || "../";
  const tenUser = localStorage.getItem("netto_current");
  const users = JSON.parse(localStorage.getItem("netto_users") || "{}");
  const tk = users[tenUser];

  if (!tenUser || !tk) {
    location.replace(goc + "index.html");
    return;
  }

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const tien = (n) => n.toLocaleString("vi-VN") + "đ";
  const ngay = (iso) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");

  const donHang = tk.donHang || [];
  const soLuotMua = donHang.length;
  const tongChiTieu = donHang.reduce((t, d) => t + (Number(d.tong) || 0), 0);

  let idx = 0;
  HANG.forEach((h, i) => {
    if (tongChiTieu >= h.tu) idx = i;
  });
  const hang = HANG[idx];
  const tiep = HANG[idx + 1];

  const voucher = (tk.voucher || []).slice();
  if (hang.ma) {
    voucher.push({
      ma: hang.ma,
      nhan: "THÀNH VIÊN",
      so: hang.giam + "%",
      pill: "Tối đa " + hang.toiDa / 1000 + "K",
      ten: "GIẢM " + hang.giam + "% - " + hang.ten.toUpperCase(),
      moTa:
        "Giảm " +
        hang.giam +
        "% giá trị đơn hàng (tối đa " +
        tien(hang.toiDa) +
        "/đơn).",
      han: null,
      daDung: false,
    });
  }
  // ===== Mã ở trang Khuyến mãi: hiện theo điều kiện của tài khoản =====
  const maDaDung = tk.maDaDung || []; // danh sách mã khách đã dùng
  const KHUYEN_MAI = [
    {
      ma: "GIAM20%",
      nhan: "VOUCHER",
      so: "20%",
      pill: "Tối đa 10K",
      ten: "GIẢM 20% TOÀN ĐƠN",
      moTa: "Đơn từ 500K trở lên. 01 mã / khách.",
      khoa: maDaDung.includes("GIAM20%") ? "Đã dùng" : "",
    },
    {
      ma: "FREESHIP",
      nhan: "SHIP",
      so: "40K",
      pill: "Đơn từ 1Tr",
      ten: "FREESHIP TOÀN QUỐC",
      moTa: "Miễn phí ship tối đa 40K (GHN), áp dụng cho đơn từ 1Tr.",
      khoa: "",
    },
    {
      ma: "CHAOBANMOI",
      nhan: "BẠN MỚI",
      so: "10K",
      pill: "Mọi đơn",
      ten: "FREESHIP BẠN MỚI",
      moTa: "Trợ ship 10K cho mọi đơn hàng đầu tiên.",
      khoa: soLuotMua > 0 ? "Chỉ dành cho khách mới" : "",
    },
  ];
  KHUYEN_MAI.forEach((km) => {
    // bỏ bản cũ trùng mã (nếu tài khoản đã có sẵn)
    const i = voucher.findIndex((v) => v.ma === km.ma);
    if (i >= 0) voucher.splice(i, 1);
    voucher.push({
      ma: km.ma,
      nhan: km.nhan,
      so: km.so,
      pill: km.pill,
      ten: km.ten,
      moTa: km.moTa,
      han: null,
      daDung: false,
      khoa: km.khoa,
    });
  });
  const bayGio = Date.now();
  const dungDuoc = (v) =>
    !v.daDung && !v.khoa && (!v.han || new Date(v.han).getTime() >= bayGio);
  const soVoucher = voucher.filter(dungDuoc).length;

  let khoiHang;
  if (tiep) {
    const phanTram = Math.min(
      100,
      ((tongChiTieu - hang.tu) / (tiep.tu - hang.tu)) * 100,
    );
    khoiHang =
      "<p>Hạng hiện tại: <strong>" +
      esc(hang.ten) +
      "</strong></p>" +
      '<div class="tk-tiendo"><div style="width:' +
      phanTram.toFixed(0) +
      '%"></div></div>' +
      '<p class="tk-ghichu">Mua thêm ' +
      tien(tiep.tu - tongChiTieu) +
      " để lên " +
      esc(tiep.ten) +
      " (giảm " +
      tiep.giam +
      "%, tối đa " +
      tien(tiep.toiDa) +
      "/đơn).</p>";
  } else {
    khoiHang =
      "<p>Hạng hiện tại: <strong>" +
      esc(hang.ten) +
      "</strong></p>" +
      '<p class="tk-ghichu">Bạn đang ở hạng cao nhất. Cảm ơn bạn đã đồng hành cùng NETTO!</p>';
  }

  // Lấy chữ hiển thị ở khối hồng bên trái nếu voucher chưa ghi sẵn
  const laySo = (v) => {
    if (v.so) return v.so;
    const m = String(v.moTa || "").match(/\d+\s*%|\d+\s*[Kk]\b/);
    return m ? m[0].replace(/\s/g, "").toUpperCase() : "🎁";
  };

  let khoiVoucher = "";
  if (voucher.length === 0) {
    khoiVoucher = '<p class="tk-ghichu">Bạn chưa có voucher nào.</p>';
  } else {
    khoiVoucher = '<div class="tk-vc-luoi">';
    voucher.forEach((v) => {
      const ok = dungDuoc(v);
      const trangThai = v.daDung
        ? "Đã dùng"
        : v.khoa
          ? v.khoa
          : ok
            ? "Đang áp dụng"
            : "Hết hạn";
      khoiVoucher +=
        '<div class="tk-vc' +
        (ok ? "" : " het") +
        '">' +
        '<div class="tk-vc-trai">' +
        "<small>" +
        esc(v.nhan || "VOUCHER") +
        "</small>" +
        "<b>" +
        esc(laySo(v)) +
        "</b>" +
        (v.pill ? "<em>" + esc(v.pill) + "</em>" : "") +
        "</div>" +
        '<div class="tk-vc-phai">' +
        "<h3>" +
        esc(v.ten || v.ma) +
        "</h3>" +
        '<p class="tk-vc-mota">' +
        esc(v.moTa || "") +
        "</p>" +
        '<ul class="tk-vc-ds">' +
        "<li>" +
        (v.han ? "HSD: " + ngay(v.han) : "Không giới hạn thời gian") +
        "</li>" +
        "<li>" +
        trangThai +
        "</li>" +
        "</ul>" +
        '<div class="tk-vc-ma"><span>Mã: <code>' +
        esc(v.ma) +
        "</code></span>" +
        '<button type="button" class="tk-vc-copy" data-ma="' +
        esc(v.ma) +
        '"' +
        (ok ? "" : " disabled") +
        ">Copy mã</button>" +
        "</div></div></div>";
    });
    khoiVoucher += "</div>";
  }

  document.getElementById("tk-noidung").innerHTML =
    '<div class="tk-card tk-ho-so">' +
    '<div class="tk-avatar">' +
    esc(tenUser.charAt(0).toUpperCase()) +
    "</div>" +
    '<div class="tk-ho-so-info"><h1>' +
    esc(tenUser) +
    "</h1>" +
    "<p>Tham gia từ: " +
    ngay(tk.ngayThamGia) +
    "</p>" +
    '<span class="tk-hang tk-hang-' +
    idx +
    '">' +
    esc(hang.ten) +
    "</span></div>" +
    '<button type="button" class="tk-dangxuat" id="tk-dangxuat">Đăng xuất</button>' +
    "</div>" +
    '<div class="tk-thongke">' +
    '<div class="tk-card"><strong>' +
    soLuotMua +
    "</strong><span>Lượt mua</span></div>" +
    '<div class="tk-card"><strong>' +
    tien(tongChiTieu) +
    "</strong><span>Tổng chi tiêu</span></div>" +
    '<div class="tk-card"><strong>' +
    soVoucher +
    "</strong><span>Voucher có thể dùng</span></div>" +
    "</div>" +
    '<div class="tk-card"><h2>Hạng thành viên</h2>' +
    khoiHang +
    "</div>" +
    '<div class="tk-card"><h2>Voucher của bạn</h2>' +
    khoiVoucher +
    "</div>";
  // Nút Copy mã
  document.getElementById("tk-noidung").addEventListener("click", function (e) {
    const nut = e.target.closest(".tk-vc-copy");
    if (!nut || nut.disabled) return;
    const ma = nut.dataset.ma;
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
      } catch (err) {}
      document.body.removeChild(t);
      xong();
    }
  });
  document.getElementById("tk-dangxuat").addEventListener("click", function () {
    localStorage.removeItem("netto_current");
    location.href = goc + "index.html";
  });
})();
