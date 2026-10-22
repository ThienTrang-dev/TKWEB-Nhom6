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
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    dots[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => goToSlide(current + 1), 5000);
  }
  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  if (btnNext) btnNext.addEventListener('click', () => { goToSlide(current + 1); resetAutoSlide(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { goToSlide(current - 1); resetAutoSlide(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetAutoSlide(); }));

  if (slides.length) startAutoSlide();

  /* ============ DROPDOWN MENU (bấm mở trên mobile) ============ */
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return; // desktop vẫn dùng hover như cũ
      e.preventDefault();
      const dropdown = toggle.nextElementSibling;
      // đóng các dropdown khác đang mở
      document.querySelectorAll('.dropdown.open').forEach((d) => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });
  });

  /* ============ CHATBOX ============ */
  const chatToggle = document.getElementById('chatboxToggle');
  const chatPopup = document.getElementById('chatboxPopup');
  const chatClose = document.getElementById('chatboxClose');

  if (chatToggle) chatToggle.addEventListener('click', () => chatPopup.classList.toggle('open'));
  if (chatClose) chatClose.addEventListener('click', () => chatPopup.classList.remove('open'));

});