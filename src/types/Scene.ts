import { Actions } from './Actions'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import { Group } from './Group'
import { ItemId } from './Item'
import { Prop } from './Prop'

export type DropBehavior = {
  enabled: boolean
  actions: Actions<ItemId>
}

export type Scene = {
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
