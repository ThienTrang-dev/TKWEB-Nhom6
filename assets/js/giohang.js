/* =========================================
   GIỎ HÀNG MINI - NETTO CLOTHES
========================================= */

// Đọc giỏ hàng từ localStorage
function layGioHang() {
    try {
        return JSON.parse(localStorage.getItem("nettoCart")) || [];
    } catch (e) {
        return [];
    }
}

// Lưu giỏ hàng
function luuGioHang(gioHang) {
    localStorage.setItem("nettoCart", JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
}

// Chuyển giá thành số
function chuyenGiaThanhSo(gia) {
    if (typeof gia === "number") return gia;

    return Number(String(gia).replace(/[^\d]/g, "")) || 0;
}

// Định dạng giá tiền
function dinhDangTien(gia) {
    return chuyenGiaThanhSo(gia).toLocaleString("vi-VN") + "đ";
}

// Cập nhật số lượng trên icon giỏ hàng
function capNhatSoLuongGioHang() {
    const gioHang = layGioHang();

    const tongSoLuong = gioHang.reduce(function(tong, sp) {
        return tong + Number(sp.soLuong || 0);
    }, 0);

    document.querySelectorAll(".cart-count").forEach(function(nut) {
        nut.textContent = tongSoLuong;
    });
}

// Tạo khung giỏ hàng mini
function taoKhungGioHang() {
    if (document.getElementById("cart-overlay")) return;

    const khung = document.createElement("div");
    khung.id = "cart-overlay";
    khung.className = "cart-overlay";

    khung.innerHTML = `
        <div class="mini-cart">
            <div class="mini-cart-header">
                <h2>GIỎ HÀNG CỦA BẠN</h2>
                <button type="button" class="mini-cart-close">&times;</button>
            </div>

            <div class="mini-cart-body" id="mini-cart-list"></div>

            <div class="mini-cart-footer">
                <div class="mini-cart-total">
                    <span>Tổng tiền:</span>
                    <strong id="mini-cart-total">0đ</strong>
                </div>

                <button type="button" class="mini-cart-checkout">
                    TIẾN HÀNH THANH TOÁN
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(khung);
}

// Mở giỏ hàng
function moGioHang() {
    taoKhungGioHang();

    const khung = document.getElementById("cart-overlay");

    hienThiGioHang();
    khung.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Đóng giỏ hàng
function dongGioHang() {
    const khung = document.getElementById("cart-overlay");

    if (khung) {
        khung.classList.remove("active");
    }

    document.body.style.overflow = "";
}

// Hiển thị danh sách sản phẩm
function hienThiGioHang() {
    const gioHang = layGioHang();
    const danhSach = document.getElementById("mini-cart-list");
    const tongTien = document.getElementById("mini-cart-total");

    if (!danhSach || !tongTien) return;

    if (gioHang.length === 0) {
        danhSach.innerHTML = `
            <div class="mini-cart-empty">
                <p>Giỏ hàng của bạn đang trống.</p>
                <span>Hãy chọn thêm sản phẩm nhé!</span>
            </div>
        `;

        tongTien.textContent = "0đ";
        return;
    }

    let tong = 0;

    danhSach.innerHTML = gioHang.map(function(sp, index) {
        const gia = chuyenGiaThanhSo(sp.gia);
        const soLuong = Number(sp.soLuong) || 1;

        tong += gia * soLuong;

        return `
            <div class="mini-cart-item">
                <img
                    src="${sp.anh || ""}"
                    alt="${sp.ten || "Sản phẩm"}"
                    class="mini-cart-image"
                >

                <div class="mini-cart-info">
                    <h3>${sp.ten || "Sản phẩm"}</h3>

                    <p>Màu: ${sp.mau || "Chưa chọn"}</p>
                    <p>Size: ${sp.size || "Chưa chọn"}</p>

                    <strong>${dinhDangTien(gia)}</strong>

                    <div class="mini-cart-actions">
                        <div class="mini-cart-quantity">
                            <button type="button" data-action="giam" data-index="${index}">−</button>
                            <span>${soLuong}</span>
                            <button type="button" data-action="tang" data-index="${index}">+</button>
                        </div>

                        <button
                            type="button"
                            class="mini-cart-remove"
                            data-action="xoa"
                            data-index="${index}"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    tongTien.textContent = dinhDangTien(tong);
}

// Xử lý các nút trong giỏ hàng
document.addEventListener("click", function(e) {
    // Mở giỏ hàng từ Header hoặc Footer
    if (e.target.closest("#header-cart-toggle, .footer-cart-link")) {
        e.preventDefault();
        moGioHang();
        return;
    }

    // Đóng bằng nút X
    if (e.target.closest(".mini-cart-close")) {
        dongGioHang();
        return;
    }

    // Đóng khi bấm ra ngoài popup
    if (e.target.id === "cart-overlay") {
        dongGioHang();
        return;
    }

    // Tăng, giảm hoặc xóa sản phẩm
    const nut = e.target.closest("[data-action]");
    if (nut) {
        const hanhDong = nut.dataset.action;
        const viTri = Number(nut.dataset.index);
        const gioHang = layGioHang();

        if (!gioHang[viTri]) return;

        if (hanhDong === "tang") {
            gioHang[viTri].soLuong++;
        }

        if (hanhDong === "giam") {
            gioHang[viTri].soLuong--;

            if (gioHang[viTri].soLuong <= 0) {
                gioHang.splice(viTri, 1);
            }
        }

        if (hanhDong === "xoa") {
            gioHang.splice(viTri, 1);
        }

        luuGioHang(gioHang);
        hienThiGioHang();
        return;
    }

    // Chuyển đến trang thanh toán
    if (e.target.closest(".mini-cart-checkout")) {
        const gioHang = layGioHang();

        if (gioHang.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }

        const self = document.querySelector('script[src$="giohang.js"]');
        const root = new URL("../../", self.src).href;

        window.location.href = root + "pages/thanhtoan.html";
    }
});

// Đóng bằng phím Escape
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        dongGioHang();
    }
});

// Khởi tạo giỏ hàng sau khi DOM sẵn sàng
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", capNhatSoLuongGioHang);
} else {
    capNhatSoLuongGioHang();
}