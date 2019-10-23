const bcrypt = require('bcryptjs')
const {Sequelize, Model} = require('sequelize')

const {sequelize: db} = require('../../core/db')

class User extends Model {
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
        set(val){
            const salt = bcrypt.genSaltSync(10)
            // 10 密码学：10表示在生成密码是计算机所花费的成本
            const psw = bcrypt.hashSync(val,salt)
            // module 的属性操作
            this.setDataValue('password',psw)
        }
    },
    openid: {
        type: Sequelize.STRING(64),
        unique: true
    }
},{
    sequelize:db,
    tableName:'users'
})

// 数据迁移 SQL更新 风险
module.exports = {
    User
}