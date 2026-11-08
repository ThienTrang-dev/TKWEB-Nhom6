const DANH_MUC = [
  { loai: "ao-ngan-tay", tu: 4, den: 34, ten: "Áo ngắn tay" },
  { loai: "ao-dai-tay", tu: 35, den: 57, ten: "Áo dài tay" },
  { loai: "vay", tu: 58, den: 77, ten: "Váy" },
  { loai: "quan-ngan", tu: 78, den: 118, ten: "Quần ngắn" },
  { loai: "quan-dai", tu: 119, den: 154, ten: "Quần dài" },
];
const SAN_PHAM = [];
DANH_MUC.forEach(function (dm) {
  for (let i = dm.tu; i <= dm.den; i++) {
    const mac_dinh = {
      id: i,
      loai: dm.loai,
      ten: "NETTO® - " + dm.ten + " mã " + i,
      gia: dm.gia,
      giaCu: "",
      ma: "NT" + String(i).padStart(3, "0"),
      mota: "Thông tin chi tiết đang được cập nhật.",
      size: ["S", "M", "L"],
      mau: [{ ten: "Mặc định", ma: "#cccccc" }],
    };
    SAN_PHAM.push(mac_dinh);
  }
});
