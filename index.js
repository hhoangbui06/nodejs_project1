const express = require('express');
const app = express();
const path = require('path')

const moment=require('moment')
app.locals.moment=moment;

const database = require('./config/database.js')
async function connectDB() {
  try {
    await database.connect();
  }
  catch (err) {
    console.log(err);
  }
}
connectDB();
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('express-flash');
app.use(cookieParser('hhoangbui'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash())


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

require('dotenv').config();
const port = process.env.PORT;

const routeClient = require("./routes/client/index-route.js")
const routeAdmin = require('./routes/admin/index-route.js')

const systemConfig = require('./config/system.js');
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.use(express.static(`${__dirname}/public`));

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')))

routeClient(app)
routeAdmin(app)
app.use((req,res)=>{
  res.render("client/pages/errors/404", {
    pageTitle:"404 Not Found"
  }
  )
})

app.listen(port, () => {
  console.log(`Welcome port ${port}`);
})