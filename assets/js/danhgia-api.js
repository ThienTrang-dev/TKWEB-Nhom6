/* =====================================================================
   NETTO - danhgia-api.js
   Đánh giá dùng chung cho mọi máy: lưu trên server (server/server.js),
   nếu server chưa bật thì tạm lưu trên máy này (localStorage).
   ===================================================================== */
(function () {
  // Địa chỉ server. Muốn đổi thì đặt window.NETTO_API = "https://..." trước khi nạp file này.
  var base = window.NETTO_API;
  if (base === undefined) {
    if (location.protocol === "file:") base = "http://localhost:3000";
    else if (location.port === "3000") base = "";
    else base = location.protocol + "//" + location.hostname + ":3000";
  }

  var TIEN_TO = "netto-danhgia-";
  var TAGS = [
    "Sản phẩm đẹp",
    "Giá tốt",
    "Đóng gói đẹp",
    "Giao hàng nhanh",
    "Chăm sóc khách hàng tận tình",
    "Chất vải tốt",
    "Form chuẩn",
  ];
  var FIT = { chat: "Chật", dung: "Đúng kích thước", rong: "Rộng" };

  var scriptSrc = document.currentScript && document.currentScript.src;
  var seedUrl = scriptSrc ? new URL("../data/danhgia.json", scriptSrc).href : "";

  function chuan(d, idSp) {
    var diem = Number(d.diem);
    if (!d || !d.nd || !(diem >= 1 && diem <= 5)) return null;
    return {
      id: d.id || "",
      idSp: String(d.idSp !== undefined ? d.idSp : idSp),
      ten: d.ten || "Khách",
      diem: diem,
      nd: String(d.nd),
      ngay: d.ngay || "",
      t: Number(d.t) || 0,
      size: d.size || "",
      mau: d.mau || "",
      cao: d.cao || "",
      nang: d.nang || "",
      fit: FIT[d.fit] ? d.fit : "",
      tags: Array.isArray(d.tags) ? d.tags : [],
      anh: Array.isArray(d.anh)
        ? d.anh.filter(function (a) { return /^data:image\//.test(a); })
        : [],
    };
  }

  function docLocal() {
    var ds = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var khoa = localStorage.key(i);
        if (!khoa || khoa.indexOf(TIEN_TO) !== 0) continue;
        var idSp = khoa.slice(TIEN_TO.length);
        var arr = [];
        try { arr = JSON.parse(localStorage.getItem(khoa)) || []; } catch (e) {}
        arr.forEach(function (d) {
          var x = chuan(d, idSp);
          if (x) ds.push(x);
        });
      }
    } catch (e) {}
    return ds;
  }

  function ghiLocal(idSp, moi) {
    try {
      var khoa = TIEN_TO + idSp;
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(khoa)) || []; } catch (e) {}
      arr.unshift(moi);
      localStorage.setItem(khoa, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function layServer() {
    return fetch(base + "/api/danhgia")
      .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
      .then(function (j) { return { ds: Array.isArray(j.danhGia) ? j.danhGia : [], online: true }; })
      .catch(function () { return { ds: [], online: false }; });
  }

  function laySeed() {
    if (!seedUrl) return Promise.resolve([]);
    return fetch(seedUrl)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (j) {
        var ds = [];
        Object.keys(j || {}).forEach(function (idSp) {
          (Array.isArray(j[idSp]) ? j[idSp] : []).forEach(function (d) {
            var x = chuan(d, idSp);
            if (x) ds.push(x);
          });
        });
        return ds;
      });
  }

  // Trả về { ds: [...mọi đánh giá], online: true/false }
  function layTatCa() {
    return Promise.all([layServer(), laySeed()]).then(function (kq) {
      var gop = [];
      var co = {};
      kq[0].ds.concat(kq[1], docLocal()).forEach(function (d) {
        var x = chuan(d, d.idSp);
        if (!x) return;
        var k = [x.idSp, x.ten, x.diem, x.nd, x.ngay].join("|");
        if (co[k]) return;
        co[k] = true;
        gop.push(x);
      });
      return { ds: gop, online: kq[0].online };
    });
  }

  // Gửi đánh giá mới. Trả về { ok, online }
  function gui(dg) {
    return fetch(base + "/api/danhgia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dg),
    })
      .then(function (r) {
        if (r.status === 400 || r.status === 429) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            return { ok: false, online: true, loi: j.error || "Không gửi được đánh giá" };
          });
        }
        if (!r.ok) throw new Error("http");
        return { ok: true, online: true };
      })
      .catch(function () {
        // Server chưa bật: lưu tạm trên máy này
        var moi = Object.assign({}, dg, { ngay: homNay() });
        var ok = ghiLocal(dg.idSp, moi);
        return { ok: ok, online: false, loi: ok ? "" : "Bộ nhớ trình duyệt đã đầy, bạn thử bớt ảnh nhé." };
      });
  }

  function homNay() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  // "5/11/2026" -> "05/11/2026"
  function dinhDangNgay(ngay) {
    var m = String(ngay || "").match(/(\d+)\/(\d+)\/(\d+)/);
    return m ? m[1].padStart(2, "0") + "/" + m[2].padStart(2, "0") + "/" + m[3] : String(ngay || "");
  }

  function ngaySo(d) {
    var m = String(d.ngay || "").match(/(\d+)\/(\d+)\/(\d+)/);
    var n = m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
    return n * 1e13 + (d.t || 0); // cùng ngày thì cái gửi sau lên trước
  }

  window.NettoDanhGia = {
    TAGS: TAGS,
    FIT: FIT,
    layTatCa: layTatCa,
    gui: gui,
    dinhDangNgay: dinhDangNgay,
    ngaySo: ngaySo,
  };
})();