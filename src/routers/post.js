const express = require("express");
const postController = require("../controllers/post");
const { identifier } = require("../middlewares/identification");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.post("/add-post", postController.addPost);
router.get("/get-all-posts", postController.getAllPosts);
router.get("/get-post/:id", postController.getPost);
router.patch("/update-post/:id", postController.updatePost);
router.delete("/delete-post/:id", postController.deletePost);

module.exports = router;
