import 'reflect-metadata'
import { ID } from '../types/ID'

/**
 * @param id - The id of the observed property
 * @description Observe a property for changes and trigger a method when it changes
 * @example
 * class Clock {
 *  @Observed('timeChange')
 *  public declare time: 0
 *
 *  @Trigger('timeChange')
 *  tickTock() {
 *   console.log(this.time % 2 === 0 ? 'tick' : 'tock')
 *  }
 * }
 */

enum EntityTypes {
  Trigger = 'trigger',
}

enum ErrorPhase {
  Compile = 'CompileError',
  Runtime = 'RuntimeError',
}

enum ErrorEntity {
  PropertyDecorator = '@PropertyDecorator',
  MethodDecorator = '@MethodDecorator',
}

type TriggerId = ID<EntityTypes.Trigger>

export function Observed(id: string) {
  return function (target: any, key: string) {
    let value
    const getter = function () {
      return value
    }
    const setter = function (newVal) {
      value = newVal
      const metadataKey: TriggerId = `${EntityTypes.Trigger}-${id}`
      const methodName = Reflect.getMetadata(metadataKey, target)
      if (typeof this[methodName] !== 'function')
        // TODO error logs
        return console.error(
          `${ErrorPhase.Runtime}: ${ErrorEntity.PropertyDecorator}/Observed: no method found for ${id} in ${target.constructor.name}`
        )
      this[methodName]()
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}

export function Trigger(id: string) {
  return function (target: any, key: string) {
    const metadataKey: TriggerId = `${EntityTypes.Trigger}-${id}`
    Reflect.defineMetadata(metadataKey, key, target)
  }
}
