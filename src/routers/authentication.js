const express = require('express');
const authController = require('../controllers/authentication');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', identifier, authController.signout);

router.get('/get-current-user', identifier, authController.getCurrentUser);

router.patch('/change-password', identifier, authController.changePassword);

router.patch(
	'/send-forgot-password-code',
	authController.sendForgotPasswordCode
);

router.patch(
	'/verify-forgot-password-code',
	authController.verifyForgotPasswordCode
);

module.exports = router;