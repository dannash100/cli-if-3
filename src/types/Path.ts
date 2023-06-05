import { Matchable } from './MatchableGroup'
import { ID } from './ID'
import { Matcher, MatcherConfig } from './Matcher'
import { SceneId } from './Scene'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import 'reflect-metadata'
import { Observe, ObservedChild } from '../decorators/Observed'

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
    if (properties.matcher) {
      const ObservedMatcher = Observe(Matcher, triggers)
      this.matcher = new ObservedMatcher(properties.matcher)
    }
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
