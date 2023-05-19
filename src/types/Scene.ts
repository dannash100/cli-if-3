import { Actions } from './Actions'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import { Group } from './Group'
import { ItemId } from './Item'
import { Prop } from './Prop'
import { ID } from './ID'
import { Path } from './Path'

export type DropBehavior = {
  enabled: boolean
  actions: Actions<ItemId>
}

export type SceneId = ID<'scene'>

export interface SceneConfig {
  id: string
  title: {}
  paths: {
    [key in DirectionalAdverbs]: []
  }
  items: []
  props: Prop[]
  groups: Group[]
  description: []
  dropBehavior: DropBehavior
}

type Paths = {
  [key in DirectionalAdverbs]: Path | Path[]
}

export abstract class Scene {
  readonly id: SceneId
  public paths: Paths

  getPathByInput(input: string): void {
    // return Object.values(this.paths).find((path) =>
    //   Array.isArray(path)
    //     ? path.find((path2) => match(path2.matcher, input))
    //     : match(path.matcher, input)
    // )
  }

  constructor(properties: SceneConfig) {
    this.id = `scene-${properties.id}`
  }
}
