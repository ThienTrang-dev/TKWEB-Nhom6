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

    // Kiểm tra tất cả sản phẩm có được chọn hay không
    const tatCaDuocChon = gioHang.every(function(sp) {
        return sp.duocChon !== false;
    });

    // Hiển thị danh sách sản phẩm
    danhSach.innerHTML = `
        <div class="mini-cart-select-all">
            <label>
                <input type="checkbox" id="cart-select-all"
                    ${tatCaDuocChon ? "checked" : ""}>
                Chọn tất cả
            </label>
        </div>
    ` + gioHang.map(function(sp, index) {
        const gia = chuyenGiaThanhSo(sp.gia);
        const soLuong = Number(sp.soLuong) || 1;
        const duocChon = sp.duocChon !== false;

        return `
            <div class="mini-cart-item">
                <input
                    type="checkbox"
                    class="cart-item-checkbox"
                    data-select-index="${index}"
                    ${duocChon ? "checked" : ""}
                >

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
                            <button type="button"
                                data-action="giam"
                                data-index="${index}">−</button>

                            <span>${soLuong}</span>

                            <button type="button"
                                data-action="tang"
                                data-index="${index}">+</button>
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

    // Tính lại tổng tiền theo những sản phẩm được chọn
    tongTien.textContent = dinhDangTien(
        tinhTongTienGioHang(gioHang)
    );
}

function tinhTongTienGioHang(gioHang) {
    return gioHang.reduce(function(tong, sp) {
        if (sp.duocChon === false) return tong;

        const gia = chuyenGiaThanhSo(sp.gia);
        const soLuong = Number(sp.soLuong) || 1;

        return tong + gia * soLuong;
    }, 0);
}
// Xử lý sự kiện click giỏ hàng
document.addEventListener("click", function(e) {

    // Nhấn icon giỏ hàng trên header hoặc footer
    if (e.target.closest("#header-cart-toggle, .footer-cart-link")) {
        e.preventDefault();
        moGioHang();
        return;
    }

    // Nhấn nút đóng
    if (e.target.closest(".mini-cart-close")) {
        dongGioHang();
        return;
    }

    // Nhấn ra ngoài khung giỏ hàng
    if (e.target.id === "cart-overlay") {
        dongGioHang();
    }
});

// Nhấn ESC để đóng giỏ hàng
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        dongGioHang();
    }
});

// Cập nhật số lượng khi tải trang
document.addEventListener("DOMContentLoaded", function() {
    capNhatSoLuongGioHang();
});
// Xử lý chọn/bỏ chọn sản phẩm
document.addEventListener("change", function(e) {
    const gioHang = layGioHang();

    // Chọn tất cả
    if (e.target.id === "cart-select-all") {
        gioHang.forEach(function(sp) {
            sp.duocChon = e.target.checked;
        });
    }

    // Chọn từng sản phẩm
    if (e.target.classList.contains("cart-item-checkbox")) {
        const index = Number(e.target.dataset.selectIndex);

        gioHang[index].duocChon = e.target.checked;
    }

    luuGioHang(gioHang);
    hienThiGioHang();
});
// Xử lý nút tiến hành thanh toán
document.addEventListener("click", function(e) {
    const nutThanhToan = e.target.closest(".mini-cart-checkout");

    if (!nutThanhToan) return;

    const gioHang = layGioHang();

    // Lấy những sản phẩm được chọn
    const sanPhamDuocChon = gioHang.filter(function(sp) {
        return sp.duocChon !== false;
    });

    if (sanPhamDuocChon.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm!");
        return;
    }

    // Lưu sản phẩm được chọn để trang thanh toán sử dụng
    localStorage.setItem(
        "nettoCheckout",
        JSON.stringify(sanPhamDuocChon)
    );

    // Chuyển đến trang thanh toán
    const script = document.querySelector('script[src*="giohang.js"]');

    if (!script) {
        alert("Không tìm thấy đường dẫn giỏ hàng!");
        return;
    }

    const thuMucGoc = script.src.replace(
        /assets\/js\/giohang\.js(?:\?.*)?$/,
        ""
    );

    window.location.href = thuMucGoc + "pages/thanhtoan.html";
});