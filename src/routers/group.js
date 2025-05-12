const express = require("express");
const groupController = require("../controllers/group");
const { identifier } = require("../middlewares/identification");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.post("/add-group", authenticateJWT, groupController.addGroup);
router.get("/get-all-groups", authenticateJWT, groupController.getAllGroups);
router.get("/get-group", identifier, groupController.getGroup);
router.post("/join-group", identifier, groupController.joinGroup);
router.patch("/leave-group", identifier, groupController.leaveGroup);
router.delete("/deleta-group", identifier, groupController.deleteGroup);
router.post("/add-post", identifier, groupController.addPost);

module.exports = router;
