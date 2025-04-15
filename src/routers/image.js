const express = require('express');
const imageController = require('../controllers/image');
const { identifier } = require('../middlewares/identification');
const multer = require('multer');

const upload = multer();
const router = express.Router();

router.post('/post', upload.single('image'), imageController.postImage);
router.get('/get/:id', identifier, imageController.getImage);
router.put('/update/:id', identifier, upload.single('image'), imageController.updateImage);
router.delete('/delete/:id', identifier, imageController.deleteImage);

module.exports = router;