const express = require('express');
const imageController = require('../controllers/image');
const multer = require('multer');

const upload = multer();
const router = express.Router();

router.post('/post', upload.single('image'), imageController.postImage);
router.get('/get/:id', imageController.getImage);
router.put('/update/:id', upload.single('image'), imageController.updateImage);
router.delete('/delete/:id', imageController.deleteImage);

module.exports = router;