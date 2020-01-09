class DeepClone {
    constructor() {
      this.cache = new Map()
    }
    clone (source) {
        if (source instanceof Object) {
            const cacheCurrent = this.cache.get(source)
            if (cacheCurrent) {
                return cacheCurrent
            }
            let dist = new Object()
            if (source instanceof Array) {
                dist = new Array()
            } else if (source instanceof Function) {
                dist = function () {
                    return source.call(this, ...arguments)
                }
            } else if (source instanceof RegExp) {
                return new RegExp()
            } else if (source instanceof Date) {
                return new Date(source)
            }
            this.cache.set(source, dist)
            Object.keys(source).map(key => {
                dist[key] = this.clone(source[key])
            })

            return dist
        }
        return source
    }
}
const a = {name: '方方'}
a.self = a
const a2 = new DeepClone().clone(a)
console.log(a2)

module.exports = DeepClone