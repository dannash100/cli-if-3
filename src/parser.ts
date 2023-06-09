import { adverbs } from './aliases/adverbs'
import { directionalAdverbs } from './aliases/directionalAdverbs'
import { prepositions } from './aliases/preposition'
import { rootWord } from './aliases/utils'
import { verbs } from './aliases/verbs'
import { LexicalCategories } from './types/words/LexicalCategories'
import { Verbs } from './types/words/Verbs'

export const aliasedRegex = <T extends string>(
  list: Aliases<T>,
  groupName: string
) =>
  `(?<${groupName}>\\b${list
    .map(([root, regex]) => regex?.source || root)
    .join('|')}\\b)`

const aliasedVerbRegex = aliasedRegex(verbs, LexicalCategories.Verb)
const aliasedAdverbRegex = aliasedRegex(adverbs, LexicalCategories.Adverb)
const aliasedPrepositionRegex = aliasedRegex(
  prepositions,
  LexicalCategories.Preposition
)
const aliasedDirectionalAdverbRegex = aliasedRegex(
  directionalAdverbs,
  LexicalCategories.DirectionalAdverb
)

const commandRegex = new RegExp(
  `^\\s*${aliasedVerbRegex}?(?:\\s+${aliasedAdverbRegex})?(?:\\s+the\\s+)?\\s*(?:${aliasedDirectionalAdverbRegex}|(?<directObject>.+?))(?:\\s*${aliasedPrepositionRegex}(?:\\s+the\\s+)?\\s*(?<indirectObject>.+?))?\\s*$`,
  'i'
)

export const parseCommand = (command: string) => {
  const {
    groups: {
      verb,
      adverb,
      directionalAdverb,
      preposition,
      directObject,
      indirectObject,
    },
  } = command.match(commandRegex)
  let rootVerb = rootWord(verb, verbs)

  // Allows shortcut "north" to be parsed as "go north"
  if (directionalAdverb && !verb) {
    rootVerb = Verbs.Go
  }

  return {
    verb: rootVerb,
    directObject,
    ...(directionalAdverb && {
      directionalAdverb: rootWord(directionalAdverb, directionalAdverbs),
    }),
    ...(adverb && { adverb: rootWord(adverb, adverbs) }),
    ...(preposition && {
      preposition: rootWord(preposition, prepositions),
      indirectObject,
    }),
  }
}
