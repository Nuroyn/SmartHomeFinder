import express from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const ensureCloudinaryEnv = () => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing Cloudinary env: ${missing.join(", ")}`);
  }
};

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    ensureCloudinaryEnv();

    const isImage = req.file.mimetype.startsWith("image/");
    const isVideo = req.file.mimetype.startsWith("video/");

    const transformation = isImage
      ? [
          {
            width: 1200,
            height: 800,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ]
      : isVideo
      ? [
          {
            width: 1280,
            height: 720,
            crop: "limit",
            quality: "auto",
            video_codec: "auto",
          },
        ]
      : [];

    cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "smart-housing/properties",
          public_id: `property_${Date.now()}`,
          transformation,
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Upload failed" });
          }

          return res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            bytes: result.bytes,
          });
        }
      )
      .end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
