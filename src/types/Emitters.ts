import 'reflect-metadata'
import { EventEmitter } from 'stream'
import { EntityTypes } from './Errors'

type Triggers = {
  [id: string]: EventEmitter
}

export function EventTrigger(id: string) {
  return (target: any, key: string) => {
    const triggerId = `${EntityTypes.Trigger}-${id}`
    const eventTriggers = Reflect.getMetadata('eventTriggers', target) || []
    Reflect.defineMetadata(
      'eventTriggers',
      [...eventTriggers, [triggerId, key]],
      target
    )
  }
}

function ObserveChange(id: string) {
  return function (target: any, key: any) {
    const property = Symbol()
    const getter = function () {
      return this[property]
    }

    // Setter with first param as type of property decorated
    const setter = function (newVal) {
      this[property] = newVal
      const metadataKey = `${EntityTypes.Trigger}-${id}`
      // Call Trigger metho
      if (!this.triggers) return
      const eventEmitter = this.triggers[metadataKey]
      if (eventEmitter) {
        eventEmitter.emit('trigger', this.id)
      }
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
      //   this[property] = newVal
      this[property] = newVal
      const eventTriggers = Reflect.getMetadata('eventTriggers', this)
      let triggers = {}
      eventTriggers.forEach(([triggerId, methodName]) => {
        class TriggerEmitter extends EventEmitter {}
        const triggerEmitter = new TriggerEmitter()

        triggerEmitter.on('trigger', async (id) => {
          this[methodName](id)
        })
        triggers[triggerId] = triggerEmitter
      })
      const children = Array.isArray(newVal) ? newVal : [newVal]
      children.forEach((child) => child.setTriggers(triggers))
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      configurable: true,
    })
  }
}

abstract class Emittable {
  triggers: Triggers
  setTriggers(triggers: Triggers) {
    this.triggers = triggers
  }
}

export class ChildClass extends Emittable {
  public id: string

  @ObserveChange('activeChange')
  public declare active

  constructor(id) {
    super()
    this.id = id
  }

  setActive(active: boolean) {
    this.active = active
  }
}

export class ParentClass {
  @ObserveChildren()
  public declare children: ChildClass[]

  constructor() {
    this.children = [new ChildClass('a'), new ChildClass('b')]
  }

  @EventTrigger('activeChange')
  logTriggered(id) {
    console.log('triggered', id)
  }
}
