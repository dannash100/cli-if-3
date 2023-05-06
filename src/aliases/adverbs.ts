import { Adverbs } from '../types/words/Adverbs'
import { flattenAliases } from './utils'

export const adverbs: Aliases<Adverbs> = flattenAliases([
  [Adverbs.Above, /above|on\s?top\sof/],
  [Adverbs.Below, /below|under(?:neath)?/],
  Adverbs.Behind,
  Adverbs.Inside,
])
