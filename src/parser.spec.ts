import { parseCommand } from './parser'
import { Adverbs } from './types/words/Adverbs'
import { DirectionalAdverbs } from './types/words/DirectionalAdverbs'
import { Prepositions } from './types/words/Prepositions'
import { Verbs } from './types/words/Verbs'

type ObjectParameters = [string[], string[]]
type RootAndAliases<T> = [T, string[]][]

interface ParserTestParameters {
  verb: Verbs
  verbAliases: string[]
  objects?: ObjectParameters | string[]
  prepositions?: RootAndAliases<Prepositions>
  adverbs?: RootAndAliases<Adverbs>
  directionalAdverbs?: RootAndAliases<DirectionalAdverbs>
}

const runParserTests = ({
  verb,
  verbAliases,
  objects = [[undefined], [undefined]],
  prepositions,
  adverbs,
  directionalAdverbs,
}: ParserTestParameters) => {
  const [directObjects, indirectObjects] = Array.isArray(objects && objects[0])
    ? (objects as ObjectParameters)
    : [objects as string[], [undefined]]
  const innerArr = prepositions ||
    adverbs ||
    directionalAdverbs || [[undefined, [undefined]]]
  innerArr.forEach(([root, aliases]) => {
    verbAliases.forEach((verbAlias) => {
      directObjects.forEach((directObject) => {
        indirectObjects.forEach((indirectObject) => {
          aliases.forEach((alias) => {
            const command = `${verbAlias}${
              adverbs || directionalAdverbs ? ` ${alias}` : ''
            }${!directionalAdverbs ? ` ${directObject}` : ''}${
              prepositions ? ` ${alias} ${indirectObject}` : ''
            }`.trim()
            it(`should parse ${verb.toUpperCase()} command: ${command}`, () => {
              expect(parseCommand(command)).toEqual({
                verb,
                directObject,
                directionalAdverb: directionalAdverbs && root,
                preposition: prepositions && root,
                adverb: adverbs && root,
                indirectObject,
              })
            })
          })
        })
      })
    })
  })
}

describe('parseCommand', () => {
  describe('go', () => {
    const verbAliases = ['go', 'go to the', '']
    const directionalAdverbs: RootAndAliases<DirectionalAdverbs> = [
      [DirectionalAdverbs.Down, ['down']],
      [DirectionalAdverbs.Up, ['up']],
      [DirectionalAdverbs.NW, ['north west', 'northwest', 'nw']],
      [DirectionalAdverbs.W, ['west', 'w']],
      [DirectionalAdverbs.SW, ['south west', 'southwest', 'sw']],
      [DirectionalAdverbs.S, ['south', 's']],
      [DirectionalAdverbs.SE, ['south east', 'southeast', 'se']],
      [DirectionalAdverbs.E, ['east', 'e']],
      [DirectionalAdverbs.NE, ['north east', 'northeast', 'ne']],
      [DirectionalAdverbs.N, ['north', 'n']],
    ]

    runParserTests({
      verb: Verbs.Go,
      verbAliases,
      directionalAdverbs,
    })
  })
  describe('go with adverb', () => {
    const adverbs: RootAndAliases<Adverbs> = [
      [Adverbs.Inside, ['inside', 'inside the']],
      [Adverbs.Above, ['above', 'ontop of']],
      [Adverbs.Below, ['below', 'under', 'underneath']],
      [Adverbs.Behind, ['behind ', 'behind the']],
    ]
    const objects = ['hole', 'deep hole', 'evil deep hole']
    runParserTests({
      verb: Verbs.Go,
      verbAliases: ['go'],
      adverbs,
      objects,
    })
  })
  describe('look', () => {
    const verbAliases = ['look', 'look at', 'look at the']
    const objects = ['tree', 'old tree', 'old oak tree']

    runParserTests({
      verb: Verbs.Look,
      verbAliases,
      objects,
    })
  })
  describe('get', () => {
    const verbAliases = ['get', 'pickup', 'pick up the', 'take', 'take the']
    const objects = ['key', 'old key', 'garden shed key']
    runParserTests({
      verb: Verbs.Get,
      verbAliases,
      objects,
    })
  })
  describe('drop', () => {
    const verbAliases = [
      'drop',
      'drop the',
      'leave',
      'leave the',
      'discard',
      'discard the',
      'throw away',
      'throw away the',
    ]
    const objects = ['key', 'old key', 'garden shed key']
    runParserTests({
      verb: Verbs.Drop,
      verbAliases,
      objects,
    })
  })
  describe('throw', () => {
    const verbAliases = ['throw', 'throw the']
    const objects: ObjectParameters = [
      ['sword', 'rusty sword', 'king dogmans sword'],
      ['snake', 'giant snake', 'giant green snake'],
    ]
    const prepositions: RootAndAliases<Prepositions> = [
      [Prepositions.At, ['at', 'at the']],
      [Prepositions.To, ['to', 'to the']],
    ]
    runParserTests({
      verb: Verbs.Throw,
      verbAliases,
      objects,
      prepositions,
    })
  })
  describe('use', () => {
    const verbAliases = ['use', 'use the']
    const prepositions: [Prepositions, string[]][] = [
      [Prepositions.On, ['on', 'on the']],
      [Prepositions.With, ['with', 'with the']],
    ]
    const objects: ObjectParameters = [
      ['key', 'old key', 'garden shed key'],
      ['door', 'shed door', 'garden shed door'],
    ]
    runParserTests({
      verb: Verbs.Use,
      verbAliases,
      prepositions,
      objects,
    })
  })
})
