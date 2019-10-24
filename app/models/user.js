const bcrypt = require('bcryptjs')
const {Sequelize, Model} = require('sequelize')

const {sequelize: db} = require('../../core/db')

class User extends Model {
    static async verifyEmailPassword(email, plainPassword) {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            // 去/core/http-exception.js中定义一个NoTFound 异常
            throw new global.errs.NotFound('账号不存在')
        }
        const correct = bcrypt.compareSync(plainPassword, user.password)
        if (!correct) {
            // 去/core/http-exception.js中定义一个AuthFailed(授权失败)
            throw new global.errs.AuthFailed('密码不正确')

        }
        return user
    }
}

User.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nickname: Sequelize.STRING,
    email: {
        type: Sequelize.STRING(128),
        unique: true
    },
    password: {
        // 扩展 设计模式 观察者模式
        type: Sequelize.STRING,
        set(val) {
            const salt = bcrypt.genSaltSync(10)
            // 10 密码学：10表示在生成密码是计算机所花费的成本
            const psw = bcrypt.hashSync(val, salt)
            // module 的属性操作
            this.setDataValue('password', psw)
        }
    },
    openid: {
        type: Sequelize.STRING(64),
        unique: true
    }
}, {
    sequelize: db,
    tableName: 'users'
})

// 数据迁移 SQL更新 风险
module.exports = {
    User
}