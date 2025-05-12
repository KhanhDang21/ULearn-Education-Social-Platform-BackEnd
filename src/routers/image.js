const express = require("express");
const imageController = require("../controllers/image");
const { identifier } = require("../middlewares/identification");
const multer = require("multer");
const { authenticateJWT } = require("../middlewares/auth");

const upload = multer();
const router = express.Router();

router.post(
  "/post-image",
  authenticateJWT,
  upload.single("image"),
  imageController.postImage
);
router.get("/get-image/:id", imageController.getImage);
router.put(
  "/update-image/:id",
  authenticateJWT,
  upload.single("image"),
  imageController.updateImage
);
router.delete("/delete-image/:id", identifier, imageController.deleteImage);

module.exports = router;
