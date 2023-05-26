import { EventTrigger } from '../decorators/Observed'
import { Matcher, MatcherConfig, MatcherTriggerId } from './Matcher'
import { Path, PathConfig } from './Path'
import 'reflect-metadata'

export const ObserveChild = (triggers): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata('eventTriggers', triggers, target.prototype)
  }
}

export interface MatchableEntity {
  matcher?: Matcher
}

export interface MatchableConfig {
  matcher?: MatcherConfig
}

export abstract class MatchableGroup<
  Entity extends MatchableEntity,
  Config extends MatchableConfig
> {
  public items: Entity[]

  matchCache: Map<string, Entity[]> = new Map()
  #nounRegex: RegExp

  public onNoMatcher?(item: Entity): void

  constructor(
    items: Config[],
    MatchedClass?: {
      new (config: Config): Entity
    }
  ) {
    const triggers = Reflect.getMetadata('eventTriggers', this)
    @ObserveChild(triggers)
    class ObservedMatchable extends MatchedClass {}

    const observableItems = items.map(
      (item) => new ObservedMatchable(item) as Entity
    )
    this.items = observableItems
    this.prepareOptimisticMatching()
  }

  @EventTrigger(MatcherTriggerId.NounChange)
  prepareOptimisticMatching() {
    if (!this.items) return
    this.matchCache = new Map()
    for (let i = 0; i < this.items.length; i++) {
      const element = this.items[i]
      const { matcher } = element
      if (matcher) {
        for (let y = 0; y < matcher.noun.length; y++) {
          const noun = matcher.noun[y]
          const existing = this.matchCache.get(noun)
          // If existing the noun has potential conflicting matches and extra logic is needed
          this.matchCache.set(
            noun,
            existing ? [...existing, element] : [element]
          )
        }
      } else {
        if (!this.onNoMatcher) {
          throw new Error('No matcher and no onNoMatcher handler')
        }
        this.onNoMatcher(element)
      }
    }
    this.#nounRegex = new RegExp(
      `^(?:(?<adjectives>.*?)\\s+)?(?<noun>${Array.from(this.matchCache.keys())
        .sort((a, b) => b.length - a.length)
        .join('|')})$`,
      'i'
    )
    console.log(this.#nounRegex)
    console.log('down'.match(this.#nounRegex))
  }

  public match(input: string) {
    return this.#nounRegex.exec(input)
  }
}

export class MatchableGroupPaths extends MatchableGroup<Path, PathConfig> {
  constructor(items: PathConfig[]) {
    super(items, Path)
  }
  public onNoMatcher(item: Path) {
    const { direction } = item
    if (!direction) {
      // TODO - use error enums and all that
      throw new Error('Path must have a matcher or a to property')
    }
    const existing = this.matchCache.get(direction)
    if (existing) {
      throw new Error('Path with a to property must be unique')
    }
    this.matchCache.set(direction, [item])
  }
}
