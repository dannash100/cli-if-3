export function WrappedCount(limit: number) {
  return function (target: Object, propertyKey: string) {
    let value = 0
    const getter = function () {
      return value
    }
    const setter = function (newVal: number) {
      value = newVal % limit
    }
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}
