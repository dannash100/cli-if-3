import { DirectionalAdverbs } from '../types/words/DirectionalAdverbs'
import { flattenAliases } from './utils'

export const directionalAdverbs: Aliases<DirectionalAdverbs> = flattenAliases([
  [DirectionalAdverbs.N, /n(?:orth)?/],
  [DirectionalAdverbs.NE, /n(?:orth)?\s?e(?:ast)?/],
  [DirectionalAdverbs.E, /e(?:ast)?/],
  [DirectionalAdverbs.SE, /s(?:outh)?\s?e(?:ast)?/],
  [DirectionalAdverbs.S, /s(?:outh)?/],
  [DirectionalAdverbs.SW, /s(?:outh)?\s?w(?:est)?/],
  [DirectionalAdverbs.W, /w(?:est)?/],
  [DirectionalAdverbs.NW, /n(?:orth)?\s?w(?:est)?/],
  DirectionalAdverbs.Up,
  DirectionalAdverbs.Down,
])
