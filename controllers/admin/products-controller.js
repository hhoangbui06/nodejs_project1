const dataProducts = require('../../models/product-model')
const filterStatusHelper = require('../../helpers/filterStatus-helper')
const searchHelper = require('../../helpers/search-helper')
const createTree = require('../../helpers/create-tree-helper')
const pagination = require('../../helpers/pagination-helper')
const systemConfig = require('../../config/system')
const dataCategories = require('../../models/category-model')
const dataAccounts = require('../../models/account-models')
const setDetail = require('../../helpers/set-detail-helper')

const prefixAdmin=systemConfig.prefixAdmin
module.exports.index = async (req, res) => {
  let sortProducts = {};
  if (req.query.sortKey && req.query.sortValue) {
    sortProducts[req.query.sortKey] = req.query.sortValue;
  }
  let filterStatus = filterStatusHelper(req.query)
  let find = {
    deleted: false
  }
  if (req.query.status) {
    let value = req.query.status;
    find["status"] = value
  }
  let search = searchHelper(req.query)
  if (search.keyword) find.title = search.title
  const count = await dataProducts.countDocuments(find)

  let objectPagination = {
    currentPage: 1,
    limitItems: 4,
    totalProduct: count
  }
  pagination(objectPagination, req.query, find)
  let products = await dataProducts.find(find).sort(sortProducts).skip(objectPagination.skipItems).limit(objectPagination.limitItems);

  products = setDetail.setStatus(products);
  products = setDetail.setNewPrice(products);
  for (let item of products) {
    if (item.createdBy.account_id) {
      let userId = item.createdBy.account_id;
      let user = await dataAccounts.findOne({
        _id: userId
      }).select('fullName _id')
      item.createUser = user
    }
    if (item.updatedBy.length > 0) {
      let updatedInfo = item.updatedBy[item.updatedBy.length - 1];
      let userId = updatedInfo.account_id;
      let user = await dataAccounts.findOne({
        _id: userId
      }).select('fullName _id')
      item.updateUser = user
    }
  }
  let index = (objectPagination.currentPage - 1) * objectPagination.limitItems + 1
  res.render('admin/pages/products/index.pug', {
    title: "Product", products: products, filterStatus: filterStatus, keyword: search.keyword, objectPagination: objectPagination, index: index
  })
}
module.exports.changeStatus = async (req, res) => {
  let updateInfo = {
    account_id: res.locals.user._id,
    updatedAt: new Date()
  }
  await dataProducts.updateOne({ _id: req.params.id }, { status: req.params.status, $push: { updatedBy: updateInfo } })
  req.flash('success', 'Cập nhật thành công!')
  res.redirect(req.headers.referer)
}

module.exports.changeMulti = async (req, res) => {
  let tmp = req.body.ids.split(',');
  let ids = [], pos = [];
  for (let x of tmp) {
    let check = x.split('-');
    ids.push(check[0]);
    pos.push(check[1])
  }
  if (ids.length) {
    let type = req.body.type;
    switch (type) {
      case "active":
        let updatedActive = {
          account_id: res.locals.user._id,
          updatedAt: new Date()
        }
        await dataProducts.updateMany({ _id: { $in: ids } }, { status: "active", $push: { updatedBy: updatedActive } });
        req.flash('success', `Đã cập nhật thành công trạng thái của ${ids.length} sản phẩm!`)
        break;
      case "inactive":
        let updatedInActive = {
          account_id: res.locals.user._id,
          updatedAt: new Date()
        }
        await dataProducts.updateMany({ _id: { $in: ids } }, { status: "inactive", $push: { updatedBy: updatedInActive } });
        req.flash('success', `Đã cập nhật thành công trạng thái của ${ids.length} sản phẩm!`)
        break;
      case "delete-multi":
        await dataProducts.updateMany({ _id: { $in: ids } }, {
          deleted: true, deletedBy: {
            account_id: res.locals.user._id,
            deletedAt: new Date()
          }
        })
        req.flash('success', `Đã xóa thành công ${ids.length} sản phẩm!`)
        break;

      case "change-position":
        let updatedPosition = {
          account_id: res.locals.user._id,
          updatedAt: new Date()
        }
        for (let i = 0; i < ids.length; i++) {
          await dataProducts.updateOne({ _id: ids[i] }, { position: pos[i], $push: { updatedBy: updatedPosition } })
        }
        req.flash('success', `Đã cập nhật thành công vị trí của ${ids.length} sản phẩm!`)

        break;
      default:
        break;


    }
  }
  res.redirect(req.headers.referer)

}
module.exports.deleteProduct = async (req, res) => {
  let id = req.params.id;
  await dataProducts.updateOne({ _id: id }, {
    deleted: true, deletedBy: {
      account_id: res.locals.user._id,
      account_fullName: res.locals.user.fullName,
      deletedAt: new Date()
    }
  })
  req.flash("success", "Đã xóa sản phẩm!")
  res.redirect(req.headers.referer)
}

module.exports.create = async (req, res) => {
  let categories = await dataCategories.find({ deleted: false });
  let newCategories = createTree.create(categories);
  res.render('admin/pages/products/create.pug', { title: "Tạo mới sản phẩm", records: newCategories, oldData: req.flash('oldData')[0] || {} })
}
module.exports.createItem = async (req, res) => {
  try {
    req.body.price = Number(req.body.price)
    req.body.discountPercentage = Number(req.body.discountPercentage)
    req.body.stock = Number(req.body.stock)
    if (req.body.position === "") {
      let count = await dataProducts.countDocuments();
      req.body.position = count + 1;
    }
    else req.body.position = Number(req.body.position)
    req.body.createdBy = {
      account_id: res.locals.user._id,
    }
    let newProduct = new dataProducts(req.body);
    await newProduct.save();
    req.flash('success', 'Đã thêm mới sản phẩm!')
  }
  catch (err) {
    req.flash('error', 'Xảy ra lỗi!')
  }
  res.redirect(`${prefixAdmin}/products/create`)
}

module.exports.editItem = async (req, res) => {
  try {
    let categories = await dataCategories.find({ deleted: false });
    let newCategories = createTree.create(categories);
    let editProduct = await dataProducts.findOne({ _id: req.params.id})
    if (!editProduct || editProduct.deleted) {
      req.flash('error', 'Sản phẩm không tồn tại hoặc đã bị xóa!');
      res.redirect(`${prefixAdmin}/products`);
      return;
    }
    res.render('admin/pages/products/edit.pug', { title: "Chỉnh sửa sản phẩm", product: editProduct, records: newCategories })
  } catch (error) {
    req.flash('error', 'Có lỗi xảy ra!');
    res.redirect(`${prefixAdmin}/products`);
  }
}
module.exports.editProduct = async (req, res) => {
  try {
    let id = req.params.id;
    let editProduct = await dataProducts.findOne({ _id: id });
    if (!editProduct || editProduct.deleted) {
      req.flash('error', 'Sản phẩm không tồn tại hoặc đã bị xóa!');
      res.redirect(`${prefixAdmin}/products`);
      return;
    }
    req.body.price = Number(req.body.price)
    req.body.discountPercentage = Number(req.body.discountPercentage)
    req.body.stock = Number(req.body.stock)
    req.body.position = Number(req.body.position)
    if (req.file) req.body.thumbnail = req.file.filename
    let updatedInfo = {
      account_id: res.locals.user._id,
      account_fullName: res.locals.user.fullName,
      updatedAt: new Date()
    }
    await dataProducts.updateOne({ _id: id }, { ...req.body, $push: { updatedBy: updatedInfo } })
    req.flash('success', 'Cập nhật sản phẩm thành công!')
  }
  catch (err) {
    req.flash('error', 'Cập nhật thất bại!')
  }
  res.redirect(req.headers.referer)
}

module.exports.detailItem = async (req, res) => {
  let id = req.params.id;
  let productDetail = await dataProducts.findOne({ _id: id })
  if (productDetail) {
    res.render('admin/pages/products/detail', { product: productDetail })
  }
  else {
    res.redirect(req.headers.referer)
  }
}