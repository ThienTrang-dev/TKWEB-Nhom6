
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
  const productGridHome = document.getElementById('product-grid-home');

  if (productGridHome && typeof SAN_PHAM !== 'undefined') {

    const sanPhamNoiBat = SAN_PHAM
      .filter(function (sp) {
        return sp.gia;
      })
      .slice(0, 4);

    sanPhamNoiBat.forEach(function (sp) {

      const card = document.createElement('article');
      card.className = 'product-card';

      const link = document.createElement('a');
      link.href = `pages/chitietsanpham.html?id=${sp.id}`;

      const thumb = document.createElement('div');
      thumb.className = 'product-thumb';

      const img = document.createElement('img');
      img.src = `assets/images/${sp.loai}/${sp.id}.jpg`;
      img.alt = sp.ten;
      img.loading = 'lazy';

      const name = document.createElement('h3');
      name.className = 'product-name';
      name.textContent = sp.ten;

      const price = document.createElement('p');
      price.className = 'product-price';

      const priceNow = document.createElement('span');
      priceNow.className = 'price-now';
      priceNow.textContent = sp.gia;

      price.appendChild(priceNow);

      if (sp.giaCu) {
        const priceOld = document.createElement('span');
        priceOld.className = 'price-old';
        priceOld.textContent = sp.giaCu;

        price.appendChild(priceOld);
      }

      thumb.appendChild(img);
      link.appendChild(thumb);
      link.appendChild(name);
      link.appendChild(price);
      card.appendChild(link);

      productGridHome.appendChild(card);

    });
  }

});
