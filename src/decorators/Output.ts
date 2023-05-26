import EventEmitter from 'events'
import 'reflect-metadata'

export function Output(ids) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    @Reflect.metadata('outputEvents', ids)
    class Extended extends constructor {
      output: EventEmitter
      constructor(...args: any[]) {
        super(...args)
        this.output = new EventEmitter()
      }
    }
    return Extended
  }
}
