const Router = require('koa-router')
const {TokenValidator} = require('../../validators/validator')

const router = new Router({
    prefix:'/v1/token'
})

router.post('/',async(ctx)=>{
    const v = await new TokenValidator().validate(ctx)
    ctx.body = v
})
module.exports = router