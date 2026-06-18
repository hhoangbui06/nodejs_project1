const dataProducts = require('../../models/product-model');
const filterStatusHelper = require('../../helpers/filterStatus-helper')
const searchHelper = require('../../helpers/search-helper')
const paginationHelper = require('../../helpers/pagination-helper')
const setDetail = require('../../helpers/set-detail-helper')
const dataCategory = require('../../models/category-model');
const categoryHelper = require('../../helpers/product-category-helper');

let index = 0;
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
    status: 'active'
  }
  let searchTitle = searchHelper(req.query)
  if (searchTitle.title) find['title'] = searchTitle.title
  const counts = await dataProducts.countDocuments(find);
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    totalProduct: counts
  }
  paginationHelper(objectPagination, req.query)
  let products = await dataProducts.find(find).skip(objectPagination.skipItems).limit(objectPagination.limitItems)
  products = setDetail.setNewPrice(products)
  res.render('client/pages/products/index.pug', {
    title: "Danh sách sản phẩm", boxheadTitle: "This is product page!", products: products, keyword: searchTitle.keyword,
    objectPagination: objectPagination
  })
}
module.exports.getRecentlyProducts = async (req, res) => {
  let find = {
    deleted: false,
    status: 'active'
  }
  let searchTitle = searchHelper(req.query)
  if (searchTitle.title) find['title'] = searchTitle.title
  const counts = await dataProducts.countDocuments(find);
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    totalProduct: counts
  }
  paginationHelper(objectPagination, req.query)
  let products = await dataProducts.find(find).skip(objectPagination.skipItems).limit(objectPagination.limitItems).sort({ "createdBy.createdAt": "desc" })
  products = setDetail.setNewPrice(products)
  res.render('client/pages/products/recently-product.pug', {
    title: "Sản phẩm mới nhất", boxheadTitle: "This is product page!", products: products, keyword: searchTitle.keyword,
    objectPagination: objectPagination
  })
}
module.exports.getFeaturedProducts = async (req, res) => {
  let find = {
    deleted: false,
    status: 'active',
    featured: "1"
  }
  let searchTitle = searchHelper(req.query)
  if (searchTitle.title) find['title'] = searchTitle.title
  const counts = await dataProducts.countDocuments(find);
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    totalProduct: counts
  }
  paginationHelper(objectPagination, req.query)
  let products = await dataProducts.find(find).skip(objectPagination.skipItems).limit(objectPagination.limitItems)
  products = setDetail.setNewPrice(products)
  res.render('client/pages/products/recently-product.pug', {
    title: "Sản phẩm nổi bật", boxheadTitle: "This is product page!", products: products, keyword: searchTitle.keyword,
    objectPagination: objectPagination
  })
}
module.exports.getBestSaleProducts = async (req, res) => {
  let find = {
    deleted: false,
    status: 'active',
  }
  let searchTitle = searchHelper(req.query)
  if (searchTitle.title) find['title'] = searchTitle.title
  const counts = await dataProducts.countDocuments(find);
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    totalProduct: counts
  }
  paginationHelper(objectPagination, req.query)
  let products = await dataProducts.find(find).skip(objectPagination.skipItems).limit(objectPagination.limitItems).sort({ discountPercentage: "desc" })
  products = setDetail.setNewPrice(products)
  res.render('client/pages/products/recently-product.pug', {
    title: "Sản phẩm giảm giá", boxheadTitle: "This is product page!", products: products, keyword: searchTitle.keyword,
    objectPagination: objectPagination
  })
}
module.exports.detailItem = async (req, res) => {
  let slug = req.params.slug;
  let find = {
    deleted: false,
    slug: slug,
    status: 'active'
  }
  let product = await dataProducts.findOne(find)
  product = setDetail.setNewPriceProduct(product)
  if (product.product_category_id) {
    let category = await dataCategory.findOne({
      deleted: false,
      status: 'active',
      _id: product.product_category_id
    })
    product.category = category;
  }
  res.render('client/pages/products/detail.pug', { title: "Chi tiết sản phẩm", product: product })
}
module.exports.categoryProducts = async (req, res) => {
  let slugCategory = req.params.slugCategory;
  let category = await dataCategory.findOne({
    deleted: false,
    status: 'active',
    slug: slugCategory
  })
  let allSubCategoryId = await categoryHelper.getSubCategory(category._id);
  let categoryProducts = await dataProducts.find({
    deleted: false,
    status: 'active',
    product_category_id: { $in: allSubCategoryId }
  })
  const counts = categoryProducts.length;
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    totalProduct: counts
  }
  paginationHelper(objectPagination, req.query)
  let products = await dataProducts.find({
    deleted: false,
    status: 'active',
    product_category_id: { $in: allSubCategoryId }
  }).skip(objectPagination.skipItems).limit(objectPagination.limitItems)
  categoryProducts = setDetail.setNewPrice(categoryProducts)
  res.render('client/pages/products/index.pug', { title: category.title, products: categoryProducts, objectPagination: objectPagination })
}