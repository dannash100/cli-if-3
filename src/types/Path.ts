import { Matchable } from './MatchableGroup'
import { ID } from './ID'
import { DefineTriggers, MatchableEntity } from './MatchableGroup'
import { Matcher, MatcherConfig } from './Matcher'
import { SceneId } from './Scene'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import 'reflect-metadata'

export type PathId = ID<'path'>

enum PathsTriggerId {
  PathChange = 'pathChange',
}

export interface PathConfig {
  id: string
  direction?: DirectionalAdverbs
  matcher?: MatcherConfig
}

/**
 * Need to account for
 * Walk down to beach
 * Go along path to beach
 * Go to beach
 *
 * A strecth:
 * Take path to beach
 */
export class Path implements Matchable {
  public id: PathId

  public to: SceneId
  public direction: DirectionalAdverbs

  public enabled: boolean
  public matcher: Matcher

  constructor(properties: PathConfig) {
    const triggers = Reflect.getMetadata('eventTriggers', this)
    @ObservedChild(triggers)
    class ObservedMatcher extends Matcher {
      constructor(config: MatcherConfig) {
        super(config)
      }
    }
    this.matcher = new ObservedMatcher(properties.matcher)
    this.id = `path-${properties.id}`
    this.direction = properties.direction
  }

  public enablePath(): void {
    this.enabled = true
  }

  public disablePath(): void {
    this.enabled = false
  }
}
