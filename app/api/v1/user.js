const bcrypt = require('bcryptjs')

const Router = require('koa-router')

const {success} = require('../../lib/helper')

const {RegisterValidator} = require('../../validators/validator')
const {User} = require('../../models/user')
const router = new Router({
    prefix:'/v1/user'
});

// 注册 新增数据 post
// 更新数据 put
// 查询数据 get
// 删除数据 delete


router.post('/register',async(ctx, next) => {
    // 思维路径
    //   我们的api需要接受那些参数
    const v = await new RegisterValidator().validate(ctx)
    // 从校验器里取出所有的user数据
    const user = {
        email:v.get('body.email'),
        password:v.get('body.password2'),
        nickname:v.get('body.nickname'),
    }
    await User.create(user)
    success()
    // ctx.body = u;
    // throw new global.errs.Success()

})

// 切记一定要到处否则它不会自动加载
module.exports = router