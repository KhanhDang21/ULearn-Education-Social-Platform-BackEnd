const express = require('express');
const groupController = require('../controllers/group');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/add-group', groupController.addGroup);
router.get('/get-group', groupController.getGroup);
router.post('/join-group', groupController.joinGroup);
router.patch('/leave-group', groupController.leaveGroup);
router.delete('/deleta-group', groupController.deleteGroup);
router.post('/add-post', groupController.addPost);

module.exports = router;