[TOC]
# 第2章 【深入理解KOA】Koa2的那点事儿与异步编程模型
## 模块加载、ES、TS、Babel浅谈
[![koa](https://img.shields.io/badge/koa-%5E2.7.0-brightgreen.svg) ](https://www.npmjs.com/package/koa)
[![koa-router](https://img.shields.io/badge/koa--router-%5E7.4.0-brightgreen.svg)](https://www.npmjs.com/package/koa-router)
[![sequelize](https://img.shields.io/badge/sequelize-%5E5.6.1-brightgreen.svg)](https://www.npmjs.com/package/sequelize)
[![mysql2](https://img.shields.io/badge/mysql2-%5E1.6.5-brightgreen.svg)](https://www.npmjs.com/package/mysql2)
### 导入包和模块的方法
> 1. commonJS
> 2. ES6
>    - import from
> 3. AMD
> - ps: 现在 nodejs 里面还不能使用Es6 （实验特性）

#### ES10
> import from / decorator (装饰器) / class this.x = (不能把属性写在类的下面)

#### babel 前端代码很多都要跑在浏览器里面
> * 将E6的代码转换成E5的代码
> * 服务端代码不存在浏览器的兼容问题

#### TS typescript 它能使用ES 比较好的新特性
> - 它有类型的约束
> - 大型js项目在维护方面并不是太方便
> - vue3.0 内核用TS 构建

```js
const koa = require('koa')
class Sample{
    x = 1; // 这个写法在node里面不支持
    constructor(){
        this.x = 1
    }
}
```

## 洋葱模型

###  new 一个 koa 应用程序对象
#### 应用程序对象
>   - 在这个对象的上面包含了很多的中间件
>   - 他可以注册很多的中间件
>     - koa 只会自动帮我们执行第一个中间件
#### 使用中间件注意
>   * 1. async / await
#### 发送HTTP KOA 接受HTTP
>   - 通常情况下我们不会单独定义一个函数，然后把函数名注册到中间件里面来
>   - 我们使用匿名函数 E6的语法

```
const Koa = require('koa')
const app = new Koa();

app.use( async(ctx, next) => {
    // ctx 上下文 非常重要的koa对象 洋葱模型
    console.log('hello,zhuchangzhi');
    const a = await next();
    // await 当成求值关键字（他会阻塞线程） 对返回的promise方法进行求值
    // await
    // - 意义1：后面也可以添加表达式，并不只是对promise进行求值
    // - 意义2：会阻塞线程
    console.log(a);
    // a.then((res)=>{
    //     console.log(res);
    // })
    console.log('hello,end1');
    // next 表示的是下一个中间件函数
    // 他的返回结果一定是一个promise
})

app.use( (ctx, next) => {
    // Promise async await
    console.log('hello,haoshuai');
    // next();
    // 对资源的操作是异步的，包括读文件。发送http请求。操作数据库 / sequelize koa-router。

    console.log('hello,end2');
    return 'abc'
})


app.listen(3000);
```
[TOC]
## 深入理解async和await （异步的终极解决方案）
> 这个思想最早出现在微软的C#中
### await
#### 如果线程不被阻塞
```js
/**
 * 由于线程被阻塞的话，我们需要等待一分钟的时间。才能将结果返回给我们的res
 * 如果线程不阻塞的话，这一块根本不需要等待一分钟的时间。
 */
app.use( (ctx, next) => {
    const start = Date.now();
    const res = axios.get('http://www.baidu.com'); //1min
    const end = Date.now();
    console.log(end-start);
    // 结果为0或者很小表示我们当前的代码并不会去等待它结果的返回。
})

```
`结果：0`
### 如果线程被阻塞
> - 意义：他会把难以处理的异步函数的调用处理成同步的
> - 误区：这段线程虽然被阻塞，但是并不是卡主他会去做别的事情。

```
app.use( async (ctx, next) => {
    const start = Date.now();
    const res = await axios.get('http://www.baidu.com'); //1min
    const end = Date.now();
    console.log(end-start);
    // 结果为0或者很小表示我们当前的代码并不会去等待它结果的返回。
})
```
`结果：158`
## async
> - 凡是加上async的函数返回值自动变成promise
> - 问题：为什么我们要在中间件函数前面加上async
>   - 因为中间件函数不管是加不加async它的返回值都是prmise
>   - 如果在中间件里面用了await的话没有加async会报错

## 为什么一定要保证洋葱模型 
### 保证洋葱模型
> - 一旦await之后我们的线程就会被阻塞，执行了外面的`console.log(2)`。
> - 然后等await线程取消阻塞之后，才会执行`console.log(4)`
#### 问题：如何保证那么多中间件函数都是按照洋葱圈模型来执行？
> - 我们需要在每一个中间件调用下一个中间 `next()`前面加上 `await`
> - 我们需要在所有的中间件都加上 `async`/`await`

```js
const Koa = require('koa')
const axios = require('axios')
const app = new Koa();

/**
 *
 */
app.use(  (ctx, next) => {
    console.log(1);
    next();
    console.log(2);
})

app.use( async (ctx, next) => {
    console.log(3)
    // 阻塞当前得线程
    const axios = require('axios')
    const res = await axios.get('http://7yue.pro')// 1min
    next()
    console.log(4);
})

app.listen(3000);
```
```
结果：
D:\z-changzhi\node_demo\NodejsKOA2>node app.js
1
3
2
4
```
#### 问题：第一个中间件如何获取第三个中间件里面的参数？
> - `await next()` 之后才能保证后面的代码全部都走完
> - 通过我们的`ctx`上下文机制
```
const Koa = require('koa')

const app = new Koa();

/**
 *
 */
app.use(async (ctx, next) => {
    console.log(1);
    await next();
    const r = ctx.r;
    console.log(r);
})

app.use
app.use(async (ctx, next) => {
    const axios = require('axios')
    const res = await axios.get('http://www.baidu.com')
    ctx.r = res
    await next()
})

app.listen(3001);
```

[TOC]
# 第3章 【让KOA更加好用】路由系统的改造
## 1. 路由
[![koa](https://img.shields.io/badge/koa-%5E2.7.0-brightgreen.svg) ](https://www.npmjs.com/package/koa)
[![koa-router](https://img.shields.io/badge/koa--router-%5E7.4.0-brightgreen.svg)](https://www.npmjs.com/package/koa-router)
[![sequelize](https://img.shields.io/badge/sequelize-%5E5.6.1-brightgreen.svg)](https://www.npmjs.com/package/sequelize)
[![mysql2](https://img.shields.io/badge/mysql2-%5E1.6.5-brightgreen.svg)](https://www.npmjs.com/package/mysql2)
#### 问题：为什么使用`ctx.path`而不是`request.path`
> 这是因为我们koa内部有一个代理,和request是等效的
```
const Koa = require('koa')

const app = new Koa();

/**
 *
 */
app.use(async (ctx, next) => {
    console.log(ctx.path);
    console.log(ctx.method);
    if(ctx.path==='/classic/latest'&&ctx.method=="GET"){
        ctx.body = {key:'classic'}
    }
})

app.listen(3001);
```
> 代码地不足：API太多不利于维护。
## 2. 使用koa-router
### 步骤
> 1. 实例化这个koa-router
> 2. 然后去编写一系列的路由函数
> 3. 最后调用router.routes()
> - 把这个中间件注册到app对象上
```js
const Koa = require('koa')
const app = new Koa()
// 引入API路由的 模块
const book = require('./api/v1/book')
const classic = require('./api/v1/classic')

app
    .use(book.routes())
    .use(classic.routes())

app.listen(3002);
```
##  3. 多Router拆分
###  web开发 好的代码 
#### 阅读方便 利于维护 提高编程效率 
> - 编程是一种艺术
> - 编程 
>   - 数据的类型
>   - 主题的划分
> - 主题
>   - 渐进式
>   - 核心主要
>   - 抽象概念
>   - 思考Model
> - 拆分 
> - 文件
#### 客户端兼容性
> - 老版本 classic 新版本 music
> - v1 v2 v3 API 是需要兼容多个版本的 （最多支持三个版本）
> - // api 携带版本号
> - // api 版本 业务变动

> - // 兼容的三个方法
>      - 1 把版本号加在url的路径之中
>      - 1 查询参数
>      - 1 加载http header 里面
#### 开闭原则
> - 我们在编程的时候
>   - 对代码地修改是关闭的
>   - 对代码地拓展是开放的 
#### 循环引用的问题
> - app 模块映入了 classic 模块 classic 模块引入了 app 模块 => 导致了循环引用的问题 
> - 问题：一旦产生了循环引用的问题nodejs是不会报错的
> - 建议：不应该在子模块里面调用我们的入口文件，只能是在app.js里面导入其它的模块
> - 分层次： 上层 ==调用== 下层 
```
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
var router = new Router()
// 引入API路由的 模块
const book = require('./api/v1/book')
const classic = require('./api/v1/classic')

/**
 * 1. 实例化这个koa-router
 * 2. 然后去编写一系列的路由函数
 * 3. 最后调用router.routes() 把这个中间件注册到app对象上
 */

app
    .use(book.routes()) //调用这个中间件
    .use(classic.routes()) //调用这个中间件


// 导出的代码
module.exports = {
    // router:router key和value相同可以简写
    router
}

app.listen(3001);
```
## 4. nodejs热部署
### webstorm 断点调试
> shift + F9
### 自动重启
> `npm i nodemon -g` -g
> - 全局安装不会出现在app.json里面
>   - 需要使用npx nodemon 来运行命令
> - `nodemon app.js` 指令运行app.js
> - package.json 脚本编辑
```json
"scripts":{
    "start:dev":"nodemon --inspect-brk",
    "start:prod":"node app.js"
}
```
### 将调试 and 自动重启相结合
> - webstorm 配置启动项
> - `C:\Users\888\AppData\Roaming\npm\node_modules\nodemon\bin\nodemon`
### BUG: Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/nodemon_tmp'
> 权限不够 使用sudo
## 5. 路由的自动注册
> - "require-directory":"^2.1.1"
```
const Koa = require('koa')
const requireDirectory = require('require-directory')
const Router = require('koa-router')
const book = require('./api/v1/book')
const classic = require('./api/v1/classic')
const app = new Koa()
// 引入API路由的 模块


const modules = requireDirectory(module,'./api',{visit:whenLoadModule})
function whenLoadModule(obj){
    // 回调函数
    if (obj instanceof Router){
        app.use(obj.routes())
    }
}
app.listen(3002);
```
## 6.初始化管理器与Process.cwd

#### 问题：类里面如何调用一个静态的方法并传值？
> // 动脑筋 思考能不能简化 无法提高 程序员就是要懒。
```js
// 传值方法1
InitManager.initLoadRouters(app)
// 传值方法2
InitManager.app = app
```

#### 问题：引入的路径变更怎么解决?(两个方案)
> - path config
>   - 将路径写在配置文件里面
> - 使用绝对路径
>   - nodejs有一个全局变量叫做
>     - process.cwd() 可以找到绝对路径
```
const apiDirectory = `${process.cwd()}/app/api`
```

### 初始化管理器
> 新建目录 core/init.js 里面装载类的代码

```js
const requireDirectory = require('require-directory')
const Router = require('koa-router')
class InitManager{
    static initCore(app){
        // 入口方法
        // 类里面如何调用一个静态的方法
        InitManager.app = app
        InitManager.initLoadRouters(app)
    }

    static initLoadRouters(app){

        requireDirectory(module, './app/api', {
            visit: whenLoadModule
        })

        function whenLoadModule(obj) {
            // 回调函数
            if (obj instanceof Router) {
                app.use(obj.routes())
            }
        }

    }
}
```
## 7 参数获取与LinValidator校验器
> - 传递参数的四种常用的方法
> 1. url 路径里面传递参数
>    - 采用:id 的形式进行传递
> 2. url ? 后面进行传参
> 3. http header 里面传递参数
> 4. body 中进行传参
#### 问题：怎么获取post请求的body？
> - 引入一个request函数库
>   - "koa-bodyparser": "^4.2.1",
>   - 他是一个中间件，使用中间件需要在app.js中注册
#### 问题：怎么校验我们客户端提供拖来的参数信息？
> - 校验的意义
>   - 防止非法的参数
>   - 给客户端明确的提示

[TOC]

# 第4章 【深入浅出讲异常】异步异常与全局异常处理

## 1 参数获取与LinValidator校验器

> - 传递参数的四种常用的方法
>
> 1. url 路径里面传递参数
>    - 采用:id 的形式进行传递
> 2. url ? 后面进行传参
> 3. http header 里面传递参数
> 4. body 中进行传参

#### 问题：怎么获取post请求的body？

> - 引入一个request函数库
>   - "koa-bodyparser": "^4.2.1",
>   - 他是一个中间件，使用中间件需要在app.js中注册

#### 问题：怎么校验我们客户端提供拖来的参数信息？

> - 校验的意义
>   - 防止非法的参数
>   - 给客户端明确的提示

### 自己编写校验层 LinValidator
> 问题：怎么在异步编程里面处理异常

## 2. 异常处理 ≠ 异常处理的运用

#### 问题：定义三个函数相互调用会出现几种情况？
> 1. 没有发生异常，正确返回结果
> 2. 发生了异常
> - 函数设计 《代码大全2》
>  1. 判断出异常 return false null
>  2. throw new Error 编程规范 throw
>     - 因为单纯的 return false/null 会丢失我们的异常数据

```js
function f1(){
}
function f2(){
    try {
        f3()
    }catch (e) {

    }
}
console.log(f3());
function f3(){
    try {
        1/0
    }catch (e) {
        throw e
    }
    return "success"
}
```

`结果：success`

> 因为js是弱类型语言，在js中`1/0`并不会报错。

#### 问题：怎么能让我调用每一个函数的时候不用 try catch？
> - 全局异常处理 
>   - 在函数的顶部制定一种机制，他可以监听到任何的异常
>   - 在没有Promise Async 的时代 用回调函数 难
>   - 技巧：如果函数返回的是Promise那么 加上await 一定没问题

## 3. 异步异常的处理方法
```js
async function f2(){
	try{
		console.log(await f3())
	}catch(error){
		console.log('error')
	}
}
async function f3(){
    await setTimeout(function(){
        throw new Error('error')
    },3000)
}
```

#### 问题：我们获取不到f3()中出现的异常
> - 如果在f2()中用try-catch f3()一定要返回一个promise，而且还是异步函数的promise
> - 
```js
async function f3(){
    return new Promise((resolve,reject)=>{
    	// 如果代码出现了错误我们需要调用 reject 
      // 如果正确调用resolve
      setTimeout(function(){
      	const r = Math.random()
      	if(r<0.5){
      		// throw new Error('error') 
      		// 不能用
      		reject('error')
      	}
      },1000)
    })
}
```

## 4. 全局异常中间件

#### BUG：DePrecationWarning: Unhandled promise
> Promise 没有添加 await (重点)

#### 问题：怎么监听任何异常 - AOP 面向切面编程（从全局的角度切入到这个问题，监听这个异常的）
> - KOA 特色 中间件 
>   - 我们要让 throw 能被全局异常监听到 并且告诉用户为什么会出现这个错误
> - 监听错误
> 	- 需要输出一段有意义的提示信息

### 新建文件 exception
> /middlewares/exception .js

## 5. 已知错误与未知错
> - 在中间件捕获到的error不应该直接返回到我们的客户端中
>   - 因为error里面还有堆栈调用的信息
>   - error 简化 清晰明了的信息 给前端
>   - HTTP Status Code 2xx,4xx,5xx
>   - message
>   - error_code 详细，开发者自己定义 10001 20003
>   - request_url
> - 错的类型
>   - 已知型错误 param int 'abc' 我们校验出来了这个错误
>     - 我们可以处理这个错误 并且明确的告诉前端
>     - try catch 处理这个错误 并且把这个错误返回给我们的前端
>   - 未知型错误 程序潜在的错误 无意识 根本就不知道的错误
>     - 输错了数据库的账号和密码

## 6. 定义异常的返回格式
### classic.js
```js
const Router = require('koa-router')
const router = new Router();

router.post('/v1/:id/classic/latest', (ctx, next) => {
    //header
    //body
    const param = ctx.params
    const query = ctx.request.query
    const headers = ctx.request.header
    const body = ctx.request.body
    if (true) {
        // 已知错误
        // 动态的特性 面向对象的方式 一个类
        const err = new Error('没有query')
        err.errorCode = 10001
        err.status = 400
        err.requestUrl = `${ctx.method} + ${ctx.path}`
        throw err;
        // error_code
    } else {
        ctx.body = {
            key: 'book'
        }
        throw new Error('Api Exception')
    }
})
module.exports = router
```
### exception.js 全局异常中间件 
```js
const catchError = async(ctx,next)=>{
    try {
        await next()
    }catch(error){
        if (error.errorCode) {
            // 判断是否为已知异常
            // error_code（python） and errorCode(js的规范)
            ctx.body = {
                msg:error.message,
                errorCode:error.errorCode,
                request:error.requestUrl
            }
            ctx.status = error.status
        }else{
            ctx.body = "服务器有点累"
        }
    }
}
module.exports = catchError
```

## 7. 定义HttpException异常基类
> - classic.js 这种方式实在是太繁琐了
>   - 我们要用面向对象的方式来 定义一个类来继承nodejs原来这个error
> - core 文件夹下定义一个文件 http-exception

#### 问题：为什么要继承这个Error
> 因为我们要把http throw抛出去 所以必须得是error类型

#### http-exception.js
```js
class HttpException extends Error {
    constructor(msg='服务器异常',errorCode=10000,code=400) {
        super()
        this.errorCode = errorCode
        this.code = code
        this.msg = msg
    }
}
module.exports = {
    HttpException
}
```
#### exception.js
```js
const {HttpException} = require('../core/http-exception')
const catchError = async(ctx,next)=>{
    try {
        await next()
    }catch(error){
        if (error instanceof HttpException) {
            // 判断是否为已知异常
            // error_code（python） and errorCode(js的规范)
            ctx.body = {
                msg:error.msg,
                errorCode:error.errorCode,
                request:`${ctx.method} + ${ctx.path}`
            }
            ctx.status = error.code
        }else{
            ctx.body = "服务器有点累"
        }
    }
}
module.exports = catchError
```

#### classic.js
```js
const Router = require('koa-router')
const router = new Router();

const {HttpException} = require('../../../core/http-exception.js')

router.post('/v1/:id/classic/latest', (ctx, next) => {
    //header
    //body
    const param = ctx.params
    const query = ctx.request.query
    const headers = ctx.request.header
    const body = ctx.request.body

    if (true) {
        // 已知错误
        // 动态的特性 面向对象的方式 一个类
        const err = new HttpException('没有query',10001,400);
        throw err;
    }
    ctx.body = {
        key: 'book'
    }
    throw new Error('Api Exception')
})
module.exports = router
```

## 8. 特定异常类与global全局变
###  特定异常类
> 定义一个自己的异常类来继承我们的 HttpException
```js
class ParameterException extends HttpException{
    constructor(msg,errorCode,code){
        super()
        this.errorCode = errorCode || 10001
        this.code = 400
        this.msg = msg || '参数错误'
    }
}
```
#### 问题：有没有什么放在在我使用HttpException的时候不需要require进来？
### global全局变量
> - 缺点：单词拼错了整个代码也不会报错，所以该导入的时候还是应该导入最好
#### 在init.js中
> 1. 定义 `static loadHttpException(){}`
> 2. 在initCore() 入口方法中调用我们的InitManager.loadHttpException()
> 3. 调用 const err = new global.errs.ParameterException('woshishabi',10002,400);
```js
// 定义
static loadHttpException(){
    const errors = require('./http-exception')
    global.errs = errors
}
// 使用
const err = new global.errs.ParameterException('woshishabi',10002,400);
throw err;
```

[TOC]
# 第5章 LinValidator校验器与Sequelize Orm生成MySQL数据表
[![validator](https://img.shields.io/badge/validator-%22%5E10.11.0---)](https://github.com/validatorjs/validator.js)
## 1. 处理未知异常
> middlewares/exception.js

```js
else{
    ctx.body = {
        msg:'we made a mistake 0(n_n)0~~',
        error_code:999,
        request:`${ctx.method} ${ctx.path}`
    }
    ctx.status = 500
}
```
#### 问题：为什么我们不直接在API里面校验
> - 手动校验特别麻烦
> - API是可以判断，但由于所有的koa接受到的都是字符串的形式。但是id在我们使用的时候一定要是一个数字类型的。即使判断正确之后id还是需要转型。
> - 如果验证的是大量的参数。整个API中基本上都是检验代码了。
> - Flask TP SpringBoot 参数校验器都是最基本的功能

## 2. Lin-Validator获取HTTP参数_batch

#### 先定义一个我们的数据
```
const c ={
    a:1,
    b:{
        f:2,
        e:{
            x:{

            }
        }
    }
}
```
#### 第一种方式获取
```js
if(body){
    if(body.b){// 在这里如果我们的body.b 不存在那么整个代码都会报错
        body.b.e
    }
}
```
#### 第二种get方式获取
```js
const id = v.get('body.b.e',parsed=false)
// 通过get这种方式是可以避免大量判断的。因为它如果不存在只会返回undefined
```
#### 问题：为什么get函数能够实现这么强大的功能呢？
> - 引用了注明的javascript库 lodash
> - 这个问题有点考验对javascript原型链的理解

### Rule 这个类
> - 第一个参数可以传递函数。来自我们的 validator.js 第三方库

## 3. HomeWork
> - 编写一个函数FindMembers
>   - 接受三个参数
>     - 1. 子类
>     - 2. 属性名的前缀
>     - 3. 方法名的前缀
>  - 要求：findMembers返回一个数组（包含ABC三个类的属性名和方法名）
>  - 提示：原型链上查找 、递归

## 4. 配置文件与在终端显示异常_batch
#### 问题：我们在构造方法中调用this前面没有写super()报错，没有给我们打印提示？
> - 原因：我们定义了一个全局中间件catch住了所有的异常，并转换为了输出。
> - 处理：识别配置生产/开发环境
>   - 开发环境 有必要能够看到具体的报错信息
>   - 生产环境 不需要
- /core/init.js

```js
static loadConfig(path = ''){
    const configPath = path || process.cwd()+'/config/config.js'
    const config = require(configPath)
    global.config = config
}
```

- /middlewares/exception.js
```js
if (global.config.environment === 'dev'){
    throw error
}
// 不用写else因为一般抛出异常之后后面的代码一般都不会执行
```

## 5. 关系型数据库与非关系型数据库 （新手看，老鸟跳过）
### User
> - 2部分：通用型 针对小程序 
>   - 注册 登录
### 关系型数据库 & 非关系型数据库
> - 关系型数据库
>   - MySql : CRUD ORM(很像在对象上面调用一个方法)
>   - MS SQLServer
>   - Oracle
>   - PostgresSQL
>   - Access
> - 非关系型数据库
>   - Redis ：典型的 key:value 不持久化（缓存）主要是用来提高查询或缓存的速度
>   - MongoDB 
>     - 里面存储的是一个一个类似于java对象的东西（文档型数据库）
>     - ODM : 
#### 问题：为什么用Mysql
> - 我用MySQL的原因主要还是因为我比较习惯mysql
> - 我们知道MongoDB是一个比较新颖的东西,在这里我们并不比较那个好，那个不好用。我认为不管黑猫白猫抓到老鼠就是好猫嘛。
#### 问题：什么是正统的服务器编程思维？
> - 关系型数据库基本的思维方式
>   - 考虑到数据库的性能、并发、以及数据一致性等等这些问题的时候 （都不简单）
>   - 我这些年的开发经验告诉我数据库的水是非常非常深的
#### 问题：比如我们把数据库写在txt文件里面，我问下大家，这个txt文件它算是数据库吗？
> - 广义上来说它也算是数据库
> - 写在数据库的意义就是 持久的存储数据
> - 所以我们把写数据库的过程也称为数据的持久化
![image](https://z-changzhi.oss-cn-shenzhen.aliyuncs.com/Typroa/assets/1571648469000.png)
## 6. 如何使用代码自动创建数据库表
### Sequelize
> 在core/db.js 中创建js文件

```js
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
    }
})
module.exports = {
    sequelize
}
```

> - 注意：使用它的话需要引入以下依赖
>   - `"sequelize":^5.6.1"`
>   - `"mysql2":"^1.6.5"` mysql 依赖
> - logging 这个参数默认是true 在控制台打印我们的sql语句

## 7. User模型与用户唯一标识设计探讨
### 创建用户模型
> 创建 app/models/user.js
> 1. 导入我们的sequelize
>    - 注意：sequlize实例是小写的s
>    - 我们还需要导入我们的Sequelize对象和Model对象
> 2. 

```js
const {sequelize:db} = require('../../core/db')

const {Sequelize,Model} = require('sequelize')

class User extends Model{
}

User.init({
    // 主键 关系型数据库 (不能重复、不能为空)
    // 自动增长id编号 1 2 3
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncreament:true
    },
    nickname:Sequelize.STRING,
    email:Sequelize.STRING,
    password:Sequelize.STRING
    openid:{
        type:Sequelize.STRING(64),
        unique:true
    },
//  用户 ——小程序 openid 不变 且唯一
//  A,B
//  你 A openid
//  你 B openid
//  找一个用户 小程序\公众号 unionID (适合用来做跨平台的)
})
```
#### 问题：在设计主键的时候注意哪些问题？
> - 一定要用数字的类型，一定不要用字符串类型。
>   - 因为：数字的查询性能以及数据库的其它方面性能是最好的
>   - 尤其不要用随机的字符串（因为有很多的人，他为了保证主键的唯一性采用了随机数 GUID）
> - 6001 6002 这种的形式。这样设计没有考虑到并发的问题
>   - 假如有1000个用户同时去生成我们的用户编号的时候就会出现问题
>   - 很多人不愿意用自增长的原因就是 暴露 用户编号
> - 总结：凡是有一定规律的（除了用随机字符串）其他都是可以猜出来用户系统
>   - 我们要做到的效果：即使别人知道了我们的用户编号，也无法做坏事
>   - 接口保护 权限 访问接口 Token 令牌

## 8. Sequelize个性化配置与数据维护策略
### 配置异步生成表
> /core/db.js

```js
sequelize.sync({
    force:true
})
```
> 设置为true的话每次数据库都会被清空

## 9. LinValidator综合应用
### 思维路径
> - 接受参数 LinValidator(校验)
> - email password1 password2 nickname
> - 

### 属性校验
> - /app/validators/validator.js

```js
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
```
### 自定义校验/规则校验
> - 适用于多个字段之间的校验
> - 在class里面定义一个方法必须以validate开头后面随意

```js
validatePassword(vals){
    const psw1 = vals.body.password1
    const psw2 = vals.body.password1
    if(psd !== psw2){
        throw new Error('两个密码必须相同')
    }
}
```
#### 问题：开发环境下 我们不会收到HTTP报错信息
> 因为我们没有判断当前的Error是不是HttpException

```js
const isHttpException = error instanceof HttpException
const idDev = global.config.environment === 'dev'
if (idDev && !isHttpException) {
    throw error
}
```

[TOC]

# 第6章 【构建用户身份系统】通用用户系统与小程序用户系统
## 1. 用户注册与Sequelize新增数据
#### 问题：如何把用户的参数保存到数据库中去
> - 用原生的sql语句吧数据插入到数据库里去
> - 用sequelize的Model 进行数据库的操作
>   1. 导入模型
>   2. 从校验器里取出所有的user数据 
>   3. 调用`User.create(user)`

```js
const {RegisterValidator} = require('../../validators/validator')
const user = {
    email:v.get('body.email'),
    password:v.get('body.password1'),
    nickname:v.get('body.nickname'),
}
User.create(user)
```

#### 问题：User.create(user)会返回给我们结果吗？
> - 断点调试发现它是promise，加上await便可对我们的User.create(user)进行求值
#### 问题：为什么我们send post请求两次会报错
> - 因为：我们的邮箱设置的unique主键唯一
> - 解决：两种方法
>   - 方法 一

```js
try{
    const r = await User.create(user)
} catch (error){
    throw new ParameterException('email不能重复')
}
```
    缺点：我们不能确定他就是email重复这样的错误
> - - 方法 二 我们在我们的validate中解决email重复的问题

```js
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
}
```
    补充：因为findOne 返回的是 Promise 所以我们也可以用.then的方式
    `User.findOne({where:{email:email}}).then(project=>{})`
    
#### 问题：为什么我解决了Email重复问题，但是不给我报错。
> - 先理解一下`Registervalidator().validate(ctx)`验证器的作用
>   - 可以想象成一个守门员，如果参数不符合规范，就不允许后面代码继续执行。
>   - 如果说没有守住这道门的话，后续的代码继续执行了。第二个重复的email就会被保存到数据库里面去。
>     - 从而触发数据库唯一性的约束，从而报ConstraintError:这个错误
>   - 所以这个问题的本质就在于，RegisterValidator()它出现了错误，但是它没有阻止后续代码的执行
> - 为什么之前没有出现这样的情况呢
>   - 因为我们先增加的自定义函数它的内部包含了一个异步操作，导致了我们整个`validateEmail(vals)`也是异步的
>   - 所以就没有办法去阻止我们后面异步代码得执行
> - 解决方案：加上await `const v = await new RegisterValidator().validate(ctx)`
>   - 我们要导入`validator-v2`
>   - 注意：以后每次我们调用validator的时候都要使用 加上await

#### 问题：为什么不将validator写成中间件的形式。也可以起到一种守门员的作用
> - 中间件实际上是一种静态的方式
>   - 现在我们是吧校验器编写成了一个类，每一次我们使用的时候都是new了一个类。
>   - new 实际上是把一个类实例化，所以每一个请求进来都会实例化一个类。（非常重要）
>   - 如果我们使用中间件的形式化，那么我们这个中间件只会在我们koa项目启动的时候new一次。
>   - 并不会每一次请求都new一个validator
> - 假如每一次请求，我们往new出来的validator对象上挂在一个变量
>   - `1 validator.a = 1`第一次请求
>   - `2 validator.a = 2`第二次请求
>   - 不能再validator上挂载我们的属性，因为全局只有一个validator的a属性
>   - 所以必须要让我们的validator保持独立
>   - 补充： 
>     - 函数：函数一般来说是不会实例化的，函数通常不会用来保存我们的状态。
>     - 实例化出来的对象：可以保存函数的状态。

## 2. 盐与密码加密
> - password存在数据库是以明文的形式存储的。
> - 使用我们的bcryptjs || npm 的包通常是放在第一位的
> - 及时我们有两个用户密码相同，最终加密过后密码还是不同的。（防范彩虹攻击）

## 3. 模型的set操作
> - 我们希望加密的方法不出现在api里面
>   - 可以用属性的方式来进行处理
### module 的属性操作
```js
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
```
## 5. success 帮助函数
> 在`../../lib/helper`里面创建


#### 扩展：设计模式 观察者模式
> - 我们假设有一个观察者，它一直在看这个password。
>   - 如果我们对这个password值做了改变的话，就会执行一段方法。
>   - 它一直观察着这个变量的状态。如果这个被赋值了，或者说被改变了就会立即调用一段函数
> - ES6 Reflect Vue3.0

## 6. isOptional校验
#### 问题：用户登录要怎么操作
> - 在传统的网站
>   - Session 考虑状态但是现在用的不是太多了。
> - 现在
>   - token 令牌 无状态
> 1. 首先：客户端需要提供用户的一个账号and密码
> 2. 服务端核对我们的密码，如果正确我们需要向客户端发送一个令牌 token（一段无意义的随机字符串） jwt （携带数据的字符串，通常携带我们用户的uid）
> 3. 所以我们必须编写一个接口 颁布令牌
> - 补充：
>   - 大概在8,9年前的话那时候没有我们的rest 无状态,webservice 有状态
>   - 有状态：比如说我们要打开一个资源的时候，
>     - 需要发送一个请求 open（打开某一个资源的状态） 
>     - 第二次请求可能就是取数据 
>     - 最后close
>   - 无状态：
>     - 一次请求就能拿到数据
>     - 不会去open也不会去close
>     - TP REST,SOAP（没有人用了）ASP JSP(动态网页技术)

### 开始创建我们的token
> - /app/v1/token.js
> - 在我们validator.js中创建我们的校验器

```js
const Router = require('koa-router')

const router = new Router({
    prefix:'/v1/token'
})

router.post('/',async (ctx)=>{
    
})
```
#### 编写接口的第一步，编写我们的校验器
> - /app/validators/validator.js 中编写我们的校验器

```js
class TokenValidator extends LinValidator{
    constructor(){
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
        // 指定当前用户的登录方式
        // 一般开发者 type 就会联想到枚举
        // 但是js中没有枚举这个概念 所以我们需要模拟枚举
        type 
    }
}
```
#### 分析：secret 创建的思路和问题分析
> - 我们必须要传入参数吗？
> - web 账号+密码
> - 登录 多元化 小程序（直接使用用户的身份就可以登录了） 密码
>   - 微信 打开小程序 微信已经帮你验证身份了。（合法用户）
>   - web account + secret
>   - account
>   - 手机号登录
> - 所以我们要添加一个type属性：来区分不同的身份参数
>   - 指定当前用户的登录方式
>   - 一般开发者 type 就会联想到枚举
>   - 但是js中没有枚举这个概念 所以我们需要模拟枚举

## 7 模拟枚举
### 用js对象方式模拟的枚举 
> - /app/lib/enum.js

```js
function isThisType(val){
    for(let key in this){
        if(this[key] == val){
            return true
        }
    }
    return false
}

const LoginType = {
    USER_MINI_PROGRAM:100,
    USER_EMAIL:101,
    USER_MOBILE:102,
    ADMIN_EMAil:201,
    isThisType
}

module.exports = {
    LoginType
}
```
### 既然我们的type也是一个参数，那么我们有必要对type进行校验
> - /app/validators/validator.js
```js
validateLoginType(vals){
    if(!vals.body.type){
        throw new Error('type是必须的参数')
    }
}
```
#### nodejs 如果我们在它 类的构造方法中 使用this 但是没有加 super() 他是不会报错的
> -  他是一个 隐藏的错误
> -  Java 语言的优势 它不会出现一些隐藏的错误
> -  Java 语言虽然笨重，但是它在编译的时候会找出绝大多数的问题。
> -  不会把问题留到运行的阶段才发现
> -  JS Python 对我们素质要求反而更高一些> - 
