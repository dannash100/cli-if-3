import chalk from 'chalk'
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
      // adjectives: ['stone'],
    },
  },
  {
    id: 'starting-beach',
    direction: DirectionalAdverbs.SW,
    matcher: {
      noun: ['beach'],
    },
  },
]

const mockPaths2: PathConfig[] = [
  {
    id: 'red-dog2',
    direction: DirectionalAdverbs.N,
    matcher: {
      noun: ['dog', 'hound'],
      adjectives: ['red'],
    },
  },
  {
    id: 'blue-dog2',
    direction: DirectionalAdverbs.SW,
    matcher: {
      noun: ['dog'],
    },
  },
]

describe('MatchableGroup', () => {
  describe('PathGroup', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create a path group from path configs containing observed metadata', () => {
      const pathGroup = new PathGroup(mockPaths)
      expect(pathGroup.items).toHaveLength(2)
      expect(pathGroup.items.every((item) => item instanceof Path)).toBeTruthy()
      expect(
        pathGroup.items.every((item) =>
          hasDecoratorTag(item, DecoratorTags.Observed)
        )
      ).toBeTruthy()
    })
    it('should contain distinct items and matchers', async () => {
      const generateRegexSpy = jest.spyOn(
        MatchableGroup.prototype,
        'generateRegex'
      )
      const configs = [mockPaths, mockPaths2]
      const groups: PathGroup[] = configs.map((config) => new PathGroup(config))

      expect(generateRegexSpy).toHaveBeenCalledTimes(2)
      configs.forEach((config, i) => {
        expect(groups[i].items).toHaveLength(2)
        expect(groups[i].items.map((item) => item.id)).toEqual(
          config.map((path) => `path-${path.id}`)
        )
        expect(groups[i].items.map((item) => item.matcher.noun)).toEqual(
          config.map((path) => path.matcher.noun)
        )
      })
    })
    it('should update the regex when a child matcher noun changes', () => {
      const generateRegexSpy = jest.spyOn(
        MatchableGroup.prototype,
        'generateRegex'
      )
      const pathGroup = new PathGroup(mockPaths)
      const nouns = mockPaths.flatMap((path) => path.matcher.noun)
      const mockNoun = 'new-noun'

      expect(generateRegexSpy).toHaveBeenCalledTimes(1)
      expect(nouns.every((noun) => pathGroup.nounRegex.test(noun))).toBeTruthy()
      expect(pathGroup.nounRegex.test(mockNoun)).toBeFalsy()
      pathGroup.items[0].matcher.addNoun(mockNoun)
      expect(generateRegexSpy).toHaveBeenCalledTimes(2)
      expect(
        [...nouns, mockNoun].every((noun) => pathGroup.nounRegex.test(noun))
      ).toBeTruthy()
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
