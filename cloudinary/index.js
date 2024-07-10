const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = "auto";
    if (file.mimetype.startsWith("image/")) {
      resource_type = "image";
    } else if (file.mimetype.startsWith("video/")) {
      resource_type = "video";
    }
    return {
      folder: "public-relation-telkom-regional-vii",
      allowed_formats: ["jpeg", "jpg", "png", "mp4"],
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: resource_type,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
