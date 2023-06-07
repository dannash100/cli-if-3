import chalk from 'chalk'
import { Logging, Matchable } from './MatchableGroup'
import { ID } from './ID'
import { Matcher, MatcherConfig } from './Matcher'
import { SceneId } from './Scene'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import 'reflect-metadata'
import { Observe, ObservedChild } from '../decorators/Observed'
import { entityLogger } from '../utils/logger'
import { EntityNames } from './EntityNames'

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
export class Path implements Matchable, Logging {
  public log = entityLogger(EntityNames.Path)
  public id: PathId

  public to: SceneId
  public direction: DirectionalAdverbs

  public enabled: boolean
  public matcher: Matcher

  constructor(properties: PathConfig) {
    this.log(
      `Creating with properties:
    ${chalk.bold`•`} id: ${chalk.yellowBright(properties.id)}
    ${
      properties.direction &&
      `${chalk.bold`•`} direction: ${properties.direction}`
    }
    `
    )
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
