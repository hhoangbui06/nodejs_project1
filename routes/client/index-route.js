const productRoutes = require("./product-route");
const homepageRoutes = require("./home-route");
const headerMiddleware = require('../../middlewares/client/header-middleware')
const searchRoutes = require('./search-route')
const cartMiddleware = require('../../middlewares/client/cart-middleware')
const cartRoute = require('./cart-route');
const checkoutRoute = require('./checkout-route')
const userRoute = require('./user-route')
const orderRoute = require('./order-route')
const userMiddleware = require('../../middlewares/client/user-middleware')
const authMiddleware = require('../../middlewares/client/auth-middleware')
const settingGeneralMiddleware=require('../../middlewares/client/settings-middleware')

module.exports = (app) => {
  app.use(headerMiddleware.getCategory)
  app.use(userMiddleware.loginUser)
  app.use(cartMiddleware.checkCart)
  app.use(settingGeneralMiddleware.settingGeneral)
  app.use('/users', userRoute)
  app.use('/', homepageRoutes)
  app.use('/products', productRoutes)
  app.use('/search', searchRoutes)
  app.use('/cart', cartRoute)
  app.use('/checkout', checkoutRoute)
  app.use('/orders', orderRoute)
}