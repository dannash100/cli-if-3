import { Prepositions } from '../types/words/Prepositions'
import { flattenAliases } from './utils'

export const prepositions: Aliases<Prepositions> = flattenAliases([
  [Prepositions.In, /in(?:\s?to)?/],
  [Prepositions.On, /on(?:\s?to)?/],
  Prepositions.With,
  Prepositions.About,
  Prepositions.From,
  Prepositions.At,
  Prepositions.To,
])
