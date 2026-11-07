// Tên kho lưu trữ giỏ hàng trong localStorage
const TEN_GIO_HANG = "netto_gio_hang";

// Lấy danh sách sản phẩm trong giỏ hàng
function layGioHang() {
    return JSON.parse(localStorage.getItem(TEN_GIO_HANG)) || [];
}

// Lưu giỏ hàng
function luuGioHang(gioHang) {
    localStorage.setItem(TEN_GIO_HANG, JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
}

// Cập nhật số lượng trên biểu tượng giỏ hàng
function capNhatSoLuongGioHang() {
    const gioHang = layGioHang();

    let tongSoLuong = 0;

    gioHang.forEach(function(sp) {
        tongSoLuong += sp.soLuong;
    });

    document.querySelectorAll(".cart-count").forEach(function(el) {
        el.textContent = tongSoLuong;
    });
}

// Thêm sản phẩm vào giỏ hàng
function themVaoGioHang(sp, size, mau, soLuong) {
    const gioHang = layGioHang();

    // Tìm sản phẩm có cùng mã, size và màu
    const sanPhamCu = gioHang.find(function(item) {
        return (
            item.id === sp.id &&
            item.size === size &&
            item.mau === mau
        );
    });

    if (sanPhamCu) {
        // Nếu đã có thì cộng thêm số lượng
        sanPhamCu.soLuong += soLuong;
    } else {
        // Nếu chưa có thì thêm sản phẩm mới
        gioHang.push({
            id: sp.id,
            ma: sp.ma,
            ten: sp.ten,
            loai: sp.loai,
            gia: Number(String(sp.gia).replace(/[^\d]/g, "")),
            giaHienThi: sp.gia,
            anh: "../assets/images/" + sp.loai + "/" + sp.id + ".jpg",
            size: size,
            mau: mau,
            soLuong: soLuong
        });
    }

    luuGioHang(gioHang);

    alert("Đã thêm sản phẩm vào giỏ hàng!");
}

// Cập nhật số lượng khi mở trang
document.addEventListener("DOMContentLoaded", function() {
    capNhatSoLuongGioHang();
});