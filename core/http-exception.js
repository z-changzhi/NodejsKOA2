
class HttpException extends Error {
    constructor(msg='服务器异常',errorCode=10000,code=400) {
        super()
        this.errorCode = errorCode
        this.code = code
        this.msg = msg
    }
}

class ParameterException extends HttpException{
    constructor(msg,errorCode,code){
        super()
        this.errorCode = errorCode || 10001
        this.code = 400
        this.msg = msg || '参数错误'
    }
}
class Success extends HttpException{
    constructor(msg,errorCode){
        super()
        this.code = 200
        this.msg = msg || 'ok'
        this.errorCode = errorCode || 0
    }
}

module.exports = {
    HttpException,
    ParameterException,
    Success
}