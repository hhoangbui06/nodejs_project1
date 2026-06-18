const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/order-controller');
const authMiddleware = require('../../middlewares/client/auth-middleware');

router.get('/', authMiddleware.checkLogin, controller.index);
router.get('/detail/:id', authMiddleware.checkLogin, controller.detail);

module.exports = router;
