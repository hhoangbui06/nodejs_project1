const dataOrders = require('../../models/order-model');
const dataProducts = require('../../models/product-model');

// [GET] /orders - Danh sách đơn hàng đã mua
module.exports.index = async (req, res) => {
  let user = res.locals.user;
  if (!user) {
    req.flash('error', "Vui lòng đăng nhập để xem đơn hàng!");
    res.redirect('/users/login');
    return;
  }

  let orders = await dataOrders.find({
    user_id: user._id.toString(),
    deleted: false
  }).sort({ createdAt: -1 }).lean();

  // Tính tổng tiền và lấy thông tin sản phẩm cho mỗi đơn hàng
  for (let order of orders) {
    let totalPrice = 0;
    if (order.products && order.products.length > 0) {
      for (let item of order.products) {
        let productInfo = await dataProducts.findOne({
          _id: item.product_id
        }).select('thumbnail title slug').lean();
        item.productInfo = productInfo;
        item.priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
        item.totalPrice = item.priceNew * item.quantity;
        totalPrice += item.totalPrice;
      }
    }
    order.totalPrice = totalPrice;
  }

  res.render('client/pages/orders/index.pug', {
    title: "Đơn hàng đã mua",
    orders: orders
  });
}

// [GET] /orders/detail/:id - Chi tiết đơn hàng
module.exports.detail = async (req, res) => {
  let user = res.locals.user;
  if (!user) {
    req.flash('error', "Vui lòng đăng nhập để xem đơn hàng!");
    res.redirect('/users/login');
    return;
  }

  let orderId = req.params.id;
  let order = await dataOrders.findOne({
    _id: orderId,
    user_id: user._id.toString(),
    deleted: false
  }).lean();

  if (!order) {
    req.flash('error', "Không tìm thấy đơn hàng!");
    res.redirect('/orders');
    return;
  }

  let totalPrice = 0;
  if (order.products && order.products.length > 0) {
    for (let item of order.products) {
      let productInfo = await dataProducts.findOne({
        _id: item.product_id
      }).select('thumbnail title slug').lean();
      item.productInfo = productInfo;
      item.priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
      item.totalPrice = item.priceNew * item.quantity;
      totalPrice += item.totalPrice;
    }
  }
  order.totalPrice = totalPrice;

  res.render('client/pages/orders/detail.pug', {
    title: "Chi tiết đơn hàng",
    order: order
  });
}
