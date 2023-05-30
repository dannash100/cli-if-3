import { EventTrigger, ObservedChild } from '../decorators/Observed'
import { Matcher, MatcherConfig, MatcherTriggerId } from './Matcher'
import { Path, PathConfig } from './Path'
import { LexicalCategories } from './words/LexicalCategories'
import 'reflect-metadata'

export interface Constructor<Entity> {
  new (...args: any[]): Entity
}

export interface Matchable {
  matcher?: Matcher
}

export interface MatchableConfig {
  matcher?: MatcherConfig
}

export abstract class MatchableGroup<
  Config extends MatchableConfig[],
  MatchableClass extends Constructor<Matchable>
> {
  public items: InstanceType<MatchableClass>[]

  #nounRegex: RegExp
  #matchCache: Map<string, InstanceType<MatchableClass>[]>

  constructor(config: Config, MatchableClass: MatchableClass) {
    const triggers = Reflect.getMetadata('eventTriggers', this)

    @ObservedChild(triggers)
    class ObservedMatcher extends MatchableClass {
      constructor(...args: any[]) {
        super(...args)
      }
    }
    this.items = config.map(
      (item) => new ObservedMatcher(item) as InstanceType<MatchableClass>
    )
  }

  #generateRegex() {
    this.#nounRegex = new RegExp(
      `^(?:(?<${LexicalCategories.Adjective}>.*?)\\s+)?(?<${
        LexicalCategories.Noun
      }>${Array.from(this.#matchCache.keys())
        .sort((a, b) => b.length - a.length)
        .join('|')})$`,
      'i'
    )
  }

  // TOdo better name
  public getCachedMatchable(key: string) {
    return this.#matchCache.get(key)
  }
  // TOdo better name
  public setCachedMatchable(
    key: string,
    value: InstanceType<MatchableClass>[]
  ) {
    this.#matchCache.set(key, value)
  }

  prepareMatch(item): void {
    const { matcher } = item
    if (!matcher) return
    matcher.noun.forEach((key) => {
      const existing = this.getCachedMatchable(key)
      this.setCachedMatchable(key, existing ? [...existing, item] : [item])
    })
  }

  @EventTrigger(MatcherTriggerId.NounChange)
  prepareMatches() {
    if (!this.items) return
    this.#matchCache = new Map()
    this.items.forEach(this.prepareMatch)
    this.#generateRegex()
  }
}

export class PathGroup extends MatchableGroup<PathConfig[], typeof Path> {
  constructor(config: PathConfig[]) {
    super(config, Path)
  }

  prepareMatch(path: Path) {
    const { direction, matcher } = path
    if (!direction && !matcher)
      throw new Error('Path must have a matcher or a direction property')
    if (direction) {
      const existing = this.getCachedMatchable(direction)
      if (existing)
        throw new Error(
          'Path with a direction property must be unique within a PathGroup'
        )
      this.setCachedMatchable(direction, existing)
    }
    super.prepareMatch(path)
  }
}
