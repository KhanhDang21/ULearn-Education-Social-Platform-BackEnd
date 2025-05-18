const express = require("express");
const groupController = require("../controllers/group");
const { identifier } = require("../middlewares/identification");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.post("/add-group", authenticateJWT, groupController.addGroup);
router.get("/get-all-groups", authenticateJWT, groupController.getAllGroups);
router.get("/get-group", authenticateJWT, groupController.getGroup);
router.post("/join-group", authenticateJWT, groupController.joinGroup);
router.patch("/leave-group", authenticateJWT, groupController.leaveGroup);
router.delete("/deleta-group", authenticateJWT, groupController.deleteGroup);
router.post("/add-post", authenticateJWT, groupController.addPost);

module.exports = router;
