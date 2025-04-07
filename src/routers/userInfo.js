const express = require('express');
const userInfoController = require('../controllers/userInfo');

const router = express.Router();

router.post('/post-user-info', userInfoController.postUserInfo);
router.get('/get-user-info/:id', userInfoController.getUserInfo);
router.put('/update-user-info/:id', userInfoController.updateUserInfo);
router.delete('/delete-user-info/:id', userInfoController.deleteUserInfo);

module.exports = router;