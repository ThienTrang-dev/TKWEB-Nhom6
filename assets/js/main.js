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
    startAutoSlide();
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

        noiBat.slice(0, 4).forEach(function (sp) {
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
            if (d && d.diem === 5 && d.nd) ds.push({ idSp: idSp, ten: d.ten || 'Khách', nd: d.nd, ngay: d.ngay });
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

});