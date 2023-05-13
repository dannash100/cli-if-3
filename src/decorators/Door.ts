import { PathId } from '../types/Path'

export function Door(pathId: PathId, open: boolean = false) {
  return function <T extends { new (...args: any[]): {} }>(ctr: T) {
    return class extends ctr {
      #open: boolean = open
      set open(newVal: boolean) {
        this._setPathEnabled(newVal)
        this.#open = newVal
      }
      get open() {
        return this.#open
      }

      private _setPathEnabled(enabled: boolean) {
        const path = this.ctx.getPath(pathId)
        if (!path) {
          throw new Error(`Path ${pathId} not found on opening door ${ctr.id}`)
        }
        path.setEnabled(enabled)
      }

      constructor(...args: any[]) {
        super(...args)
        this._setPathEnabled(open)
      }
    }
  }
}
