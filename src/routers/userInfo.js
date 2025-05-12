const express = require("express");
const userInfoController = require("../controllers/userInfo");
const { identifier } = require("../middlewares/identification");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/post-user-info",
  authenticateJWT,
  userInfoController.postUserInfo
);
router.get(
  "/get-user-info/:id",
  authenticateJWT,
  userInfoController.getUserInfo
);
router.put(
  "/update-user-info/:id",
  authenticateJWT,
  userInfoController.updateUserInfo
);
router.delete(
  "/delete-user-info/:id",
  identifier,
  userInfoController.deleteUserInfo
);

module.exports = router;
