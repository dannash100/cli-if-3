import { Observed, Trigger } from '../decorators/Observed'
import { NonCaptureGroup, anyOfWords } from '../utils/regexGenerators'
import 'reflect-metadata'
import { Logging } from './MatchableGroup'
import { EntityLogger } from '../utils/logger'

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

export class Matcher implements Logging {
  public log: EntityLogger

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
    /**
     * ${
      properties?.matcher
        ? `${chalk.bold`•`} name:${
            properties.matcher?.adjectives
              ? ` ${chalk.yellow(properties.matcher.adjectives)}`
              : ''
          } ${chalk.yellowBright(properties.matcher.noun)}`
        : ''
    }
     */
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

  #generateRegex() {
    const { adjectives, exact } = this.#groups
    this.#regex = new RegExp(
      `^(?:(?<${MatchType.Exact}>${exact}(?!.*?\\b(?!${adjectives})\\w+).+)|(?<${MatchType.Partial}>(?!.*?\\b(?!${adjectives})\\w+)\\w+)|(?<${MatchType.Misfit}>.*?(?!${adjectives}).+))$`,
      'i'
    )
  }

  addAdjective(adjective: string) {
    this.adjectives.push(adjective)
  }

  removeAdjective(adjective: string) {
    this.adjectives = this.adjectives.filter((a) => a !== adjective)
  }

  addNoun(noun: string) {
    this.noun = [...this.noun, noun]
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
