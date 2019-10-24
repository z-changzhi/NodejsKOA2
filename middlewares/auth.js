const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')

class Auth {
    constructor(level){
        this.level = level
        Auth.USER = 8
        Auth.ADMIN = 16
        Auth.SUPER_ADMIN = 32
    }

    get m(){
        return async(ctx,next)=>{
            const userToken = basicAuth(ctx.req)
            let errMsg = 'token不合法'
            if(!userToken||!userToken.name){
                throw new global.errs.Forbbiden(errMsg)
            }
            try{
                var decode = jwt.verify(userToken.name,global.config.security.secretKey)
            }catch(error){
                // token 不合法
                // token 过期
                if(error.name =='TokenExpiredError'){
                    errMsg = 'token已过期'
                }
                throw new global.errs.Forbbiden(errMsg)
            }
            if(decode.scope < this.level){
                errMsg = '权限不足'
                throw new global.errs.Forbbiden(errMsg)
            }
            // jwt 包含我们自定义的数据 uid,scope
            // uid,scope
            // 2
            ctx.auth = {
                uid:decode.uid,
                scope:decode.scope
            }
            await next()
        }
    }
}

module.exports = {
    Auth
}