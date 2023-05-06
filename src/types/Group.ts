import { Item } from './Item'
import { Prop } from './Prop'

export type GroupId = `group-${string}`

export type Group = {
  // Unique identifier for group
  id: GroupId
  // Internal description describing group
  description: string
  /**
   * Group is enabled to interact with
   * this is useful in the case of opening a drawer
   * where you want to hide the contents until the drawer is opened
   */
  enabled: boolean
  /**
   * Group is isolated from other groups
   * only items and props in this group can be interacted with
   * this is useful for scenes with multiple rooms or states
   * that need to be toggled
   */
  isolated: boolean
  members: {
    items: Item[]
    props: Prop[]
  }
}
