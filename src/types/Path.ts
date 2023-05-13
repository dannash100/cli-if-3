import { ID } from './ID'
import { Matcher } from './Matcher'
import { SceneId } from './Scene'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'

export type PathId = ID<'path'>

export type Path = {
  id: PathId
  to: SceneId
  enabled: boolean
  condition?: any // TODO
  matcher?: Matcher // i.e "go to beach" where beach is N
}
