const express = require('express');
const commentController = require('../controllers/comment');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/post-comment', commentController.postComment);
router.get('/get-comment/:id', commentController.getComment);
router.put('/update-comment/:id', commentController.updateComment);
router.delete('/delete-commit/:id', commentController.deleteComment);

module.exports = router;