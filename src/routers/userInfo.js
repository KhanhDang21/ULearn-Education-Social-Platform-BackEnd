const express = require('express');
const userInfoController = require('../controllers/userInfo');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/post-user-info', userInfoController.postUserInfo);
router.get('/get-user-info/:id', identifier, userInfoController.getUserInfo);
router.put('/update-user-info/:id', identifier, userInfoController.updateUserInfo);
router.delete('/delete-user-info/:id', identifier, userInfoController.deleteUserInfo);

module.exports = router;