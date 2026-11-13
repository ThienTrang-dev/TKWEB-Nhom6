document.addEventListener("DOMContentLoaded", function () {
  // 1. Ẩn hiện box ngân hàng khi chọn phương thức thanh toán
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoBox = document.getElementById("bankInfoBox");

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "zalopay" || this.value === "vnpay") {
        bankInfoBox.style.display = "block";
      } else {
        bankInfoBox.style.display = "none";
      }
    });
  });

  // 2. ĐỌC DỮ LIỆU TỪ GIỎ HÀNG "nettoCart"
  const itemsContainer = document.getElementById("checkoutItemsList");
  let subtotal = 0;
  let shipping = 30000;
  let discount = 0;

  const gioHang = JSON.parse(localStorage.getItem("nettoCart")) || [];

  function chuyenGiaThanhSo(gia) {
    return Number(String(gia || "").replace(/\D/g, "")) || 0;
  }

  if (itemsContainer) {
    if (gioHang.length > 0) {
      itemsContainer.innerHTML = "";
      subtotal = 0;

      gioHang.forEach((sp) => {
        const donGia = chuyenGiaThanhSo(sp.gia);
        const soLuong = Number(sp.soLuong) || 1;
        const thanhTien = donGia * soLuong;
        subtotal += thanhTien;

        itemsContainer.innerHTML += `
                    <div class="checkout-item-card">
                        <img src="${sp.anh}" alt="${sp.ten}" class="item-thumb-cool">
                        <div class="item-info-cool">
                            <h4>${sp.ten}</h4>
                            <p>Màu: ${sp.mau || "Mặc định"} | Size: ${sp.size || "S"}</p>
                            <p>Số lượng: ${soLuong}</p>
                        </div>
                        <div class="item-price-cool">${thanhTien.toLocaleString("vi-VN")}đ</div>
                    </div>
                `;
      });
    } else {
      itemsContainer.innerHTML = `<p style="color: #888; font-size: 13px;">Giỏ hàng của bạn đang trống.</p>`;
      shipping = 0;
    }
  }

  // Hàm cập nhật tổng tiền
  function updateTotals() {
    document.getElementById("subtotalPrice").innerText =
      subtotal.toLocaleString("vi-VN") + "đ";
    document.getElementById("shippingFee").innerText =
      shipping.toLocaleString("vi-VN") + "đ";

    if (discount > 0) {
      document.getElementById("discountRow").style.display = "flex";
      document.getElementById("discountAmount").innerText =
        "-" + discount.toLocaleString("vi-VN") + "đ";
    } else {
      document.getElementById("discountRow").style.display = "none";
    }

    const finalTotal = Math.max(0, subtotal + shipping - discount);
    document.getElementById("finalTotalPrice").innerText =
      finalTotal.toLocaleString("vi-VN") + "đ";
    document.getElementById("barTotalPrice").innerText =
      finalTotal.toLocaleString("vi-VN") + "đ";
  }

  updateTotals();

  // 3. Xử lý mã giảm giá (Hiển thị thông báo trực tiếp, KHÔNG dùng alert)
  const applyVoucherBtn = document.getElementById("applyVoucherBtn");
  const voucherMessage = document.getElementById("voucherMessage");

  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener("click", function () {
      const code = document
        .getElementById("voucherInput")
        .value.trim()
        .toUpperCase();

      if (code === "NETTO10") {
        discount = 50000;
        if (voucherMessage) {
          voucherMessage.style.color = "#e06d82"; // Màu hồng thương hiệu
          voucherMessage.innerText =
            "✨ Áp dụng mã NETTO10 thành công! Bạn được giảm 50.000đ.";
        }
        updateTotals();
      } else {
        discount = 0;
        if (voucherMessage) {
          voucherMessage.style.color = "#d9534f"; // Màu đỏ báo lỗi
          voucherMessage.innerText =
            "❌ Mã giảm giá không hợp lệ hoặc đã hết hạn!";
        }
        updateTotals();
      }
    });
  }

  // 4. Xử lý đặt hàng thành công
  const checkoutForm = document.getElementById("checkoutForm");
  const successModal = document.getElementById("orderSuccessModal");
  const finishBtn = document.getElementById("finishOrderBtn");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (gioHang.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
      }
      if (typeof nettoGhiDon === "function") nettoGhiDon(); //tính bằng tiền gốc chưa ap mã giảm giá để tính hạng tv luôn
      localStorage.removeItem("nettoCart");
      successModal.style.display = "flex";
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener("click", function () {
      window.location.href = "../index.html";
    });
  }
});
