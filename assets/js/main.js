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

    track.style.transform = `translateX(-${current * 100}%)`;
  }

  function startAutoSlide() {
    if (slides.length > 1) {
      autoSlideTimer = setInterval(function () {
        goToSlide(current + 1);
      }, 5000);
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
  // Lấy đánh giá 5 sao khách đã viết ở trang chi tiết sản phẩm
  // (lưu trong localStorage, khoá "netto-danhgia-<id sản phẩm>", xem chitietsanpham.js).
  // Hiện 3 nhận xét đầu, nút "Xem thêm" mở các nhận xét còn lại.
  const reviewGrid = document.getElementById('review-grid-home');
  const reviewMore = document.getElementById('review-more');

  if (reviewGrid && reviewMore) {
    const TIEN_TO = 'netto-danhgia-';
    const BAN_DAU = 3;

    // "5/11/2026" -> số để sắp xếp (mới nhất trước)
    const ngayThanhSo = function (ngay) {
      const m = String(ngay || '').match(/(\d+)\/(\d+)\/(\d+)/);
      return m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
    };

    const docDanhGia = function () {
      const ds = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const khoa = localStorage.key(i);
          if (!khoa || khoa.indexOf(TIEN_TO) !== 0) continue;
          const idSp = khoa.slice(TIEN_TO.length);
          let arr = [];
          try {
            arr = JSON.parse(localStorage.getItem(khoa)) || [];
          } catch (e) {}
          arr.forEach(function (d) {
            if (d && d.diem === 5 && d.nd) {
              const anh = Array.isArray(d.anh)
                ? d.anh.filter(function (a) { return /^data:image\//.test(a); })
                : [];
              ds.push({ idSp: idSp, ten: d.ten || 'Khách', nd: d.nd, ngay: d.ngay, anh: anh });
            }
          });
        }
      } catch (e) {}
      // mới nhất trước (cùng ngày giữ nguyên thứ tự)
      return ds
        .map(function (d, i) { return { d: d, i: i }; })
        .sort(function (a, b) {
          return ngayThanhSo(b.d.ngay) - ngayThanhSo(a.d.ngay) || a.i - b.i;
        })
        .map(function (x) { return x.d; });
    };

    const taoThe = function (d, tenSp) {
      const card = document.createElement('article');
      card.className = 'review-card';

      const stars = document.createElement('div');
      stars.className = 'review-stars';
      stars.textContent = '★★★★★';

      const text = document.createElement('p');
      text.className = 'review-text';
      text.textContent = d.nd;

      // Ảnh khách đính kèm (nếu có), bấm để phóng to
      let photos = null;
      if (d.anh && d.anh.length) {
        photos = document.createElement('div');
        photos.className = 'review-photos';
        d.anh.forEach(function (src) {
          const im = document.createElement('img');
          im.src = src;
          im.alt = 'Ảnh đánh giá của ' + d.ten;
          im.loading = 'lazy';
          im.addEventListener('click', function () {
            if (window.nettoMoAnh) window.nettoMoAnh(src);
          });
          photos.appendChild(im);
        });
      }

      const author = document.createElement('div');
      author.className = 'review-author';

      const avatar = document.createElement('div');
      avatar.className = 'review-avatar';
      avatar.textContent = d.ten.charAt(0).toUpperCase();

      const info = document.createElement('div');
      info.className = 'review-author-info';
      const ten = document.createElement('span');
      ten.textContent = d.ten;
      info.appendChild(ten);

      if (tenSp) {
        const sp = document.createElement('a');
        sp.className = 'review-product';
        sp.href = 'pages/chitietsanpham.html?id=' + encodeURIComponent(d.idSp);
        sp.textContent = tenSp;
        info.appendChild(sp);
      }

      author.appendChild(avatar);
      author.appendChild(info);
      card.appendChild(stars);
      card.appendChild(text);
      if (photos) card.appendChild(photos);
      card.appendChild(author);
      return card;
    };

    const danhGia = docDanhGia();

    // Chưa có đánh giá 5 sao nào: giữ 3 đánh giá mẫu có sẵn trong HTML
    if (danhGia.length) {
      fetch('assets/data/products.json')
        .then(function (res) { return res.ok ? res.json() : []; })
        .catch(function () { return []; })
        .then(function (dsSp) {
          const tenTheoId = {};
          dsSp.forEach(function (sp) { tenTheoId[sp.id] = sp.ten; });

          const cacThe = danhGia.map(function (d) {
            return taoThe(d, tenTheoId[d.idSp]);
          });

          reviewGrid.innerHTML = '';
          cacThe.forEach(function (c, i) {
            c.hidden = i >= BAN_DAU;
            reviewGrid.appendChild(c);
          });

          if (cacThe.length > BAN_DAU) {
            let moRong = false;
            reviewMore.hidden = false;
            reviewMore.addEventListener('click', function () {
              moRong = !moRong;
              cacThe.forEach(function (c, i) {
                c.hidden = !moRong && i >= BAN_DAU;
              });
              reviewMore.textContent = moRong ? 'Thu gọn' : 'Xem thêm nhận xét';
            });
          }
        });
    }
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
