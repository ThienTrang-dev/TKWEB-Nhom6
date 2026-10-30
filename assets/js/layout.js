
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

  const header = `
<header class="site-header">
  <div class="topbar">
    <a href="${root}index.html" class="logo">NETTO</a>

    <div class="search-box">
      <select class="search-select">
        <option>Tất cả</option>
        <option>Áo</option>
        <option>Váy / Chân váy</option>
        <option>Phụ kiện</option>
      </select>

      <input type="text" placeholder="Tìm sản phẩm bạn mong muốn">

      <button type="button" class="search-btn" aria-label="Tìm kiếm">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"/>
        </svg>
      </button>
    </div>

    <div class="topbar-right">
      <a href="${root}pages/form.html" class="account-link">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5m0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5"/>
        </svg>
        <span>Đăng nhập / Đăng ký</span>
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
            <a href="${root}pages/sanpham.html?loai=ao">Áo</a>
          </li>
          <li>
            <a href="${root}pages/sanpham.html?loai=vay">Váy / Chân váy</a>
          </li>
          <li>
            <a href="${root}pages/sanpham.html?loai=phukien">Phụ kiện</a>
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
        <a href="#" aria-label="Youtube">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#fff" d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8M10 15V9l5.2 3z"/>
          </svg>
        </a>

        <a href="#" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#fff" d="M12 2c2.7 0 3.06 0 4.12.06 1.06.05 1.79.22 2.43.47a4.9 4.9 0 0 1 1.78 1.15 4.9 4.9 0 0 1 1.15 1.78c.25.64.42 1.37.47 2.43.06 1.06.06 1.42.06 4.12s0 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.78 4.9 4.9 0 0 1-1.78 1.15c-.64.25-1.37.42-2.43.47-1.06.06-1.42.06-4.12.06s-3.06 0-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.78-1.15 4.9 4.9 0 0 1-1.15-1.78c-.25-.64-.42-1.37-.47-2.43C2 15.06 2 14.7 2 12s0-3.06.06-4.12c.05-1.06.22-1.79.47-2.43a4.9 4.9 0 0 1 1.15-1.78A4.9 4.9 0 0 1 5.46.52c.64-.25 1.37-.42 2.43-.47C8.94 0 9.3 0 12 0zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4M17.4 5.7a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0"/>
          </svg>
        </a>

        <a href="#" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="16" height="16">
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
  <div class="chatbox-popup" id="chatboxPopup">
    <button class="chatbox-close" id="chatboxClose">&times;</button>
    <p>Chào mừng bạn đến với NETTO ♡</p>
    <a href="#" class="chatbox-btn">Chat Now</a>
  </div>

  <button class="chatbox-icon" id="chatboxToggle" aria-label="Mở chat">
    <svg viewBox="0 0 24 24" width="26" height="26">
      <path fill="#fff" d="M12 2C6.48 2 2 6.02 2 11c0 2.61 1.24 4.94 3.24 6.6-.11.98-.4 2.38-1.24 3.9 0 0 2.24-.4 4.24-1.93.87.22 1.8.33 2.76.33 5.52 0 10-4.02 10-9S17.52 2 12 2"/>
    </svg>
  </button>
</div>`;

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
  }

  // Chạy sau khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
