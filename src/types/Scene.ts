import { Actions } from './Actions'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import { Group } from './Group'
import { ItemId } from './Item'
import { Prop } from './Prop'
import { ID } from './ID'
import { Path } from './Path'
import { Matcher } from './Matcher'
import { aliasedRegex } from 'src/parser'
import { LexicalCategories } from './words/LexicalCategories'

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

const match = (matcher: Matcher, input: string) => {
  const { base, aliases, attributes } = matcher

  const aliasedNounRegex = aliasedRegex(
    [base, ...aliases],
    LexicalCategories.Noun
  )
  const matcherRegex = new RegExp(
    `^(?<adjectives>(?:\\w+\\s+)*?(?:\\w+)?)\\s*${aliasedNounRegex}$`,
    'i'
  )
  const {
    groups: { noun, adjectives },
  } = input.match(matcherRegex)

  if (!noun) return false

  const adjectivesList = adjectives.split(/\s+/)

  if (adjectivesList.every((adjective) => attributes.includes(adjective))) {
  }

  return base === input
}

export abstract class Scene {
  readonly id: SceneId
  public paths: Paths

  getPathByInput(input: string): Path | Path[] {
    return Object.values(this.paths).find((path) =>
      Array.isArray(path)
        ? path.find((path2) => match(path2.matcher, input))
        : match(path.matcher, input)
    )
  }

  constructor(properties: SceneConfig) {
    this.id = `scene-${properties.id}`
  }
}
