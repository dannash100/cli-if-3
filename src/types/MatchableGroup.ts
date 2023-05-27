import { EventTrigger } from '../decorators/Observed'
import { Matcher, MatcherTriggerId } from './Matcher'
import { Path, PathConfig } from './Path'
import 'reflect-metadata'

export interface Constructor<Entity> {
  new (...args: any[]): Entity
}

export interface MatchableEntity {
  matcher?: Matcher
}

export abstract class MatchableGroup<Entity extends MatchableEntity> {
  public items: Entity[]

  matchCache: Map<string, Entity[]>
  #nounRegex: RegExp

  public onNoMatcher?(item: Entity): void

  constructor(...args: any[]) {
    this.items = args[0]
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
  }

  public match(input: string) {
    return this.#nounRegex.exec(input)
  }
}

export function ObservedChild(triggers): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('eventTriggers', triggers, target.prototype)
  }
}

function ObservedItems<
  T extends Constructor<MatchableEntity>,
  D extends Constructor<MatchableGroup<InstanceType<T>>>
>(Class: T) {
  return function (constructor: D) {
    return class extends constructor {
      constructor(...args: any[]) {
        const triggers = Reflect.getMetadata(
          'eventTriggers',
          constructor.prototype
        )
        @ObservedChild(triggers)
        class ObservedMatchable extends Class {
          constructor(...args: any[]) {
            super(args[0])
          }
        }
        const observableItems = args[0].map(
          (item) => new ObservedMatchable(item) as T
        )
        super(observableItems)
      }
    }
  }
}

@ObservedItems(Path)
export class PathGroup extends MatchableGroup<Path> {
  constructor(items: PathConfig[]) {
    super(items)
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
