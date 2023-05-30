import 'reflect-metadata'
import { ID } from '../types/ID'
import { EventEmitter } from 'stream'
import { Constructor } from '../types/MatchableGroup'

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
        eventEmitter.emit('trigger', target.constructor.name)
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
  return (target: any, key: string) => {
    const triggerId: TriggerId = `${EntityTypes.Trigger}-${id}`
    const eventTriggers = Reflect.getMetadata('eventTriggers', target) || []
    Reflect.defineMetadata(
      'eventTriggers',
      [...eventTriggers, [triggerId, key]],
      target
    )
  }
}

export const hasDecoratorTag = (target: Object, tag: DecoratorTags) => {
  const tags = Reflect.getMetadata('tags', target) || ([] as DecoratorTags[])
  return tags.includes(tag)
}

/** Tags to indicate decorators applied to class */
export enum DecoratorTags {
  Observed = 'observed',
}

export function ObservedChild(triggers): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('eventTriggers', triggers, target.prototype)
    const tags = Reflect.getMetadata('tags', target.constructor) || []
    Reflect.defineMetadata(
      'tags',
      [...tags, DecoratorTags.Observed],
      target.prototype
    )
  }
}

export function Observe<TBase extends Constructor<{}>>(Base: TBase, triggers) {
  @ObservedChild(triggers)
  class Observed extends Base {}
  return Observed
}
