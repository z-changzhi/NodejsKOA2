module.exports = {
    // prod/dev
    environment:'prod',
    database:{
        dbName:'zchangzhi',
        host:'localhost',
        port:3306,
        user:'root',
        password:'Cz202020',
    },
    security:{
        secretKey:'abcdefg',
        expiresIn:60*60*24
    }
}