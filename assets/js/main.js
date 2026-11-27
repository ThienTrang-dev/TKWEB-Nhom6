document.addEventListener('DOMContentLoaded', function () {

  /* ============ HERO BANNER SLIDER ============ */
  const track = document.querySelector('.hero-track');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  const btnPrev = document.querySelector('.hero-arrow-left');
  const btnNext = document.querySelector('.hero-arrow-right');

  let current = 0;
  let autoSlideTimer;

  function goToSlide(index) {
    if (!slides.length || !track) return;

    if (dots[current]) {
      dots[current].classList.remove('active');
    }

    current = (index + slides.length) % slides.length;

    if (dots[current]) {
      dots[current].classList.add('active');
    }

    track.style.transform = `translateX(-${current * 100}%)`;   /*làm banner chuyển động theo trục X ngang*/
  }

  function startAutoSlide() {
    if (slides.length > 1) {
      autoSlideTimer = setInterval(function () {
        goToSlide(current + 1);
      }, 5000);    /*cứ 5000 mili giây = 5 giây thì chuyển*/ 
    }
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      goToSlide(current + 1);
      resetAutoSlide();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      goToSlide(current - 1);
      resetAutoSlide();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goToSlide(i);
      resetAutoSlide();
    });
  });

  if (slides.length) {
    startAutoSlide();         // Bắt đầu tự động chuyển slide khi trang được tải
  }


  /* ============ DROPDOWN MENU ============ */
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {

      if (window.innerWidth > 900) return;

      e.preventDefault();

      const dropdown = toggle.nextElementSibling;

      document.querySelectorAll('.dropdown.open').forEach(function (d) {
        if (d !== dropdown) {
          d.classList.remove('open');
        }
      });

      if (dropdown) {
        dropdown.classList.toggle('open');
      }
    });
  });


  /* ============ CHATBOX ============ */
  const chatToggle = document.getElementById('chatboxToggle');
  const chatPopup = document.getElementById('chatboxPopup');
  const chatClose = document.getElementById('chatboxClose');

  if (chatToggle && chatPopup) {
    chatToggle.addEventListener('click', function () {
      chatPopup.classList.toggle('open');
    });
  }

  if (chatClose && chatPopup) {
    chatClose.addEventListener('click', function () {
      chatPopup.classList.remove('open');
    });
  }


  /* ============ SẢN PHẨM NỔI BẬT TRANG CHỦ ============ */
  // Tiêu chí "nổi bật": sản phẩm đang giảm giá (giá cũ > giá bán).
  // Mỗi lần tải trang chọn ngẫu nhiên 4 sản phẩm trong nhóm này.
  // Nút "Xem thêm" dẫn tới pages/sanpham.html?loai=noi-bat (cùng tiêu chí, xem sanpham.js).
  const productGridHome = document.getElementById('product-grid-home');

  if (productGridHome) {
    const soGia = function (g) {
      const n = String(g || '').replace(/\D/g, '');
      return n ? Number(n) : null;
    };
    const dinhDangGia = function (g) {
      const n = soGia(g);
      return n === null ? '' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    };
    const phanTramGiam = function (sp) {
      const g = soGia(sp.gia);
      const c = soGia(sp.giaCu);
      return g !== null && c !== null && c > g ? Math.round(((c - g) / c) * 100) : 0;
    };

    fetch('assets/data/products.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (danhSach) {
        const noiBat = danhSach.filter(function (sp) {
          return phanTramGiam(sp) > 0;
        });

        // Xáo trộn (Fisher-Yates) rồi lấy 4 sản phẩm đầu
        for (let i = noiBat.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tam = noiBat[i];
          noiBat[i] = noiBat[j];
          noiBat[j] = tam;
        }

        // Nhóm cho các tab lọc (khớp với sanpham.js)
        const NHOM_TC = {
          ao: ['ao-dai-tay', 'ao-ngan-tay'],
          quan: ['quan-dai', 'quan-ngan'],
          vay: ['vay']
        };

        const veLuoi = function (nhom) {
          productGridHome.innerHTML = '';
          noiBat.filter(function (sp) {
            return nhom === 'tat-ca' || NHOM_TC[nhom].indexOf(sp.loai) >= 0;
          }).slice(0, 8).forEach(function (sp) {
          const card = document.createElement('article');
          card.className = 'product-card';

          const link = document.createElement('a');
          link.href = 'pages/chitietsanpham.html?id=' + sp.id;

          const thumb = document.createElement('div');
          thumb.className = 'product-thumb';

          const img = document.createElement('img');
          img.src = 'assets/images/' + sp.loai + '/' + sp.id + '.jpg';
          img.alt = sp.ten;
          img.loading = 'lazy';

          const badge = document.createElement('span');
          badge.className = 'badge badge-sale';
          badge.textContent = '-' + phanTramGiam(sp) + '%';

          const name = document.createElement('h3');
          name.className = 'product-name';
          name.textContent = sp.ten;

          const price = document.createElement('p');
          price.className = 'product-price';

          const priceNow = document.createElement('span');
          priceNow.className = 'price-now';
          priceNow.textContent = dinhDangGia(sp.gia);
          price.appendChild(priceNow);

          const priceOld = document.createElement('span');
          priceOld.className = 'price-old';
          priceOld.textContent = dinhDangGia(sp.giaCu);
          price.appendChild(priceOld);

          thumb.appendChild(img);
          thumb.appendChild(badge);
          link.appendChild(thumb);
          link.appendChild(name);
          link.appendChild(price);
          card.appendChild(link);
          productGridHome.appendChild(card);
          });
        };

        veLuoi('tat-ca');

        const tabs = document.querySelectorAll('#feat-tabs .feat-tab');
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            veLuoi(tab.getAttribute('data-nhom'));
          });
        });
      })
      .catch(function (e) {
        // Mở bằng file:// sẽ bị chặn đọc JSON; hãy dùng Live Server hoặc đưa lên host
        console.warn('Không tải được sản phẩm nổi bật:', e);
      });
  }


   /* ============ KHÁCH HÀNG NÓI GÌ VỀ NETTO ============ */
  // Đánh giá lấy từ server (dùng chung mọi máy) qua assets/js/danhgia-api.js.
  // Bên trái: điểm trung bình + mức độ vừa vặn. Bên phải: danh sách, sắp xếp, phân trang.
  const rvRoot = document.getElementById('review-home');

  if (rvRoot && window.NettoDanhGia) {
    const MOI_TRANG = 10;
    const elDiem = document.getElementById('rv-diem');
    const elSao = document.getElementById('rv-sao');
    const elSub = document.getElementById('rv-sub');
    const elFit = document.getElementById('rv-fit');
    const elDem = document.getElementById('rv-dem');
    const elDs = document.getElementById('rv-ds');
    const elPage = document.getElementById('rv-page');
    const elSort = document.getElementById('rv-sort');

    let tatCa = [];
    let tenSp = {};
    let trang = 1;

    const el = function (tag, cls, text) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text !== undefined) e.textContent = text;
      return e;
    };

    // Sao đầy theo phần trăm (hỗ trợ 4.8 sao…)
    const veSao = function (diem, cls) {
      const s = el('span', 'rv-stars-i' + (cls ? ' ' + cls : ''));
      s.style.setProperty('--p', Math.max(0, Math.min(100, (diem / 5) * 100)) + '%');
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', diem.toFixed(1) + ' trên 5 sao');
      return s;
    };

    const sapXep = function (ds) {
      const kieu = elSort.value;
      let r = ds.slice();
      if (kieu === 'anh') r = r.filter(function (d) { return d.anh.length; });
      return r.sort(function (a, b) {
        if (kieu === 'cao') return (b.diem - a.diem) || (NettoDanhGia.ngaySo(b) - NettoDanhGia.ngaySo(a));
        if (kieu === 'thap') return (a.diem - b.diem) || (NettoDanhGia.ngaySo(b) - NettoDanhGia.ngaySo(a));
        return NettoDanhGia.ngaySo(b) - NettoDanhGia.ngaySo(a);
      });
    };

    const veTomTat = function () {
      const n = tatCa.length;
      const tb = n ? tatCa.reduce(function (t, d) { return t + d.diem; }, 0) / n : 0;
      elDiem.textContent = n ? tb.toFixed(1) : '0';
      elSao.innerHTML = '';
      elSao.appendChild(veSao(tb));

      const coFit = tatCa.filter(function (d) { return d.fit; });
      const dem = { chat: 0, dung: 0, rong: 0 };
      coFit.forEach(function (d) { dem[d.fit]++; });
      const pct = function (k) { return coFit.length ? (dem[k] / coFit.length) * 100 : 0; };

      elSub.textContent = n
        ? n + ' đánh giá' + (coFit.length ? ' · ' + pct('dung').toFixed(1).replace('.0', '') + '% khách nói đúng size' : '')
        : 'Chưa có đánh giá nào';

      elFit.innerHTML = '';
      [['chat', 'Chật'], ['dung', 'Đúng kích thước'], ['rong', 'Rộng']].forEach(function (x) {
        const hang = el('div', 'rv-fit-row');
        const bar = el('div', 'rv-fit-bar');
        const fill = el('span', 'rv-fit-fill' + (dem[x[0]] && dem[x[0]] === Math.max(dem.chat, dem.dung, dem.rong) ? ' max' : ''));
        fill.style.width = pct(x[0]) + '%';
        bar.appendChild(fill);
        hang.appendChild(el('span', 'rv-fit-name', x[1]));
        hang.appendChild(bar);
        hang.appendChild(el('span', 'rv-fit-pct', pct(x[0]).toFixed(1).replace('.0', '') + '%'));
        elFit.appendChild(hang);
      });
    };

    const taoMuc = function (d) {
      const it = el('article', 'rv-item');

      const dau = el('div', 'rv-item-head');
      dau.appendChild(el('span', 'rv-avatar', (d.ten || 'K').charAt(0).toUpperCase()));
      dau.appendChild(el('strong', 'rv-name', d.ten));
      dau.appendChild(el('span', 'rv-dot', '·'));
      dau.appendChild(el('span', 'rv-date', NettoDanhGia.dinhDangNgay(d.ngay)));
      it.appendChild(dau);

      it.appendChild(veSao(d.diem, 'rv-stars-lg'));

      const meta = el('div', 'rv-meta');
      const them = function (nhan, giaTri) {
        if (!giaTri) return;
        const m = el('span', 'rv-meta-i');
        m.appendChild(el('b', '', nhan + ': '));
        m.appendChild(document.createTextNode(giaTri));
        meta.appendChild(m);
      };
      them('Kích thước', d.size);
      them('Màu sắc', d.mau);
      them('Phù hợp với cơ thể', NettoDanhGia.FIT[d.fit]);
      them('Chiều cao', d.cao ? d.cao + 'cm' : '');
      them('Cân nặng', d.nang ? d.nang + 'kg' : '');
      if (meta.childNodes.length) it.appendChild(meta);

      it.appendChild(el('p', 'rv-text', d.nd));

      if (d.anh.length) {
        const ph = el('div', 'rv-photos');
        d.anh.forEach(function (src) {
          const im = document.createElement('img');
          im.src = src;
          im.alt = 'Ảnh đánh giá của ' + d.ten;
          im.loading = 'lazy';
          im.addEventListener('click', function () {
            if (typeof window.xemAnhPhongTo === 'function') window.xemAnhPhongTo(src);
            else if (typeof window.nettoMoAnh === 'function') window.nettoMoAnh(src);
          });
          ph.appendChild(im);
        });
        it.appendChild(ph);
      }

      if (d.tags.length) {
        const tg = el('div', 'rv-tags');
        d.tags.forEach(function (t) { tg.appendChild(el('span', 'rv-tag', t)); });
        it.appendChild(tg);
      }

      if (tenSp[d.idSp]) {
        const a = el('a', 'rv-product', tenSp[d.idSp]);
        a.href = 'pages/chitietsanpham.html?id=' + encodeURIComponent(d.idSp);
        it.appendChild(a);
      }
      return it;
    };

    const vePhanTrang = function (tong) {
      elPage.innerHTML = '';
      const soTrang = Math.ceil(tong / MOI_TRANG);
      if (soTrang <= 1) return;
      const nut = function (nhan, t, tat, on) {
        const b = el('button', 'rv-page-btn' + (on ? ' on' : ''), nhan);
        b.type = 'button';
        b.disabled = !!tat;
        b.addEventListener('click', function () {
          trang = t;
          ve();
          rvRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        elPage.appendChild(b);
      };
      nut('‹', trang - 1, trang === 1);
      for (let i = 1; i <= soTrang; i++) nut(String(i), i, false, i === trang);
      nut('›', trang + 1, trang === soTrang);
    };

    const ve = function () {
      const ds = sapXep(tatCa);
      const tong = ds.length;
      const dau = (trang - 1) * MOI_TRANG;
      const hien = ds.slice(dau, dau + MOI_TRANG);

      elDem.textContent = tong
        ? 'Hiển thị ' + (dau + 1) + '–' + (dau + hien.length) + ' trên ' + tong + ' đánh giá'
        : '';

      elDs.innerHTML = '';
      if (!hien.length) {
        const p = el('p', 'rv-empty', tatCa.length
          ? 'Chưa có đánh giá nào có hình ảnh.'
          : 'Chưa có đánh giá nào. Hãy mua sắm và là người đầu tiên chia sẻ cảm nhận nhé!');
        elDs.appendChild(p);
      } else {
        hien.forEach(function (d) { elDs.appendChild(taoMuc(d)); });
      }
      vePhanTrang(tong);
    };

    elSort.addEventListener('change', function () { trang = 1; ve(); });

    Promise.all([
      NettoDanhGia.layTatCa(),
      fetch('assets/data/products.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; })
    ]).then(function (kq) {
      tatCa = kq[0].ds;
      kq[1].forEach(function (sp) { tenSp[sp.id] = sp.ten; });
      veTomTat();
      ve();
    });
  }
  /* ============ SỐ LIỆU THƯƠNG HIỆU ============ */
  // Lấy số thật từ products.json: tổng mẫu, số danh mục, số mẫu đang giảm giá
  const thongKe = document.getElementById('brand-stats');

  if (thongKe) {
    const soGiaTK = function (g) {
      const n = String(g || '').replace(/\D/g, '');
      return n ? Number(n) : null;
    };

    const demLen = function (el, dich) {
      const batDau = performance.now();
      const thoiGian = 1200;
      const buoc = function (bay) {
        const t = Math.min((bay - batDau) / thoiGian, 1);
        el.textContent = Math.round(dich * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(buoc);
      };
      requestAnimationFrame(buoc);
    };

    fetch('assets/data/products.json')
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function () { return []; })
      .then(function (ds) {
        if (!ds.length) {
          thongKe.hidden = true;
          return;
        }

        const giaTri = {
          members: 5,
          products: ds.length,
          categories: new Set(ds.map(function (sp) { return sp.loai; })).size,
          sale: ds.filter(function (sp) {
            const g = soGiaTK(sp.gia);
            const c = soGiaTK(sp.giaCu);
            return g !== null && c !== null && c > g;
          }).length
        };

        const chay = function () {
          thongKe.querySelectorAll('[data-stat]').forEach(function (el) {
            demLen(el, giaTri[el.getAttribute('data-stat')] || 0);
          });
        };

        // Chỉ đếm khi người dùng cuộn tới khối này
        if ('IntersectionObserver' in window) {
          const quanSat = new IntersectionObserver(function (mucTieu) {
            if (mucTieu[0].isIntersecting) {
              chay();
              quanSat.disconnect();
            }
          }, { threshold: 0.4 });
          quanSat.observe(thongKe);
        } else {
          chay();
        }
      });
  }
});

/* ============ TRANG CHỦ: hiện dần khi cuộn + căn lề header ============ */
/* Hiệu ứng hiện dần khi cuộn tới từng khối ở trang chủ */
(function () {
  var cacKhoi = document.querySelectorAll('.reveal');
  if (!cacKhoi.length) return;

  var giamChuyenDong = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || giamChuyenDong) {
    cacKhoi.forEach(function (k) { k.classList.add('in'); });
    return;
  }

  document.documentElement.classList.add('js-reveal');
  var quanSat = new IntersectionObserver(function (ds) {
    ds.forEach(function (d) {
      if (d.isIntersecting) {
        d.target.classList.add('in');
        quanSat.unobserve(d.target);
      }
    });
  }, { threshold: 0.12 });

  cacKhoi.forEach(function (k) { quanSat.observe(k); });
})();

/* Header là position:fixed và cao hơn 120px trên điện thoại/máy tính bảng
   (menu xuống dòng) nên đè lên banner. Cho body chừa đúng chiều cao header. */
(function () {
  function canhLe() {
    var h = document.querySelector('.site-header');
    if (h && document.querySelector('.hero-s1')) document.body.style.paddingTop = Math.ceil(h.getBoundingClientRect().height) + 'px';
  }
  window.addEventListener('load', canhLe);
  window.addEventListener('resize', canhLe);
  document.addEventListener('DOMContentLoaded', canhLe);
  if ('ResizeObserver' in window) {
    var xem = new ResizeObserver(canhLe);
    var timHeader = setInterval(function () {
      var h = document.querySelector('.site-header');
      if (h) { xem.observe(h); canhLe(); clearInterval(timHeader); }
    }, 100);
    setTimeout(function () { clearInterval(timHeader); }, 3000);
  }
})();

/* ============ TRANG CHỦ: số mẫu trên từng ô danh mục ============ */
(function () {
  var cacO = document.querySelectorAll('.dm-p[data-loai]');
  if (!cacO.length) return;
  fetch('assets/data/products.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (ds) {
      cacO.forEach(function (o) {
        var n = ds.filter(function (sp) { return sp.loai === o.getAttribute('data-loai'); }).length;
        if (n) o.querySelector('.cat-count').textContent = n + ' mẫu';
      });
    })
    .catch(function () {});
})();

/* ===== Bộ sưu tập + danh mục (trang chủ) ===== */
// Bộ sưu tập (lookbook layout mới) + danh mục (overlay card)
(function () {
  var BST = [
    { tab: "Dịu dàng", ten: "Dịu dàng trong từng nếp áo", loai: "ao-ngan-tay",
      mota: "Áo, váy, quần form tôn dáng, chất vải mềm thoáng, dễ phối để đi học, đi làm hay đi chơi.",
      sp: [[30, "Áo ngắn tay cổ sen xanh mint"], [69, "Chân váy xếp ly trắng"], [6, "Áo len ngắn tay xanh nhạt"]] },
    { tab: "Sắc hồng pastel", ten: "Sắc hồng pastel cho ngày mới", loai: "ao-dai-tay",
      mota: "Áo khoác len, quần short xếp ly và những gam màu nhẹ nhàng dành riêng cho bạn.",
      sp: [[45, "Áo khoác len hồng"], [84, "Quần short hồng xếp ly"], [139, "Quần dài hồng rút nhún"]] },
    { tab: "Tủ đồ đen", ten: "Một tủ đồ đen luôn đúng gu", loai: "ao-dai-tay",
      mota: "Cardigan viền trắng kết hợp chân váy xếp ly: gọn gàng, nữ tính, mặc là đẹp.",
      sp: [[40, "Cardigan đen viền trắng"], [75, "Chân váy tweed đen"], [18, "Áo len đen cổ bẻ"]] }
  ];
  function gia(g) { var n = String(g || "").replace(/\D/g, ""); return n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ" : ""; }

  // ----- bộ sưu tập -----
  var root = document.querySelector(".bst");
  if (!root) return;
  var stage = root.querySelector(".bst-stage"), body = root.querySelector(".bst-side-body"), tabs = root.querySelector(".bst-tabs");
  var DATA = {}, cur = 0;
  tabs.innerHTML = BST.map(function (b, i) {
    return '<button type="button" class="bst-tab" role="tab" data-i="' + i + '">' + b.tab + "</button>";
  }).join("");

  var LOAI = { 30: "ao-ngan-tay", 69: "vay", 6: "ao-ngan-tay", 45: "ao-dai-tay", 84: "quan-ngan", 139: "quan-dai", 40: "ao-dai-tay", 75: "vay", 18: "ao-ngan-tay" };
  function thongTin(id) { return DATA[id] || {}; }
  function img(id) { return "assets/images/" + LOAI[id] + "/" + id + ".jpg"; }
  function cu(id) { var t = thongTin(id); return gia(t.giaCu) && gia(t.giaCu) !== gia(t.gia) ? "<s>" + gia(t.giaCu) + "</s>" : ""; }

  function ve(i) {
    var b = BST[i];
    root.dataset.k = i;
    tabs.querySelectorAll(".bst-tab").forEach(function (t, k) { t.setAttribute("aria-selected", k === i); });
    stage.innerHTML = b.sp.map(function (s, k) {
      return '<a class="bst-plate p' + k + '" href="pages/chitietsanpham.html?id=' + s[0] + '"><span class="bst-ph"><img src="' + img(s[0]) +
        '" alt="' + s[1] + '"></span><span class="bst-tag"><b>' + s[1] + "</b>" + gia(thongTin(s[0]).gia) + cu(s[0]) + "</span></a>";
    }).join("");
    body.innerHTML = "<h3>" + b.ten + '</h3><p class="bst-desc">' + b.mota + '</p><div class="bst-list">' +
      b.sp.map(function (s) {
        return '<a class="bst-row" href="pages/chitietsanpham.html?id=' + s[0] + '"><span class="bst-th"><img src="' + img(s[0]) +
          '" alt=""></span><span class="bst-nm">' + s[1] + '</span><span class="bst-pr">' + gia(thongTin(s[0]).gia) + cu(s[0]) + "</span></a>";
      }).join("") + "</div>";
    var plates = stage.querySelectorAll(".bst-plate");
    body.querySelectorAll(".bst-row").forEach(function (r, k) {
      function dim(on) { plates.forEach(function (p, j) { p.classList.toggle("dim", on && j !== k); }); }
      r.addEventListener("mouseenter", function () { dim(true); });
      r.addEventListener("focus", function () { dim(true); });
      r.addEventListener("mouseleave", function () { dim(false); });
      r.addEventListener("blur", function () { dim(false); });
    });
  }
  tabs.addEventListener("click", function (e) {
    var t = e.target.closest(".bst-tab");
    if (!t || +t.dataset.i === cur) return;
    cur = +t.dataset.i;
    root.classList.add("swap");
    setTimeout(function () { ve(cur); root.classList.remove("swap"); }, 300);
  });
  fetch("assets/data/products.json").then(function (r) { return r.json(); })
    .then(function (ds) { ds.forEach(function (p) { DATA[p.id] = p; }); })
    .catch(function () {})
    .then(function () { ve(0); });
  })();