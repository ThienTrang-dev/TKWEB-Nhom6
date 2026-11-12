document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById("myPopup");
    const closeBtn = document.querySelector(".popup-close");

    // Kiểm tra xem người dùng đã xem popup trong phiên làm việc này chưa
    if (!sessionStorage.getItem("hasSeenPopup")) {
        // Nếu chưa xem thì sau 1 giây hiện popup lên
        if (popup) {
            setTimeout(function() {
                popup.style.display = "flex";
            }, 1000);
        }

        // Đánh dấu là đã xem để các lần bấm sang trang khác không bị hiện lại nữa
        sessionStorage.setItem("hasSeenPopup", "true");
    }

    // Bấm dấu X để tắt popup
    if (closeBtn) {
        closeBtn.onclick = function() {
            popup.style.display = "none";
        }
    }

    // Bấm ra ngoài vùng nền mờ để tắt popup
    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = "none";
        }
    }
});