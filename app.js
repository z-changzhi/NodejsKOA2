const Koa = require('koa')
const parser = require('koa-bodyparser')
const InitManager = require('./core/init')
const Exception = require('./middlewares/exception')
// require('./app/models/user')

const app = new Koa()

console.log(process.cwd());
app.use(parser())
app.use(Exception)
InitManager.initCore(app)


app.listen(3002);