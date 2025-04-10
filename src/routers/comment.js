const express = require('express');
const commentController = require('../controllers/comment');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/post-comment', commentController.postComment);
router.get('/get/:id', )


module.exports = router;