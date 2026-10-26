const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

// Chuyển qua lại giữa đăng nhập và đăng ký
function hienForm(dangNhap) {
  formLogin.hidden = !dangNhap;
  formRegister.hidden = dangNhap;
  tabLogin.classList.toggle("active", dangNhap);
  tabRegister.classList.toggle("active", !dangNhap);
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

// Quên mật khẩu
document.getElementById("quen-mk").addEventListener("click", function (e) {
  e.preventDefault();
  const email = prompt(
    "Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu:",
  );
  if (email) {
    alert("Đã gửi hướng dẫn tới " + email + " (demo).");
  }
});
