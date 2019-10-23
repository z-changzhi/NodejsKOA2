const {HttpException} = require('../core/http-exception')
const catchError = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        // 开发环境 当前的Error不是HttpException
        const isHttpException = error instanceof HttpException
        const idDev = global.config.environment === 'dev'
        if (idDev && !isHttpException) {
            throw error
        }
        // 不用写else因为一般抛出异常之后后面的代码一般都不会执行
        if (isHttpException) {
            // 判断是否为已知异常
            // error_code（python） and errorCode(js的规范)
            ctx.body = {
                msg: error.msg,
                errorCode: error.errorCode,
                request: `${ctx.method} + ${ctx.path}`
            }
            ctx.status = error.code
        } else {
            ctx.body = {
                msg: 'we made a mistake 0(n_n)0~~',
                error_code: 999,
                request: `${ctx.method} ${ctx.path}`
            }
            ctx.status = 500
        }
    }
}
module.exports = catchError