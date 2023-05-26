import { ID } from './ID'
import { Matchable, MatchableConfig } from './MatchableGroup'
import { MatchType, Matcher, MatcherConfig } from './Matcher'
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

export class Path {
  id: PathId
  to: SceneId
  enabled: boolean
  direction: DirectionalAdverbs

  static observers: any[] = []

  matcher: Matcher

  constructor(properties: PathConfig) {
    const triggers = Reflect.getMetadata('eventTriggers', this)
    console.log(triggers)
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
