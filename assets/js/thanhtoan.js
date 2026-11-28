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
            '<option value="">Chọn Quận / Huyện</option>';
          wardSelect.innerHTML = '<option value="">Chọn Phường / Xã</option>';

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
          wardSelect.innerHTML = '<option value="">Chọn Phường / Xã</option>';

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

  // 1. Ẩn/hiện thông tin QR & highlight thẻ thanh toán đang chọn
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoBox = document.getElementById("bankInfoBox");

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      document
        .querySelectorAll(".payment-item")
        .forEach((item) => item.classList.remove("active"));
      if (this.closest(".payment-item")) {
        this.closest(".payment-item").classList.add("active");
      }

      if (this.value === "qr") {
        bankInfoBox.style.display = "block";
        batDauDemNguoc();
      } else {
        bankInfoBox.style.display = "none";
        dungDemNguoc();
      }
    });
  });

  function trichXuatTenFile(raw) {
    if (!raw) return "";
    if (Array.isArray(raw)) raw = raw[0] || "";
    if (typeof raw === "object" && raw !== null) raw = raw.src || raw.url || "";
    const str = String(raw).trim().split("?")[0];
    if (!str || str.toLowerCase().includes("qr")) return "";
    const parts = str.split("/");
    return parts[parts.length - 1] || "";
  }

  function taoDanhSachUngVienAnh(sp) {
    const candidates = [];
    if (
      sp &&
      typeof sp.anh === "string" &&
      sp.anh.trim() &&
      !sp.anh.toLowerCase().includes("qr")
    ) {
      candidates.push(sp.anh.trim());
    }

    let tenFile = "";
    if (sp && Array.isArray(sp.mauArr) && sp.mauArr.length > 0) {
      tenFile = trichXuatTenFile(sp.mauArr[0].anh);
    }
    if (!tenFile && sp && Array.isArray(sp.mau) && sp.mau.length > 0) {
      tenFile = trichXuatTenFile(sp.mau[0].anh);
    }
    if (!tenFile && sp) {
      tenFile = trichXuatTenFile(
        sp.anh || sp.image || sp.img || sp.hinh || sp.thumbnail || sp.images,
      );
    }

    if (tenFile) {
      candidates.push("../assets/images/" + tenFile);
      candidates.push("../assets/images/sanpham/" + tenFile);
      candidates.push("../assets/images/products/" + tenFile);
      candidates.push("../images/" + tenFile);
      candidates.push("./assets/images/" + tenFile);
      candidates.push("assets/images/" + tenFile);
    }
    candidates.push("../assets/images/logo.png");
    return [...new Set(candidates)];
  }

  function ganTuDongSuaAnh(imgEl, candidates) {
    if (!imgEl || !Array.isArray(candidates) || candidates.length === 0) return;
    let idx = 0;
    imgEl.src = candidates[0];
    imgEl.onerror = function () {
      idx += 1;
      if (idx < candidates.length) {
        imgEl.src = candidates[idx];
      } else {
        imgEl.onerror = null;
      }
    };
  }

  // 2. Hiển thị danh sách giỏ hàng liên kết từ nettoCart (kèm tăng/giảm/xóa)
  const itemsContainer = document.getElementById("checkoutItemsList");
  const cartItemCountLabel = document.getElementById("cartItemCountLabel");
  let subtotal = 0;
  let shipping = 30000;
  let discount = 0;
  let currentVoucherCode = "";

  let gioHang = (JSON.parse(localStorage.getItem("nettoCart")) || []).map(
    (sp) => {
      const listAnh = taoDanhSachUngVienAnh(sp);
      return { ...sp, anh: listAnh[0] || "../assets/images/logo.png" };
    },
  );
  localStorage.setItem("nettoCart", JSON.stringify(gioHang));

  function chuyenGiaThanhSo(gia) {
    return Number(String(gia || "").replace(/\D/g, "")) || 0;
  }

  function renderCheckoutCart() {
    if (!itemsContainer) return;

    const tongSoLuong = gioHang.reduce(
      (sum, sp) => sum + (Number(sp.soLuong) || 1),
      0,
    );
    if (cartItemCountLabel) {
      cartItemCountLabel.innerText = `${tongSoLuong} sản phẩm`;
    }

    if (gioHang.length > 0) {
      itemsContainer.innerHTML = "";
      subtotal = 0;

      gioHang.forEach((sp, index) => {
        const donGia = chuyenGiaThanhSo(sp.gia);
        const soLuong = Number(sp.soLuong) || 1;
        const thanhTien = donGia * soLuong;
        subtotal += thanhTien;

        itemsContainer.innerHTML += `
                    <div class="checkout-item-card">
                        <img data-item-index="${index}" alt="${sp.ten}" class="item-thumb-cool">
                        <div class="item-info-cool">
                            <h4>${sp.ten}</h4>
                            <div class="item-variant-pills">
                                <span class="variant-pill">${sp.mauTen || sp.mau || "Mặc định"}</span>
                                <span class="variant-pill">Size ${sp.size || "S"}</span>
                            </div>
                            <div class="item-qty-controls">
                                <button type="button" class="qty-btn-cool" data-action="minus" data-index="${index}">-</button>
                                <span class="qty-val-cool">${soLuong}</span>
                                <button type="button" class="qty-btn-cool" data-action="plus" data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="item-right-col">
                            <span class="item-price-cool">${thanhTien.toLocaleString("vi-VN")}đ</span>
                            <button type="button" class="btn-remove-item" data-action="remove" data-index="${index}">🗑 Xóa</button>
                        </div>
                    </div>
                `;
      });

      itemsContainer
        .querySelectorAll("img[data-item-index]")
        .forEach((imgEl) => {
          const idx = Number(imgEl.dataset.itemIndex);
          ganTuDongSuaAnh(imgEl, taoDanhSachUngVienAnh(gioHang[idx]));
        });

      shipping = 30000;
    } else {
      itemsContainer.innerHTML = `<p style="color: #888; font-size: 13.5px; text-align: center; padding: 18px 10px;">Giỏ hàng của bạn đang trống.</p>`;
      subtotal = 0;
      shipping = 0;
      discount = 0;
    }

    if (currentVoucherCode) {
      apDungMaGiamGia(currentVoucherCode, false);
    } else {
      updateTotals();
    }
  }

  if (itemsContainer) {
    itemsContainer.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      if (!gioHang[index]) return;

      if (action === "plus") {
        gioHang[index].soLuong = (Number(gioHang[index].soLuong) || 1) + 1;
      } else if (action === "minus") {
        const cur = Number(gioHang[index].soLuong) || 1;
        if (cur > 1) {
          gioHang[index].soLuong = cur - 1;
        } else {
          gioHang.splice(index, 1);
        }
      } else if (action === "remove") {
        gioHang.splice(index, 1);
      }

      localStorage.setItem("nettoCart", JSON.stringify(gioHang));
      renderCheckoutCart();
    });
  }

  // VietQR động & đếm ngược 5 phút
  const VIETQR = { bank: "MB", account: "0355291529", name: "NETTO CLOTHES" };
  const QR_SECONDS = 5 * 60;

  let maDonHang = taoMaDon();
  let tongHienTai = 0;
  let conLai = QR_SECONDS;
  let qrTimer = null;

  function taoMaDon() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 8; i++)
      s += chars[Math.floor(Math.random() * chars.length)];
    return "NT" + s;
  }

  function veQR() {
    const img = document.getElementById("vietqrImg");
    if (!img) return;
    if (tongHienTai <= 0) {
      img.src = "../assets/images/qr.jpg";
      document.getElementById("qrAmount").innerText = "0đ";
      document.getElementById("qrNote").innerText = maDonHang;
      return;
    }
    img.src =
      "https://img.vietqr.io/image/" +
      VIETQR.bank +
      "-" +
      VIETQR.account +
      "-compact2.png" +
      "?amount=" +
      Math.round(tongHienTai) +
      "&addInfo=" +
      encodeURIComponent(maDonHang) +
      "&accountName=" +
      encodeURIComponent(VIETQR.name);
    document.getElementById("qrAmount").innerText =
      tongHienTai.toLocaleString("vi-VN") + "đ";
    document.getElementById("qrNote").innerText = maDonHang;
  }

  function hienDongHo() {
    const m = String(Math.floor(conLai / 60)).padStart(2, "0");
    const s = String(conLai % 60).padStart(2, "0");
    const el = document.getElementById("qrTimer");
    if (el) el.innerText = m + ":" + s;
  }

  function batDauDemNguoc() {
    clearInterval(qrTimer);
    conLai = QR_SECONDS;
    hienDongHo();
    qrTimer = setInterval(function () {
      conLai--;
      if (conLai <= 0) {
        maDonHang = taoMaDon();
        conLai = QR_SECONDS;
        veQR();
      }
      hienDongHo();
    }, 1000);
  }

  function dungDemNguoc() {
    clearInterval(qrTimer);
  }

  function capNhatQR(tongTien) {
    tongHienTai = tongTien;
    veQR();
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
    capNhatQR(finalTotal);

    const barSavingText = document.getElementById("barSavingText");
    if (barSavingText) {
      barSavingText.innerText =
        "Tiết kiệm " + discount.toLocaleString("vi-VN") + "đ";
    }
  }

  // 3. Xử lý mã giảm giá (nhập tay hoặc bấm chọn thẻ voucher)
  const applyVoucherBtn = document.getElementById("applyVoucherBtn");
  const voucherInput = document.getElementById("voucherInput");
  const voucherMessage = document.getElementById("voucherMessage");

  function apDungMaGiamGia(rawCode, showNotice = true) {
    const code = rawCode.trim().toUpperCase();
    discount = 0;
    currentVoucherCode = "";

    document.querySelectorAll(".voucher-ticket").forEach((ticket) => {
      ticket.classList.toggle("selected", ticket.dataset.code === code);
    });

    if (!voucherMessage) return;

    if (gioHang.length === 0) {
      if (showNotice) {
        voucherMessage.style.color = "#dc2626";
        voucherMessage.innerText =
          "❌ Giỏ hàng đang trống, không thể áp dụng mã!";
      }
      updateTotals();
      return;
    }

    if (code === "THANHTHIET-BAC") {
      discount = Math.min(Math.round(subtotal * 0.05), 50000);
      currentVoucherCode = code;
      voucherMessage.style.color = "#16a34a";
      voucherMessage.innerText = `✓ Đã áp mã THANHTHIET-BAC • Giảm ${discount.toLocaleString("vi-VN")}đ`;
    } else if (code === "THANHTHIET-DONG") {
      discount = Math.min(Math.round(subtotal * 0.03), 30000);
      currentVoucherCode = code;
      voucherMessage.style.color = "#16a34a";
      voucherMessage.innerText = `✓ Đã áp mã THANHTHIET-DONG • Giảm ${discount.toLocaleString("vi-VN")}đ`;
    } else if (code === "FREESHIP") {
      if (subtotal >= 300000) {
        discount = Math.min(shipping, 40000);
        currentVoucherCode = code;
        voucherMessage.style.color = "#16a34a";
        voucherMessage.innerText = `✓ Đã áp mã FREESHIP • Hỗ trợ ship ${discount.toLocaleString("vi-VN")}đ`;
      } else {
        voucherMessage.style.color = "#dc2626";
        voucherMessage.innerText =
          "❌ Mã FREESHIP chỉ áp dụng cho đơn từ 300.000đ trở lên!";
      }
    } else if (code === "GIAM20%") {
      if (subtotal >= 1000000) {
        discount = Math.min(Math.round(subtotal * 0.2), 500000);
        currentVoucherCode = code;
        voucherMessage.style.color = "#16a34a";
        voucherMessage.innerText = `✓ Đã áp mã GIAM20% • Giảm ${discount.toLocaleString("vi-VN")}đ`;
      } else {
        voucherMessage.style.color = "#dc2626";
        voucherMessage.innerText =
          "❌ Mã GIAM20% chỉ áp dụng cho đơn từ 1.000.000đ trở lên!";
      }
    } else if (code === "CHAOBANMOI") {
      discount = Math.min(subtotal + shipping, 50000);
      currentVoucherCode = code;
      voucherMessage.style.color = "#16a34a";
      voucherMessage.innerText = `✓ Đã áp mã CHAOBANMOI • Trợ ship ${discount.toLocaleString("vi-VN")}đ`;
    } else {
      voucherMessage.style.color = "#dc2626";
      voucherMessage.innerText =
        "❌ Mã giảm giá không hợp lệ hoặc không tồn tại!";
    }

    updateTotals();
  }

  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener("click", function () {
      apDungMaGiamGia(voucherInput.value, true);
    });
  }

  document.querySelectorAll(".voucher-ticket").forEach((ticket) => {
    ticket.addEventListener("click", function () {
      const code = this.dataset.code;
      if (voucherInput) voucherInput.value = code;
      apDungMaGiamGia(code, true);
    });
  });

  // Tự động nạp sản phẩm khi bấm "Mua ngay" (?muangay=1)
  const urlParams = new URLSearchParams(window.location.search);
  const isBuyNow = urlParams.get("muangay") === "1";
  const buyNowId =
    urlParams.get("id") || urlParams.get("ma") || urlParams.get("sanpham");
  const buyNowQty = Math.max(1, Number(urlParams.get("soluong")) || 1);
  const buyNowSize = urlParams.get("size") || "S";
  const buyNowColor = urlParams.get("mau") || "";
  const savedBuyNow = JSON.parse(localStorage.getItem("nettoBuyNow") || "null");

  if (isBuyNow && savedBuyNow && savedBuyNow.ten) {
    const listAnh = taoDanhSachUngVienAnh(savedBuyNow);
    gioHang = [
      {
        ...savedBuyNow,
        anh: listAnh[0] || savedBuyNow.anh || "../assets/images/logo.png",
        soLuong: savedBuyNow.soLuong || buyNowQty,
        size: savedBuyNow.size || buyNowSize,
        mau: savedBuyNow.mau || buyNowColor || "Mặc định",
      },
    ];
    localStorage.setItem("nettoCart", JSON.stringify(gioHang));
    localStorage.removeItem("nettoBuyNow");
    renderCheckoutCart();
  } else if (isBuyNow && gioHang.length === 0 && buyNowId) {
    fetch("../assets/data/products.json")
      .then((res) => res.json())
      .then((products) => {
        const list = Array.isArray(products)
          ? products
          : products.products || [];
        const target = list.find(
          (p) =>
            String(p.id) === String(buyNowId) ||
            String(p.ma) === String(buyNowId),
        );

        if (target) {
          const defaultColorName =
            (Array.isArray(target.mau) && target.mau[0] && target.mau[0].ten) ||
            "Mặc định";
          const itemMoi = {
            id: target.id,
            ten: target.name || target.ten || "Sản phẩm NETTO",
            gia: target.price || target.gia || "289000",
            anh: "",
            mau: buyNowColor || defaultColorName,
            size: buyNowSize,
            soLuong: buyNowQty,
            mauArr: target.mau,
          };
          itemMoi.anh =
            taoDanhSachUngVienAnh(itemMoi)[0] || "../assets/images/logo.png";
          gioHang = [itemMoi];
          localStorage.setItem("nettoCart", JSON.stringify(gioHang));
          renderCheckoutCart();
        }
      })
      .catch((err) => console.log("Không nạp được sản phẩm mua ngay:", err));
  }

  // Khởi tạo giỏ hàng lần đầu
  renderCheckoutCart();

  // 4. Xử lý đặt hàng & Kiểm tra điều kiện
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

      fullnameError.style.display = "none";
      phoneError.style.display = "none";
      emailError.style.display = "none";

      let isValid = true;

      const nameWords = fullname.split(/\s+/).filter(Boolean);
      if (nameWords.length < 2) {
        fullnameError.innerText =
          "⚠️ Vui lòng nhập họ và tên đầy đủ từ 2 từ trở lên!";
        fullnameError.style.display = "block";
        fullnameInput.focus();
        isValid = false;
        return;
      }

      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phone)) {
        phoneError.innerText =
          "⚠️ Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!";
        phoneError.style.display = "block";
        phoneInput.focus();
        isValid = false;
        return;
      }

      if (email && !email.includes("@")) {
        emailError.innerText = "⚠️ Địa chỉ email phải chứa ký tự '@'!";
        emailError.style.display = "block";
        emailInput.focus();
        isValid = false;
        return;
      }

      if (isValid) {
        // Lưu đơn vào tài khoản đang đăng nhập
        const tenUser = localStorage.getItem("netto_current");
        const users = JSON.parse(localStorage.getItem("netto_users") || "{}");

        if (tenUser && users[tenUser]) {
          const tongDon = Math.max(0, subtotal + shipping - discount);

          users[tenUser].donHang = users[tenUser].donHang || [];
          users[tenUser].donHang.push({
            ma: maDonHang,
            ngay: new Date().toISOString(),
            tong: tongDon,
            sanPham: gioHang,
            voucher: currentVoucherCode,
          });

          if (currentVoucherCode) {
            users[tenUser].maDaDung = users[tenUser].maDaDung || [];
            users[tenUser].maDaDung.push(currentVoucherCode);
          }

          localStorage.setItem("netto_users", JSON.stringify(users));
        }

        localStorage.removeItem("nettoCart");
        dungDemNguoc();
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
