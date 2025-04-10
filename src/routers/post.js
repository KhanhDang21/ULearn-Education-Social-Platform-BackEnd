const express = require('express');
const postController = require('../controllers/post');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/add-post', postController.addPost);
router.get('/get/:id', postController.getPost);

module.exports = router;