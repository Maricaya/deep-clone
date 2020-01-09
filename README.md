### 深拷贝
完成一个高性能的深拷贝。
参考loadsh[https://github.com/lodash/lodash/blob/master/.internal/baseClone.js]

### 测试
引入chai和sinon进行测试。启动测试：
```bash
yarn test
```


深拷贝是面试常考的知识点，也经常容易出错，下面来看看我的答题思路吧。

## 什么是深拷贝
理解一：
- 假设b是a的一份拷贝，并且b中没有对a对象的引用。
理解二：
- b是a的一份拷贝。
- 把a和b画出图，a与b之间没有连接。

## 询问
在做任何与算法、需求相关时，都要问这几个问题：
- 询问数据类型
  - 拷贝的数据中有什么？
- 询问数据规模
  - 10？
  - 10w？
  - 10w个嵌套？
- 性能要求
  - 对时间、空间、速度要求
- 运行环境
  - IE6？Chrome?
- 其他要求
  - 有没有其他内容？
- 开始写

## 开始写
### 最简单的方法
JSON序列化反序列化
```js
let obj = {
  a: 1,
  b: [1, 2, 3],
  c: {d1: 'ddd', d2: 'ccc'}
}
let obj1 = JSON.parse(JSON.stringify(a))
obj1.a = 2
console.log(obj.a)
```

这个方法的缺点是什么？
- 不支持`function`
  - 以前有函数报错，现在是直接忽略
- 不支持`undefined` (支持`null`)
- 不支持引用.JSON不支持环状结构，只支出树状结构
  - `a.self = a` `a(#100).self = (#101)`
```js
let a = {
  name: 'a'
}
a.self = a
```
- 不支持`Date`,会把 `new Date()` 变成字符串
- 不支持正则表达式
- 不支持`symbol`

### 如何实现支持以上类型的深拷贝？
递归
- 看节点类型（7种）
- 基本类型，直接拷贝
- object分情况讨论
  - 普通object - for in
  - 数组Array - Array初始化
  - 函数 -  怎么拷贝？闭包？
  - 日期Date - 怎么拷贝？

### 测试驱动开发
使用chai和sinon，先进行项目构建
可以去我的仓库拷贝代码，删去src/index.js test/index.js中内容

#### 完成浅拷贝 - 基本类型
6种基本数据类型 num string boolean undefined null symbol
不是引用类型，直接返回即可
```js
class DeepClone {
    clone (source) {
        return source
    }
}
```
#### 完成对象拷贝
判断数据是不是对象`xxx instanceof Object`
##### 能够复制普通对象
```js
const a = { name: 'cat', child: { name: 'miaomiao' } }
class DeepClone {
  clone(source) {
    if (source instanceof Object) {
      let dist = new Object()
      // 使用for in 遍历对象上所有数据
      for (const key in source) {
        dist[key] = this.clone(source[key]) 
      }
      return dist
    }
    return source
  }
}

module.exports = DeepClone
```
##### 能够复制数组
```js
clone(source) {
  if (source instanceof Object) {
    let dist = new Object()
    /****************************/
    if (source instanceof Array) {
      dist = new Array()
    }
    /****************************/
    // 使用for in 遍历对象上所有数据
    for (const key in source) {
      dist[key] = this.clone(source[key]) 
    }
    return dist
  }
  return source
}
```
##### 能够复制函数
既然是函数，那么拷贝时再调用一次即可。调用原函数算深拷贝吗？这里要回到我们对深拷贝的定义：没有互相引用。
这里调用了一下原函数，算不算互相引用呢？ 只有执行时才引用，没有执行的时候没有引用，而且函数调用的堆栈不一样。很难明确算不算互相引用。
再回到深拷贝的定义，深拷贝不是一种术语，而是程序员们都认同的方法，这样写也没问题。

函数由环境和参数决定。环境无法更改，在定义时已经决定。参数是this、传递的参数。使用`...arguments` 传递。

```js
clone(source) {
  if (source instanceof Object) {
    let dist = new Object()
    if (source instanceof Array) {
      dist = new Array()
    }
    /****************************/
    else if (source instanceof Function) {
      dist = function () {
        return source.call(this, ...arguments)
      }
    }
    /****************************/
    // 使用for in 遍历对象上所有数据
    for (const key in source) {
      dist[key] = this.clone(source[key]) 
    }
    return dist
  }
  return source
}
```
##### 这种方式的缺点
###### 使用了递归: 环引用
递归：必须有一个结尾，目前的对象都有一个末尾。如果对象是一个环呢？

window 就是一个环引用 window.self = window
```js
const a = {name: 'cat'}
  a.self = a
// 不能写成
const a = { name: 'a', self: a }
/*
* 因为会先解析右侧，self 为 undefined
*/
```
解决方法：使用Map设置缓存，已经深拷贝过的数据直接去缓存中寻找。
```js
class DeepClone {
  /****************************/
  constructor() {
    this.cache = new Map()
  }
  clone (source) {
    if (source instanceof Object) {
        const cacheCurrent = this.cache.get(source)
        if (cacheCurrent) {
            return cacheCurrent
        }
    /****************************/
        let dist = new Object()
        if (source instanceof Array) {
          dist = new Array()
        } else if (source instanceof Function) {
          dist = function () {
              return source.call(this, ...arguments)
          }
        }
  /****************************/
        this.cache.set(source, dist)
  /****************************/
        // 使用for in 遍历对象上所有数据
        for (const key in source) {
          dist[key] = this.clone(source[key]) 
        }
      return dist
    }
    return source
  }
}
```

###### 环引用的爆栈问题
```js
const a = { child: null }
let b = a
for (let i = 0; i < 20000; i++) {
    b.child = { child: null }
    b = b.child
}
const a2 = new DeepClone().clone(a)
```
一共有2w次引用，不可能存入chrome。Chrome的堆栈大概有1.2w左右。
会产生堆栈溢出。

解决办法：把结构进行改造，把递归变成循环。每进入一个对象，不去复制，把对象放入数组中，把子元素放入数组的后面。

#### 拷贝RegExp、Date
使用`new RegExp(source)` `new Date(source)` 进行拷贝
```js
clone (source) {
  // ...
  if (source instanceof Object) {
    let dist = new Object()
    if (source instanceof Array) {
      dist = new Array()
    } else if (source instanceof Function) {
      dist = function () {
        return source.call(this, ...arguments)
      }
    }
    /************************************/
    else if (source instanceof RegExp) {
      return new RegExp(source)
    } else if (source instanceof Date) {
      return new Date(source)
    }
    /************************************/
  //  ...
}
```

### 为什么使用class？
每次new一个deepClone，会得到新的空数组cache。
不然旧的cache会一直保留在内存中。

### 自己实现的优缺点
优点
- 加深对js对象基础的理解
缺点
- 如果类型超出以上4个范围，比如 Buffer、Map
- 每个类型需要单独加一个if else