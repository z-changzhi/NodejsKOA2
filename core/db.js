const Sequelize = require('sequelize')
const {
    dbName,
    host,
    port,
    user,
    password
} = require('../config/config').database
const sequelize = new Sequelize(dbName,user,password,{
    dialect:'mysql',// dialect 指定数据库的类型
    host,
    port,
    logging:true,
    timezone:'+08:00',// 按照我们的北京时间来记录时间相关的数据
    define:{
        // create_time update_time delete_time
        timestamps:true,
        paranoid:true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored:true
    }
})

sequelize.sync({
    force:true
    // force:false
})

module.exports = {
    sequelize
}