export function TriggerOnChange<T>(trigger: (entity: T & ThisType<T>) => void) {
  return function (target: any, key: string) {
    let value = 0
    const getter = function () {
      return value
    }
    const setter = function (newVal) {
      value = newVal
      trigger(this)
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}
