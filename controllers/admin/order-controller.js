const dataOrder = require('../../models/order-model');
const dataProduct = require('../../models/product-model');
const mongoose = require('mongoose');

// [GET] /admin/orders - Danh sách đơn hàng
module.exports.index = async (req, res) => {
  let find = {
    deleted: false
  }
  let records = await dataOrder.find(find).sort({ createdAt: -1 }).lean()

  // Tính tổng tiền cho mỗi đơn hàng
  for (let order of records) {
    let totalPrice = 0;
    if (order.products && order.products.length > 0) {
      for (let item of order.products) {
        let priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
        totalPrice += priceNew * item.quantity;
      }
    }
    order.totalPrice = totalPrice;
  }

  res.render('admin/pages/orders/index.pug', { title: "Danh sách đơn hàng", records: records })
}

// [GET] /admin/orders/detail/:id - Chi tiết đơn hàng
module.exports.detailOrder = async (req, res) => {
  let id = req.params.id;
  let order = await dataOrder.findOne({
    _id: id,
    deleted: false
  }).lean()

  if (order && order.products) {
    let totalPrice = 0;
    for (let item of order.products) {
      let product = await dataProduct.findOne({
        _id: item.product_id
      }).select('thumbnail title slug').lean()
      if (product) {
        item.productInfo = product
      }
      item.priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
      item.totalPrice = item.priceNew * item.quantity;
      totalPrice += item.totalPrice;
    }
    order.totalPrice = totalPrice;
  }

  res.render('admin/pages/orders/detail.pug', { title: "Chi tiết đơn hàng", order: order })
}

// [GET] /admin/orders/edit/:id - Form chỉnh sửa đơn hàng
module.exports.editOrder = async (req, res) => {
  let id = req.params.id;
  let order = await dataOrder.findOne({
    _id: id,
    deleted: false
  }).lean()

  if (order && order.products) {
    for (let item of order.products) {
      let product = await dataProduct.findOne({
        _id: item.product_id
      }).select('thumbnail title').lean()
      if (product) {
        item.productInfo = product
      }
      item.priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
      item.totalPrice = item.priceNew * item.quantity;
    }
  }

  res.render('admin/pages/orders/edit.pug', { title: "Chỉnh sửa đơn hàng", order: order })
}

// [PATCH] /admin/orders/edit/:id - Cập nhật đơn hàng
module.exports.updateOrder = async (req, res) => {
  let id = req.params.id;
  try {
    let updateData = {
      userInfo: {
        fullName: req.body.fullName,
        phone: req.body.phone,
        address: req.body.address
      }
    }

    // Cập nhật số lượng sản phẩm
    if (req.body.quantities) {
      let order = await dataOrder.findOne({ _id: id }).lean();
      if (order && order.products) {
        let quantities = Array.isArray(req.body.quantities) ? req.body.quantities : [req.body.quantities];
        for (let i = 0; i < order.products.length; i++) {
          if (quantities[i] !== undefined) {
            order.products[i].quantity = parseInt(quantities[i]) || 1;
          }
        }
        updateData.products = order.products;
      }
    }

    await dataOrder.updateOne({ _id: id }, updateData);
    req.flash('success', "Cập nhật đơn hàng thành công!")
  }
  catch (err) {
    req.flash('error', "Cập nhật đơn hàng thất bại!")
  }
  res.redirect(req.headers.referer)
}

// [DELETE] /admin/orders/delete/:id - Xóa đơn hàng (soft delete)
module.exports.deleteOrder = async (req, res) => {
  let id = req.params.id;
  await dataOrder.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
  req.flash('success', "Đã xóa đơn hàng!")
  res.redirect(req.headers.referer)
}

// [PATCH] /admin/orders/remove-product/:orderId/:productId - Xóa sản phẩm khỏi đơn hàng
module.exports.removeProduct = async (req, res) => {
  let { orderId, productId } = req.params;
  try {
    await dataOrder.updateOne(
      { _id: orderId },
      { $pull: { products: { product_id: productId } } }
    );
    req.flash('success', "Đã xóa sản phẩm khỏi đơn hàng!")
  }
  catch (err) {
    req.flash('error', "Xóa sản phẩm thất bại!")
  }
  res.redirect(req.headers.referer)
}
