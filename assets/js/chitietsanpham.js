function dinhDangGia(g) {
    const s = String(g || "").replace(/\D/g, "");
    return s ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ" : "";
}
fetch("../assets/data/products.json")
    .then(function(res) {
        return res.json();
    })
    .then(function(SAN_PHAM) {
        const id = Number(new URLSearchParams(location.search).get("id"));
        const sp = SAN_PHAM.find(function(x) {
            return x.id === id;
        });

        if (!sp) {
            document.querySelector(".ct-wrap").innerHTML =
                '<p>Không tìm thấy sản phẩm. <a href="sanpham.html">Quay lại danh sách</a></p>';
        } else {
            const anh = "../assets/images/" + sp.loai + "/" + sp.id + ".jpg";
            document.title = sp.ten;
            document.getElementById("ct-ten").textContent = sp.ten;
            document.getElementById("ct-duongdan").textContent = sp.ten;
            // Link "Sản phẩm" trên đường dẫn: kèm id để trang danh sách cuộn về đúng sản phẩm
            const linkSP = document.querySelector(
                '.ct-breadcrumb a[href="sanpham.html"]',
            );
            if (linkSP) linkSP.href = "sanpham.html?sp=" + sp.id;
            document.getElementById("ct-ma").textContent = sp.ma;
            document.getElementById("ct-gia").textContent = dinhDangGia(sp.gia);
            document.getElementById("ct-mota-text").textContent = sp.mota;

            if (sp.giaCu) {
                const cu = document.getElementById("ct-gia-cu");
                cu.textContent = dinhDangGia(sp.giaCu);
                cu.hidden = false;
                document.getElementById("ct-sale").hidden = false;
            }
            const thuMuc = "../assets/images/" + sp.loai + "/";
            const anhLon = document.getElementById("ct-anh-lon");
            const boxThumb = document.querySelector(".ct-thumbs");
            anhLon.alt = sp.ten;

            function tenFile(a) {
                return typeof a === "number" ? a + ".jpg" : a;
            }

            // Gom ảnh của tất cả các màu vào một danh sách
            const tatCaAnh = [];
            sp.mau.forEach(function(m, iMau) {
                const ds = m.anh && m.anh.length ? m.anh : [sp.id];
                ds.forEach(function(a) {
                    tatCaAnh.push({ file: tenFile(a), mau: iMau });
                });
            });

            function chonAnh(i) {
                anhLon.src = thuMuc + tatCaAnh[i].file;
                boxThumb.querySelectorAll("img").forEach(function(x, k) {
                    x.classList.toggle("active", k === i);
                });
                document.querySelectorAll("#ct-mau button").forEach(function(n, k) {
                    n.classList.toggle("active", k === tatCaAnh[i].mau);
                });
            }
            boxThumb.innerHTML = "";

            tatCaAnh.forEach(function(a, i) {
                const img = document.createElement("img");
                img.src = thuMuc + a.file;
                img.alt = sp.ten;
                img.addEventListener("click", function() {
                    chonAnh(i);
                });
                boxThumb.appendChild(img);
            });
            // Tạo nút size và màu từ dữ liệu
            const boxSize = document.getElementById("ct-size");
            sp.size.forEach(function(s, i) {
                const b = document.createElement("button");
                b.type = "button";
                b.textContent = s;
                if (i === 0) b.className = "active";
                boxSize.appendChild(b);
            });
            const boxMau = document.getElementById("ct-mau");
            sp.mau.forEach(function(m, i) {
                const b = document.createElement("button");
                b.type = "button";
                b.title = m.ten;
                b.style.background = m.ma;
                if (i === 0) b.className = "active";
                b.addEventListener("click", function() {
                    chonAnh(
                        tatCaAnh.findIndex(function(a) {
                            return a.mau === i;
                        }),
                    );
                });
                boxMau.appendChild(b);
            });
            chonAnh(0);
            // Chọn một nút trong nhóm
            ["ct-size", "ct-mau"].forEach(function(idNhom) {
                const nuts = document.querySelectorAll("#" + idNhom + " button");
                nuts.forEach(function(n) {
                    n.addEventListener("click", function() {
                        nuts.forEach(function(x) {
                            x.classList.remove("active");
                        });
                        n.classList.add("active");
                    });
                });
            });

            // Số lượng
            const sl = document.getElementById("ct-sl");
            document.getElementById("ct-tang").addEventListener("click", function() {
                sl.value = Number(sl.value) + 1;
            });
            document.getElementById("ct-giam").addEventListener("click", function() {
                if (Number(sl.value) > 1) sl.value = Number(sl.value) - 1;
            });

            // Gợi ý size
            document.getElementById("ct-tinh").addEventListener("click", function() {
                const cao = Number(document.getElementById("ct-cao").value);
                const nang = Number(document.getElementById("ct-nang").value);
                const kq = document.getElementById("ct-ketqua");
                if (!cao || !nang) {
                    kq.textContent = "Vui lòng nhập chiều cao và cân nặng.";
                    return;
                }
                const bmi = nang / (cao * cao);
                kq.textContent =
                    "Size gợi ý cho bạn: " + (bmi < 19 ? "S" : bmi > 23.5 ? "L" : "M");
            });

            // Lấy thông tin sản phẩm đang chọn
            function laySanPhamDangChon() {
                const size = document.querySelector("#ct-size .active").textContent;
                const nutMau = document.querySelector("#ct-mau .active");
                return {
                    id: sp.id,
                    ten: sp.ten,
                    gia: sp.gia,
                    size: size,
                    mau: nutMau ? nutMau.title : "",
                    soLuong: Number(sl.value),
                    anh: anhLon.getAttribute("src"),
                };
            }

            // Thêm vào giỏ hàng (lưu trong localStorage)
            function themVaoGio() {
                const moi = laySanPhamDangChon();
                let gio = [];

                try {
                    gio = JSON.parse(localStorage.getItem("nettoCart")) || [];
                } catch (e) {}

                // Chuyển đường dẫn ảnh thành đường dẫn đầy đủ
                // để ảnh vẫn hiển thị khi mở giỏ hàng ở trang khác
                moi.anh = new URL(moi.anh, location.href).href;

                // Cùng sản phẩm + size + màu thì cộng dồn số lượng
                const co = gio.find(function(x) {
                    return x.id === moi.id && x.size === moi.size && x.mau === moi.mau;
                });

                if (co) {
                    co.soLuong += moi.soLuong;
                } else {
                    gio.push(moi);
                }

                try {
                    localStorage.setItem("nettoCart", JSON.stringify(gio));

                    // Cập nhật số lượng trên biểu tượng giỏ hàng
                    if (typeof capNhatSoLuongGioHang === "function") {
                        capNhatSoLuongGioHang();
                    }
                } catch (e) {
                    alert("Không thể lưu sản phẩm vào giỏ hàng!");
                }
            }
            document.getElementById("ct-them").addEventListener("click", function() {
                themVaoGio();
                alert("Đã thêm " + sl.value + " sản phẩm vào giỏ hàng!");
            });


            // Mua ngay: chỉ lưu sản phẩm này rồi nhảy thẳng sang trang thanh toán
            document.getElementById("ct-mua").addEventListener("click", function() {
                try {
                    localStorage.setItem(
                        "muaNgay",
                        JSON.stringify([laySanPhamDangChon()]),
                    );
                } catch (e) {}
                window.location.href = "thanhtoan.html"; // đổi đúng tên trang thanh toán của nhóm
            });
        }
    });
// ===== Đánh giá sản phẩm (lưu trong trình duyệt) =====
(function() {
    const id = new URLSearchParams(location.search).get("id");
    const form = document.getElementById("dg-form");
    if (!id || !form) return;

    const KHOA = "netto-danhgia-" + id;
    const ds = document.getElementById("dg-ds");
    const boLoc = document.getElementById("dg-loc");
    const saoTren = document.querySelector(".ct-sao");
    const nutSao = document.querySelectorAll("#dg-chon-sao button");
    const nutMo = document.getElementById("dg-mo-form");
    let diem = 5; // số sao đang chọn khi viết
    let loc = 0; // 0 = tất cả, 1..5 = lọc theo số sao

    function doc() {
        try {
            return JSON.parse(localStorage.getItem(KHOA)) || [];
        } catch (e) {
            return [];
        }
    }

    function ghi(arr) {
        try {
            localStorage.setItem(KHOA, JSON.stringify(arr));
            return true;
        } catch (e) {
            return false; // thường do bộ nhớ trình duyệt đầy (ảnh nặng)
        }
    }

    // ---- Ảnh đính kèm (tối đa 3), thu nhỏ trước khi lưu để không đầy bộ nhớ ----
    const TOI_DA_ANH = 3;
    const inputAnh = document.getElementById("dg-anh");
    const xemAnh = document.getElementById("dg-anh-xem");
    let anhChon = [];

    function nenAnh(file) {
        return new Promise(function(ok, loi) {
            const fr = new FileReader();
            fr.onerror = loi;
            fr.onload = function() {
                const img = new Image();
                img.onerror = loi;
                img.onload = function() {
                    const k = Math.min(1, 800 / Math.max(img.width, img.height));
                    const c = document.createElement("canvas");
                    c.width = Math.round(img.width * k);
                    c.height = Math.round(img.height * k);
                    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                    ok(c.toDataURL("image/jpeg", 0.72));
                };
                img.src = fr.result;
            };
            fr.readAsDataURL(file);
        });
    }

    function veXemAnh() {
        xemAnh.innerHTML = "";
        anhChon.forEach(function(src, i) {
            const it = document.createElement("div");
            it.className = "it";
            const im = document.createElement("img");
            im.src = src;
            im.alt = "Ảnh " + (i + 1);
            const x = document.createElement("button");
            x.type = "button";
            x.textContent = "×";
            x.setAttribute("aria-label", "Bỏ ảnh này");
            x.addEventListener("click", function() {
                anhChon.splice(i, 1);
                veXemAnh();
            });
            it.appendChild(im);
            it.appendChild(x);
            xemAnh.appendChild(it);
        });
    }

    if (inputAnh) {
        inputAnh.addEventListener("change", async function() {
            const files = Array.from(inputAnh.files).filter(function(f) {
                return /^image\//.test(f.type);
            });
            inputAnh.value = "";
            for (const f of files) {
                if (anhChon.length >= TOI_DA_ANH) {
                    alert("Chỉ đính kèm tối đa " + TOI_DA_ANH + " ảnh.");
                    break;
                }
                try {
                    anhChon.push(await nenAnh(f));
                } catch (e) {
                    alert("Không đọc được ảnh " + f.name);
                }
            }
            veXemAnh();
        });
    }

    function chuoiSao(n) {
        return "★".repeat(n) + "☆".repeat(5 - n);
    }

    function chonSao(n) {
        diem = n;
        nutSao.forEach(function(b) {
            b.classList.toggle("on", Number(b.dataset.v) <= n);
        });
    }

    // Hàng nút lọc: Tất cả, 5 Sao (n), 4 Sao (n)...
    function veLoc(arr) {
        boLoc.innerHTML = "";
        [0, 5, 4, 3, 2, 1].forEach(function(n) {
            const dem =
                n === 0 ?
                arr.length :
                arr.filter(function(d) {
                    return d.diem === n;
                }).length;
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = n === 0 ? "Tất cả" : n + " Sao (" + dem + ")";
            if (n === loc) b.className = "on";
            b.addEventListener("click", function() {
                loc = n;
                ve();
            });
            boLoc.appendChild(b);
        });
    }

    // Danh sách đánh giá: avatar chữ cái, tên, sao, ngày, nội dung
    function veDS(arr) {
        ds.innerHTML = "";
        const hien =
            loc === 0 ?
            arr :
            arr.filter(function(d) {
                return d.diem === loc;
            });

        if (!hien.length) {
            const p = document.createElement("p");
            p.className = "dg-trong";
            p.textContent = arr.length ?
                "Chưa có đánh giá nào cho mục này." :
                "Chưa có đánh giá nào. Hãy là người đầu tiên!";
            ds.appendChild(p);
            return;
        }

        hien.forEach(function(d) {
            const o = document.createElement("div");
            o.className = "dg-muc";

            const av = document.createElement("div");
            av.className = "dg-avatar";
            av.textContent = d.ten.charAt(0).toUpperCase();

            const body = document.createElement("div");
            body.className = "dg-body";

            const ten = document.createElement("div");
            ten.className = "dg-ten";
            ten.textContent = d.ten;

            const sao = document.createElement("div");
            sao.className = "dg-sao";
            sao.textContent = chuoiSao(d.diem);

            const ngay = document.createElement("div");
            ngay.className = "dg-ngay";
            ngay.textContent = d.ngay;

            const nd = document.createElement("p");
            nd.textContent = d.nd;

            body.appendChild(ten);
            body.appendChild(sao);
            body.appendChild(ngay);
            body.appendChild(nd);

            if (Array.isArray(d.anh) && d.anh.length) {
                const dsAnh = document.createElement("div");
                dsAnh.className = "dg-anh-ds";
                d.anh.forEach(function(src) {
                    if (!/^data:image\//.test(src)) return;
                    const im = document.createElement("img");
                    im.src = src;
                    im.alt = "Ảnh đánh giá của " + d.ten;
                    im.loading = "lazy";
                    im.addEventListener("click", function() {
                        if (window.nettoMoAnh) window.nettoMoAnh(src);
                    });
                    dsAnh.appendChild(im);
                });
                body.appendChild(dsAnh);
            }

            o.appendChild(av);
            o.appendChild(body);
            ds.appendChild(o);
        });
    }

    function ve() {
        const arr = doc();

        // Điểm trung bình
        let tb = 0;
        if (arr.length) {
            tb =
                arr.reduce(function(t, d) {
                    return t + d.diem;
                }, 0) / arr.length;
        }
        const lamTron = Math.round(tb);
        document.getElementById("dg-diem").textContent = arr.length ?
            tb.toFixed(1) :
            "0";
        document.getElementById("dg-sao-tong").textContent = chuoiSao(lamTron);
        if (saoTren) {
            saoTren.textContent =
                chuoiSao(lamTron) + (arr.length ? "  (" + arr.length + ")" : "");
        }

        veLoc(arr);
        veDS(arr);
    }

    nutSao.forEach(function(b) {
        b.addEventListener("click", function() {
            chonSao(Number(b.dataset.v));
        });
    });

    nutMo.addEventListener("click", function() {
        form.hidden = !form.hidden;
        nutMo.textContent = form.hidden ? "Viết đánh giá" : "Đóng";
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nd = document.getElementById("dg-nd").value.trim();
        if (!nd) return;
        const ten = document.getElementById("dg-ten").value.trim() || "Khách";
        const arr = doc();
        const moi = {
            ten: ten,
            diem: diem,
            nd: nd,
            ngay: new Date().toLocaleDateString("vi-VN"),
        };
        if (anhChon.length) moi.anh = anhChon.slice();
        arr.unshift(moi);
        if (!ghi(arr)) {
            alert(
                "Không lưu được đánh giá: bộ nhớ trình duyệt đã đầy. Bạn thử bớt ảnh nhé.",
            );
            return;
        }
        form.reset();
        anhChon = [];
        veXemAnh();
        chonSao(5);
        form.hidden = true;
        nutMo.textContent = "Viết đánh giá";
        loc = 0;
        ve();
    });

    chonSao(5);
    ve();
})();
// ===== % giảm giá + Sản phẩm gợi ý (4 sản phẩm cố định theo nhóm) =====
(function() {
    const id = Number(new URLSearchParams(location.search).get("id"));
    if (!id) return;

    // Ghi id sản phẩm muốn cố định; để [] thì lấy 4 sản phẩm đầu của nhóm
    const GOI_Y = {
        ao: [],
        quan: [],
        vay: [],
    };
    const NHOM_CUA = {
        "ao-ngan-tay": "ao",
        "ao-dai-tay": "ao",
        "quan-dai": "quan",
        "quan-ngan": "quan",
        vay: "vay",
    };

    function soGia(g) {
        const s = String(g || "").replace(/\D/g, "");
        return s ? Number(s) : null;
    }

    function dinhDangGia(g) {
        const n = soGia(g);
        if (n === null) return "";
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    }

    function phanTram(gia, giaCu) {
        const g = soGia(gia);
        const c = soGia(giaCu);
        if (g === null || c === null || c <= g) return 0;
        return Math.round(((c - g) / c) * 100);
    }

    fetch("../assets/data/products.json")
        .then(function(res) {
            return res.json();
        })
        .then(function(DS) {
            const sp = DS.find(function(x) {
                return x.id === id;
            });
            if (!sp) return;

            // ----- Nhãn phần trăm giảm giá cạnh giá -----
            const sale = document.getElementById("ct-sale");
            if (sale) {
                const p = phanTram(sp.gia, sp.giaCu);
                sale.textContent = "-" + p + "%";
                sale.hidden = !p;
            }

            // ----- Chọn 4 sản phẩm gợi ý -----
            const nhom = NHOM_CUA[sp.loai];
            if (!nhom) return;

            let chon = GOI_Y[nhom]
                .map(function(i) {
                    return DS.find(function(x) {
                        return x.id === i;
                    });
                })
                .filter(function(x) {
                    return x && x.id !== id;
                });
            DS.forEach(function(x) {
                if (
                    chon.length < 4 &&
                    NHOM_CUA[x.loai] === nhom &&
                    x.id !== id &&
                    chon.indexOf(x) < 0
                ) {
                    chon.push(x);
                }
            });
            chon = chon.slice(0, 4);
            if (!chon.length) return;

            // ----- Dựng khối gợi ý, đặt dưới khung đánh giá -----
            const sec = document.createElement("section");
            sec.className = "ct-lienquan";
            const h = document.createElement("h2");
            h.textContent = "Có thể bạn cũng thích";
            const luoi = document.createElement("div");
            luoi.className = "lq-luoi";

            chon.forEach(function(x) {
                const a = document.createElement("a");
                a.className = "lq-card";
                a.href = "chitietsanpham.html?id=" + x.id;

                const khungAnh = document.createElement("div");
                khungAnh.className = "lq-anh";
                const img = document.createElement("img");
                img.src = "../assets/images/" + x.loai + "/" + x.id + ".jpg";
                img.alt = x.ten;
                img.loading = "lazy";
                khungAnh.appendChild(img);

                const giam = phanTram(x.gia, x.giaCu);
                if (giam) {
                    const nhan = document.createElement("span");
                    nhan.className = "lq-giam";
                    nhan.textContent = "-" + giam + "%";
                    khungAnh.appendChild(nhan);
                }

                const ten = document.createElement("p");
                ten.className = "lq-ten";
                ten.textContent = x.ten;

                const gia = document.createElement("p");
                gia.className = "lq-gia";
                const giaBan = document.createElement("span");
                giaBan.textContent = dinhDangGia(x.gia);
                gia.appendChild(giaBan);
                if (x.giaCu) {
                    const cu = document.createElement("span");
                    cu.className = "lq-gia-cu";
                    cu.textContent = dinhDangGia(x.giaCu);
                    gia.appendChild(cu);
                }

                a.appendChild(khungAnh);
                a.appendChild(ten);
                a.appendChild(gia);
                luoi.appendChild(a);
            });

            sec.appendChild(h);
            sec.appendChild(luoi);
            const dg = document.getElementById("ct-danhgia");
            if (dg) dg.after(sec);
            else document.getElementById("site-footer").before(sec);
        });
})();
// ===== Tồn kho: nằm cùng hàng với nút chọn màu =====
(function() {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const boxMau = document.getElementById("ct-mau");
    const cacNut = document.querySelectorAll("#ct-them, #ct-mua");
    const nutMua = {
        set disabled(v) {
            cacNut.forEach(function(n) {
                n.disabled = v;
            });
        },
    };
    if (!id || !boxMau) return;

    // Bọc nút màu và dòng tồn kho vào cùng một hàng
    const hang = document.createElement("div");
    hang.className = "ct-mau-hang";
    boxMau.parentNode.insertBefore(hang, boxMau);
    hang.appendChild(boxMau);
    const ton = document.createElement("span");
    ton.className = "ct-ton";
    ton.hidden = true;
    hang.appendChild(ton);

    fetch("../assets/data/products.json")
        .then(function(res) {
            return res.json();
        })
        .then(function(DS) {
            const sp = DS.find(function(x) {
                return x.id === id;
            });
            if (!sp) return;

            function hien(i) {
                const m = sp.mau && sp.mau[i];
                // Ưu tiên số tồn của màu, không có thì dùng số tồn chung của sản phẩm
                let n = m && m.ton !== undefined ? m.ton : sp.ton;
                ton.classList.remove("it", "het");
                if (n === undefined || n === null || n === "") {
                    ton.hidden = true;
                    if (nutMua) nutMua.disabled = false;
                    return;
                }
                n = Number(n);
                ton.hidden = false;
                if (n <= 0) {
                    ton.textContent = "Hết hàng";
                    ton.classList.add("het");
                    if (nutMua) nutMua.disabled = true;
                } else {
                    ton.textContent =
                        n <= 5 ? "Chỉ còn " + n + " sản phẩm" : "Còn " + n + " sản phẩm";
                    if (n <= 5) ton.classList.add("it");
                    if (nutMua) nutMua.disabled = false;
                }
            }

            function mauDangChon() {
                const nuts = Array.from(boxMau.children);
                const i = nuts.findIndex(function(b) {
                    return b.classList.contains("active");
                });
                return i < 0 ? 0 : i;
            }

            // Đổi màu (bấm nút màu hoặc bấm ảnh nhỏ) thì tồn kho đổi theo
            new MutationObserver(function() {
                hien(mauDangChon());
            }).observe(boxMau, {
                attributes: true,
                attributeFilter: ["class"],
                subtree: true,
            });
            hien(0);
        });
})();