#### vue的响应式原理，它是怎么知道数据变化的呢 
问题描述？  
问了 Vue 响应式原理，先手写了观察者模式（网上说是发布订阅模式，我觉得还是有区别的，发布订阅模式是 Vue 的 emit和 $on 的实现原理），之后讲 Vue 如何递归去把数据添加到响应式系统 【Object.defineProperty】，然后讲 Dep 和 Watcher 类，Vue 在 Compile 阶段如何识别 data 数据，实例化 Watcher 的过程【Dep.target】 


Dep可以看做是书店，Watcher就是书店订阅者，而Observer就是书店的书，订阅者在书店订阅书籍，就可以添加订阅者信息，一旦有新书就会通过书店给订阅者发送消息。
1. 原理是根据Object.defineProperty的getter，setter，当数据变化时会触发。
2. 其中收集依赖是在getter中收集，这样就知道key值在哪里用到了，依赖存储在Dep中，也就是谁触发getter函数，就会把那个Watcher收集到Dep中， 
````

export default class Dep {
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    removeSub(sub) {
        remove(this.subs, sub)
    }
    depend() {
        if(window.target) {
            this.addSub(window.target)
        }
    }
    notify() {
        const subs = this.subs.slice()
        for(let i = 0,len = subs.length; i < len; i++) {
            subs[i].update()
        }
    }
}
function remove(arr, item) {
    if(arr.length) {
        const index = arr.indexof(item)
        if(index>-1) {
            return arr.splice(index, 1)
        }
    }
}
````

3. 收集的依赖是什么？收集谁？
````

Vue.prototype._init = function (options?: Object) { 
     const vm: Component = this 
     ...
     initLifecycle(vm) 
     initEvents(vm)  // 初始化事件相关的属性 
     initRender(vm)  // vm添加了一些虚拟dom、slot等相关的属性和方法 
     callHook(vm, 'beforeCreate')  //钩子函数，创建之前
     initInjections(vm)  // resolve injections before data/props
     initState(vm)  //初始化状态，主要就是操作数据了，props、methods、data、computed、watch，从这里开始就涉及到了Observer、Dep和Watcher 
     initProvide(vm)  // resolve provide after data/props
     callHook(vm, 'created')   //钩子函数，创建完成
     ...
 }

````



当属性值变化的时候，通知谁，初始化data（）
收集的依赖是window.target,当触发读取数据的时候（window.target=this），会从这个全局唯一的位置读取正在读取数据的watcher，然后收集起来放进Dep。这个收集的watcher是个中介，当数据变化时通知他，然后他统一执行属性对应的回调函数。通知到对应的需要更新DOM的组件（中等粒度），内部进行diff算法更新， 依赖保存在defineReactive上，也就是也getter的函数。
````

this.$vm.Watcher('data.a.b.c', (newVal, oldVal)=>{})
export default class Watcher {
    constructor(vm, objString, cb) {
        this.vm = vm
       // parsePath 封装的度str的方法
        this.getter = parsePath(objString)
        this.cb = cb
        this.value = this.get() // 获取旧值
    }
    
    get() {
        window.target = this
        // 执行this.getter(),就可以从 this.vm中 读取data.a.b.c的内容,
        // 这个时候就可以把window.targe添加到dep中
        let value = this.getter.call(this.vm, this.vm)
        window.target = undefined
        return value
    }
    // 当 data.a.b.c的值变化时就会触发 update函数， 就会执行回调函数
    updata() {
        const oldValue = this.value
        this.value = this.get() // 获取新值
        this.cb.call(this.vm, this.value, this.oldValue)
    }
}

// 解析简单路径
const bailRE = /[^\w.$]/
export function parsePath(path) {
    if(bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function(obj) {
        for(let i = 0; i < segments.length; i++) {
            if(!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}
//var obj = {a:{b:{c:124314}, z:''}, d: 11}
//var val = parsePath('a.b.c')(obj)
// 124314  // 读取a.b.c的值
````

4. 前面的只能侦探数据中一个属性的变化，需要一个Observe把数据中所有属性包括子属性都侦测到，然后将其都转化为getter/setter的形式，然后去追踪他们的变化。运用递归跑完所有属性。因为getter/setter的原因，只对数据的更新有触发，新增删除啥的就感知不到了，需要借助vm.$set函数，传入对key值的新增或者深层级的修改，新增的话手动触发observe函数去把他转为getter/setter形式进行跟踪，
````

export class Observer {
    constructor(value) {
        this.value = value
        if(!Array.isArray(value)) {
        //walk方法会将每一个属性都转换成getter/setter的形式，只在Object可以调用
            this.walk(value)
        }
    }
    
    walk(obj) {
        const keys = Object.keys(obj)
        for(let i = 0; i < keys;i++) {
            defineReative(obj, keys[i], obj[keys[i]])
        }
    }
}

function defineReactive(data, key, val) {
    if(typeof val == 'object') {
        // 递归子属性是object
        new Observer(val)
    }
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get:function() {
            dep.depend() // 收集依赖
            return val
        },
        set: function(value) {
            if(val == value) return
            val = value
            dep.notify() //通知依赖渲染
        }
    })
}
````

属性描述符必须是数据描述符或者存取描述符两种形式之一，不能同时是两者 。这就意味着你可以：
````

Object.defineProperty({}, "num", {
    value: 1,
    writable: true,
    enumerable: true,
    configurable: true
});
也可以：
var value = 1;
Object.defineProperty({}, "num", {
    get : function(){
      return value;
    },
    set : function(newValue){
      value = newValue;
    },
    enumerable : true,
    configurable : true
});
但是不可以：
// 报错
Object.defineProperty({}, "num", {
    value: 1,
    get: function() {
        return 1;
    }
});
````

5. watcher会记录自己要用通知那些Dep，Dep也会记录通知那些Watcher。

数组依赖收集的位置
对象或数组类型会通过 new Observer 创建 observer 实例，
所以，Observer 中的 value 可能是数组，也可能是对象；
Observer 类中的 value，即 this 指 observer 实例，
为其添加 __ob__ 属性，这样每个对象本身或数组就拥有了 ob 属性；
因此，可在此处为 observer 实例添加 dep 属性，
这就相当于为数组或对象本身都增加了一个 dep 属性；
这样就可以在对象或数组上，通过value.__ob__.dep 取到 dep，
当数组数据变化时，可以通过 dep 中收集的 watcher 触发视图更新操作；

Array数组是如何监听数据的变化的？
是利用拦截prototype的方法属性，例如splice、push、pop、shift、unshift、sort、reverse这七个方法，这种改变数组自身内容的方法。
不改变自身的方法不重写。
/ src/core/observer/array.js
 
// 获取数组的原型Array.prototype，上面有我们常用的数组方法
const arrayProto = Array.prototype
// 创建一个空对象arrayMethods，并将arrayMethods的原型指向Array.prototype
export const arrayMethods = Object.create(arrayProto)
 
// 列出需要重写的数组方法名
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
// 遍历上述数组方法名，依次将上述重写后的数组方法添加到arrayMethods对象上
````

methodsToPatch.forEach(function (method) {
  // 保存一份当前的方法名对应的数组原始方法
  const original = arrayProto[method]
  // 将重写后的方法定义到arrayMethods对象上，function mutator() {}就是重写后的方法
  def(arrayMethods, method, function mutator (...args) {
    // 调用数组原始方法，并传入参数args，并将执行结果赋给result
    const result = original.apply(this, args)
    // 当数组调用重写后的方法时，this指向该数组，当该数组为响应式时，就可以获取到其__ob__属性
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // 将当前数组的变更通知给其订阅者
    ob.dep.notify()
    // 最后返回执行结果result
    return result
  })
})
 
 
````

当调用push方法的时候，其实调用的是arrayMethods.push,而arrayMethods.push是函数mutator，实际上执行的就是mutator函数。
希望拦截器只覆盖响应式数组的原型，避免造成全局Array的污染。
````

const hasProto = '__proto__' in {}
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
export class observer {
    constructor(value) {
        this.value = value
        this.dep = new Dep()
        dep(value, '__ob__', this) // __ob__值就是当前Observe的实例
        if(Array.isArray(value)){
            const augment = hasProto?protoAugment:copyAugment
            augment(value, arrayMethods, arrayKeys)
        }else {
            this.walk(value)
        }
    }
}
function protoAugment(value, arrayMethods, arrayKeys){
    value.__proto__ = arrayMethods // 可以很巧妙的实现覆盖value原型的功能
}

function copyAugment(value, arrayMethods, arrayKeys) {
    for(let i = 0, len = arrayKeys.length; i < len; i++){
        const key = arrayKeys[i] // 方法名
        def(value, key, arrayMethods[key]) // arrayMethods[key] 方法名对应的函数
    }
}

// 拦截数组的原型上的key属性。挂载方法
function def（obj, key, val, enumerable） {
    object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

我们也要深度观察数组的每一项，包括新增的成员，获取新增的值进行双向绑定
observeArray(items) {
    for(let i = 0, len = items.length; i < len; i++){
        observe(items[i]) // 成员双向绑定
    }
}
````

__proto__其实就是Object.getPrototypeOf 和 Object.setPrototypeOf 的代替版本。
使用ES6的Object.setPrototypeOf来代替__proto__完全可以实现相同效果
依赖的收集：
也是在defineReactive中收集依赖：
````
function defineReactive(data, key, val) {
    if(typeof val === 'object') new observer(val)
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            dep.depend()
            // 这里就是收集依赖
            return val
        }，
        set:function(newval){
            if(newval === val){
                return
            }
            dep.notify()
            val = newval
        }
    })
}
````

数组中嵌套对象的依赖收集原理
例如：arr:[{a:1},{b:2}]
当对 arr 取值时{{arr}}，默认会对 arr 进行 JSON.stringify(arr)，
JSON.stringify 会取出内部所有属性进行打印输出
即 JSON.stringify 会对内部属性进行取值操作，此时会走 getter，
而 getter 中就会为对象本身和内部属性进行依赖收集
````
<body>
  <div id=app>
    {{arr}}
  </div>
  <script src="./vue.js"></script>
  <script>
    // 测试数组的依赖收集
    let vm = new Vue({
      el: '#app',
      data() {
        return { arr: [{ a: 1 }, { b: 2 }] }
      }
    });
    vm.arr[0].a = 100;
    console.log("输出当前 vm", vm);
  </script>
</body>
````

页面输出：[{"a":100},{"b":2}]

对 arr 取值，内部会进行 JSON.stringify，就会为对象中的 a 属性做依赖收集；
所以，数组中的对象中的 a 属性更新时，走的就是对象的更新和数组无关
数组中如果有对象[{}]，也需要为对象本身做依赖收集，
因为未来有可能会为对象新增属性，对象本身做依赖收集才可以更新视图

// src/observe/index.js
````

function defineReactive(obj, key, value) {
  let childOb = observe(value);
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      if(Dep.target){
        dep.depend();
        if(childOb){
            childOb.dep.depend();
            if(Array.isArray(value)){// 如果当前数据是数组类型
              dependArray(value)     // 可能数组中继续嵌套数组，需递归处理
            }  
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue);
      value = newValue;
      dep.notify();
    }
  })
}
````

````

/**
 * 使数组中的引用类型都进行依赖收集
 * @param {*} value 需要做递归依赖收集的数组
 */
function dependArray(value) {// 让数组里的引用类型都收集依赖
  // 数组中如果有对象:[{}]或[[]]，也要做依赖收集（后续会为对象新增属性）
  for(let i = 0; i < value.length; i++){
    let current = value[i];
    // current 上如果有__ob__，说明是对象，就让 dep 收集依赖（只有对象上才有 __ob__）
    current.__ob__ && current.__ob__.dep.depend();
    // 如果内部还是数组，继续递归处理
    if(Array.isArray(current)){
      dependArray(current)
    }
  }
}
````


数组外层和内部属性都添加dep



如果支持_proto_则覆盖原型，否则就挂载这些方法到Array（）上，这样使用的方法就是用的这些挂载函数，也是在getter中收集依赖，将依赖Dep放在Observe中，为了让拦截和getter中都可以访问到Observe实例。例如多了一个_ob_来存observe实例，判定数组有没有转为响应式，避免重复操作。
缺点是：
有些方式拦截不到：this.list[2] = 1;  this.list.length = 0 ;无法触发render或watch

总结
响应式数据原理分为对象和数组两大类，在 Vue 初始化过程中：
通过对象属性劫持，会为所有属性添加 dep
还会为属性值进行依赖收集：为对象本身和数组也添加 dep
如果是属性变化，将触发属性对应的 dep 去做更新；
如果是数组更新，将触发数组本身的 dep 去做更新；
如果取值时属性值为数组，数组中的对象类型（数组中嵌套的对象或数组）递归进行依赖收集
如果数组中嵌套了对象，由于对象取值会进行 JSON.stringify，所以对象中的属性默认就会做依赖收集