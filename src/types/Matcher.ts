import EventEmitter from 'events'
import { Observed, Trigger } from '../decorators/Observed'
import { NonCaptureGroup, anyOfWords } from '../utils/regexGenerators'
import { Output } from '../decorators/Output'
import 'reflect-metadata'

export interface MatcherConfig {
  noun: string | string[]
  adjectives?: string[]
}

export enum MatchType {
  Misfit = 'misfit', // Get red key given a room with blue key
  Partial = 'partial', // Get rusty key given a room with blue rusty key
  Exact = 'exact', // Get rusty red key given a room with rusty red key
}

export enum MatcherTriggerId {
  AdjectiveChange = 'adjectiveChange',
  NounChange = 'nounChange',
}

export class Matcher {
  @Observed(MatcherTriggerId.NounChange)
  public declare noun: string[]

  @Observed(MatcherTriggerId.AdjectiveChange)
  public declare adjectives: string[]

  #regex: RegExp
  #groups: {
    adjectives?: NonCaptureGroup
    noun?: NonCaptureGroup
    exact?: string
  } = {}

  constructor({ noun, adjectives = [] }: MatcherConfig) {
    this.setAdjectives(adjectives)
    this.setNoun(noun)
  }

  @Trigger(MatcherTriggerId.AdjectiveChange)
  onAdjectiveChange() {
    this.#groups.adjectives = anyOfWords(this.adjectives)
    this.#groups.exact = this.adjectives.reduce(
      (group, adj) => `${group}(?=.*?\\b${adj}\\b)`,
      ''
    )
    this.#generateRegex()
  }

  @Trigger(MatcherTriggerId.NounChange)
  onNounChange() {
    this.#groups.noun = anyOfWords(this.noun)
    this.#generateRegex()
  }

  /**
   * New regex for adverb only advanced matching
   * ^(?:(?<exact>(?=.*?\bred\b)(?=.*?\brusty\b)(?!.*?\b(?!(?:red|rusty)\b)\w+).+)|(?<partial>(?!.*?\b(?!red|rusty)\w+).\w*$)|(?<misfit>.*?(?!(?:red|rusty)).+))$
   */
  #generateRegex() {
    const { adjectives, exact } = this.#groups
    this.#regex = new RegExp(
      `^(?:(?<${MatchType.Exact}>${exact}(?!.*?\\b(?!${adjectives})\\w+).+)|(?<${MatchType.Partial}>(?!.*?\\b(?!${adjectives})\\w+)\\w+)|(?<${MatchType.Misfit}>.*?(?!${adjectives}).+))$`,
      'i'
    )
    console.log(this.#regex.source)
  }

  addAdjective(adjective: string) {
    this.adjectives.push(adjective)
  }

  removeAdjective(adjective: string) {
    this.adjectives = this.adjectives.filter((a) => a !== adjective)
  }

  addNoun(noun: string) {
    this.noun.push(noun)
  }

  removeNoun(noun: string) {
    this.noun = this.noun.filter((n) => n !== noun)
  }

  setAdjectives(adjectives: string[]) {
    this.adjectives = adjectives
  }

  setNoun(noun: string[] | string) {
    this.noun = Array.isArray(noun) ? noun : [noun]
  }

  match(str: string): false | MatchType {
    const matches = str.match(this.#regex)
    if (!matches?.groups) return false
    const { exact, partial, misfit } = matches.groups
    if (misfit) return MatchType.Misfit
    if (exact) return MatchType.Exact
    if (partial) return MatchType.Partial
  }
}
