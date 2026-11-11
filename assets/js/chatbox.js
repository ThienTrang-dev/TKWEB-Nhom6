/* =====================================================
   NETTO - chatbox.js
   Chatbox hỗ trợ khách, câu khó chuyển cho quản trị viên.
   Không cần nhúng tay: layout.js tự nạp file này sau search.js
   (để dùng lại hàm tìm sản phẩm).
===================================================== */
(function () {
  "use strict";

  /* ============ CẤU HÌNH ============ */
  const CONFIG = {
    // Nơi nhận tin gửi quản trị viên. Đăng ký miễn phí tại formspree.io,
    // tạo form rồi dán URL dạng "https://formspree.io/f/xxxxxxxx" vào đây.
    // Để trống thì tin chỉ lưu trong trình duyệt (dùng để demo).
    adminEndpoint: "",

    // Các trang bot tự đọc để trả lời. Muốn bot biết thêm gì thì thêm một dòng.
    //  file : tên file trong thư mục pages/
    //  khoi : selector của từng khối nội dung (mỗi khối là một "đoạn kiến thức")
    //  tieuDe: selector tiêu đề trong khối (có thể bỏ trống)
    //  dong : selector các dòng nội dung trong khối
    nguon: [
      { file: "chinh-sach.html", khoi: ".policy-section", tieuDe: "h3", dong: "p, li, h4" },
      { file: "huongdan.html", khoi: ".luu-y-van p", dong: "" },
      { file: "lienhe.html", khoi: ".info-item", dong: "" },
      { file: "khuyen-mai.html", khoi: ".campaign-card", tieuDe: "h3", dong: ".campaign-quote, li" },
      { file: "khuyen-mai.html", khoi: ".voucher-ticket", tieuDe: "h3", dong: "p, li, .code-wrapper" },
    ],
  };

  const self = document.currentScript;
  const root = self && self.src ? new URL("../../", self.src).href : "";

  // Dùng lại hàm của search.js; nếu thiếu thì bot vẫn chạy nhưng không gợi ý sản phẩm
  const N = window.NETTO || {};
  const boDau =
    N.boDau ||
    function (s) {
      return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
    };
  const timSanPham = N.timSanPham || function () { return []; };

  /* ============ TỪ KHOÁ ĐIỀU HƯỚNG ============ */
  const TU_GAP_NGUOI = [
    "nhan vien", "gap nguoi", "chu shop", "quan tri", "admin",
    "khieu nai", "phan nan", "tu van truc tiep", "nguoi that",
  ];
  const TU_CHAO = [" xin chao ", " chao ", " hello ", " hi ", " alo "];
  // Từ đệm bỏ đi khi so khớp câu hỏi với nội dung các trang
  const TU_DEM = [
    "la", "co", "khong", "cua", "thi", "bao", "nhieu", "may", "nao", "gi", "o",
    "dau", "nhu", "the", "de", "va", "cac", "mot", "nay", "duoc", "ban", "minh",
    "shop", "cho", "toi", "muon", "xin", "hoi", "a", "nhe", "vay", "sao", "tai",
    "khi", "neu", "se", "da", "dang", "rat", "hay", "hoac", "voi", "tu", "den",
    "ve", "tren", "trong", "ma", "netto", "ah", "nha", "ak", "oi", "nhi",
    "bang", "cach", "lam", "giup", "can", "biet", "vui", "long", "phai", "nen",
    "bi", "roi", "con", "cung", "nhung", "thay", "lay", "dc", "k", "ko",
  ];
  const TU_BO = [
    "co", "khong", "ban", "shop", "cho", "minh", "toi", "muon", "tim", "mua",
    "xem", "nao", "gi", "a", "nhe", "la", "voi", "cua", "duoc", "bao", "nhieu",
    "gia", "the", "nay", "va", "cac",
  ];

  /* ============ GIAO DIỆN ============ */
  const style = document.createElement("style");
  style.textContent = `
.nt-chat{position:fixed;right:20px;bottom:92px;width:350px;max-width:calc(100vw - 24px);height:480px;
  max-height:calc(100vh - 120px);background:#fff;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.2);
  display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:"Be Vietnam Pro",sans-serif;font-size:14px}
.nt-chat.open{display:flex}
.nt-chat-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#111;color:#fff;font-weight:600}
.nt-chat-head button{background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer}
.nt-chat-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#fdf6f3}
.nt-msg{max-width:84%;padding:9px 12px;border-radius:12px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
.nt-msg.bot{align-self:flex-start;background:#fff;border:1px solid #eee;color:#333;border-bottom-left-radius:4px}
.nt-msg.user{align-self:flex-end;background:#e2543f;color:#fff;border-bottom-right-radius:4px}
.nt-msg a{color:#e2543f;font-weight:600}
.nt-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 0;background:#fdf6f3}
.nt-chips button{font-family:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #e2543f;color:#e2543f;
  background:#fff;border-radius:999px;cursor:pointer}
.nt-chips button:hover{background:#e2543f;color:#fff}
.nt-act{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.nt-act button{font-family:inherit;font-size:12.5px;padding:5px 10px;border:1px solid #e2543f;color:#e2543f;background:#fff;border-radius:999px;cursor:pointer}
.nt-act button:hover{background:#e2543f;color:#fff}
.nt-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}
.nt-chat-form input{flex:1;min-width:0;padding:10px 12px;border:1px solid #e8d9d3;border-radius:8px;font-family:inherit;font-size:14px;outline:none}
.nt-chat-form input:focus{border-color:#e2543f}
.nt-chat-form button{padding:0 16px;border:none;border-radius:8px;background:#111;color:#fff;font-family:inherit;font-weight:600;cursor:pointer}
.nt-chat-form button:hover{background:#e2543f}
`;
  document.head.appendChild(style);

  const chat = { pending: null, daChao: false, dangGui: false, miss: 0, lanSaiLH: 0, xacNhan: null, daGui: {} };
  let elBody, elInput, elPanel;

  function themTinNhan(noiDung, ai) {
    const d = document.createElement("div");
    d.className = "nt-msg " + ai;
    if (typeof noiDung === "string") d.textContent = noiDung;
    else d.appendChild(noiDung);
    elBody.appendChild(d);
    elBody.scrollTop = elBody.scrollHeight;
  }

  function botNoi(text) {
    themTinNhan(text, "bot");
  }

  // Tin nhắn của bot kèm vài nút bấm nhanh
  function botNoiNut(text, nuts) {
    const box = document.createElement("div");
    box.appendChild(document.createTextNode(text));
    const row = document.createElement("div");
    row.className = "nt-act";
    nuts.forEach(function (n) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = n;
      b.addEventListener("click", function () {
        row.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
        xuLyTinNhan(n);
      });
      row.appendChild(b);
    });
    box.appendChild(row);
    themTinNhan(box, "bot");
  }

  // Chuẩn hoá câu hỏi để nhận ra "cùng một câu" dù gõ khác dấu/hoa thường
  function khoaCau(t) {
    return tachTu(t).join(" ");
  }

  function dungChat() {
    elPanel = document.createElement("div");
    elPanel.className = "nt-chat";
    elPanel.innerHTML =
      '<div class="nt-chat-head"><span>NETTO - Hỗ trợ khách hàng</span>' +
      '<button type="button" aria-label="Đóng">&times;</button></div>' +
      '<div class="nt-chat-body" aria-live="polite"></div>' +
      '<div class="nt-chips"></div>' +
      '<form class="nt-chat-form">' +
      '<input type="text" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">' +
      '<button type="submit">Gửi</button></form>';
    document.body.appendChild(elPanel);

    elBody = elPanel.querySelector(".nt-chat-body");
    elInput = elPanel.querySelector("input");
    const chips = elPanel.querySelector(".nt-chips");

    ["Giờ mở cửa", "Đổi trả", "Giao hàng", "Gặp nhân viên"].forEach(function (t) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t;
      b.addEventListener("click", function () {
        xuLyTinNhan(t);
      });
      chips.appendChild(b);
    });

    elPanel.querySelector(".nt-chat-head button").addEventListener("click", dongChat);
    elPanel.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      const v = elInput.value.trim();
      if (v) {
        elInput.value = "";
        xuLyTinNhan(v);
      }
    });
  }

  function moChat() {
    if (!elPanel) dungChat();
    elPanel.classList.add("open");
    taiKienThuc();
    if (!chat.daChao) {
      chat.daChao = true;
      botNoi("Chào bạn, mình là trợ lý của NETTO. Bạn cần mình giúp gì hôm nay?");
    }
    elInput.focus();
  }

  function dongChat() {
    if (elPanel) elPanel.classList.remove("open");
  }

  /* ============ XỬ LÝ TIN NHẮN ============ */
  function coTu(chuoi, danhSach) {
    return danhSach.some(function (k) {
      return chuoi.indexOf(k) > -1;
    });
  }

  function boTuThua(text) {
    return boDau(text)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (t) {
        return t && TU_BO.indexOf(t) === -1;
      })
      .join(" ");
  }

  function chuyenChoNhanVien(cauHoi) {
    const khoa = khoaCau(cauHoi);
    chat.xacNhan = null;
    if (chat.daGui[khoa]) {
      const hl = layHotline();
      botNoi("Câu này mình đã chuyển cho quản trị viên rồi, bạn chờ phản hồi nhé." + (hl ? " Cần gấp thì gọi hotline " + hl + "." : ""));
      return;
    }
    if (chat.pending) {
      botNoi("Mình đang chờ bạn để lại số điện thoại hoặc email để nhân viên liên hệ nhé (hoặc gõ \"bỏ qua\").");
      return;
    }
    chat.lanSaiLH = 0;
    chat.pending = { cauHoi: cauHoi, khoa: khoa };
    botNoi(
      "Câu này cần nhân viên NETTO hỗ trợ trực tiếp. Bạn để lại số điện thoại hoặc email, bên mình sẽ liên hệ sớm nhất nhé. (Gõ \"bỏ qua\" nếu không muốn để lại.)"
    );
  }

  /* ============ BOT TỰ ĐỌC NỘI DUNG CÁC TRANG ============ */
  function gon(t) {
    return String(t || "").replace(/\s+/g, " ").trim();
  }

  function tachTu(t) {
    return boDau(t).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  }

  // Cắt một trang HTML thành nhiều "đoạn kiến thức" theo cấu hình nguon
  function cacDoan(doc, ng) {
    const kq = [];
    doc.querySelectorAll(ng.khoi).forEach(function (el) {
      const tdEl = ng.tieuDe ? el.querySelector(ng.tieuDe) : null;
      const tieuDe = tdEl ? gon(tdEl.textContent).replace(/^\d+\.\s*/, "") : "";
      let dong = ng.dong
        ? Array.from(el.querySelectorAll(ng.dong)).map(function (n) { return gon(n.textContent); })
        : [gon(el.textContent)];
      dong = dong.filter(Boolean);
      if (dong.length) kq.push({ tieuDe: tieuDe, dong: dong, id: el.id || "", file: ng.file });
    });
    return kq;
  }

  function chuanBi(d) {
    d.tuTieuDe = new Set(tachTu(d.tieuDe));
    const hetTu = tachTu(d.tieuDe + " " + d.dong.join(" "));
    d.tu = new Set(hetTu);
    d.doDai = hetTu.length || 1;
    return d;
  }

  let kbPromise = null;
  function taiKienThuc() {
    if (kbPromise) return kbPromise;
    kbPromise = Promise.all(
      CONFIG.nguon.map(function (ng) {
        return fetch(root + "pages/" + ng.file)
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.text();
          })
          .then(function (html) {
            return cacDoan(new DOMParser().parseFromString(html, "text/html"), ng);
          })
          .catch(function (e) {
            // Mở web bằng file:// sẽ bị chặn đọc; hãy dùng Live Server hoặc đưa lên host
            console.warn("Chatbot không đọc được " + ng.file + ":", e);
            return [];
          });
      })
    ).then(function (ds) {
      const tat = [].concat.apply([], ds);
      // Giờ mở cửa lấy từ footer đang hiển thị
      document.querySelectorAll(".site-footer .contact-list li").forEach(function (li) {
        const t = gon(li.textContent);
        if (t) tat.push({ tieuDe: "", dong: [t], id: "", file: "" });
      });
      return tat.map(chuanBi);
    });
    return kbPromise;
  }

  function tuKhoaCauHoi(text) {
    const set = new Set(
      tachTu(text).filter(function (t) {
        return TU_DEM.indexOf(t) === -1;
      })
    );
    return Array.from(set);
  }

  function demKhop(tokens, tapTu) {
    return tokens.filter(function (t) {
      return tapTu.has(t);
    }).length;
  }

  function timDapAn(text, kb) {
    const tokens = tuKhoaCauHoi(text);
    if (!tokens.length) return null;
    let tot = null;
    let diemTot = 0;
    kb.forEach(function (d) {
      const khop = demKhop(tokens, d.tu);
      if (!khop) return;
      const khopTieuDe = demKhop(tokens, d.tuTieuDe);
      // ưu tiên đoạn khớp nhiều từ nhất, rồi tới tiêu đề khớp, rồi đoạn ngắn sát ý hơn đoạn dài
      const diem = 3 * khop + 2 * khopTieuDe + (3 * khop) / Math.sqrt(d.doDai);
      // Đoạn ngắn (một dòng liên hệ, một lưu ý...) chỉ cần khớp 1 từ chính
      const duDieuKien =
        khop >= 2 ||
        d.doDai <= 25 ||
        (tokens.length === 1 && khopTieuDe >= 1);
      if (duDieuKien && khop / tokens.length >= 0.5 && diem > diemTot) {
        diemTot = diem;
        tot = d;
      }
    });
    if (!tot) return null;

    // Chỉ hiện 2 dòng sát câu hỏi nhất thay vì cả đoạn dài
    let dong = tot.dong;
    if (dong.length > 2) {
      const diemDong = dong.map(function (l, i) {
        return { l: l, i: i, d: demKhop(tokens, new Set(tachTu(l))) };
      });
      const cao = Math.max.apply(null, diemDong.map(function (x) { return x.d; }));
      // chỉ giữ các dòng sát câu hỏi nhất (tối đa 2)
      let chon = diemDong
        .filter(function (x) { return cao > 0 && x.d === cao; })
        .slice(0, 2);
      if (!chon.length) chon = diemDong.slice(0, 2);
      dong = chon
        .sort(function (a, b) { return a.i - b.i; })
        .map(function (x) { return x.l; });
    }
    return { tieuDe: tot.tieuDe, dong: dong, id: tot.id, file: tot.file };
  }

  // Không đủ chắc để trả lời, nhưng có đoạn gần nghĩa -> gợi ý tiêu đề cho khách chọn
  function timGanDung(text, kb) {
    const tokens = tuKhoaCauHoi(text);
    if (!tokens.length) return [];
    const daThay = {};
    return kb
      .map(function (d) { return { d: d, k: demKhop(tokens, d.tu) }; })
      .filter(function (x) { return x.k > 0 && x.d.tieuDe; })
      .sort(function (a, b) { return b.k - a.k; })
      .filter(function (x) {
        if (daThay[x.d.tieuDe]) return false;
        daThay[x.d.tieuDe] = true;
        return true;
      })
      .slice(0, 3)
      .map(function (x) { return x.d.tieuDe; });
  }

  function hienDapAn(kq) {
    const box = document.createElement("div");
    const chu = (kq.tieuDe ? kq.tieuDe + "\n" : "") + kq.dong.join("\n");
    box.appendChild(document.createTextNode(chu));
    if (kq.file) {
      box.appendChild(document.createTextNode("\n"));
      const a = document.createElement("a");
      a.href = root + "pages/" + kq.file + (kq.id ? "#" + kq.id : "");
      a.textContent = "Xem chi tiết";
      box.appendChild(a);
    }
    themTinNhan(box, "bot");
  }

  function layHotline() {
    const el = document.querySelector(".hotline strong");
    return el ? el.textContent.trim() : "";
  }

  async function xuLyTinNhan(text) {
    themTinNhan(text, "user");
    const s = boDau(text);
    const tu = tachTu(text);

    // Bot vừa hỏi "có muốn chuyển nhân viên không?"
    if (chat.xacNhan) {
      const cau = chat.xacNhan.cauHoi;
      if (tu.length <= 4 && coTu(" " + tu.join(" ") + " ", [" co ", " ok ", " vang ", " dong y ", " chuyen ", " duoc "])) {
        chuyenChoNhanVien(cau);
        return;
      }
      if (tu.length <= 4 && coTu(" " + tu.join(" ") + " ", [" khong ", " thoi ", " ko ", " k "])) {
        chat.xacNhan = null;
        botNoi("Ok bạn, nếu cần gì thêm cứ hỏi mình nhé.");
        return;
      }
      chat.xacNhan = null; // khách hỏi chuyện khác -> bỏ qua câu hỏi cũ
    }

    // Đang chờ khách để lại liên hệ (vẫn cho hỏi chuyện khác, không bị kẹt)
    if (chat.pending) {
      const g = text.replace(/[\s.\-]/g, "");
      const email = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      const sdt = g.match(/(\+?84|0)\d{9}/);
      if (email || sdt) {
        guiQuanTri(chat.pending.cauHoi, email ? email[0] : sdt[0]);
        return;
      }
      if (coTu(s, ["bo qua", "khong de lai"])) {
        guiQuanTri(chat.pending.cauHoi, "");
        return;
      }
      // Không phải liên hệ: nếu bot trả lời được thì cứ trả lời, không bắt nhập lại
    }

    if (coTu(s, TU_GAP_NGUOI)) {
      chat.miss = 0;
      chuyenChoNhanVien(text);
      return;
    }

    // Hỏi về sản phẩm
    const rutGon = boTuThua(text);
    const sp = rutGon ? timSanPham(rutGon) : [];
    if (sp.length) {
      chat.miss = 0;
      const box = document.createElement("div");
      box.appendChild(document.createTextNode("Mình tìm thấy " + sp.length + " sản phẩm phù hợp:"));
      sp.slice(0, 4).forEach(function (p) {
        const a = document.createElement("a");
        a.href = root + "pages/chitietsanpham.html?id=" + encodeURIComponent(p.id);
        a.textContent = p.ten + (p.gia ? " - " + p.gia : "");
        a.style.display = "block";
        a.style.marginTop = "6px";
        box.appendChild(a);
      });
      themTinNhan(box, "bot");
      return;
    }

    // Hỏi về chính sách, hướng dẫn, khuyến mãi, liên hệ: bot đọc từ các trang của web
    const kb = await taiKienThuc();
    const kq = timDapAn(text, kb);
    if (kq) {
      chat.miss = 0;
      hienDapAn(kq);
      return;
    }

    if (coTu(" " + s + " ", TU_CHAO)) {
      botNoi("Chào bạn! Bạn muốn tìm sản phẩm hay cần hỗ trợ về đổi trả, giao hàng?");
      return;
    }

    // Đang chờ liên hệ mà khách gõ câu khó hiểu: nhắc nhẹ, sai 2 lần thì thôi không ép
    if (chat.pending) {
      chat.lanSaiLH++;
      if (chat.lanSaiLH >= 2) {
        chat.pending = null;
        botNoi("Mình chưa nhận được thông tin liên hệ nên tạm dừng việc chuyển nhân viên. Bạn cứ hỏi tiếp, hoặc bấm \"Gặp nhân viên\" khi cần nhé.");
      } else {
        botNoi("Mình chưa thấy số điện thoại hoặc email hợp lệ. Bạn nhập lại giúp mình nhé, hoặc gõ \"bỏ qua\".");
      }
      return;
    }

    // Chưa hiểu: hỏi lại trước, gợi ý gần đúng, lần thứ 2 mới đề nghị chuyển nhân viên
    // (không tự chuyển, khách đồng ý mới chuyển)
    chat.miss++;
    if (chat.miss === 1) {
      const gy = timGanDung(text, kb);
      if (gy.length) {
        botNoiNut("Mình chưa chắc ý bạn. Có phải bạn muốn hỏi về một trong các mục này không?", gy);
      } else {
        botNoiNut(
          "Mình chưa hiểu rõ câu hỏi. Bạn nói cụ thể hơn giúp mình được không? Ví dụ tên sản phẩm, phí giao hàng, đổi trả, khuyến mãi...",
          ["Đổi trả", "Giao hàng", "Khuyến mãi"]
        );
      }
      return;
    }
    chat.miss = 0;
    chat.xacNhan = { cauHoi: text };
    botNoiNut("Câu này mình chưa trả lời được. Bạn có muốn mình chuyển cho nhân viên NETTO không?", ["Có, chuyển nhân viên", "Không cần"]);
  }

  // Gửi cho quản trị viên: lưu trong trình duyệt + gửi qua Formspree nếu đã cấu hình
  async function guiQuanTri(cauHoi, lienHe) {
    if (chat.dangGui) return;
    chat.dangGui = true;
    const data = {
      cau_hoi: cauHoi,
      lien_he: lienHe || "(khách không để lại)",
      trang: location.href,
      thoi_gian: new Date().toLocaleString("vi-VN"),
    };
    if (lienHe && lienHe.indexOf("@") > -1) data.email = lienHe; // để chủ shop bấm Reply

    try {
      const kho = JSON.parse(localStorage.getItem("netto_chat_inbox") || "[]");
      kho.push(data);
      localStorage.setItem("netto_chat_inbox", JSON.stringify(kho));
    } catch (e) {}

    let ok = true;
    if (CONFIG.adminEndpoint) {
      try {
        const r = await fetch(CONFIG.adminEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        ok = r.ok;
      } catch (e) {
        ok = false;
      }
    }

    if (ok && chat.pending) chat.daGui[chat.pending.khoa] = true;
    chat.pending = null;
    chat.dangGui = false;
    if (ok) {
      botNoi("Mình đã chuyển câu hỏi cho quản trị viên. NETTO sẽ phản hồi bạn sớm nhất có thể. Cảm ơn bạn!");
    } else {
      const hl = layHotline();
      botNoi("Mình chưa gửi được tin cho quản trị viên. Bạn vui lòng liên hệ hotline" + (hl ? " " + hl : "") + " để được hỗ trợ ngay nhé.");
    }
  }

  /* ============ KHỞI TẠO ============ */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#chatboxToggle")) {
      if (elPanel && elPanel.classList.contains("open")) dongChat();
      else moChat();
    }
  });

  function khoiTao() {
    // Bỏ khung chào cũ (nút "Chat Now" giả), thay bằng chatbox mới
    document.querySelectorAll(".chatbox-popup").forEach(function (el) {
      el.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", khoiTao);
  } else {
    khoiTao();
  }
})();