document.addEventListener("DOMContentLoaded", function () {
  // 0. Tải danh sách 63 Tỉnh/Thành phố tự động qua API
  const citySelect = document.getElementById("citySelect");
  const districtSelect = document.getElementById("districtSelect");
  const wardSelect = document.getElementById("wardSelect");

  if (citySelect && districtSelect && wardSelect) {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((city) => {
          const option = document.createElement("option");
          option.value = city.name;
          option.text = city.name;
          option.dataset.code = city.code;
          citySelect.appendChild(option);
        });

        citySelect.addEventListener("change", function () {
          const selectedCityCode =
            this.options[this.selectedIndex].dataset.code;
          districtSelect.innerHTML =
            '<option value="">Chọn quận/huyện</option>';
          wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';

          const selectedCity = data.find((c) => c.code == selectedCityCode);
          if (selectedCity && selectedCity.districts) {
            selectedCity.districts.forEach((district) => {
              const option = document.createElement("option");
              option.value = district.name;
              option.text = district.name;
              option.dataset.code = district.code;
              districtSelect.appendChild(option);
            });
          }
        });

        districtSelect.addEventListener("change", function () {
          const selectedCityCode =
            citySelect.options[citySelect.selectedIndex].dataset.code;
          const selectedDistrictCode =
            this.options[this.selectedIndex].dataset.code;
          wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';

          const selectedCity = data.find((c) => c.code == selectedCityCode);
          if (selectedCity && selectedCity.districts) {
            const selectedDistrict = selectedCity.districts.find(
              (d) => d.code == selectedDistrictCode,
            );
            if (selectedDistrict && selectedDistrict.wards) {
              selectedDistrict.wards.forEach((ward) => {
                const option = document.createElement("option");
                option.value = ward.name;
                option.text = ward.name;
                wardSelect.appendChild(option);
              });
            }
          }
        });
      })
      .catch((error) =>
        console.log("Không thể tải dữ liệu hành chính:", error),
      );
  }

  // 1. Ẩn/hiện thông tin QR khi chọn phương thức thanh toán
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoBox = document.getElementById("bankInfoBox");

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "qr") {
        bankInfoBox.style.display = "block";
      } else {
        bankInfoBox.style.display = "none";
      }
    });
  });

  // 2. Hiển thị danh sách giỏ hàng cơ bản gọn gàng
  const itemsContainer = document.getElementById("checkoutItemsList");
  let subtotal = 0;
  let shipping = 30000;
  let discount = 0;

  const laMuaNgay = new URLSearchParams(location.search).get("muangay") === "1";
  let gioHang = [];
  try {
    gioHang =
      JSON.parse(localStorage.getItem(laMuaNgay ? "muaNgay" : "nettoCart")) ||
      [];
  } catch (e) {}
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
      itemsContainer.innerHTML = `<p style="color: #888; font-size: 13px; text-align: center; padding: 10px;">Giỏ hàng của bạn đang trống.</p>`;
      shipping = 0;
    }
  }

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

    const barSavingText = document.getElementById("barSavingText");
    if (barSavingText) {
      barSavingText.innerText =
        "Tiết kiệm " + discount.toLocaleString("vi-VN") + "đ";
    }
  }

  updateTotals();

  // 3. Xử lý mã giảm giá chuẩn theo trang Khuyến mãi
  const applyVoucherBtn = document.getElementById("applyVoucherBtn");
  const voucherMessage = document.getElementById("voucherMessage");

  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener("click", function () {
      const code = document
        .getElementById("voucherInput")
        .value.trim()
        .toUpperCase();
      discount = 0;

      if (!voucherMessage) return;

      if (gioHang.length === 0) {
        voucherMessage.style.color = "#d9534f";
        voucherMessage.innerText =
          "❌ Giỏ hàng đang trống, không thể áp dụng mã!";
        updateTotals();
        return;
      }

      if (code === "GIAM20%") {
        if (subtotal >= 500000) {
          discount = Math.min(subtotal * 0.2, 10000); // Giảm 20% tối đa 10k
          voucherMessage.style.color = "#e06d82";
          voucherMessage.innerText = `✨ Áp dụng mã GIAM20% thành công! Bạn được giảm ${discount.toLocaleString("vi-VN")}đ.`;
        } else {
          voucherMessage.style.color = "#d9534f";
          voucherMessage.innerText =
            "❌ Mã GIAM20% chỉ áp dụng cho đơn từ 500.000đ trở lên!";
        }
      } else if (code === "FREESHIP") {
        if (subtotal >= 1000000) {
          discount = Math.min(shipping, 40000); // Freeship tối đa 40k
          voucherMessage.style.color = "#e06d82";
          voucherMessage.innerText = `✨ Áp dụng mã FREESHIP thành công! Bạn được miễn phí vận chuyển ${discount.toLocaleString("vi-VN")}đ.`;
        } else {
          voucherMessage.style.color = "#d9534f";
          voucherMessage.innerText =
            "❌ Mã FREESHIP chỉ áp dụng cho đơn từ 1.000.000đ trở lên!";
        }
      } else if (code === "CHAOBANMOI") {
        discount = Math.min(shipping, 10000); // Trợ ship 10k mọi đơn
        voucherMessage.style.color = "#e06d82";
        voucherMessage.innerText = `✨ Áp dụng mã CHAOBANMOI thành công! Bạn được trợ ship ${discount.toLocaleString("vi-VN")}đ.`;
      } else {
        voucherMessage.style.color = "#d9534f";
        voucherMessage.innerText =
          "❌ Mã giảm giá không hợp lệ hoặc không tồn tại!";
      }

      updateTotals();
    });
  }

  // 4. Xử lý đặt hàng & Kiểm tra điều kiện với dòng thông báo trực tiếp dưới ô input
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

      const fullnameInput = document.getElementById("fullname");
      const phoneInput = document.getElementById("phone");
      const emailInput = document.getElementById("email");

      const fullname = fullnameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();

      const fullnameError = document.getElementById("fullnameError");
      const phoneError = document.getElementById("phoneError");
      const emailError = document.getElementById("emailError");

      // Reset lỗi cũ
      fullnameError.style.display = "none";
      phoneError.style.display = "none";
      emailError.style.display = "none";

      let isValid = true;

      // Kiểm tra Họ tên từ 2 từ trở lên
      const nameWords = fullname.split(/\s+/).filter(Boolean);
      if (nameWords.length < 2) {
        fullnameError.innerText =
          "⚠️ Vui lòng nhập họ và tên đầy đủ từ 2 từ trở lên!";
        fullnameError.style.display = "block";
        fullnameInput.focus();
        isValid = false;
        return;
      }

      // Kiểm tra Số điện thoại đúng 10 chữ số bắt đầu bằng 0
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phone)) {
        phoneError.innerText =
          "⚠️ Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!";
        phoneError.style.display = "block";
        phoneInput.focus();
        isValid = false;
        return;
      }

      // Kiểm tra Email có chứa @
      if (email && !email.includes("@")) {
        emailError.innerText = "⚠️ Địa chỉ email phải chứa ký tự '@'!";
        emailError.style.display = "block";
        emailInput.focus();
        isValid = false;
        return;
      }
      if (isValid) {
        if (typeof nettoGhiDon === "function") {
          if (laMuaNgay) {
            const soSP = gioHang.reduce(function (t, sp) {
              return t + (Number(sp.soLuong) || 0);
            }, 0);
            nettoGhiDon(subtotal, soSP);
          } else {
            nettoGhiDon();
          }
        }
        if (typeof nettoTruTon === "function") nettoTruTon(gioHang);
        if (laMuaNgay) {
          localStorage.removeItem("muaNgay");
        } else {
          localStorage.removeItem("nettoCart");
        }
        successModal.style.display = "flex";
      }
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener("click", function () {
      window.location.href = "../index.html";
    });
  }
});
