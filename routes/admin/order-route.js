const express = require('express')
const router = express.Router();
const controller = require('../../controllers/admin/order-controller')

// [GET] /admin/orders
router.get('/', controller.index)

// [GET] /admin/orders/detail/:id
router.get('/detail/:id', controller.detailOrder)

// [GET] /admin/orders/edit/:id
router.get('/edit/:id', controller.editOrder)

// [PATCH] /admin/orders/edit/:id
router.patch('/edit/:id', controller.updateOrder)

// [DELETE] /admin/orders/delete/:id
router.delete('/delete/:id', controller.deleteOrder)

// [PATCH] /admin/orders/remove-product/:orderId/:productId
router.patch('/remove-product/:orderId/:productId', controller.removeProduct)

module.exports = router
