import { ID } from './ID'
import { Matcher } from './Matcher'

export type ItemId = ID<'item'>

export type Item = {
  id: ItemId
  visible: boolean
  name: string
  matcher: Matcher
  descriptions: {}
}
