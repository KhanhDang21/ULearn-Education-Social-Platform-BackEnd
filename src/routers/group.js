const express = require('express');
const groupController = require('../controllers/group');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/add-group',identifier, groupController.addGroup);
router.get('/get-group',identifier, groupController.getGroup);
router.post('/join-group',identifier, groupController.joinGroup);
router.patch('/leave-group',identifier, groupController.leaveGroup);
router.delete('/deleta-group',identifier, groupController.deleteGroup);
router.post('/add-post',identifier, groupController.addPost);

module.exports = router;