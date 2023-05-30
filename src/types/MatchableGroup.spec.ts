import { DecoratorTags, hasDecoratorTag } from '../decorators/Observed'
import { MatchableGroup, PathGroup } from './MatchableGroup'
import { Path, PathConfig } from './Path'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'
import 'reflect-metadata'

const mockPaths: PathConfig[] = [
  {
    id: 'outside-stone-hut',
    direction: DirectionalAdverbs.N,
    matcher: {
      noun: ['hut', 'house'],
      adjectives: ['stone'],
    },
  },
  {
    id: 'starting-beach',
    direction: DirectionalAdverbs.SW,
    matcher: {
      noun: 'beach',
    },
  },
]

describe('MatchableGroup', () => {
  describe('PathGroup', () => {
    const generateRegexSpy = jest.spyOn(
      MatchableGroup.prototype,
      'generateRegex'
    )
    // it('should create a path group from path configs containing observed metadata', () => {
    //   const pathGroup = new PathGroup(mockPaths)
    //   expect(pathGroup.items).toHaveLength(2)
    //   const [path] = pathGroup.items
    //   expect(path).toBeInstanceOf(Path)
    //   expect(hasDecoratorTag(path, DecoratorTags.Observed)).toBeTruthy()
    // })
    it('should not trigger events from another group', () => {
      new PathGroup(mockPaths)
      new PathGroup(mockPaths)
      new PathGroup(mockPaths)
      expect(generateRegexSpy).toHaveBeenCalledTimes(3)
    })
    // it('should generate regex containing nouns and there aliases', () => {
    //   const pathGroup = new PathGroup(mockPaths)
    //   console.log('#DEBUG: PATH GROUP', pathGroup)
    //   expect(generateRegexSpy).toHaveBeenCalledWith([
    //     'hut',
    //     'house',
    //     'beach',
    //   ])
    //   expect(pathGroup.items).toHaveLength(2)
    //   const [path] = pathGroup.items
    //   console.log(path.matcher)
    //   // expect(pathGroup.#regex)
    // })
  })
})
