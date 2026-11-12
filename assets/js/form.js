const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const formForgot = document.getElementById("form-forgot");
const tabs = document.querySelector(".auth-tabs");
const forgotMsg = document.getElementById("forgot-msg");

// Chuyển qua lại giữa đăng nhập và đăng ký
function hienForm(dangNhap) {
  formLogin.hidden = !dangNhap;
  formRegister.hidden = dangNhap;
  formForgot.hidden = true;
  tabs.hidden = false;
  tabLogin.classList.toggle("active", dangNhap);
  tabRegister.classList.toggle("active", !dangNhap);
}

// Màn hình quên mật khẩu
function hienQuenMK() {
  formLogin.hidden = true;
  formRegister.hidden = true;
  formForgot.hidden = false;
  tabs.hidden = true;
  forgotMsg.hidden = true;
  formForgot.reset();
}

tabLogin.addEventListener("click", function () {
  hienForm(true);
});
tabRegister.addEventListener("click", function () {
  hienForm(false);
});

// Đăng nhập
formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = document.getElementById("login-user").value.trim();
  if (user === "") {
    alert("Vui lòng nhập tên đăng nhập.");
    return;
  }
  alert("Xin chào " + user + "! Đăng nhập thành công (demo).");
});

// Đăng ký
formRegister.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = document.getElementById("reg-user").value.trim();
  const pass = document.getElementById("reg-pass").value;

  if (user.length < 3) {
    alert("Tên đăng nhập phải có ít nhất 3 ký tự.");
    return;
  }
  if (pass.length < 6) {
    alert("Mật khẩu phải có ít nhất 6 ký tự.");
    return;
  }
  alert("Đăng ký thành công (demo). Hãy đăng nhập bằng tài khoản vừa tạo.");
  formRegister.reset();
  hienForm(true);
});

// Quên mật khẩu: mở màn hình riêng
document.getElementById("quen-mk").addEventListener("click", function (e) {
  e.preventDefault();
  hienQuenMK();
});
formForgot.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  forgotMsg.textContent =
    "Đã gửi hướng dẫn đặt lại mật khẩu tới " +
    email +
    ". Vui lòng kiểm tra hộp thư của bạn (demo).";
  forgotMsg.hidden = false;
});
document.getElementById("forgot-back").addEventListener("click", function (e) {
  e.preventDefault();
  hienForm(true);
});

// Chưa có tài khoản? Đăng ký
const denDangKy = document.getElementById("den-dang-ky");
if (denDangKy) {
  denDangKy.addEventListener("click", function (e) {
    e.preventDefault();
    hienForm(false);
  });
}
