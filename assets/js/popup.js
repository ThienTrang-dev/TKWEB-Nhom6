document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById("myPopup");
    const closeBtn = document.querySelector(".popup-close");

    // Tự động bật popup sau 1 giây mở trang
    if (popup) {
        setTimeout(function() {
            popup.style.display = "flex";
        }, 1000);
    }

    // Bấm dấu X để tắt popup
    if (closeBtn) {
        closeBtn.onclick = function() {
            popup.style.display = "none";
        }
    }

    // Bấm ra ngoài nền mờ để tắt popup
    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = "none";
        }
    }
});