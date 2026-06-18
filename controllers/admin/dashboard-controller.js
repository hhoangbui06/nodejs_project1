const dataOrder = require('../../models/order-model');
const dataProduct = require('../../models/product-model');
const dataAccounts = require('../../models/account-models');
const dataCategory = require('../../models/category-model');

module.exports.dashboard = async (req, res) => {
  const orderCount = await dataOrder.countDocuments({ deleted: false });
  const productCount = await dataProduct.countDocuments({ deleted: false });
  const accountCount = await dataAccounts.countDocuments({ deleted: false });

  // Tính tổng doanh thu
  const orders = await dataOrder.find({ deleted: false }).lean();
  let totalRevenue = 0;
  for (let order of orders) {
    if (order.products && order.products.length > 0) {
      for (let item of order.products) {
        let priceNew = Math.round(item.price * (100 - item.discountPercentage) / 100);
        totalRevenue += priceNew * item.quantity;
      }
    }
  }

  res.render('admin/pages/dashboard/index.pug', {
    title: "Trang tổng quan",
    orderCount: orderCount,
    productCount: productCount,
    accountCount: accountCount,
    totalRevenue: totalRevenue
  })
}