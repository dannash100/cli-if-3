import { PathId } from '../types/Path'

export function Container(open) {
  return function <T extends { new (...args: any[]): {} }>(ctr: T) {
    return class extends ctr {
      #open: boolean = open
      public contents = []
      set open(newVal: boolean) {
        this._setContentsEnabled(newVal)
        this.#open = newVal
      }
      get open() {
        return this.#open
      }

      private _setContentsEnabled(enabled: boolean) {}

      constructor(...args: any[]) {
        super(...args)
        this._setContentsEnabled(open)
        this.contents = args
      }
    }
  }
}
