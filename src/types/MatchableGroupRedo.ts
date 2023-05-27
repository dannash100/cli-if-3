import { ObservedChild } from '../decorators/Observed'
import { Matcher, MatcherConfig } from './Matcher'
import { Path, PathConfig } from './Path'
import 'reflect-metadata'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'

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
  #matchCache: Map<string, InstanceType<MatchableClass>[]> = new Map()

  // remove
  abstract onNoMatcher(item: InstanceType<MatchableClass>): void

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
}

class PathGroup extends MatchableGroup<PathConfig[], typeof Path> {
  constructor(config: PathConfig[]) {
    super(config, Path)
  }
  onNoMatcher(item: InstanceType<typeof Path>): void {
    throw new Error('Method not implemented.')
  }
}

const pathMatchableGroup = new PathGroup([
  {
    id: 'path-to-beach',
    direction: DirectionalAdverbs.Down,
  },
])

const items = pathMatchableGroup.items
