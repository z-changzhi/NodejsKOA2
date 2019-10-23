const Router = require('koa-router')
const router = new Router();
const {PositiveIntegerValidator} = require('../../validators/validator')
const {HttpException,ParameterException} = require('../../../core/http-exception.js')

router.post('/v1/:id/classic/latest', async(ctx, next) => {
    // header
    // body
    const param = ctx.params
    const query = ctx.request.query
    const headers = ctx.request.header
    const body = ctx.request.body
    // const r = new ParameterException("woshishabi");
    const v = await new PositiveIntegerValidator().validate(ctx)

    // const id = v.get('path.id')

    // const id = v.get('body.key', parsed = false)
    // 通过get这种方式是可以避免大量判断的。因为它如果不存在只会返回undefined
    ctx.body = 'success'
})
module.exports = router