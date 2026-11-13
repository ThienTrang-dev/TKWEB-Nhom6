// Header + footer + chatbox dùng chung cho mọi trang.
// Nhúng:
// index.html: <script src="assets/js/layout.js"></script>
// pages/*.html: <script src="../assets/js/layout.js"></script>
(function () {
  // Tự xác định đường dẫn gốc từ vị trí file layout.js
  const self =
    document.currentScript ||
    document.querySelector('script[src$="layout.js"]');

  if (!self || !self.src) {
    console.error("Không tìm thấy file layout.js");
    return;
  }

  const root = new URL("../../", self.src).href;
  window.nettoRoot = root;

  const SOCIAL = {
    tiktok: "https://www.tiktok.com/@nettoclothings",
    facebook: "https://www.facebook.com/aeonmallhalong.14quangninh",
  };
  const header = `
<header class="site-header">
  <div class="topbar">
    <a href="${root}index.html" class="logo">NETTO</a>

    <div class="search-box">
      <select class="search-select">
        <option value="">Tất cả</option>
        <option value="ao">Áo</option>
        <option value="quan">Quần</option>
        <option value="vay">Váy / Chân váy</option>
      </select>

      <input type="text" placeholder="Tìm sản phẩm bạn mong muốn">

      <button type="button" class="search-btn" aria-label="Tìm kiếm">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"/>
        </svg>
      </button>
    </div>

    <div class="topbar-right">
      <a href="${root}pages/form.html" class="account-link" id="account-link">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5m0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5"/>
        </svg>
        <span id="account-text">Đăng nhập / Đăng ký</span>
      </a>

      <a href="${root}pages/giohang.html" class="cart-link" aria-label="Giỏ hàng">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path fill="currentColor" d="M7 4h-2l-1 2H2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 8 21h12v-2H8l1.1-2h7.45a2 2 0 0 0 1.75-1.03L21.7 8H6.21l-.94-2H7z"/>
        </svg>
        <span class="cart-count">0</span>
      </a>
    </div>
  </div>

  <nav class="main-nav">
    <ul>
      <li>
        <a href="${root}index.html" data-page="index.html">Trang chủ</a>
      </li>

      <li>
        <a href="${root}pages/gioithieu.html" data-page="gioithieu.html">Giới thiệu</a>
      </li>

      <li class="has-dropdown">
        <a href="${root}pages/sanpham.html"
           class="dropdown-toggle"
           data-page="sanpham.html">Sản phẩm ▾</a>

        <ul class="dropdown">
        <li>
        <a href ="${root}pages/sanpham.html?loai=quan">Quần</a>
        </li>
          <li>
            <a href="${root}pages/sanpham.html?loai=ao">Áo</a>
          </li>
          <li>
            <a href="${root}pages/sanpham.html?loai=vay">Váy / Chân váy</a>
          </li>
          
        </ul>
      </li>

      <li>
        <a href="${root}pages/huongdan.html" data-page="huongdan.html">Hướng dẫn</a>
      </li>

      <li>
        <a href="${root}pages/khuyen-mai.html" data-page="khuyen-mai.html">Khuyến mãi</a>
      </li>

      <li class="has-dropdown">
        <a href="${root}pages/chinh-sach.html"
           class="dropdown-toggle"
           data-page="chinh-sach.html">Chính sách ▾</a>

        <ul class="dropdown">
          <li><a href="${root}pages/chinh-sach.html#doi-tra">Đổi trả</a></li>
          <li><a href="${root}pages/chinh-sach.html#van-chuyen">Vận chuyển</a></li>
          <li><a href="${root}pages/chinh-sach.html#bao-mat">Bảo mật</a></li>
        </ul>
      </li>

      <li>
        <a href="${root}pages/tin-tuc.html" data-page="tin-tuc.html">Tin tức</a>
      </li>

      <li>
        <a href="${root}pages/lienhe.html" data-page="lienhe.html">Liên hệ</a>
      </li>
    </ul>

    <div class="hotline">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z"/>
      </svg>
      Hotline: <strong>0817923001</strong>
    </div>
  </nav>
</header>`;

  const footer = `
<footer class="site-footer">
  <div class="footer-grid">

    <div class="footer-col footer-brand">
      <a href="${root}index.html" class="logo">NETTO</a>

      <ul class="contact-list">
        <li>
          <span class="contact-icon">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="#fff" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5"/>
            </svg>
          </span>
          <span>12 Chùa Bộc, Đống Đa, Hà Nội</span>
        </li>

        <li>
          <span class="contact-icon">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="#fff" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 10.59V6h-2v8l6.11 3.65 1-1.63z"/>
            </svg>
          </span>
          <span>Giờ làm việc: Từ 9:00 đến 22:00 các ngày trong tuần từ Thứ 2 đến Chủ nhật</span>
        </li>

        <li>
          <span class="contact-icon">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="#fff" d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z"/>
            </svg>
          </span>
          <span>Hotline <strong>0817923001</strong></span>
        </li>
      </ul>

            <div class="social-icons">
        <a href="${SOCIAL.tiktok}" class="social-tiktok"
       target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <img src="https://cdn.simpleicons.org/tiktok/FFFFFF" alt="TikTok">
    </a>

        <a href="${SOCIAL.facebook}" class="social-fb" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#fff" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12"/>
          </svg>
        </a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Về chúng tôi</h4>
      <ul>
        <li><a href="${root}index.html">Trang chủ</a></li>
        <li><a href="${root}pages/gioithieu.html">Giới thiệu</a></li>
        <li><a href="${root}pages/sanpham.html">Sản phẩm</a></li>
        <li><a href="${root}pages/huongdan.html">Hướng dẫn</a></li>
        <li><a href="${root}pages/khuyen-mai.html">Khuyến mãi</a></li>
        <li><a href="${root}pages/chinh-sach.html">Chính sách</a></li>
        <li><a href="${root}pages/tin-tuc.html">Tin tức</a></li>
        <li><a href="${root}pages/lienhe.html">Liên hệ</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Chính sách</h4>
      <ul>
        <li><a href="${root}pages/chinh-sach.html#doi-tra">Chính sách đổi trả</a></li>
        <li><a href="${root}pages/chinh-sach.html#bao-mat">Chính sách bảo mật</a></li>
        <li><a href="${root}pages/chinh-sach.html#thanh-toan">Chính sách thanh toán</a></li>
        <li><a href="${root}pages/chinh-sach.html#thanh-vien">Chính sách thành viên khách hàng</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Dịch vụ</h4>
      <ul>
        <li><a href="${root}pages/sanpham.html">Tìm kiếm</a></li>
        <li><a href="${root}pages/form.html">Đăng nhập</a></li>
        <li><a href="${root}pages/form.html">Đăng ký</a></li>
        <li><a href="${root}pages/giohang.html">Giỏ hàng</a></li>
      </ul>
    </div>

  </div>

  <div class="footer-bottom">
    © 2026 NETTO. Bản quyền thuộc về Nhóm 6.
  </div>
</footer>`;

  const chatbox = `
<div class="chatbox-widget">
  <button class="chatbox-icon" id="chatboxToggle" aria-label="Mở chat">
    <svg viewBox="0 0 24 24" width="26" height="26">
      <path fill="#fff" d="M12 2C6.48 2 2 6.02 2 11c0 2.61 1.24 4.94 3.24 6.6-.11.98-.4 2.38-1.24 3.9 0 0 2.24-.4 4.24-1.93.87.22 1.8.33 2.76.33 5.52 0 10-4.02 10-9S17.52 2 12 2"/>
    </svg>
  </button>
</div>`;
  function capNhatTaiKhoan() {
    const users = JSON.parse(localStorage.getItem("netto_users") || "{}");
    let user = localStorage.getItem("netto_current");
    if (user && !users[user]) {
      localStorage.removeItem("netto_current");
      user = null;
    }
    if (!user) return;

    const link = document.getElementById("account-link");
    const chu = document.getElementById("account-text");
    if (link && chu) {
      link.href = root + "pages/taikhoan.html";
      chu.textContent = "Tài khoản";
    }
    document
      .querySelectorAll('.site-footer a[href*="form.html"]')
      .forEach(function (a, i) {
        if (i === 0) {
          a.href = root + "pages/taikhoan.html";
          a.textContent = "Tài khoản";
        } else {
          a.parentElement.style.display = "none";
        }
      });
  }
  function render() {
    let h = document.getElementById("site-header");

    if (!h) {
      h = document.createElement("div");
      h.id = "site-header";
      document.body.prepend(h);
    }

    let f = document.getElementById("site-footer");

    if (!f) {
      f = document.createElement("div");
      f.id = "site-footer";
      document.body.append(f);
    }

    h.innerHTML = header;
    f.innerHTML = footer;
    capNhatTaiKhoan();
    // Không tạo chatbox trùng lặp
    if (!document.querySelector(".chatbox-widget")) {
      document.body.insertAdjacentHTML("beforeend", chatbox);
    }

    // Đánh dấu menu của trang hiện tại
    const trang = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".main-nav a[data-page]").forEach(function (a) {
      if (a.dataset.page === trang) {
        a.classList.add("active");
      }
    });

    // Nạp tìm kiếm + chatbox sau khi header/chatbox đã có trên trang.
    // async = false để search.js chạy xong rồi mới tới chatbox.js.
    ["search.js", "chatbox.js"].forEach(function (ten) {
      const sc = document.createElement("script");
      sc.src = root + "assets/js/" + ten;
      sc.async = false;
      document.head.appendChild(sc);
    });
  }

  // Chạy sau khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
// ===== Khung đăng nhập nổi =====
function dongKhungDangNhap() {
  const nen = document.getElementById("auth-modal");
  if (nen) nen.classList.remove("mo");
  document.body.style.overflow = "";
}

function moKhungDangNhap(url) {
  let nen = document.getElementById("auth-modal");
  if (!nen) {
    nen = document.createElement("div");
    nen.id = "auth-modal";
    nen.className = "auth-modal";
    nen.innerHTML =
      '<div class="auth-modal-hop">' +
      '<button type="button" class="auth-modal-dong" aria-label="Đóng">&times;</button>' +
      '<iframe class="auth-modal-khung" title="Đăng nhập / Đăng ký"></iframe>' +
      "</div>";
    document.body.appendChild(nen);

    // Bấm nền tối hoặc nút X thì đóng
    nen.addEventListener("click", function (e) {
      if (e.target === nen || e.target.closest(".auth-modal-dong")) {
        dongKhungDangNhap();
      }
    });
    // Bấm Esc thì đóng
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") dongKhungDangNhap();
    });
    // Form báo chiều cao để khung tự co giãn
    window.addEventListener("message", function (e) {
      if (e.data && e.data.netto === "auth-height") {
        nen.querySelector("iframe").style.height = e.data.h + "px";
      }
    });
  }
  const khung = nen.querySelector("iframe");
  if (!khung.getAttribute("src")) {
    khung.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "modal=1";
  }
  nen.classList.add("mo");
  document.body.style.overflow = "hidden";
}

// Bấm vào bất kỳ link nào dẫn tới form.html thì mở khung nổi
document.addEventListener("click", function (e) {
  const link = e.target.closest('a[href*="form.html"]');
  if (!link || location.pathname.endsWith("form.html")) return;
  e.preventDefault();
  moKhungDangNhap(link.href);
});

// Phóng to ảnh đánh giá (dùng chung trang chủ và trang chi tiết sản phẩm)
(function () {
  let lop = null;
  window.nettoMoAnh = function (src) {
    if (!/^data:image\//.test(src)) return;
    if (!lop) {
      lop = document.createElement("div");
      lop.className = "anh-lightbox";
      lop.innerHTML = '<img alt="Ảnh đánh giá" />';
      lop.addEventListener("click", function () {
        lop.classList.remove("open");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") lop.classList.remove("open");
      });
      document.body.appendChild(lop);
    }
    lop.querySelector("img").src = src;
    lop.classList.add("open");
  };
})();
// ===== Nhận tin từ form: đăng nhập / đăng ký thành công =====
window.addEventListener("message", function (e) {
  const khung = document.querySelector("#auth-modal iframe");
  if (!khung || e.source !== khung.contentWindow) return;
  if (!e.data || e.data.netto !== "auth-success") return;

  dongKhungDangNhap();
  if (e.data.dangKy) {
    hienPopupDangKy();
  } else {
    window.location.href = window.nettoRoot + "index.html";
  }
});

function hienPopupDangKy() {
  const nen = document.createElement("div");
  nen.className = "popup-thanhcong";
  nen.innerHTML =
    '<div class="popup-thanhcong-hop">' +
    '<div class="popup-thanhcong-icon">✓</div>' +
    "<h3>Đăng ký thành công!</h3>" +
    "<p>Chào mừng bạn đến với NETTO. Bạn đã được tặng 1 voucher chào mừng.</p>" +
    '<button type="button">Về trang chủ</button>' +
    "</div>";
  document.body.appendChild(nen);
  nen.querySelector("button").addEventListener("click", function () {
    window.location.href = window.nettoRoot + "index.html";
  });
}

// ===== Ghi 1 đơn hàng cho tài khoản đang đăng nhập =====
window.nettoGhiDon = function (tong, soSP) {
  const user = localStorage.getItem("netto_current");
  const users = JSON.parse(localStorage.getItem("netto_users") || "{}");
  if (!user || !users[user]) return false;

  if (tong == null) {
    const gio = JSON.parse(localStorage.getItem("nettoCart") || "[]");
    tong = gio.reduce(function (t, sp) {
      return (
        t +
        (Number(String(sp.gia).replace(/\D/g, "")) || 0) *
          (Number(sp.soLuong) || 0)
      );
    }, 0);
    soSP = gio.reduce(function (t, sp) {
      return t + (Number(sp.soLuong) || 0);
    }, 0);
  }
  users[user].donHang = users[user].donHang || [];
  users[user].donHang.push({
    ma: "DH" + Date.now(),
    ngay: new Date().toISOString(),
    tong: tong,
    soSP: soSP || 0,
  });
  localStorage.setItem("netto_users", JSON.stringify(users));
  return true;
};
