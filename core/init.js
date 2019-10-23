const requireDirectory = require('require-directory')
const Router = require('koa-router')
class InitManager{
    static initCore(app){
        // 入口方法
        // 类里面如何调用一个静态的方法
        InitManager.app = app
        InitManager.initLoadRouters()
        InitManager.loadHttpException()
        InitManager.loadConfig()
    }

    static loadConfig(path = ''){
        const configPath = path || process.cwd()+'/config/config.js'
        const config = require(configPath)
        global.config = config
    }
    static initLoadRouters(){
        const apiDirectory = `${process.cwd()}/app/api`
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        })

        function whenLoadModule(obj) {
            // 回调函数
            if (obj instanceof Router) {
                // app.use(obj.routes())
                InitManager.app.use(obj.routes())
            }
        }
    }
    static loadHttpException(){
        const errors = require('./http-exception')
        global.errs = errors
    }
}
module.exports = InitManager