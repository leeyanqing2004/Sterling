import api from "./api";

export async function getMyPoints() {
    try {
      const res = await api.get("/users/me");
      return res.data.points; 
    } catch (err) {
      console.error("Failed to fetch current user's points:", err);
      return null;
    }
}

// export async function getQrCodeData() { started QR feat, need to add api or something to make the codes asldadhsakjdhaskjdha
//     try {
//       const res = await api.get("/users/me/qrcode");
//       return res.data.qrCodeData; 
//     } catch (err) {
//       console.error("Failed to fetch current user's QR code data:", err);
//       return null;
//     }
//   }