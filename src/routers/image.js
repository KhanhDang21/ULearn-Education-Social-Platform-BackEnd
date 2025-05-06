const express = require('express');
const imageController = require('../controllers/image');
const { identifier } = require('../middlewares/identification');
const multer = require('multer');

const upload = multer();
const router = express.Router();

router.post('/post-image', upload.single('image'), imageController.postImage);
router.get('/get-image/:id', identifier, imageController.getImage);
router.put('/update-image/:id', identifier, upload.single('image'), imageController.updateImage);
router.delete('/delete-image/:id', identifier, imageController.deleteImage);

module.exports = router;