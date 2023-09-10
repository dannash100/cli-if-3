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
      this[property] = newVal
      args
        .map((id) => `${EntityTypes.Trigger}-${id}`)
        .forEach((id) => {
          const eventEmitter = this.triggers[id]
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
      if (!(children[0] instanceof Emittable))
        throw new Error(
          `Property ${key} does not support ObserveChildren decorator as it contains instances not extending Emittable`
        )
      const eventTriggers = Reflect.getMetadata('eventTriggers', this) || []
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
        { ...this.triggers }
      )
      children.forEach((child) => child.setTriggers(triggers))
      this[property] = newVal
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
