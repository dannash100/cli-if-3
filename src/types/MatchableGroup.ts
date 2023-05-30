import { EventEmitter } from 'stream'
import chalk from 'chalk'
import { EventTrigger, Observe } from '../decorators/Observed'
import { Matcher, MatcherConfig, MatcherTriggerId } from './Matcher'
import { Path, PathConfig } from './Path'
import { LexicalCategories } from './words/LexicalCategories'
import 'reflect-metadata'
import { EntityLogger, entityLogger } from '../utils/logger'
import { EntityNames } from './EntityNames'
import { ErrorSeverity } from './Errors'
import { ID } from './ID'

export interface Constructor<Entity> {
  new (...args: any[]): Entity
}

export interface Matchable {
  matcher?: Matcher
}

export interface MatchableConfig {
  matcher?: MatcherConfig
}

export interface Logging {
  log: EntityLogger
}

export abstract class MatchableGroup<
  Config extends MatchableConfig[],
  MatchableClass extends Constructor<Matchable>
> implements Logging
{
  public id: ID<'matchable-group'>
  public log: EntityLogger

  public subscriptions: EventEmitter[] = []
  public items: InstanceType<MatchableClass>[] = []

  public nounRegex: RegExp
  public matchCache: Map<string, InstanceType<MatchableClass>[]>

  constructor(config: Config, MatchableClass: MatchableClass) {
    this.log = entityLogger(`${MatchableClass.name}Group` as EntityNames)
    this.prepareMatch = this.prepareMatch.bind(this)
    this.getCachedMatchable = this.getCachedMatchable.bind(this)
    this.setCachedMatchable = this.setCachedMatchable.bind(this)
    this.prepareMatches = this.prepareMatches.bind(this)

    const eventTriggers = Reflect.getMetadata('eventTriggers', this)

    this.log(
      `Creating group with ${config.length} ${MatchableClass.name} item${
        config.length === 1 ? '' : 's'
      }`
    )

    /** Todo method decorator calls once - so all triggers are hitting each group
     * Need to extends the emitters and instantiate in constructor
     */

    const triggers = {}

    eventTriggers.forEach(([triggerId, methodName]: [string, string]) => {
      class TriggerEmitter extends EventEmitter {}
      const triggerEmitter = new TriggerEmitter()

      const listener = triggerEmitter.on(
        'trigger',
        (entityName: EntityNames) => {
          if (!this.items) return
          this
            .log(`${chalk.yellow`${methodName}`} was triggered by observed event 
           ${chalk.yellowBright
             .bold`ϟ`} From: ${entityName} ${chalk.whiteBright(triggerId)}`)

          this[methodName]()
        }
      )
      this[triggerId] = listener
      triggers[triggerId] = triggerEmitter
    })

    for (let i = 0; i < config.length; i++) {
      const element = config[i]
      this.items.push(
        new Path(element, triggers) as InstanceType<MatchableClass>
      )
    }

    // this.items = config.map(
    //   (item) => {
    //     const ObservedMatcher = Observe(MatchableClass, triggers);
    //     return new ObservedMatcher(item) as InstanceType<MatchableClass>
    //   }
    // )

    this.items[0].matcher.addNoun('dog')
    this.items[0].matcher.addNoun('dog')

    this.log(`Observing ${MatchableClass.name} items for changes with triggers:
    ${Object.keys(triggers)
      .map((x) => `${chalk.bold`•`} ${chalk.whiteBright(x)}`)
      .join('\n')}`)

    this.prepareMatches()
  }

  public generateRegex() {
    this.nounRegex = new RegExp(
      `^(?:(?<${LexicalCategories.Adjective}>.*?)\\s+)?(?<${
        LexicalCategories.Noun
      }>${Array.from(this.matchCache.keys())
        .sort((a, b) => b.length - a.length)
        .join('|')})$`,
      'i'
    )
  }

  // TOdo better name
  public getCachedMatchable(key: string) {
    const match = this.matchCache.get(key)
    return match
  }
  // TOdo better name
  public setCachedMatchable(
    key: string,
    value: InstanceType<MatchableClass>[]
  ) {
    this.matchCache.set(key, value)
  }

  public prepareMatch(item) {
    const { matcher } = item
    if (!matcher || !matcher.noun) {
      console.log('#DEBUG: NO MATCHER for', item.id, matcher)
      return
    }
    matcher.noun.forEach((key) => {
      console.log('#DEBUG: NOUN', key)
      const existing = this.getCachedMatchable(key)
      this.setCachedMatchable(key, existing ? [...existing, item] : [item])
    })
  }

  @EventTrigger(MatcherTriggerId.NounChange)
  public prepareMatches() {
    console.log(this.items, 'ITEMS triggered')
    if (!this.items) return
    this.matchCache = new Map()
    this.items.forEach(this.prepareMatch)
    this.generateRegex()
  }
}

export class PathGroup extends MatchableGroup<PathConfig[], typeof Path> {
  constructor(config: PathConfig[]) {
    super(config, Path)
  }

  public prepareMatch(path: Path) {
    const { direction, matcher } = path
    if (!direction && !matcher) {
      this.log(
        'Path must have a matcher or a direction property',
        ErrorSeverity.Error
      )
      process.exit(1) // todo shutdown
    }
    if (direction) {
      const existing = this.getCachedMatchable(direction)
      if (existing) {
        this.log(
          'Path with a direction property must be unique within a PathGroup',
          ErrorSeverity.Error
        )
        process.exit(1) // todo shutdown
      }
      this.setCachedMatchable(direction, existing)
    }
    return super.prepareMatch(path)
  }
}
