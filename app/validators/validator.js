const {LinValidator, Rule} = require('../../core/lin-validator-v2')
const {ParameterException} = require('../../core/http-exception')
const {User} = require('../models/user')
const {LoginType} = require('../lib/enum')
// Rule 定义属性校验
class PositiveIntegerValidator extends LinValidator {
    constructor() {
        super()
        this.id = [
            new Rule('isInt', '需要是正整数', {min: 1})
        ]
        // 多个定义规则是且关系
    }
}

class RegisterValidator extends LinValidator {
    constructor() {
        super()
        this.email = [
            new Rule('isEmail', '不符合Email的规范')
        ]
        this.password1 = [
            // 指定范围 不能让密码有危险的字符 123456
            new Rule('isLength', '密码最少6个字符，最多32个字符', {
                min: 6,
                max: 32
            }),
            new Rule('matches','密码不符合规范','^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]')
        ]
        this.password2 = this.password1
        this.nickname = [
            new Rule('isLength','昵称不符合长度规范',{
                min:4,
                max:32
            })
        ]
    }

    validatePassword(vals) {
        const psw1 = vals.body.password1
        const psw2 = vals.body.password2
        if (psw1 !== psw2) {
            // throw new ParameterException('两个密码必须相同')
            throw new Error('两次输入的密码不一致，请重新输入')
        }
    }

    async validateEmail(vals){
        const email = vals.body.email
        // 我们要查询数据库的email 来进行验证
        //   - 我们操作数据库基本上都是依赖我们的模型
        // 问题：怎么通过我们的User模型进行查询呢
        const user = await User.findOne({
            where:{
                email:email
            }
        })
        // 因为findOne 返回的是 Promise 所以我们也可以用.then的方式
        if(user){
            // throw new ParameterException('email已存在')
            throw new Error('email已存在')
        }
    }
}

class TokenValidator extends LinValidator{
    constructor(){
        super()
        this.account = [
            new Rule('isLength','不符合账号规则',{
                min:4,
                max:32
            })
        ]
        this.secret = [
            // secret 可以有两种情况
            // 1. 可以为空值 2. 也可以不传值
            // 2. 传的话必须得满足一定的验证条件（可以为空/可以不为空  ）
            // 查询 分页 （典型的可以传也可以不传）
            new Rule('isOptional'),// 它还可以设置默认值
            new Rule('isLength','至少6个字符',{
                min:6,
                max:128
            })
        ]
    }
    validateLoginType(vals){
        if(!vals.body.type){
            throw new Error('type是必须参数')
        }
        if(!LoginType.isThisType(vals.body.type)){
            throw new Error('type参数不合法')
        }
    }
}

module.exports = {
    PositiveIntegerValidator,
    RegisterValidator,
    TokenValidator
}