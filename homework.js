class A {
    constructor() {
        this.nameA = 'a'
    }
    validateA() {
        console.log("A")
    }
}

class B extends A {
    constructor() {
        super()
        this.nameB = 'b'
    }

    validateB() {
        console.log("B")
    }
}

class C extends B {
    constructor() {
        super()
        this.nameC = 'c'
    }

    validateC() {
        console.log("C")
    }
}

function findMembers(instance, fieldPrefix, funcPrefix) {
    // console.log(instance);
    let arr = []
    for (let item in instance){
        // arr.push(item)
        // console.log(item)
    }

    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null)
            return []

        let names = Reflect.ownKeys(instance)
        console.log("names-")
        console.log(names)
        names = names.filter((name)=>{
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name)
        })

        return [...names, ..._find(instance.__proto__)]
    }
    function _shouldKeep(value) {
        if (!value.indexOf(fieldPrefix,0) || value.startsWith(funcPrefix)){
            return true
        }else{
            return false
        }
    }
    console.log(_find(instance));;
    // return arr;
}



var c = new C()

// 编写一个函数findMembers

const members = findMembers(c, 'name', 'validate')
console.log(members)
