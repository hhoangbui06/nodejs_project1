const dashboardRoute = require('./dashboard-route')
const systemConfig = require('../../config/system')
const productsRoute = require('./products-route')
const categoryRoute = require('./category-route')
const roleRoute = require('./role-route')
const accountsRoute = require('./accounts-route');
const authRoute = require('./auth-route')
const authMiddleware = require('../../middlewares/admin/auth-middleware')
const myAccountRoute = require('./my-account-route')
const binRoute = require('./bin-route')
const settingRoute = require('./setting-route')
const orderRoute = require('./order-route')

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(PATH_ADMIN + '/auth', authRoute)
  app.use(PATH_ADMIN + '/dashboard', authMiddleware.authLogin, dashboardRoute)
  app.use(PATH_ADMIN + '/products', authMiddleware.authLogin, productsRoute)
  app.use(PATH_ADMIN + '/categories', authMiddleware.authLogin, categoryRoute)
  app.use(PATH_ADMIN + '/roles', authMiddleware.authLogin, roleRoute)
  app.use(PATH_ADMIN + '/accounts', authMiddleware.authLogin, accountsRoute)
  app.use(PATH_ADMIN + '/orders', authMiddleware.authLogin, orderRoute)
  app.use(PATH_ADMIN + '/my-account', authMiddleware.authLogin, myAccountRoute)
  app.use(PATH_ADMIN + '/bin', authMiddleware.authLogin, binRoute)
  app.use(PATH_ADMIN + '/settings', authMiddleware.authLogin, settingRoute)
}