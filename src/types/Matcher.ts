import { flattenAliases } from '../aliases/utils'
import { aliasedRegex } from '../parser'
import { LexicalCategories } from './words/LexicalCategories'

/**
 * {
 *  base: 'key',
 *  attributes: ['red', 'rusty']
 * }
 * {
 *  base: 'key',
 *  attributes: ['blue', 'rusty']
 * }
 * Get key
 * => Which key?
 * Get rusty key
 * => Which rusty key?
 * Get green key
 * => I can't see a green key.
 * Get red key
 * => You pickup the red key.
 */

/**
 * Example 1:
 * rusty red key
 *  root: 'key'
 *  attributes: ['red']
 * rusty blue key
 *  root: 'key'
 *  attributes: ['blue']
 *  Get key - which key?
 *  Get rusty key - which rusty key?
 *  Get blue key - you pick up the blue key?
 *  Get green key - You can't see a green key
 * Example 2:
 * green key
 *
 * Given Red key and blue key
 * get Key - [Partial, Partial] if partial?
 * get shiny key - [] - There is no key that is shiny
 * Given no key
 * get shiny key  - I can't see a shiny key
 *
 *
 */

export enum MatchType {
  Misfit = 'misfit', // Get red key given a room with blue key
  Partial = 'partial', // Get rusty key given a room with blue rusty key
  Exact = 'exact', // Get rusty red key given a room with rusty red key
}

/**
 * Do i need special syntax for like when its required to say red key - dont think so just make noun red key
 */

export class Matcher {
  noun: (string | [string, RegExp])[]
  adjectives: string[]

  constructor({ noun, adjectives = [] }) {
    this.noun = Array.isArray(noun) ? noun : [noun]
    this.adjectives = adjectives
  }

  match(input: string) {
    // TODO this goofy
    const aliasedNounRegex = aliasedRegex(
      flattenAliases(this.noun),
      LexicalCategories.Noun
    )
    const matcherRegex = new RegExp(
      `^(?<adjectives>(?:\\w+\\s+)*?(?:\\w+)?)\\s*${aliasedNounRegex}\\s*$`,
      'i'
    )

    const match = input.match(matcherRegex)

    if (!match) return false

    const {
      groups: { noun, adjectives },
    } = input.match(matcherRegex)

    if (!noun) return false

    const adjectiveList = adjectives ? adjectives.split(/\s+/) : []

    const matches = this.adjectives.filter((adjective) =>
      adjectiveList.includes(adjective)
    )
    const misfits = adjectiveList.filter(
      (adjective) => !this.adjectives.includes(adjective)
    )

    if (misfits.length) {
      return MatchType.Misfit
    }
    if (this.adjectives.length === matches.length) {
      return MatchType.Exact
    }
    return MatchType.Partial
  }
}
