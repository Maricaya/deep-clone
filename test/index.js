const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const assert = chai.assert

const DeepClone = require("../src/index.js")
describe('deepClone', () => {
    it('是一个函数', () => {
        assert.isFunction(new DeepClone().clone)
    })
    it('能够复制基本类型', () => {
        // num string boolean undefined null symbol
        const n = 123
        const n2 = new DeepClone().clone(n)
        assert(n === n2)
        const str = '123'
        const str2 = new DeepClone().clone(str)
        assert(str === str2)
        const b = true
        const b2 = new DeepClone().clone(b)
        assert(b === b2)
        const u = undefined
        const u1 = new DeepClone().clone(u)
        assert(u === u1)
        const empty = null
        const empty2 = new DeepClone().clone(empty)
        assert(empty === empty2)
    })
    describe('对象', () => {
        it('能够复制普通对象', () => {
            const a = {
                name: 'cat',
                child: {
                    name: 'mimi'
                }
            }
            const a2 = new DeepClone().clone(a)
            assert(a !== a2)
            assert(a.name === a2.name)
            assert(a.child !== a2.child)
            assert(a.child.name === a2.child.name)
        })
        it('能够复制数组对象', () => {
            const a = [
                [11, 12],
                [21, 22],
                [31, 32]
            ]
            const a2 = new DeepClone().clone(a)
            assert(a !== a2)
            assert(a[0] !== a2[0])
            assert(a[1] !== a2[1])
            assert(a[2] !== a2[2])
            assert.deepEqual(a, a2)
        })
        it('能够复制函数', () => {
            const a = function (x, y) {
                return x + y
            }
            a.xxx = {
                yyy: {
                    zzz: 1
                }
            }
            const a2 = new DeepClone().clone(a)
            assert(a !== a2)
            assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
            assert(a.xxx !== a2.xxx)
            assert(a(1, 2) === a2(1, 2))
        })
        it('环也能复制', () => {
            const a = {
                name: '方方'
            }
            a.self = a
            const a2 = new DeepClone().clone(a)
            assert(a !== a2)
            assert(a.name === a2.name)
            assert(a.self !== a2.self)
        })
        xit('不会爆栈', () => {
            const a = { child: null }
            let b = a
            for (let i = 0; i < 20000; i++) {
                b.child = { child: null }
                b = b.child
            }
            const a2 = new DeepClone().clone(a)
            assert(a !== a2)
            assert(a.child !== a2.child)
            /*
                可能会爆栈，解决方式
                对结构进行改造
                用循环的方法，把数据放进一个数组里
            */
        })
        it('可以复制正则表达式', () => {
            const a = new RegExp('hi\\d+', 'gi')
            const a2 = new DeepClone().clone(a)
            assert(a.source === a2.source)
            assert(a.flags === a2.flags)
            assert(a !== a2)
        })
        it('可以复制日期', () => {
            const a = new Date()
            const a2 = new DeepClone().clone(a)
            assert(a.getTime() === a2.getTime())
            assert(a !== a2)
        })
        it('自动跳过原型属性', () => {
            const a = Object.create({name: 'a'})
            a.xxx = {yyy:{zzz:1}}
            const a2 = new DeepClone().clone(a)
            assert(a!== a2)
            assert.isFalse('name' in a2)
            assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
            assert(a.xxx.yyy !== a2.xxx.yyy)
            assert(a.xxx !== a2.xxx)
            // NaN !== NaN
        })
    })
})