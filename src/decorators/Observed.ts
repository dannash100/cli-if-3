import 'reflect-metadata'
import { ID } from '../types/ID'
import { EventEmitter } from 'stream'

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

    // Setter with first param as type of property decorated
    const setter = function (newVal) {
      value = newVal
      const metadataKey: TriggerId = `${EntityTypes.Trigger}-${id}`
      const methodName = Reflect.getMetadata(metadataKey, target)

      if (methodName) {
        if (typeof this[methodName] !== 'function') {
          return console.error(
            `${ErrorPhase.Runtime}: ${ErrorEntity.PropertyDecorator}/Observed: no method found for ${id} in ${target.constructor.name}`
          )
        }
        this[methodName]()
      }

      // Call Trigger method
      const triggers = Reflect.getMetadata('eventTriggers', this)
      if (!triggers) return
      const eventEmitter = triggers[metadataKey]
      if (eventEmitter) {
        eventEmitter.emit('trigger', newVal)
      }
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

export function EventTrigger(id: string) {
  return function (target: any, key: string) {
    const metadataKey: TriggerId = `${EntityTypes.Trigger}-${id}`
    const eventEmitter = new EventEmitter()
    eventEmitter.on('trigger', target[key])
    const eventTriggers = Reflect.getMetadata('eventTriggers', target)
    if (eventTriggers) {
      Reflect.defineMetadata(
        'eventTriggers',
        { ...eventTriggers, [metadataKey]: eventEmitter },
        target
      )
    } else {
      Reflect.defineMetadata(
        'eventTriggers',
        { [metadataKey]: eventEmitter },
        target
      )
    }
    console.log(Reflect.getMetadata('eventTriggers', target))
  }
}

export function ObservedChild(triggers): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('eventTriggers', triggers, target.prototype)
  }
}
