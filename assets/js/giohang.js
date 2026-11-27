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
// Thông báo khi giỏ hàng trống hoặc chưa chọn sản phẩm
function hienThongBaoChonSanPham() {
    if (document.getElementById("cart-warning")) return;

    const thongBao = document.createElement("div");
    thongBao.id = "cart-warning";
    thongBao.className = "cart-warning";

    thongBao.innerHTML = `
        <div class="cart-warning-box">
            <button type="button" class="cart-warning-close">&times;</button>

            <div class="cart-warning-icon">🛍️</div>

            <h3>Chưa có sản phẩm được chọn!</h3>

            <p>
                Vui lòng chọn ít nhất một sản phẩm
                trước khi tiến hành thanh toán nhé.
            </p>

            <button type="button" class="cart-warning-btn">
                Đã hiểu
            </button>
        </div>
    `;

    document.body.appendChild(thongBao);

    thongBao.querySelector(".cart-warning-close").addEventListener("click", function() {
        thongBao.remove();
    });

    thongBao.querySelector(".cart-warning-btn").addEventListener("click", function() {
        thongBao.remove();
    });

    thongBao.addEventListener("click", function(e) {
        if (e.target === thongBao) {
            thongBao.remove();
        }
    });
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

// Cập nhật lại khi quay lại trang bằng nút Back/Forward
window.addEventListener("pageshow", function() {
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
        hienThongBaoChonSanPham();
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
// Xử lý nút tăng, giảm và xóa sản phẩm
document.addEventListener("click", function(e) {
    const nut = e.target.closest("[data-action]");

    if (!nut) return;

    const hanhDong = nut.dataset.action;
    const index = Number(nut.dataset.index);

    const gioHang = layGioHang();

    if (index < 0 || index >= gioHang.length) return;

    // Xóa sản phẩm
    if (hanhDong === "xoa") {
        gioHang.splice(index, 1);
    }

    // Giảm số lượng
    else if (hanhDong === "giam") {
        if (Number(gioHang[index].soLuong) > 1) {
            gioHang[index].soLuong--;
        }
    }

    // Tăng số lượng
    else if (hanhDong === "tang") {
        gioHang[index].soLuong = Number(gioHang[index].soLuong || 1) + 1;
    }

    luuGioHang(gioHang);
    hienThiGioHang();
});




(function () {
    const CHECKOUT_CART_KEY = "nettoCheckoutCart";
    const MAIN_CART_KEY = "nettoCart";

    function isSelectAll(el) {
        const text = (
            (el.closest("label")?.innerText || el.parentElement?.innerText || "") +
            " " +
            (el.id || "") +
            " " +
            (el.className || "")
        ).toLowerCase();
        return (
            text.includes("chọn tất cả") ||
            text.includes("chon tat ca") ||
            text.includes("select-all") ||
            text.includes("selectall") ||
            text.includes("check-all") ||
            text.includes("checkall")
        );
    }

    function parsePrice(val) {
        return Number(String(val || "").replace(/\D/g, "")) || 0;
    }

    function getCartItemElements() {
        const selectors = [
            ".cart-item",
            ".cart-row",
            ".cart-product-item",
            ".drawer-cart-item",
            ".gio-hang-item",
            "[data-cart-index]",
            "[data-index]"
        ];

        for (const sel of selectors) {
            const nodes = Array.from(document.querySelectorAll(sel)).filter(node =>
                Boolean(node.querySelector('input[type="checkbox"]') || node.querySelector("img"))
            );
            if (nodes.length > 0) return nodes;
        }

        const allCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(
            cb => !isSelectAll(cb)
        );
        const itemContainers = [];
        allCheckboxes.forEach(cb => {
            let parent = cb.parentElement;
            for (let i = 0; i < 5 && parent; i++) {
                if (parent.querySelector("img") && parent.querySelectorAll('input[type="checkbox"]').length === 1) {
                    if (!itemContainers.includes(parent)) {
                        itemContainers.push(parent);
                    }
                    break;
                }
                parent = parent.parentElement;
            }
        });
        return itemContainers;
    }

    function getCheckedIndicesFromDOM(cartLength) {
        const itemEls = getCartItemElements();
        if (itemEls.length > 0) {
            const checkedIdx = [];
            itemEls.forEach((el, idx) => {
                const cb = el.querySelector('input[type="checkbox"]');
                if (cb && !cb.disabled && cb.checked) {
                    checkedIdx.push(idx);
                }
            });
            return checkedIdx;
        }

        const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(
            cb => !isSelectAll(cb) && !cb.disabled
        );
        if (cbs.length > 0) {
            return cbs.map((cb, idx) => (cb.checked ? idx : -1)).filter(idx => idx >= 0 && idx < cartLength);
        }

        return null;
    }

    // Cập nhật lại tổng tiền hiển thị trên drawer giỏ hàng chỉ tính các món được tích
    function capNhatTongTienDrawer() {
        const cart = JSON.parse(localStorage.getItem(MAIN_CART_KEY) || "[]");
        if (!Array.isArray(cart)) return;

        const checkedIndices = getCheckedIndicesFromDOM(cart.length);
        const selectedItems = Array.isArray(checkedIndices)
            ? checkedIndices.map(idx => cart[idx]).filter(Boolean)
            : cart.filter(item => item.checked !== false);

        const totalMoney = selectedItems.reduce(
            (sum, sp) => sum + parsePrice(sp.gia || sp.price) * (Number(sp.soLuong || sp.quantity) || 1),
            0
        );

        const totalSelectors = [
            "#cartTotal",
            "#cart-total",
            ".cart-total-price",
            ".cart-total-amount",
            ".drawer-total-price"
        ];
        for (const sel of totalSelectors) {
            const el = document.querySelector(sel);
            if (el) {
                el.innerText = totalMoney.toLocaleString("vi-VN") + "đ";
            }
        }
    }

    // Lưu trạng thái tick/bỏ tick của từng món vào nettoCart (KHÔNG xóa món bỏ tick)
    document.addEventListener("change", function (e) {
        if (!e.target || !e.target.matches('input[type="checkbox"]')) return;

        const cart = JSON.parse(localStorage.getItem(MAIN_CART_KEY) || "[]");
        if (!Array.isArray(cart) || cart.length === 0) return;

        if (isSelectAll(e.target)) {
            const checkAllState = e.target.checked;
            cart.forEach(item => {
                item.checked = checkAllState;
            });
            localStorage.setItem(MAIN_CART_KEY, JSON.stringify(cart));
            setTimeout(capNhatTongTienDrawer, 0);
            return;
        }

        const itemEls = getCartItemElements();
        if (itemEls.length === cart.length) {
            itemEls.forEach((el, idx) => {
                const cb = el.querySelector('input[type="checkbox"]');
                if (cb && cart[idx]) {
                    cart[idx].checked = cb.checked;
                }
            });
            localStorage.setItem(MAIN_CART_KEY, JSON.stringify(cart));
        }
        setTimeout(capNhatTongTienDrawer, 0);
    });

    // Khi bấm TIẾN HÀNH THANH TOÁN: chỉ gửi các món được tick vào nettoCheckoutCart, giữ nguyên nettoCart
    document.addEventListener(
        "click",
        function (e) {
            const trigger = e.target.closest("a, button");
            if (!trigger) return;

            const text = (trigger.innerText || trigger.textContent || "").trim().toLowerCase();
            const href = (trigger.getAttribute("href") || "").toLowerCase();
            const isCheckoutBtn =
                href.includes("thanhtoan") ||
                text.includes("tiến hành thanh toán") ||
                text.includes("tien hanh thanh toan") ||
                text.includes("thanh toán") ||
                text.includes("thanh toan") ||
                trigger.id === "btnCheckout" ||
                trigger.classList.contains("btn-checkout") ||
                trigger.classList.contains("checkout-btn");

            if (!isCheckoutBtn) return;

            const cart = JSON.parse(localStorage.getItem(MAIN_CART_KEY) || "[]");
            if (!Array.isArray(cart) || cart.length === 0) return;

            const checkedIndices = getCheckedIndicesFromDOM(cart.length);
            let selectedItems = [];

            if (Array.isArray(checkedIndices)) {
                selectedItems = checkedIndices.map(idx => cart[idx]).filter(Boolean);
            } else if (cart.some(item => typeof item.checked === "boolean")) {
                selectedItems = cart.filter(item => item.checked !== false);
            } else {
                selectedItems = cart;
            }

            if (selectedItems.length === 0) {
                e.preventDefault();
                e.stopPropagation();
                alert("Vui lòng tick chọn ít nhất 1 sản phẩm để thanh toán!");
                return;
            }

            // Chỉ lưu món được chọn sang nettoCheckoutCart, KHÔNG ghi đè xóa mất món chưa chọn ở nettoCart
            localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(selectedItems));
        },
        true
    );
})();
