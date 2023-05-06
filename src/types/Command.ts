import { Prepositions } from './words/Prepositions'
import { Verbs } from './words/Verbs'

type Target = {
  adjectives?: string[]
  noun: string
}

type Command = {
  verb: Verbs
  directObject: Target // tbd
  preposition?: Prepositions
  indirectObject?: Target // tbd,  adverbial phrase
  adverbial?: string // tbd
}
