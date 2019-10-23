const Router = require('koa-router')
var router = new Router();
router.get('/v1/classic/book', (ctx, next) => {
    ctx.body = {key:'b1ook'}
});
module.exports = router