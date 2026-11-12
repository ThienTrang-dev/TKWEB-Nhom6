/* =========================================
   GIỎ HÀNG MINI - NETTO CLOTHES
========================================= */

// Lưu đường dẫn gốc của website
const duongDanGoc = new URL("../../", document.currentScript.src);

// Lấy giỏ hàng từ localStorage
let gioHang = JSON.parse(localStorage.getItem("nettoCart")) || [];

// Loại bỏ những sản phẩm có dữ liệu không hợp lệ
gioHang = gioHang.filter(function(sp) {
    return sp &&
        sp.id != null &&
        sp.ten &&
        sp.gia != null &&
        Number(sp.soLuong) > 0;
});

// Chuyển giá thành số
function chuyenGiaThanhSo(gia) {
    return Number(String(gia || "").replace(/\D/g, "")) || 0;
}

// Định dạng tiền
function dinhDangTien(gia) {
    return gia.toLocaleString("vi-VN") + "đ";
}

// Lưu giỏ hàng
function luuGioHang() {
    localStorage.setItem("nettoCart", JSON.stringify(gioHang));
}

// Cập nhật số lượng trên Header
function capNhatSoLuongGioHang() {
    const dem = document.querySelector(".cart-count");

    if (dem) {
        const tongSoLuong = gioHang.reduce(function(tong, sp) {
            return tong + (Number(sp.soLuong) || 0);
        }, 0);

        dem.textContent = tongSoLuong;
        dem.style.display = tongSoLuong > 0 ? "inline-flex" : "none";
    }
}

// Tạo giao diện giỏ hàng
function taoKhungGioHang() {
    if (document.getElementById("cart-overlay")) {
        return;
    }

    const khung = document.createElement("div");

    khung.id = "cart-overlay";
    khung.className = "cart-overlay";

    khung.innerHTML = `
        <div class="cart-modal">

            <div class="cart-header">
                <h3>Giỏ hàng của bạn</h3>

                <button type="button" class="cart-close">
                    &times;
                </button>
            </div>

            <div class="cart-items"></div>

            <div class="cart-footer">

                <div class="cart-total">
                    <span>Tổng tiền:</span>
                    <strong>0đ</strong>
                </div>

                <button type="button" class="cart-checkout">
                    TIẾN HÀNH THANH TOÁN
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(khung);

    khung.querySelector(".cart-close").addEventListener("click", dongGioHang);

    khung.addEventListener("click", function(event) {
        if (event.target === khung) {
            dongGioHang();
        }
    });

    // Xử lý tăng, giảm số lượng và xóa sản phẩm
    khung.querySelector(".cart-items").addEventListener("click", function(event) {
        const nut = event.target.closest("button");

        if (!nut) return;

        const index = Number(nut.dataset.index);

        if (nut.classList.contains("cart-plus")) {
            gioHang[index].soLuong++;
        }

        if (nut.classList.contains("cart-minus")) {
            gioHang[index].soLuong--;

            if (gioHang[index].soLuong <= 0) {
                gioHang.splice(index, 1);
            }
        }

        if (nut.classList.contains("cart-remove")) {
            gioHang.splice(index, 1);
        }

        luuGioHang();
        hienThiGioHang();
    });

    // Nút thanh toán
    khung.querySelector(".cart-checkout").addEventListener("click", function() {
        if (gioHang.length > 0) {
            window.location.href = new URL("pages/thanhtoan.html", duongDanGoc).href;
        }
    });
}

// Hiển thị sản phẩm trong giỏ
function hienThiGioHang() {
    const danhSach = document.querySelector(".cart-items");
    const tongTien = document.querySelector(".cart-total strong");
    const nutThanhToan = document.querySelector(".cart-checkout");

    if (!danhSach) return;

    danhSach.innerHTML = "";

    if (gioHang.length === 0) {
        danhSach.innerHTML = `
            <div class="cart-empty">
                Giỏ hàng của bạn đang trống.
            </div>
        `;

        tongTien.textContent = "0đ";
        nutThanhToan.disabled = true;

        capNhatSoLuongGioHang();
        return;
    }

    let tong = 0;

    gioHang.forEach(function(sp, index) {
        const gia = chuyenGiaThanhSo(sp.gia);
        tong += gia * Number(sp.soLuong);

        const sanPham = document.createElement("div");
        sanPham.className = "cart-item";

        const anh = document.createElement("img");
        anh.src = sp.anh;
        anh.alt = sp.ten;

        const thongTin = document.createElement("div");
        thongTin.className = "cart-item-info";

        const ten = document.createElement("h4");
        ten.textContent = sp.ten;

        const mau = document.createElement("p");
        mau.textContent = "Màu: " + sp.mau;

        const size = document.createElement("p");
        size.textContent = "Size: " + sp.size;

        const giaSP = document.createElement("div");
        giaSP.className = "cart-item-price";
        giaSP.textContent = dinhDangTien(gia);

        const soLuong = document.createElement("div");
        soLuong.className = "cart-quantity";

        soLuong.innerHTML = `
            <button type="button" class="cart-minus" data-index="${index}">-</button>
            <span>${sp.soLuong}</span>
            <button type="button" class="cart-plus" data-index="${index}">+</button>
            <button type="button" class="cart-remove" data-index="${index}">Xóa</button>
        `;

        thongTin.appendChild(ten);
        thongTin.appendChild(mau);
        thongTin.appendChild(size);
        thongTin.appendChild(giaSP);
        thongTin.appendChild(soLuong);

        sanPham.appendChild(anh);
        sanPham.appendChild(thongTin);

        danhSach.appendChild(sanPham);
    });

    tongTien.textContent = dinhDangTien(tong);
    nutThanhToan.disabled = false;

    capNhatSoLuongGioHang();
}

// Thêm sản phẩm vào giỏ hàng
function themVaoGioHang(sp) {
    const sanPhamCu = gioHang.find(function(item) {
        return item.id === sp.id &&
            item.size === sp.size &&
            item.mau === sp.mau;
    });

    if (sanPhamCu) {
        sanPhamCu.soLuong += Number(sp.soLuong);
    } else {
        gioHang.push({
            id: sp.id,
            ten: sp.ten,
            gia: sp.gia,
            anh: sp.anh,
            size: sp.size,
            mau: sp.mau,
            soLuong: Number(sp.soLuong)
        });
    }

    luuGioHang();
    hienThiGioHang();

    // Không tự động mở giỏ hàng nữa
}
// Mở giỏ hàng
function moGioHang() {
    const khung = document.getElementById("cart-overlay");

    if (khung) {
        khung.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

// Đóng giỏ hàng
function dongGioHang() {
    const khung = document.getElementById("cart-overlay");

    if (khung) {
        khung.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", function() {

    taoKhungGioHang();

    luuGioHang();

    hienThiGioHang();

    // Bắt sự kiện Header và Footer
    document.addEventListener("click", function(event) {
        if (
            event.target.closest("#header-cart-toggle") ||
            event.target.closest(".footer-cart-link")
        ) {
            event.preventDefault();
            moGioHang();
        }
    });

    // Nhấn ESC để đóng
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            dongGioHang();
        }
    });

});