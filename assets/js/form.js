const $ = (id) => document.getElementById(id);
const tabLogin = $("tab-login");
const tabRegister = $("tab-register");
const formLogin = $("form-login");
const formRegister = $("form-register");
const formForgot = $("form-forgot");
const tabs = document.querySelector(".auth-tabs");

// ===== Tiện ích =====
const layUsers = () => JSON.parse(localStorage.getItem("netto_users") || "{}");
const luuUsers = (u) => localStorage.setItem("netto_users", JSON.stringify(u));
const chuanHoa = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

function baoLoi(id, msg) {
  const el = $(id);
  el.textContent = msg || "";
  el.hidden = !msg;
}
function xoaLoi() {
  document.querySelectorAll(".loi").forEach((el) => (el.hidden = true));
}

// ===== Chuyển form =====
function hienForm(dangNhap) {
  xoaLoi();
  formLogin.hidden = !dangNhap;
  formRegister.hidden = dangNhap;
  formForgot.hidden = true;
  tabs.hidden = false;
  tabLogin.classList.toggle("active", dangNhap);
  tabRegister.classList.toggle("active", !dangNhap);
}

let buocQuen = 1;
let userQuen = "";
function hienQuenMK() {
  xoaLoi();
  formLogin.hidden = true;
  formRegister.hidden = true;
  formForgot.hidden = false;
  tabs.hidden = true;
  formForgot.reset();
  buocQuen = 1;
  $("forgot-b1").hidden = false;
  $("forgot-b2").hidden = true;
  $("forgot-msg").hidden = true;
  $("forgot-btn").textContent = "Tiếp tục";
  $("forgot-mota").textContent =
    "Nhập tên đăng nhập để lấy lại câu hỏi bảo mật.";
}

tabLogin.addEventListener("click", () => hienForm(true));
tabRegister.addEventListener("click", () => hienForm(false));
$("den-dang-ky").addEventListener("click", (e) => {
  e.preventDefault();
  hienForm(false);
});
$("quen-mk").addEventListener("click", (e) => {
  e.preventDefault();
  hienQuenMK();
});
$("forgot-back").addEventListener("click", (e) => {
  e.preventDefault();
  hienForm(true);
});

// ===== Con mắt hiện/ẩn mật khẩu =====
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const o = $(btn.dataset.target);
    const hien = o.type === "password";
    o.type = hien ? "text" : "password";
    btn.textContent = hien ? "🙈" : "👁";
    btn.classList.toggle("on", hien);
  });
});

// ===== Đăng nhập thành công =====
function dangNhapXong(user, laDangKy) {
  localStorage.setItem("netto_current", user);
  if (window.parent !== window) {
    parent.postMessage(
      { netto: "auth-success", user: user, dangKy: !!laDangKy },
      "*",
    );
  } else {
    location.href = "../index.html";
  }
}
// ===== Đăng nhập =====
formLogin.addEventListener("submit", (e) => {
  e.preventDefault();
  xoaLoi();
  const user = $("login-user").value.trim();
  const pass = $("login-pass").value;
  const users = layUsers();

  if (!users[user]) {
    baoLoi("login-user-err", "Tên đăng nhập không tồn tại.");
    return;
  }
  if (users[user].password !== pass) {
    baoLoi("login-pass-err", "Mật khẩu không đúng, vui lòng thử lại.");
    return;
  }
  dangNhapXong(user);
});

// ===== Đăng ký =====
formRegister.addEventListener("submit", (e) => {
  e.preventDefault();
  xoaLoi();
  const user = $("reg-user").value.trim();
  const pass = $("reg-pass").value;
  const q1 = $("reg-q1").value.trim();
  const a1 = chuanHoa($("reg-a1").value);
  const q2 = $("reg-q2").value.trim();
  const a2 = chuanHoa($("reg-a2").value);
  const users = layUsers();
  let ok = true;

  if (user.length < 3) {
    baoLoi("reg-user-err", "Tên đăng nhập phải có ít nhất 3 ký tự.");
    ok = false;
  } else if (users[user]) {
    baoLoi("reg-user-err", "Tên đăng nhập đã được sử dụng.");
    ok = false;
  }
  if (pass.length < 6) {
    baoLoi("reg-pass-err", "Mật khẩu phải có ít nhất 6 ký tự.");
    ok = false;
  }
  if (!q1 || !a1 || !q2 || !a2) {
    baoLoi("reg-q-err", "Vui lòng nhập đủ 2 câu hỏi và 2 đáp án.");
    ok = false;
  } else if (q1.toLowerCase() === q2.toLowerCase()) {
    baoLoi("reg-q-err", "Hai câu hỏi không được giống nhau.");
    ok = false;
  }
  if (!ok) return;

  users[user] = {
    password: pass,
    q1: q1,
    a1: a1,
    q2: q2,
    a2: a2,
    ngayThamGia: new Date().toISOString(),
    donHang: [],
    voucher: [
      {
        ma: "CHAOBANMOI",
        ten: "Freeship bạn mới",
        moTa: "Trợ ship 10K cho mọi đơn hàng",
        han: null, // trang Khuyến mãi không ghi hạn nên để không giới hạn
        daDung: false,
      },
    ],
  };
  luuUsers(users);
  dangNhapXong(user, true);
});

// ===== Quên mật khẩu (2 bước) =====
formForgot.addEventListener("submit", (e) => {
  e.preventDefault();
  xoaLoi();
  const users = layUsers();

  if (buocQuen === 1) {
    const user = $("forgot-user").value.trim();
    if (!users[user]) {
      baoLoi("forgot-err", "Tên đăng nhập không tồn tại.");
      return;
    }
    userQuen = user;
    $("forgot-q1").textContent = users[user].q1;
    $("forgot-q2").textContent = users[user].q2;
    $("forgot-b1").hidden = true;
    $("forgot-b2").hidden = false;
    $("forgot-mota").textContent =
      "Trả lời 2 câu hỏi bảo mật và nhập mật khẩu mới.";
    $("forgot-btn").textContent = "Đặt lại mật khẩu";
    buocQuen = 2;
    return;
  }

  // bước 2
  const acc = users[userQuen];
  if (
    chuanHoa($("forgot-a1").value) !== acc.a1 ||
    chuanHoa($("forgot-a2").value) !== acc.a2
  ) {
    baoLoi("forgot-err", "Đáp án chưa đúng, vui lòng thử lại.");
    return;
  }
  const mkMoi = $("forgot-newpass").value;
  if (mkMoi.length < 6) {
    baoLoi("forgot-err", "Mật khẩu mới phải có ít nhất 6 ký tự.");
    return;
  }
  acc.password = mkMoi;
  luuUsers(users);
  hienForm(true);
  $("login-user").value = userQuen;
  alert("Đổi mật khẩu thành công, hãy đăng nhập lại!");
});
