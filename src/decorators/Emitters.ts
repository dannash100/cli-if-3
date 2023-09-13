import 'reflect-metadata'
import { EventEmitter } from 'stream'
import { EntityTypes } from '../types/Errors'

type Triggers = {
  [id: string]: EventEmitter
}

export function EventTrigger(...args: string[]) {
  return (target: any, key: string) => {
    const eventTriggers = Reflect.getMetadata('eventTriggers', target) || []
    Reflect.defineMetadata(
      'eventTriggers',
      [
        ...eventTriggers,
        ...args.map((id) => [`${EntityTypes.Trigger}-${id}`, key]),
      ],
      target
    )
  }
}

export function ObserveChange(...args: string[]) {
  return function (target: any, key: any) {
    const property = Symbol()
    const getter = function () {
      return this[property]
    }

    // Setter with first param as type of property decorated
    const setter = function (newVal) {
      const triggers = Reflect.getMetadata('triggers', this.constructor)
      if (!triggers) return

      this[property] = newVal
      args
        .map((id) => `${EntityTypes.Trigger}-${id}`)
        .forEach((id) => {
          const eventEmitter = triggers[id]
          if (eventEmitter) eventEmitter.emit('trigger', this.id)
        })
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}

export function ObserveChildren() {
  return function (target: any, key: any) {
    const property = Symbol()
    const getter = function () {
      return this[property]
    }

    // Setter with first param as type of property decorated
    const setter = function (newVal) {
      const children = Array.isArray(newVal) ? newVal : [newVal]
      const eventTriggers = Reflect.getMetadata('eventTriggers', this) || []
      const parentTriggers =
        Reflect.getMetadata('triggers', this.constructor) || {}
      const triggers = eventTriggers.reduce(
        (acc, [triggerId, methodName]) => {
          class TriggerEmitter extends EventEmitter {}
          const triggerEmitter = new TriggerEmitter()
          triggerEmitter.on('trigger', (id) => {
            this[methodName](id)
          })
          return {
            ...acc,
            [triggerId]: triggerEmitter,
          }
        },
        { ...parentTriggers }
      )
      const clonedChildren = children.map((child) => {
        const proto = Object.getPrototypeOf(child)
        @Reflect.metadata('triggers', triggers)
        class C extends child.constructor {}
        return Object.assign(
          new C(),
          proto,
          // gets rid of symbol keys
          Object.fromEntries(Object.entries(child))
        )
      })

      this[property] = Array.isArray(newVal)
        ? clonedChildren
        : clonedChildren[0]
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}

export abstract class Emittable {
  triggers: Triggers = {}
  protected setTriggers(triggers: Triggers) {
    this.triggers = triggers
  }
}
