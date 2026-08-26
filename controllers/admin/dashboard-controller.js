const dataOrder = require('../../models/order-model');
const dataProduct = require('../../models/product-model');
const dataAccounts = require('../../models/account-models');
const dataCategory = require('../../models/category-model');
const dataUser=require('../../models/user-model')
const dataAccount=require('../../models/account-models')

module.exports.dashboard = async (req, res) => {
  const productInfo={}, categoryInfo={}, accountInfo={}, userInfo={};
  productInfo.total=await dataProduct.find({deleted:false}).countDocuments()
  productInfo.active=await dataProduct.find({status:"active", deleted:false}).countDocuments()
  productInfo.inactive=productInfo.total-productInfo.active

  categoryInfo.total=await dataCategory.find({deleted:false}).countDocuments()
  categoryInfo.active=await dataCategory.find({status:"active", deleted:false}).countDocuments()
  categoryInfo.inactive=categoryInfo.total-categoryInfo.active

  accountInfo.total=await dataAccount.find({deleted:false}).countDocuments()
  accountInfo.active=await dataAccount.find({status:"active", deleted:false}).countDocuments()
  accountInfo.inactive=accountInfo.total-accountInfo.active

  userInfo.total=await dataUser.find({deleted:false}).countDocuments()
  userInfo.active=await dataUser.find({status:"active", deleted:false}).countDocuments()
  userInfo.inactive=userInfo.total-userInfo.active
  res.render('admin/pages/dashboard/index.pug', {
    productInfo:productInfo,
    categoryInfo:categoryInfo,
    accountInfo:accountInfo,
    userInfo:userInfo
  })
}