const express = require("express");
const commentController = require("../controllers/comment");
const { identifier } = require("../middlewares/identification");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.post("/post-comment", authenticateJWT, commentController.postComment);
router.get(
  "/get-all-comment/:postId?",
  authenticateJWT,
  commentController.getAllComments
);
router.get("/get-comment/:id", authenticateJWT, commentController.getComment);
router.put("/update-comment/:id", commentController.updateComment);
router.delete("/delete-commit/:id", commentController.deleteComment);

module.exports = router;
