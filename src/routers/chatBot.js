const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatBot');

router.post('/ask', chatbotController.chatBot);

module.exports = router;