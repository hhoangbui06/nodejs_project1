const dataOrders=require('../../models/order-model');
const dataProducts=require('../../models/product-model');
const dataCart=require('../../models/cart-models');
const setDetail=require('../../helpers/set-detail-helper')
module.exports.index=async(req,res)=>{
   if (!req.cookies.cartId) {
      req.flash("error", "Không tìm thấy giỏ hàng")
      res.redirect(req.headers.referer);
      return;
    }
    let cart = await dataCart.findOne({
      _id: req.cookies.cartId
    })
    let products = cart.products;
    await Promise.all(products.map(async (item)=>{
      let productId=item.product_id;
      let product=await dataProducts.findOne({
        _id:productId
      }).select('thumbnail price title discountPercentage slug')
      item.product=setDetail.setNewPriceProduct(product)
    }))
    products.totalPrice=products.reduce((total, item)=>{
      return total+item.product.priceNew*item.quantity
    },0)
  res.render('client/pages/checkout/index.pug', {title:"Thanh toán", cartDetail:products})
}
module.exports.postOrder=async(req,res)=>{
  let cartId=req.cookies.cartId;
  const cart=await dataCart.findOne({
    _id:cartId
  });
  let products=await Promise.all(cart.products.map(async (item)=>{
    const product=await dataProducts.findOne({
      _id:item.product_id
    }).select("price discountPercentage")
    return {
      product_id:item.product_id,
      price:product.price,
      discountPercentage: product.discountPercentage,
      quantity:item.quantity
    }
  }))
  const userInfo=req.body
  const orderInfo={
    cart_id:cartId,
    userInfo:userInfo,
    products:products
  }
  // Lưu user_id nếu người dùng đã đăng nhập
  if(res.locals.user){
    orderInfo.user_id = res.locals.user._id;
  }
  const newOrder= new dataOrders(orderInfo);

  await newOrder.save();
  await dataCart.updateOne({
    _id:cartId
  }, {products:[]})
  res.redirect(`/checkout/success/${newOrder._id}`)
}
module.exports.getSuccessOrder=async(req,res)=>{
  let orderId=req.params.orderId;
  let order=await dataOrders.findOne({
    _id:orderId
  }).lean()
  for (let product of order.products){
    let productInfo=await dataProducts.findOne({
      _id:product.product_id
    }).select("thumbnail title").lean()
    product.productInfo=productInfo;
    product.priceNew=Math.round(product.price*(100-product.discountPercentage)/100);
    product.totalPrice=product.quantity*product.priceNew
  }
  order.totalPrice=order.products.reduce((total, item)=>{
    return total +item.priceNew*item.quantity;
  },0)
  res.render('client/pages/checkout/success.pug', {title:"Đặt hàng thành công!", order:order})
}